from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
# from chatbot import router as chatbot_router  # Temporarily disabled - requires emergentintegrations
from voip_crm import router as voip_crm_router
from platinum_campaigns import router as platinum_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ElevenLabsOutboundCallRequest(BaseModel):
    agentId: str
    agentPhoneNumberId: str
    toNumber: str

class ElevenLabsOutboundCallResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks

@api_router.post("/elevenlabs/outbound-call", response_model=ElevenLabsOutboundCallResponse)
async def create_elevenlabs_outbound_call(request: ElevenLabsOutboundCallRequest):
    """
    Initiate an outbound call using ElevenLabs conversational AI agent
    """
    try:
        # ElevenLabs API configuration
        ELEVENLABS_API_KEY = os.environ.get('ELEVENLABS_API_KEY', 'sk_6958a19e56f95f6527d6824701ffb181ac6db0ce455b7776')
        ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/convai/twilio/outbound-call'

        # Prepare request payload
        payload = {
            "agent_id": request.agentId,
            "agent_phone_number_id": request.agentPhoneNumberId,
            "to_number": request.toNumber
        }

        # Make request to ElevenLabs API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                ELEVENLABS_API_URL,
                json=payload,
                headers={
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY
                }
            )

            data = response.json()

            if response.status_code != 200:
                logger.error(f"ElevenLabs API error: {data}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail={
                        "error": "ElevenLabs API error",
                        "details": data
                    }
                )

            # Return success response
            return ElevenLabsOutboundCallResponse(
                success=True,
                message="Outbound call initiated successfully",
                data={
                    "conversationId": data.get('conversation_id'),
                    "callSid": data.get('callSid'),
                    "status": "initiated" if data.get('success') else "failed"
                }
            )

    except httpx.TimeoutException:
        logger.error("ElevenLabs API timeout")
        raise HTTPException(status_code=504, detail="ElevenLabs API timeout")
    except httpx.RequestError as e:
        logger.error(f"ElevenLabs API connection error: {e}")
        raise HTTPException(status_code=503, detail=f"Connection error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in ElevenLabs outbound call: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Include the routers in the main app
app.include_router(api_router)
# app.include_router(chatbot_router)  # Temporarily disabled - requires emergentintegrations
app.include_router(voip_crm_router)
app.include_router(platinum_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()