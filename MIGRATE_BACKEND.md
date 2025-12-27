# Backend'i Vercel'dan Render.com'a Taşıma

## Neden Render.com?

- ✅ Python/FastAPI için optimize
- ✅ Ücretsiz tier mevcut
- ✅ 5 dakikada deploy
- ✅ MongoDB Atlas ile kolay entegrasyon
- ✅ Vercel'dan daha iyi Python desteği

---

## Adım 1: MongoDB Atlas (Eğer Yapmadıysanız)

1. https://www.mongodb.com/cloud/atlas
2. Free cluster oluşturun (Frankfurt)
3. Username: `admin`, Password: `Velora2024!`
4. Network Access: **0.0.0.0/0**
5. Connection string:
   ```
   mongodb+srv://admin:Velora2024!@velora.xxxxx.mongodb.net/
   ```

---

## Adım 2: Render.com Hesabı

1. https://render.com/
2. GitHub ile giriş yapın
3. **Get Started for Free**

---

## Adım 3: Backend Deploy

### 3.1 New Web Service
- Dashboard → **New** → **Web Service**
- GitHub repo'nuzu seçin
- **Connect**

### 3.2 Yapılandırma

| Alan | Değer |
|------|-------|
| **Name** | `velora-backend` |
| **Region** | Frankfurt (EU Central) |
| **Branch** | `main` veya `master` |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |

### 3.3 Environment Variables

| Key | Value |
|-----|-------|
| `MONGO_URL` | MongoDB Atlas connection string'iniz |
| `DB_NAME` | `velora_voip` |
| `CORS_ORIGINS` | `*` |

### 3.4 Deploy
- **Create Web Service**
- 5-7 dakika bekleyin

### 3.5 Backend URL
Deploy sonrası:
```
https://velora-backend.onrender.com
```

✅ Bu URL'i kopyalayın!

---

## Adım 4: Frontend'i Güncelle

### 4.1 vercel.json Düzenle

`frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://velora-backend.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4.2 Git Push

```bash
git add frontend/vercel.json
git commit -m "Use Render backend"
git push
```

Vercel otomatik redeploy yapacak.

---

## Adım 5: Test

### Backend Test
```bash
curl https://velora-backend.onrender.com/docs
```

FastAPI Swagger UI görmelisiniz.

### Frontend Test
```
https://velora-voip-git-master-mustafas-projects-e6e0f0db.vercel.app
```

Numara ekleme şimdi çalışmalı!

---

## Vercel'daki Backend'i Kaldırma (Opsiyonel)

1. Vercel Dashboard → Backend project
2. Settings → Delete Project

---

## Avantajlar

| Özellik | Vercel | Render.com |
|---------|--------|------------|
| Python/FastAPI | ⚠️ Zor | ✅ Kolay |
| Free Tier | Sınırlı | ✅ Generous |
| Cold Start | Var | Var (15dk) |
| Setup | Karmaşık | Basit |
| Log Viewing | Zor | Kolay |

---

## Alternatif: Vercel'da Düzeltme (Karmaşık)

Eğer backend'i Vercel'da tutmak istiyorsanız:

1. **Vercel Python Runtime** configure edin
2. **api/** klasörü altında Python functions oluşturun
3. FastAPI'yi ASGI adapter ile çalıştırın

**Örnek:** `api/index.py`
```python
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/api/test")
def test():
    return {"status": "ok"}

handler = Mangum(app)
```

⚠️ **Uyarı:** Karmaşık ve önerilmez!

---

## Özet

1. ✅ MongoDB Atlas kur
2. ✅ Render.com'da backend deploy et
3. ✅ Frontend vercel.json güncelle
4. ✅ Test et

**Süre:** 10-15 dakika
**Maliyet:** Ücretsiz

---

**ÖNERİ:** Render.com kullanın - çok daha kolay ve güvenilir!
