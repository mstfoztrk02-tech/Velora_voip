import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_data():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing data
    await db.dealers.delete_many({})
    await db.customers.delete_many({})
    await db.users.delete_many({})
    await db.call_records.delete_many({})
    await db.active_calls.delete_many({})
    await db.tariffs.delete_many({})
    
    # Create Tariffs
    tariffs = [
        {
            "id": "tariff_1",
            "name": "Standard Tarife",
            "price_per_minute": 0.15,
            "currency": "TRY",
            "description": "Standart görüşme tarifesi"
        },
        {
            "id": "tariff_2",
            "name": "Premium Tarife",
            "price_per_minute": 0.10,
            "currency": "TRY",
            "description": "İndirimli görüşme tarifesi"
        },
        {
            "id": "tariff_3",
            "name": "Business Tarife",
            "price_per_minute": 0.08,
            "currency": "TRY",
            "description": "Kurumsal görüşme tarifesi"
        }
    ]
    await db.tariffs.insert_many(tariffs)
    
    # Create Dealers
    dealers = [
        {
            "id": "dealer_1",
            "name": "İstanbul Telekom A.Ş.",
            "email": "info@istanbul-telekom.com",
            "phone": "0212 555 0001",
            "status": "active",
            "created_at": datetime.utcnow(),
            "total_customers": 3,
            "total_minutes": 1234.5,
            "total_calls": 89
        },
        {
            "id": "dealer_2",
            "name": "Ankara İletişim Ltd.",
            "email": "contact@ankara-iletisim.com",
            "phone": "0312 555 0002",
            "status": "active",
            "created_at": datetime.utcnow(),
            "total_customers": 2,
            "total_minutes": 876.3,
            "total_calls": 54
        },
        {
            "id": "dealer_3",
            "name": "İzmir VoIP Sistemleri",
            "email": "destek@izmir-voip.com",
            "phone": "0232 555 0003",
            "status": "active",
            "created_at": datetime.utcnow(),
            "total_customers": 4,
            "total_minutes": 2156.8,
            "total_calls": 132
        }
    ]
    await db.dealers.insert_many(dealers)
    
    # Create Customers
    customers = [
        # Dealer 1 customers
        {
            "id": "customer_1",
            "dealer_id": "dealer_1",
            "name": "Tekno Yazılım A.Ş.",
            "tariff": "Premium Tarife",
            "number": "+90 532 123 4567",
            "currency": "TRY",
            "total_minutes": 456.2,
            "total_calls": 34,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "id": "customer_2",
            "dealer_id": "dealer_1",
            "username": "mehmet.kaya",
            "tariff": "Standard Tarife",
            "number": "+90 533 234 5678",
            "currency": "TRY",
            "total_minutes": 389.1,
            "total_calls": 28,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "id": "customer_3",
            "dealer_id": "dealer_1",
            "username": "ayse.demir",
            "tariff": "Business Tarife",
            "number": "+90 534 345 6789",
            "currency": "USD",
            "total_minutes": 389.2,
            "total_calls": 27,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        # Dealer 2 customers
        {
            "id": "customer_4",
            "dealer_id": "dealer_2",
            "username": "fatma.ozturk",
            "tariff": "Premium Tarife",
            "number": "+90 535 456 7890",
            "currency": "TRY",
            "total_minutes": 523.7,
            "total_calls": 31,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "id": "customer_5",
            "dealer_id": "dealer_2",
            "username": "ali.celik",
            "tariff": "Standard Tarife",
            "number": "+90 536 567 8901",
            "currency": "EUR",
            "total_minutes": 352.6,
            "total_calls": 23,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        # Dealer 3 customers
        {
            "id": "customer_6",
            "dealer_id": "dealer_3",
            "username": "zeynep.arslan",
            "tariff": "Business Tarife",
            "number": "+90 537 678 9012",
            "currency": "TRY",
            "total_minutes": 678.4,
            "total_calls": 45,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "id": "customer_7",
            "dealer_id": "dealer_3",
            "username": "can.yildirim",
            "tariff": "Premium Tarife",
            "number": "+90 538 789 0123",
            "currency": "TRY",
            "total_minutes": 567.2,
            "total_calls": 38,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "id": "customer_8",
            "dealer_id": "dealer_3",
            "username": "deniz.aydin",
            "tariff": "Standard Tarife",
            "number": "+90 539 890 1234",
            "currency": "USD",
            "total_minutes": 445.8,
            "total_calls": 29,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "id": "customer_9",
            "dealer_id": "dealer_3",
            "username": "ece.koc",
            "tariff": "Business Tarife",
            "number": "+90 530 901 2345",
            "currency": "TRY",
            "total_minutes": 465.4,
            "total_calls": 20,
            "status": "active",
            "created_at": datetime.utcnow()
        }
    ]
    await db.customers.insert_many(customers)
    
    # Create Call Records
    countries = ["Türkiye", "Almanya", "İngiltere", "Fransa", "ABD"]
    cities = {
        "Türkiye": ["İstanbul", "Ankara", "İzmir", "Bursa"],
        "Almanya": ["Berlin", "Münih", "Hamburg"],
        "İngiltere": ["Londra", "Manchester"],
        "Fransa": ["Paris", "Marsilya"],
        "ABD": ["New York", "Los Angeles", "Chicago"]
    }
    
    call_records = []
    for i in range(100):
        customer_id = f"customer_{random.randint(1, 9)}"
        country = random.choice(countries)
        city = random.choice(cities[country])
        duration = random.randint(30, 1800)  # 30 seconds to 30 minutes
        
        call_records.append({
            "id": f"call_{i+1}",
            "customer_id": customer_id,
            "caller_number": f"+90 5{random.randint(30, 59)} {random.randint(100, 999)} {random.randint(1000, 9999)}",
            "called_number": f"+{random.randint(1, 999)} {random.randint(100, 999)} {random.randint(1000, 9999)}",
            "country": country,
            "city": city,
            "duration": duration,
            "call_date": datetime.utcnow() - timedelta(hours=random.randint(1, 168)),
            "cost": duration * 0.15 / 60,
            "ai_spam_score": random.uniform(0, 1),
            "ai_sentiment": random.choice(["Pozitif", "Nötr", "Negatif"]),
            "audio_url": None
        })
    
    await db.call_records.insert_many(call_records)
    
    print("✅ Mock data successfully seeded!")
    print(f"Created {len(dealers)} dealers")
    print(f"Created {len(customers)} customers")
    print(f"Created {len(call_records)} call records")
    print(f"Created {len(tariffs)} tariffs")

if __name__ == "__main__":
    asyncio.run(seed_data())
