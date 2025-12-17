from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# System prompt to keep the chatbot focused on Velora topics
SYSTEM_PROMPT = """Sen Velora'nın yapay zeka destekli müşteri hizmetleri asistanısın. 
Velora, Türkiye'nin ilk tam odaklı yapay zeka tabanlı telekom operatörüdür.

Velora'nın hizmetleri:
- Sabit Numara: Coğrafi numaralar
- 0850 Numara: Türkiye geneli sabit numaralar
- Bulut Santral: İnternet üzerinden telefon santrali
- Çağrı Merkezi: Müşteri hizmetleri yönetimi
- Toplu SMS: Yüksek hacimli SMS gönderimi
- OTP SMS: Doğrulama kodları için SMS
- İYS: İleti Yönetim Sistemi

İletişim:
- Telefon: 0850 000 00 00
- E-posta: info@velora.com.tr
- Adres: İstanbul, Türkiye

Görevin:
1. Velora'nın ürün ve hizmetleri hakkında bilgi vermek
2. Kullanıcıların sorularını yanıtlamak
3. Teknik destek sağlamak
4. Abonelik ve fiyatlandırma konularında yardımcı olmak

Önemli:
- Sadece Velora ve telekom hizmetleri ile ilgili konularda yardımcı ol
- Konu dışı sorulara nazikçe cevap verme ve Velora hizmetlerine yönlendir
- Profesyonel ve yardımsever bir ton kullan
- Türkçe konuş
"""

@router.post("/chat", response_model=ChatResponse)
async def chat(chat_message: ChatMessage):
    try:
        # Generate or use existing session ID
        session_id = chat_message.session_id or str(uuid.uuid4())
        
        # Get API key
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return ChatResponse(
                response="Üzgünüm, şu anda yapay zeka servisi yapılandırılmamış. Lütfen 0850 000 00 00 numaralı telefondan bize ulaşın.",
                session_id=session_id
            )
        
        try:
            # Initialize LLM Chat with simpler approach
            chat_client = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=SYSTEM_PROMPT
            ).with_model("openai", "gpt-4o-mini")
            
            # Create user message
            user_msg = UserMessage(text=chat_message.message)
            
            # Get response from LLM
            response = await chat_client.send_message(user_msg)
            
            # Save messages to database (non-blocking)
            try:
                await db.chat_messages.insert_one({
                    "session_id": session_id,
                    "role": "user",
                    "content": chat_message.message,
                    "timestamp": datetime.utcnow()
                })
                
                await db.chat_messages.insert_one({
                    "session_id": session_id,
                    "role": "assistant",
                    "content": response,
                    "timestamp": datetime.utcnow()
                })
            except Exception as db_error:
                print(f"Database save error: {db_error}")
                # Continue even if database save fails
            
            return ChatResponse(
                response=response,
                session_id=session_id
            )
            
        except Exception as llm_error:
            print(f"LLM error: {llm_error}")
            # Fallback response
            return ChatResponse(
                response="Merhaba! Ben Velora AI asistanıyım. Size nasıl yardımcı olabilirim? Velora'nın bulut santral, toplu SMS, sabit numara hizmetleri hakkında bilgi verebilirim. 📞",
                session_id=session_id
            )
        
    except Exception as e:
        print(f"General error: {e}")
        return ChatResponse(
            response="Üzgünüm, geçici bir hata oluştu. Lütfen tekrar deneyin veya 0850 000 00 00 numaralı telefondan bize ulaşın.",
            session_id=session_id
        )

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    try:
        messages = await db.chat_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(100)
        
        return {
            "session_id": session_id,
            "messages": [
                {
                    "role": msg["role"],
                    "content": msg["content"],
                    "timestamp": msg["timestamp"].isoformat()
                }
                for msg in messages
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history/{session_id}")
async def clear_chat_history(session_id: str):
    try:
        result = await db.chat_messages.delete_many({"session_id": session_id})
        return {
            "success": True,
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
