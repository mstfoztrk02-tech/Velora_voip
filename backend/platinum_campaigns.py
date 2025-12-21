from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid

router = APIRouter(prefix="/platinum/campaigns", tags=["Platinum Campaigns"])


# Enums
class CampaignStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    STOPPED = "stopped"


class CallStatus(str, Enum):
    PENDING = "pending"
    DIALING = "dialing"
    ANSWERED = "answered"
    BUSY = "busy"
    NOANSWER = "noanswer"
    FAILED = "failed"
    COMPLETED = "completed"


# Models
class Script(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    language: str = "en-US"
    text: str
    variables: List[str] = []
    voice_id: Optional[str] = None
    audio_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Campaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    script_id: str
    trunk: str
    context: str = "from-internal"
    concurrency: int = 1
    numbers: List[str]
    schedule: Optional[Dict[str, Any]] = None
    status: CampaignStatus = CampaignStatus.DRAFT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    stats: Dict[str, int] = {
        "total": 0,
        "pending": 0,
        "dialing": 0,
        "answered": 0,
        "busy": 0,
        "noanswer": 0,
        "failed": 0,
        "completed": 0,
    }


class CallLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    campaign_id: str
    number: str
    status: CallStatus = CallStatus.PENDING
    started_at: Optional[datetime] = None
    answered_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration: Optional[int] = None  # seconds
    hangup_cause: Optional[str] = None
    dtmf: Optional[str] = None
    audio_id: Optional[str] = None
    retry_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Input Models
class ScriptCreate(BaseModel):
    name: str
    language: str = "en-US"
    text: str
    variables: List[str] = []
    voice_id: Optional[str] = None


class CampaignCreate(BaseModel):
    name: str
    script_id: str
    trunk: str
    context: str = "from-internal"
    concurrency: int = Field(default=1, ge=1, le=10)
    numbers: List[str]
    schedule: Optional[Dict[str, Any]] = None


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    concurrency: Optional[int] = None
    schedule: Optional[Dict[str, Any]] = None


# API Endpoints
@router.post("/scripts", response_model=Script)
async def create_script(script: ScriptCreate):
    """Create a new TTS script"""
    from server import db

    script_data = script.model_dump()
    script_obj = Script(**script_data)

    result = await db.platinum_scripts.insert_one(script_obj.model_dump())

    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to create script")

    return script_obj


@router.get("/scripts", response_model=List[Script])
async def list_scripts(
    limit: int = Query(default=50, le=100), skip: int = Query(default=0, ge=0)
):
    """List all scripts"""
    from server import db

    cursor = db.platinum_scripts.find().sort("created_at", -1).skip(skip).limit(limit)
    scripts = await cursor.to_list(length=limit)

    return [Script(**script) for script in scripts]


@router.get("/scripts/{script_id}", response_model=Script)
async def get_script(script_id: str):
    """Get script by ID"""
    from server import db

    script = await db.platinum_scripts.find_one({"id": script_id})

    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    return Script(**script)


@router.post("/", response_model=Campaign)
async def create_campaign(campaign: CampaignCreate):
    """Create a new campaign"""
    from server import db

    # Validate script exists
    script = await db.platinum_scripts.find_one({"id": campaign.script_id})
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    campaign_data = campaign.model_dump()
    campaign_obj = Campaign(**campaign_data)
    campaign_obj.stats["total"] = len(campaign.numbers)
    campaign_obj.stats["pending"] = len(campaign.numbers)

    result = await db.platinum_campaigns.insert_one(campaign_obj.model_dump())

    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to create campaign")

    return campaign_obj


@router.get("/", response_model=List[Campaign])
async def list_campaigns(
    status: Optional[CampaignStatus] = None,
    limit: int = Query(default=50, le=100),
    skip: int = Query(default=0, ge=0),
):
    """List campaigns"""
    from server import db

    query = {}
    if status:
        query["status"] = status

    cursor = (
        db.platinum_campaigns.find(query).sort("created_at", -1).skip(skip).limit(limit)
    )
    campaigns = await cursor.to_list(length=limit)

    return [Campaign(**campaign) for campaign in campaigns]


@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(campaign_id: str):
    """Get campaign by ID"""
    from server import db

    campaign = await db.platinum_campaigns.find_one({"id": campaign_id})

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return Campaign(**campaign)


@router.patch("/{campaign_id}", response_model=Campaign)
async def update_campaign(campaign_id: str, updates: CampaignUpdate):
    """Update campaign"""
    from server import db

    campaign = await db.platinum_campaigns.find_one({"id": campaign_id})

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign["status"] not in [CampaignStatus.DRAFT, CampaignStatus.PAUSED]:
        raise HTTPException(
            status_code=400, detail="Cannot update running or completed campaign"
        )

    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.platinum_campaigns.update_one({"id": campaign_id}, {"$set": update_data})

    updated = await db.platinum_campaigns.find_one({"id": campaign_id})
    return Campaign(**updated)


@router.post("/{campaign_id}/start")
async def start_campaign(campaign_id: str):
    """Start campaign"""
    from server import db

    campaign = await db.platinum_campaigns.find_one({"id": campaign_id})

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign["status"] == CampaignStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Campaign already running")

    await db.platinum_campaigns.update_one(
        {"id": campaign_id},
        {
            "$set": {
                "status": CampaignStatus.RUNNING,
                "started_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    # TODO: Start worker process to dial numbers

    return {"ok": True, "message": "Campaign started"}


@router.post("/{campaign_id}/pause")
async def pause_campaign(campaign_id: str):
    """Pause campaign"""
    from server import db

    campaign = await db.platinum_campaigns.find_one({"id": campaign_id})

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign["status"] != CampaignStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Campaign not running")

    await db.platinum_campaigns.update_one(
        {"id": campaign_id},
        {
            "$set": {
                "status": CampaignStatus.PAUSED,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return {"ok": True, "message": "Campaign paused"}


@router.post("/{campaign_id}/stop")
async def stop_campaign(campaign_id: str, mode: str = "graceful"):
    """Stop campaign"""
    from server import db

    campaign = await db.platinum_campaigns.find_one({"id": campaign_id})

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if mode == "hard":
        # TODO: Hangup all active calls immediately
        pass

    await db.platinum_campaigns.update_one(
        {"id": campaign_id},
        {
            "$set": {
                "status": CampaignStatus.STOPPED,
                "completed_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return {"ok": True, "message": f"Campaign stopped ({mode} mode)"}


@router.get("/{campaign_id}/calls", response_model=List[CallLog])
async def get_campaign_calls(
    campaign_id: str,
    status: Optional[CallStatus] = None,
    limit: int = Query(default=100, le=500),
    skip: int = Query(default=0, ge=0),
):
    """Get call logs for campaign"""
    from server import db

    query = {"campaign_id": campaign_id}
    if status:
        query["status"] = status

    cursor = (
        db.platinum_call_logs.find(query).sort("created_at", -1).skip(skip).limit(limit)
    )
    logs = await cursor.to_list(length=limit)

    return [CallLog(**log) for log in logs]
