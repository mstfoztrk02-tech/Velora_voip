from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/voip-crm", tags=["voip-crm"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Models
class Dealer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    total_customers: int = 0
    total_minutes: float = 0
    total_calls: int = 0

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    name: str
    tariff: str
    number: Optional[str] = None
    currency: str = "TRY"
    total_minutes: float = 0
    total_calls: int = 0
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    username: str
    extension: Optional[str] = None
    status: str = "active"
    total_minutes: float = 0
    total_calls: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TrunkSettings(BaseModel):
    customer_id: str
    ip_address: str
    port: int = 5060
    codec: str = "G.711"
    protocol: str = "UDP"
    max_calls: int = 10
    auth_username: Optional[str] = None
    auth_password: Optional[str] = None
    register_interval: int = 3600
    nat_traversal: bool = True

class ActiveCall(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    caller: str
    callee: str
    trunk: str
    duration: int = 0
    codec: str
    country: str
    city: Optional[str] = None
    status: str = "active"
    started_at: datetime = Field(default_factory=datetime.utcnow)

class CallRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    caller_number: str
    called_number: str
    country: str
    city: Optional[str] = None
    duration: int  # in seconds
    call_date: datetime = Field(default_factory=datetime.utcnow)
    cost: float = 0.0
    ai_spam_score: Optional[float] = None
    ai_sentiment: Optional[str] = None
    ai_noise_filtered: bool = False
    ai_transcription: Optional[str] = None
    audio_url: Optional[str] = None
    codec: Optional[str] = None

class Tariff(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price_per_minute: float
    currency: str = "TRY"
    description: Optional[str] = None

class AutoDialerNumber(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    phone_number: str
    status: str = "pending"  # pending, calling, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    called_at: Optional[datetime] = None
    call_result: Optional[str] = None

class AutoDialerSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    total_numbers: int
    concurrent_calls: int
    status: str = "stopped"  # running, stopped, paused
    started_at: Optional[datetime] = None
    stopped_at: Optional[datetime] = None
    calls_made: int = 0
    calls_successful: int = 0
    calls_failed: int = 0

# Dealers
@router.post("/dealers", response_model=Dealer)
async def create_dealer(dealer: Dealer):
    dealer_dict = dealer.dict()
    await db.dealers.insert_one(dealer_dict)
    return dealer

@router.get("/dealers", response_model=List[Dealer])
async def get_dealers():
    dealers = await db.dealers.find().to_list(100)
    return [Dealer(**dealer) for dealer in dealers]

@router.get("/dealers/{dealer_id}", response_model=Dealer)
async def get_dealer(dealer_id: str):
    dealer = await db.dealers.find_one({"id": dealer_id})
    if not dealer:
        raise HTTPException(status_code=404, detail="Dealer not found")
    return Dealer(**dealer)

# Customers
@router.post("/customers", response_model=Customer)
async def create_customer(customer: Customer):
    customer_dict = customer.dict()
    await db.customers.insert_one(customer_dict)
    
    # Update dealer's customer count
    await db.dealers.update_one(
        {"id": customer.dealer_id},
        {"$inc": {"total_customers": 1}}
    )
    return customer

@router.get("/customers", response_model=List[Customer])
async def get_customers(dealer_id: Optional[str] = None):
    query = {"dealer_id": dealer_id} if dealer_id else {}
    customers = await db.customers.find(query).to_list(1000)
    return [Customer(**customer) for customer in customers]

@router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return Customer(**customer)

@router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer: Customer):
    customer_dict = customer.dict()
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": customer_dict}
    )
    return customer

# Trunk Settings
@router.post("/trunk-settings", response_model=TrunkSettings)
async def create_trunk_settings(settings: TrunkSettings):
    settings_dict = settings.dict()
    await db.trunk_settings.insert_one(settings_dict)
    return settings

@router.get("/trunk-settings/{customer_id}", response_model=TrunkSettings)
async def get_trunk_settings(customer_id: str):
    settings = await db.trunk_settings.find_one({"customer_id": customer_id})
    if not settings:
        raise HTTPException(status_code=404, detail="Trunk settings not found")
    return TrunkSettings(**settings)

# Call Records
@router.post("/call-records", response_model=CallRecord)
async def create_call_record(record: CallRecord):
    record_dict = record.dict()
    await db.call_records.insert_one(record_dict)
    
    # Update customer stats
    await db.customers.update_one(
        {"id": record.customer_id},
        {
            "$inc": {
                "total_minutes": record.duration / 60,
                "total_calls": 1
            }
        }
    )
    return record

@router.get("/call-records", response_model=List[CallRecord])
async def get_call_records(customer_id: Optional[str] = None, limit: int = 100):
    query = {"customer_id": customer_id} if customer_id else {}
    records = await db.call_records.find(query).sort("call_date", -1).to_list(limit)
    return [CallRecord(**record) for record in records]

# Tariffs
@router.post("/tariffs", response_model=Tariff)
async def create_tariff(tariff: Tariff):
    tariff_dict = tariff.dict()
    await db.tariffs.insert_one(tariff_dict)
    return tariff

@router.get("/tariffs", response_model=List[Tariff])
async def get_tariffs():
    tariffs = await db.tariffs.find().to_list(100)
    return [Tariff(**tariff) for tariff in tariffs]

# Users
@router.post("/users", response_model=User)
async def create_user(user: User):
    user_dict = user.dict()
    await db.users.insert_one(user_dict)
    return user

@router.get("/users", response_model=List[User])
async def get_users(customer_id: Optional[str] = None):
    query = {"customer_id": customer_id} if customer_id else {}
    users = await db.users.find(query).to_list(1000)
    return [User(**user) for user in users]

# Active Calls
@router.post("/active-calls", response_model=ActiveCall)
async def create_active_call(call: ActiveCall):
    call_dict = call.dict()
    await db.active_calls.insert_one(call_dict)
    return call

@router.get("/active-calls", response_model=List[ActiveCall])
async def get_active_calls():
    calls = await db.active_calls.find({"status": "active"}).to_list(100)
    return [ActiveCall(**call) for call in calls]

@router.delete("/active-calls/{call_id}")
async def terminate_call(call_id: str):
    result = await db.active_calls.update_one(
        {"id": call_id},
        {"$set": {"status": "terminated"}}
    )
    return {"success": True, "message": "Call terminated"}

# Statistics
@router.get("/statistics")
async def get_statistics():
    total_dealers = await db.dealers.count_documents({})
    total_customers = await db.customers.count_documents({})
    total_users = await db.users.count_documents({})
    active_calls = await db.active_calls.count_documents({"status": "active"})
    
    # Calculate total call duration
    pipeline = [
        {"$group": {
            "_id": None,
            "total_duration": {"$sum": "$duration"},
            "total_calls": {"$sum": 1}
        }}
    ]
    call_stats = await db.call_records.aggregate(pipeline).to_list(1)
    
    total_duration = call_stats[0]["total_duration"] if call_stats else 0
    total_calls = call_stats[0]["total_calls"] if call_stats else 0
    
    return {
        "total_dealers": total_dealers,
        "total_customers": total_customers,
        "total_users": total_users,
        "active_calls": active_calls,
        "total_call_duration_minutes": total_duration / 60,
        "total_calls": total_calls
    }

# Auto Dialer Module
@router.post("/auto-dialer/numbers", response_model=AutoDialerNumber)
async def add_auto_dialer_number(number: AutoDialerNumber):
    """Add a single phone number to auto dialer queue"""
    number_dict = number.dict()
    await db.auto_dialer_numbers.insert_one(number_dict)
    return number

@router.post("/auto-dialer/numbers/bulk")
async def add_auto_dialer_numbers_bulk(data: dict):
    """Add multiple phone numbers to auto dialer queue"""
    customer_id = data.get("customer_id")
    phone_numbers = data.get("phone_numbers", [])

    if not customer_id or not phone_numbers:
        raise HTTPException(status_code=400, detail="customer_id and phone_numbers are required")

    numbers = []
    for phone in phone_numbers:
        number = AutoDialerNumber(
            customer_id=customer_id,
            phone_number=phone
        )
        numbers.append(number.dict())

    if numbers:
        await db.auto_dialer_numbers.insert_many(numbers)

    return {"success": True, "added": len(numbers), "message": f"{len(numbers)} numara başarıyla eklendi"}

@router.get("/auto-dialer/numbers", response_model=List[AutoDialerNumber])
async def get_auto_dialer_numbers(customer_id: str):
    """Get all phone numbers for auto dialer"""
    numbers = await db.auto_dialer_numbers.find({"customer_id": customer_id}).to_list(10000)
    return [AutoDialerNumber(**num) for num in numbers]

@router.put("/auto-dialer/numbers/{number_id}")
async def update_auto_dialer_number(number_id: str, data: dict):
    """Update a phone number status in auto dialer queue"""
    status = data.get("status")
    call_result = data.get("call_result")

    update_data = {}
    if status:
        update_data["status"] = status
    if call_result:
        update_data["call_result"] = call_result
    if status == "calling":
        update_data["called_at"] = datetime.utcnow()

    result = await db.auto_dialer_numbers.update_one(
        {"id": number_id},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Number not found")
    return {"success": True, "message": "Numara güncellendi"}

@router.delete("/auto-dialer/numbers/{number_id}")
async def delete_auto_dialer_number(number_id: str):
    """Delete a phone number from auto dialer queue"""
    result = await db.auto_dialer_numbers.delete_one({"id": number_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Number not found")
    return {"success": True, "message": "Numara silindi"}

@router.delete("/auto-dialer/numbers/bulk/{customer_id}")
async def delete_all_auto_dialer_numbers(customer_id: str):
    """Delete all phone numbers for a customer"""
    result = await db.auto_dialer_numbers.delete_many({"customer_id": customer_id})
    return {"success": True, "deleted": result.deleted_count, "message": f"{result.deleted_count} numara silindi"}

@router.post("/auto-dialer/start")
async def start_auto_dialer(data: dict):
    """Start auto dialer session"""
    customer_id = data.get("customer_id")
    concurrent_calls = data.get("concurrent_calls", 1)

    if not customer_id:
        raise HTTPException(status_code=400, detail="customer_id is required")

    # Check if there are numbers to call
    numbers_count = await db.auto_dialer_numbers.count_documents({
        "customer_id": customer_id,
        "status": "pending"
    })

    if numbers_count == 0:
        raise HTTPException(status_code=400, detail="Aranacak numara bulunamadı")

    # Create or update session
    existing_session = await db.auto_dialer_sessions.find_one({"customer_id": customer_id})

    if existing_session:
        # Update existing session
        await db.auto_dialer_sessions.update_one(
            {"customer_id": customer_id},
            {
                "$set": {
                    "status": "running",
                    "concurrent_calls": concurrent_calls,
                    "total_numbers": numbers_count,
                    "started_at": datetime.utcnow()
                }
            }
        )
    else:
        # Create new session
        session = AutoDialerSession(
            customer_id=customer_id,
            total_numbers=numbers_count,
            concurrent_calls=concurrent_calls,
            status="running",
            started_at=datetime.utcnow()
        )
        await db.auto_dialer_sessions.insert_one(session.dict())

    return {"success": True, "message": "Otomatik arama başlatıldı", "numbers_to_call": numbers_count}

@router.post("/auto-dialer/stop")
async def stop_auto_dialer(data: dict):
    """Stop auto dialer session"""
    customer_id = data.get("customer_id")

    if not customer_id:
        raise HTTPException(status_code=400, detail="customer_id is required")

    result = await db.auto_dialer_sessions.update_one(
        {"customer_id": customer_id},
        {
            "$set": {
                "status": "stopped",
                "stopped_at": datetime.utcnow()
            }
        }
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Aktif oturum bulunamadı")

    return {"success": True, "message": "Otomatik arama durduruldu"}

@router.get("/auto-dialer/status/{customer_id}")
async def get_auto_dialer_status(customer_id: str):
    """Get current auto dialer status"""
    session = await db.auto_dialer_sessions.find_one({"customer_id": customer_id})

    pending_count = await db.auto_dialer_numbers.count_documents({
        "customer_id": customer_id,
        "status": "pending"
    })

    calling_count = await db.auto_dialer_numbers.count_documents({
        "customer_id": customer_id,
        "status": "calling"
    })

    completed_count = await db.auto_dialer_numbers.count_documents({
        "customer_id": customer_id,
        "status": "completed"
    })

    failed_count = await db.auto_dialer_numbers.count_documents({
        "customer_id": customer_id,
        "status": "failed"
    })

    return {
        "session": AutoDialerSession(**session) if session else None,
        "pending_calls": pending_count,
        "calling": calling_count,
        "completed_calls": completed_count,
        "failed_calls": failed_count,
        "total_numbers": pending_count + calling_count + completed_count + failed_count
    }
