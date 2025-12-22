# Backend Deployment - Render.com (10 Dakika)

## Ön Gereksinimler
- [x] GitHub hesabı
- [x] MongoDB Atlas hesabı ve connection string
- [x] Render.com hesabı (ücretsiz)

---

## Adım 1: MongoDB Atlas (Eğer Yapmadıysanız)

### 1.1 Hesap Oluşturun
- https://www.mongodb.com/cloud/atlas
- "Try Free" ile kaydolun

### 1.2 Free Cluster
- Create Deployment → M0 FREE
- Region: Frankfurt
- Cluster Name: velora

### 1.3 Database User
- Username: `admin`
- Password: `Velora2024!` (şifrenizi kaydedin)

### 1.4 Network Access
- Add IP Address → **Allow Access from Anywhere (0.0.0.0/0)**

### 1.5 Connection String
```
mongodb+srv://admin:Velora2024!@velora.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

✅ Bu connection string'i kopyalayın!

---

## Adım 2: GitHub'a Push

```bash
cd D:\Projects\Velora_voip-main\Velora_voip-main

# Git init (eğer yapmadıysanız)
git init
git add .
git commit -m "Add backend deployment files"

# GitHub'a push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/velora-voip.git
git push -u origin main
```

---

## Adım 3: Render.com'da Backend Deploy

### 3.1 Render.com Hesabı
- https://render.com/
- "Get Started for Free"
- GitHub ile giriş yapın

### 3.2 New Web Service
1. Dashboard → **New** → **Web Service**
2. GitHub repository'nizi bağlayın (velora-voip)
3. **Connect** tıklayın

### 3.3 Yapılandırma

| Alan | Değer |
|------|-------|
| **Name** | `velora-backend` |
| **Region** | Frankfurt (EU Central) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free |

### 3.4 Environment Variables

**Advanced** → **Add Environment Variable**

| Key | Value |
|-----|-------|
| `MONGO_URL` | `mongodb+srv://admin:Velora2024!@velora.xxxxx.mongodb.net/` |
| `DB_NAME` | `velora_voip` |
| `CORS_ORIGINS` | `*` |
| `ELEVENLABS_API_KEY` | `sk_...` (varsa) |

⚠️ **ÖNEMLİ:** MONGO_URL'inizi MongoDB Atlas'tan alın!

### 3.5 Deploy
- **Create Web Service** tıklayın
- Deploy başlayacak (5-7 dakika sürer)

### 3.6 Backend URL'inizi Alın
Deploy tamamlandığında:
```
https://velora-backend.onrender.com
```

✅ Bu URL'i kopyalayın!

---

## Adım 4: Vercel'da Frontend Güncelleme

### 4.1 vercel.json Güncelleyin

`frontend/vercel.json` dosyasını açın:

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

**ÖNEMLİ:** `velora-backend.onrender.com` yerine kendi backend URL'inizi yazın!

### 4.2 Git Push

```bash
git add frontend/vercel.json
git commit -m "Update backend URL in vercel.json"
git push
```

Vercel otomatik olarak redeploy yapacak (2-3 dakika).

---

## Adım 5: Test

### 5.1 Backend Test
Tarayıcıda açın:
```
https://velora-backend.onrender.com/docs
```

FastAPI Swagger UI görmelisiniz.

### 5.2 Frontend Test
```
https://velora-voip-git-master-mustafas-projects-e6e0f0db.vercel.app
```

1. Giriş yapın
2. "Numara Ekle" butonuna tıklayın
3. Numara ekleyin

✅ Başarılı olmalı!

---

## Sorun Giderme

### Render'da Deploy Failed
**Kontrol:**
- `requirements.txt` var mı?
- Build command doğru mu?
- Start command doğru mu?

**Log'ları Kontrol:**
Render Dashboard → Service → Logs

### Backend Çalışmıyor
**Test:**
```bash
curl https://velora-backend.onrender.com/docs
```

**Olası Sorunlar:**
- MongoDB connection string yanlış
- Environment variables eksik
- CORS ayarları yanlış

### Frontend Backend'e Bağlanamıyor
**Kontrol:**
1. `vercel.json`'da backend URL doğru mu?
2. Vercel'da redeploy yaptınız mı?
3. Backend çalışıyor mu?

**Console'da Kontrol:**
F12 → Console → Network tab
- İstekler nereye gidiyor?
- Status code ne?

---

## Render.com Free Tier Notları

⚠️ **Cold Start:** Free tier'da 15 dakika inaktivite sonrası backend uyur. İlk istek 30-60 saniye sürebilir.

**Çözüm:** Paid plan ($7/ay) veya cron job ile her 10 dakikada bir ping atın.

---

## Alternatifler

### Railway.app
- Daha hızlı deploy
- Free $5 credit
- https://railway.app

### Heroku
- Artık free tier yok
- $7/ay başlangıç

### Vercel Serverless (İleri Seviye)
- Python için karmaşık
- Önerilmez

---

**Önerilen:** Render.com kullanın - en kolay ve güvenilir!
