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
    await db.trunk_settings.delete_many({})
    
    # Create Tariffs
    tariffs = [
        {"id": "tariff_1", "name": "Standard Tarife", "price_per_minute": 0.15, "currency": "TRY"},
        {"id": "tariff_2", "name": "Premium Tarife", "price_per_minute": 0.10, "currency": "TRY"},
        {"id": "tariff_3", "name": "Business Tarife", "price_per_minute": 0.08, "currency": "TRY"}
    ]
    await db.tariffs.insert_many(tariffs)
    
    # Create Dealers
    dealers = [
        {"id": "dealer_1", "name": "İstanbul Telekom A.Ş.", "email": "info@istanbul-telekom.com", 
         "phone": "0212 555 0001", "status": "active", "created_at": datetime.utcnow(),
         "total_customers": 3, "total_minutes": 1234.5, "total_calls": 89},
        {"id": "dealer_2", "name": "Ankara İletişim Ltd.", "email": "contact@ankara-iletisim.com",
         "phone": "0312 555 0002", "status": "active", "created_at": datetime.utcnow(),
         "total_customers": 2, "total_minutes": 876.3, "total_calls": 54},
        {"id": "dealer_3", "name": "İzmir VoIP Sistemleri", "email": "destek@izmir-voip.com",
         "phone": "0232 555 0003", "status": "active", "created_at": datetime.utcnow(),
         "total_customers": 2, "total_minutes": 1456.8, "total_calls": 98}
    ]
    await db.dealers.insert_many(dealers)
    
    # Create Customers
    customers = [
        {"id": "customer_1", "dealer_id": "dealer_1", "name": "Tekno Yazılım A.Ş.",
         "tariff": "Premium Tarife", "number": "+90 532 123 4567", "currency": "TRY",
         "total_minutes": 456.2, "total_calls": 34, "status": "active", "created_at": datetime.utcnow()},
        {"id": "customer_2", "dealer_id": "dealer_1", "name": "Dijital Medya Ltd.",
         "tariff": "Business Tarife", "number": "+90 533 234 5678", "currency": "USD",
         "total_minutes": 389.1, "total_calls": 28, "status": "active", "created_at": datetime.utcnow()},
        {"id": "customer_3", "dealer_id": "dealer_1", "name": "E-Ticaret Platformu",
         "tariff": "Standard Tarife", "number": "+90 534 345 6789", "currency": "EUR",
         "total_minutes": 389.2, "total_calls": 27, "status": "active", "created_at": datetime.utcnow()},
        {"id": "customer_4", "dealer_id": "dealer_2", "name": "Finans Danışmanlık",
         "tariff": "Premium Tarife", "number": "+90 535 456 7890", "currency": "TRY",
         "total_minutes": 523.7, "total_calls": 31, "status": "active", "created_at": datetime.utcnow()},
        {"id": "customer_5", "dealer_id": "dealer_2", "name": "Lojistik Hizmetleri",
         "tariff": "Business Tarife", "number": "+90 536 567 8901", "currency": "TRY",
         "total_minutes": 352.6, "total_calls": 23, "status": "active", "created_at": datetime.utcnow()},
        {"id": "customer_6", "dealer_id": "dealer_3", "name": "Mühendislik Ofisi",
         "tariff": "Premium Tarife", "number": "+90 537 678 9012", "currency": "USD",
         "total_minutes": 678.4, "total_calls": 45, "status": "active", "created_at": datetime.utcnow()},
        {"id": "customer_7", "dealer_id": "dealer_3", "name": "Reklam Ajansı",
         "tariff": "Standard Tarife", "number": "+90 538 789 0123", "currency": "TRY",
         "total_minutes": 778.4, "total_calls": 53, "status": "active", "created_at": datetime.utcnow()}
    ]
    await db.customers.insert_many(customers)
    
    # Create Users
    users = [
        {"id": "user_1", "customer_id": "customer_1", "username": "ahmet.yilmaz", "extension": "101",
         "status": "active", "total_minutes": 156.3, "total_calls": 12, "created_at": datetime.utcnow()},
        {"id": "user_2", "customer_id": "customer_1", "username": "mehmet.kaya", "extension": "102",
         "status": "active", "total_minutes": 189.5, "total_calls": 14, "created_at": datetime.utcnow()},
        {"id": "user_3", "customer_id": "customer_1", "username": "ayse.demir", "extension": "103",
         "status": "active", "total_minutes": 110.4, "total_calls": 8, "created_at": datetime.utcnow()},
        {"id": "user_4", "customer_id": "customer_2", "username": "fatma.ozturk", "extension": "201",
         "status": "active", "total_minutes": 234.7, "total_calls": 18, "created_at": datetime.utcnow()},
        {"id": "user_5", "customer_id": "customer_2", "username": "ali.celik", "extension": "202",
         "status": "active", "total_minutes": 154.4, "total_calls": 10, "created_at": datetime.utcnow()},
        {"id": "user_6", "customer_id": "customer_3", "username": "zeynep.arslan", "extension": "301",
         "status": "active", "total_minutes": 267.8, "total_calls": 19, "created_at": datetime.utcnow()},
        {"id": "user_7", "customer_id": "customer_3", "username": "can.yildirim", "extension": "302",
         "status": "active", "total_minutes": 121.4, "total_calls": 8, "created_at": datetime.utcnow()},
        {"id": "user_8", "customer_id": "customer_4", "username": "deniz.aydin", "extension": "401",
         "status": "active", "total_minutes": 298.3, "total_calls": 21, "created_at": datetime.utcnow()},
        {"id": "user_9", "customer_id": "customer_5", "username": "ece.koc", "extension": "501",
         "status": "active", "total_minutes": 187.2, "total_calls": 13, "created_at": datetime.utcnow()},
        {"id": "user_10", "customer_id": "customer_6", "username": "murat.tas", "extension": "601",
         "status": "active", "total_minutes": 345.6, "total_calls": 26, "created_at": datetime.utcnow()}
    ]
    await db.users.insert_many(users)
    
    # Create Trunk Settings
    trunk_settings = [
        {"customer_id": "customer_1", "ip_address": "192.168.1.10", "port": 5060, "codec": "G.711",
         "protocol": "UDP", "max_calls": 10, "auth_username": "trunk1", "auth_password": "pass123",
         "register_interval": 3600, "nat_traversal": True},
        {"customer_id": "customer_2", "ip_address": "192.168.1.20", "port": 5060, "codec": "G.729",
         "protocol": "TCP", "max_calls": 15, "auth_username": "trunk2", "auth_password": "pass456",
         "register_interval": 3600, "nat_traversal": True},
        {"customer_id": "customer_3", "ip_address": "192.168.1.30", "port": 5061, "codec": "Opus",
         "protocol": "TLS", "max_calls": 20, "auth_username": "trunk3", "auth_password": "pass789",
         "register_interval": 7200, "nat_traversal": False}
    ]
    await db.trunk_settings.insert_many(trunk_settings)
    
    # Create Active Calls
    active_calls = [
        {"id": "call_active_1", "customer_id": "customer_1", "caller": "+90 532 123 4567",
         "callee": "+1 555 123 4567", "trunk": "Trunk-1", "duration": 125, "codec": "G.711",
         "country": "ABD", "city": "New York", "status": "active", "started_at": datetime.utcnow() - timedelta(minutes=2)},
        {"id": "call_active_2", "customer_id": "customer_2", "caller": "+90 533 234 5678",
         "callee": "+44 20 7946 0958", "trunk": "Trunk-2", "duration": 87, "codec": "G.729",
         "country": "İngiltere", "city": "Londra", "status": "active", "started_at": datetime.utcnow() - timedelta(minutes=1, seconds=27)},
        {"id": "call_active_3", "customer_id": "customer_3", "caller": "+90 534 345 6789",
         "callee": "+49 30 12345678", "trunk": "Trunk-3", "duration": 234, "codec": "Opus",
         "country": "Almanya", "city": "Berlin", "status": "active", "started_at": datetime.utcnow() - timedelta(minutes=3, seconds=54)},
        {"id": "call_active_4", "customer_id": "customer_4", "caller": "+90 535 456 7890",
         "callee": "+33 1 42 68 53 00", "trunk": "Trunk-1", "duration": 56, "codec": "G.711",
         "country": "Fransa", "city": "Paris", "status": "active", "started_at": datetime.utcnow() - timedelta(seconds=56)},
        {"id": "call_active_5", "customer_id": "customer_6", "caller": "+90 537 678 9012",
         "callee": "+90 212 555 0001", "trunk": "Trunk-2", "duration": 345, "codec": "G.729",
         "country": "Türkiye", "city": "İstanbul", "status": "active", "started_at": datetime.utcnow() - timedelta(minutes=5, seconds=45)}
    ]
    await db.active_calls.insert_many(active_calls)
    
    # Create Call Records with AI features
    countries = ["Türkiye", "Almanya", "İngiltere", "Fransa", "ABD"]
    cities = {
        "Türkiye": ["İstanbul", "Ankara", "İzmir"],
        "Almanya": ["Berlin", "Münih"],
        "İngiltere": ["Londra", "Manchester"],
        "Fransa": ["Paris", "Marsilya"],
        "ABD": ["New York", "Los Angeles"]
    }
    
    transcriptions = [
        "Merhaba, ürünümüz hakkında bilgi almak istiyorum.",
        "Siparişimin kargo durumunu öğrenebilir miyim?",
        "Teknik destek almam gerekiyor, yardımcı olabilir misiniz?",
        "Fatura detaylarını gönderebilir misiniz?",
        "Toplantı saatimizi 14:00'e alabilir miyiz?"
    ]
    
    call_records = []
    for i in range(100):
        customer_id = f"customer_{random.randint(1, 7)}"
        country = random.choice(countries)
        city = random.choice(cities[country])
        duration = random.randint(30, 1800)
        
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
            "ai_noise_filtered": random.choice([True, False]),
            "ai_transcription": random.choice(transcriptions),
            "codec": random.choice(["G.711", "G.729", "Opus"]),
            "audio_url": None
        })
    
    await db.call_records.insert_many(call_records)
    
    print("✅ Mock data successfully seeded!")
    print(f"Created {len(dealers)} dealers")
    print(f"Created {len(customers)} customers")
    print(f"Created {len(users)} users")
    print(f"Created {len(active_calls)} active calls")
    print(f"Created {len(call_records)} call records")
    print(f"Created {len(tariffs)} tariffs")
    print(f"Created {len(trunk_settings)} trunk settings")

if __name__ == "__main__":
    asyncio.run(seed_data())
