from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import hashlib
import re
from xml.etree import ElementTree as ET
from urllib.parse import urlparse

load_dotenv()

router = APIRouter(prefix="/api/sippy", tags=["sippy"])
logger = logging.getLogger(__name__)

# SippySoft XML-RPC Configuration (matching frontend .env)
SIPPY_RPC_URL = os.environ.get('SIPPY_RPC_URL', 'https://185.8.12.118/xmlapi/xmlapi')
SIPPY_RPC_USER = os.environ.get('SIPPY_RPC_USER', 'ssp-root')
SIPPY_RPC_PASS = os.environ.get('SIPPY_RPC_PASS', '549!x!nyk7wAM')
SIPPY_DISABLE_TLS_VERIFY = os.environ.get('SIPPY_DISABLE_TLS_VERIFY', 'true').lower() == 'true'

class CDRRecord(BaseModel):
    call_id: Optional[str] = None
    caller: str
    callee: str
    start_time: str
    end_time: Optional[str] = None
    duration: int
    status: str
    direction: str
    country: Optional[str] = None
    city: Optional[str] = None
    cost: Optional[float] = None
    trunk: Optional[str] = None
    codec: Optional[str] = None

class SippyHealthResponse(BaseModel):
    ok: bool
    message: str
    details: Optional[Dict[str, Any]] = None

def md5(data: str) -> str:
    """Generate MD5 hash"""
    return hashlib.md5(data.encode()).hexdigest()

def parse_digest_header(header: str) -> Dict[str, str]:
    """Parse WWW-Authenticate Digest header"""
    parts = {}
    matches = re.finditer(r'(\w+)=(?:"([^"]+)"|([^\s,]+))', header)
    for match in matches:
        parts[match.group(1)] = match.group(2) or match.group(3)
    return parts

def create_digest_auth_header(username: str, password: str, method: str, uri: str, digest_params: Dict[str, str]) -> str:
    """Create Digest authentication header"""
    ha1 = md5(f"{username}:{digest_params['realm']}:{password}")
    ha2 = md5(f"{method}:{uri}")

    nc = "00000001"
    import random
    cnonce = md5(str(random.random()))

    response = md5(f"{ha1}:{digest_params['nonce']}:{nc}:{cnonce}:{digest_params.get('qop', 'auth')}:{ha2}")

    auth_header = f'Digest username="{username}", realm="{digest_params["realm"]}", nonce="{digest_params["nonce"]}", uri="{uri}", response="{response}"'

    if digest_params.get('qop'):
        auth_header += f', qop={digest_params["qop"]}, nc={nc}, cnonce="{cnonce}"'

    if digest_params.get('opaque'):
        auth_header += f', opaque="{digest_params["opaque"]}"'

    return auth_header

def build_xmlrpc_request(method: str, params: List[Any]) -> str:
    """Build XML-RPC request"""
    params_xml = ""

    if params:
        param_values = []
        for param in params:
            if isinstance(param, bool):
                # Handle boolean BEFORE int check (bool is subclass of int in Python)
                param_values.append(f"<param><value><int>{1 if param else 0}</int></value></param>")
            elif isinstance(param, str):
                param_values.append(f"<param><value><string>{param}</string></value></param>")
            elif isinstance(param, int):
                param_values.append(f"<param><value><int>{param}</int></value></param>")
            elif isinstance(param, dict):
                members = ""
                for key, val in param.items():
                    if isinstance(val, bool):
                        # Handle boolean BEFORE int check
                        value_tag = f"<int>{1 if val else 0}</int>"
                    elif isinstance(val, str):
                        value_tag = f"<string>{val}</string>"
                    elif isinstance(val, int):
                        value_tag = f"<int>{val}</int>"
                    else:
                        value_tag = f"<string>{str(val)}</string>"
                    members += f"<member><name>{key}</name><value>{value_tag}</value></member>"
                param_values.append(f"<param><value><struct>{members}</struct></value></param>")
            else:
                param_values.append(f"<param><value><string>{str(param)}</string></value></param>")
        params_xml = f"<params>{''.join(param_values)}</params>"
    else:
        params_xml = "<params></params>"

    return f'''<?xml version="1.0"?>
<methodCall>
  <methodName>{method}</methodName>
  {params_xml}
</methodCall>'''

def parse_xmlrpc_value(element) -> Any:
    """Parse XML-RPC value element recursively"""
    if element is None:
        return None

    # Array
    array = element.find('array')
    if array is not None:
        data = array.find('data')
        if data is not None:
            values = []
            for value in data.findall('value'):
                values.append(parse_xmlrpc_value(value))
            return values
        return []

    # Struct
    struct = element.find('struct')
    if struct is not None:
        result = {}
        for member in struct.findall('member'):
            name_elem = member.find('name')
            value_elem = member.find('value')
            if name_elem is not None and value_elem is not None:
                result[name_elem.text] = parse_xmlrpc_value(value_elem)
        return result

    # String
    string = element.find('string')
    if string is not None:
        return string.text or ""

    # Int
    int_val = element.find('int') or element.find('i4')
    if int_val is not None:
        return int(int_val.text) if int_val.text else 0

    # Boolean
    bool_val = element.find('boolean')
    if bool_val is not None:
        return bool(int(bool_val.text)) if bool_val.text else False

    # Double
    double_val = element.find('double')
    if double_val is not None:
        return float(double_val.text) if double_val.text else 0.0

    # Default to element text or empty string
    return element.text or ""

def parse_xmlrpc_response(xml_string: str) -> Any:
    """Parse XML-RPC response"""
    try:
        root = ET.fromstring(xml_string)

        # Check for fault
        fault = root.find('.//fault')
        if fault is not None:
            fault_value = fault.find('.//value')
            fault_data = parse_xmlrpc_value(fault_value) if fault_value is not None else {}
            raise Exception(f"XML-RPC Fault: {fault_data}")

        # Parse params (for methodResponse)
        params = root.find('params')
        if params is not None:
            param = params.find('param')
            if param is not None:
                value = param.find('value')
                if value is not None:
                    return parse_xmlrpc_value(value)

        return None
    except ET.ParseError as e:
        logger.error(f"Failed to parse XML-RPC response: {e}")
        raise Exception(f"Invalid XML-RPC response: {e}")

async def call_xmlrpc(url: str, user: str, password: str, method: str, params: List[Any], disable_tls_verify: bool = False) -> Any:
    """Make XML-RPC call with HTTP Digest authentication"""
    request_body = build_xmlrpc_request(method, params)

    # Configure httpx client
    verify = not disable_tls_verify

    async with httpx.AsyncClient(verify=verify, timeout=30.0) as client:
        # First request - expect 401 with WWW-Authenticate
        response = await client.post(
            url,
            content=request_body,
            headers={
                "Content-Type": "text/xml",
                "User-Agent": "Python-Client/1.0"
            }
        )

        # Handle Digest Authentication
        if response.status_code == 401 and "www-authenticate" in response.headers:
            auth_header = response.headers["www-authenticate"]

            if auth_header.startswith("Digest"):
                digest_params = parse_digest_header(auth_header[7:])
                uri = urlparse(url).path
                auth_value = create_digest_auth_header(user, password, "POST", uri, digest_params)

                # Second request with authentication
                response = await client.post(
                    url,
                    content=request_body,
                    headers={
                        "Content-Type": "text/xml",
                        "User-Agent": "Python-Client/1.0",
                        "Authorization": auth_value
                    }
                )

        if response.status_code != 200:
            raise Exception(f"HTTP {response.status_code}: {response.text[:200]}")

        return parse_xmlrpc_response(response.text)

@router.get("/health", response_model=SippyHealthResponse)
async def check_sippy_health():
    """
    Check SippySoft XML-RPC connection and authentication
    Uses the same credentials as IntegrationsPage
    """
    if not SIPPY_RPC_URL or not SIPPY_RPC_USER or not SIPPY_RPC_PASS:
        return SippyHealthResponse(
            ok=False,
            message="SippySoft credentials not configured",
            details={"error": "Missing SIPPY_RPC_URL, SIPPY_RPC_USER, or SIPPY_RPC_PASS in environment variables"}
        )

    try:
        # Test with system.listMethods
        result = await call_xmlrpc(
            SIPPY_RPC_URL,
            SIPPY_RPC_USER,
            SIPPY_RPC_PASS,
            "system.listMethods",
            [],
            SIPPY_DISABLE_TLS_VERIFY
        )

        return SippyHealthResponse(
            ok=True,
            message="SippySoft XML-RPC connection successful",
            details={
                "rpcUrl": SIPPY_RPC_URL,
                "authMode": "digest",
                "user": SIPPY_RPC_USER[:2] + "***",
                "availableMethods": result[:10] if isinstance(result, list) else str(result)[:100],
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"SippySoft health check error: {e}")
        return SippyHealthResponse(
            ok=False,
            message=f"SippySoft XML-RPC connection failed: {str(e)}",
            details={"error": str(e)}
        )

@router.get("/cdrs", response_model=List[CDRRecord])
async def get_call_records(
    limit: int = 100,
    offset: int = 0,
    i_customer: str = "",
    recursive: bool = True,
    order: Optional[str] = None
):
    """
    Fetch Active Calls from SippySoft using listAllCalls XML-RPC method

    Based on: https://support.sippysoft.com/support/solutions/articles/107462-xml-rpc-api-manage-active-calls

    Query Parameters:
        limit: Maximum number of records (default: 100) - applied after fetching
        offset: Pagination offset (default: 0) - applied after fetching
        i_customer: Customer ID filter (default: "" for root customer)
        recursive: Include subcustomer calls (default: True)
        order: Sort order - oldest_first, oldest_last, longest_first, longest_last
    """
    if not SIPPY_RPC_URL or not SIPPY_RPC_USER or not SIPPY_RPC_PASS:
        raise HTTPException(
            status_code=503,
            detail="SippySoft credentials not configured"
        )

    try:
        # Prepare parameters for listAllCalls
        params = {
            "i_customer": i_customer,
            "recursive": recursive
        }

        if order:
            params["order"] = order

        logger.info(f"Calling SippySoft listAllCalls with params: {params}")

        # Call SippySoft listAllCalls method
        result = await call_xmlrpc(
            SIPPY_RPC_URL,
            SIPPY_RPC_USER,
            SIPPY_RPC_PASS,
            "listAllCalls",
            [params],
            SIPPY_DISABLE_TLS_VERIFY
        )

        logger.info(f"Successfully fetched {len(result) if isinstance(result, list) else 0} calls from SippySoft")

        # Transform result to CDR records
        cdr_list = []

        if isinstance(result, list):
            for record in result:
                if isinstance(record, dict):
                    # Parse SippySoft listAllCalls response format
                    # Fields: CLI, CLD, CALL_ID, DURATION, CC_STATE, I_ACCOUNT,
                    #         CALLER_MEDIA_IP, CALLEE_MEDIA_IP, SETUP_TIME, DIRECTION, NODE_ID

                    cdr = CDRRecord(
                        call_id=str(record.get('CALL_ID') or record.get('call_id') or ''),
                        caller=record.get('CLI') or record.get('caller') or 'Unknown',
                        callee=record.get('CLD') or record.get('callee') or 'Unknown',
                        start_time=record.get('SETUP_TIME') or record.get('setup_time') or datetime.utcnow().isoformat(),
                        end_time=None,  # Active calls don't have end time yet
                        duration=int(record.get('DURATION') or record.get('duration') or 0),
                        status=record.get('CC_STATE') or record.get('status') or 'active',
                        direction=record.get('DIRECTION') or ('inbound' if record.get('incoming') else 'outbound'),
                        country=record.get('country'),
                        city=record.get('city') or record.get('region'),
                        cost=float(record.get('cost') or 0),
                        trunk=str(record.get('I_ACCOUNT') or record.get('i_account') or ''),
                        codec=record.get('codec')
                    )
                    cdr_list.append(cdr)

        # Apply limit and offset (client-side pagination)
        start = offset
        end = offset + limit
        paginated_list = cdr_list[start:end]

        logger.info(f"Returning {len(paginated_list)} calls (offset: {offset}, limit: {limit})")

        return paginated_list

    except Exception as e:
        logger.error(f"Error fetching calls from SippySoft: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch calls from SippySoft: {str(e)}"
        )

@router.post("/call-method")
async def call_sippy_method(method: str, params: List[Any] = []):
    """
    Generic endpoint to call any SippySoft XML-RPC method
    Useful for testing and debugging
    """
    if not SIPPY_RPC_URL or not SIPPY_RPC_USER or not SIPPY_RPC_PASS:
        raise HTTPException(
            status_code=503,
            detail="SippySoft credentials not configured"
        )

    try:
        result = await call_xmlrpc(
            SIPPY_RPC_URL,
            SIPPY_RPC_USER,
            SIPPY_RPC_PASS,
            method,
            params,
            SIPPY_DISABLE_TLS_VERIFY
        )

        return {
            "ok": True,
            "method": method,
            "result": result
        }
    except Exception as e:
        logger.error(f"Error calling method {method}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to call method: {str(e)}"
        )
