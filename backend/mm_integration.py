import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from mm_client import MMClient


router = APIRouter(prefix="/api/mm", tags=["mm"])


class AddNumbersToCallRequest(BaseModel):
    aiid: str
    content: str
    stime: str
    etime: str


@router.post("/add_numbers_to_call")
async def add_numbers_to_call(payload: AddNumbersToCallRequest):
    try:
        client = MMClient()
        return await client.post_json("_api/add_numbers_to_call.php", payload.model_dump())
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"MM API request failed: {exc}") from exc
    except httpx.HTTPStatusError as exc:
        # Preserve remote status code when possible
        status_code = exc.response.status_code if exc.response is not None else 502
        detail = None
        try:
            detail = exc.response.json()
        except Exception:
            detail = exc.response.text if exc.response is not None else str(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc


@router.post("/call_unreached_numbers")
async def call_unreached_numbers():
    """Trigger immediate calling of unreached numbers via MM API.

    Frontend does NOT send a payload; backend always forwards:
    {"ai": 11, "now": true}
    """
    try:
        client = MMClient()
        return await client.post_json(
            "_api/call_unreached_numbers.php", {"ai": 11, "now": True}
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"MM API request failed: {exc}") from exc
    except httpx.HTTPStatusError as exc:
        status_code = exc.response.status_code if exc.response is not None else 502
        detail = None
        try:
            detail = exc.response.json()
        except Exception:
            detail = exc.response.text if exc.response is not None else str(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
