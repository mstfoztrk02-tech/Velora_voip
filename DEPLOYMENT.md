# Velora VoIP Deployment Guide

Bu kılavuz, Velora VoIP CRM sistemini Vercel (Frontend) ve Render.com (Backend) üzerinde deploy etmeniz için hazırlanmıştır.

## Ön Hazırlık

### Gerekli Servisler
- **MongoDB Atlas** (Ücretsiz tier kullanılabilir)
- **Render.com** hesabı (Backend için)
- **Vercel** hesabı (Frontend için - mevcut)
- **ElevenLabs API Key** (Opsiyonel)

---

## 1. MongoDB Atlas Kurulumu

### Adım 1: MongoDB Atlas Hesabı
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hesabı oluşturun
2. Yeni bir **Free Cluster** oluşturun
3. Cluster → "Connect" → "Connect your application" seçin
4. Connection string'i kopyalayın:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Adım 2: Database Kullanıcısı Oluşturun
1. Database Access → Add New Database User
2. Username ve şifre belirleyin
3. Built-in Role: **Read and write to any database**

### Adım 3: Network Access
1. Network Access → Add IP Address
2. **Allow Access from Anywhere** (0.0.0.0/0) seçin
3. Confirm

---

## 2. Backend Deployment (Render.com)

### Adım 1: GitHub Repository
1. Projenizi GitHub'a push edin:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/velora-voip.git
   git push -u origin main
   ```

### Adım 2: Render.com'da Web Service Oluşturun
1. [Render.com](https://render.com) hesabınıza giriş yapın
2. **New** → **Web Service**
3. GitHub repository'nizi bağlayın
4. Aşağıdaki ayarları yapın:
   - **Name:** `velora-voip-backend`
   - **Region:** Frankfurt (Europe) veya yakın bir bölge
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Adım 3: Environment Variables
Render Dashboard'da Environment Variables ekleyin:

| Key | Value |
|-----|-------|
| `MONGO_URL` | MongoDB connection string'iniz |
| `DB_NAME` | `velora_voip` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key (varsa) |
| `CORS_ORIGINS` | `*` veya frontend URL'iniz |

### Adım 4: Deploy
1. **Create Web Service**
2. Deploy işlemi otomatik başlayacak
3. Deploy tamamlandığında backend URL'inizi alın:
   ```
   https://velora-voip-backend.onrender.com
   ```

### Adım 5: Health Check
Backend'in çalıştığını kontrol edin:
```
https://velora-voip-backend.onrender.com/docs
```
Bu URL'de FastAPI Swagger dokümantasyonu görmelisiniz.

---

## 3. Frontend Deployment (Vercel)

### Adım 1: Vercel Environment Variables
Vercel Dashboard'da projenize gidin → **Settings** → **Environment Variables**

Aşağıdaki değişkeni ekleyin:

| Name | Value | Environments |
|------|-------|--------------|
| `REACT_APP_BACKEND_URL` | `https://velora-voip-backend.onrender.com` | Production, Preview, Development |

**ÖNEMLİ:** Render.com'dan aldığınız backend URL'ini buraya yazın.

### Adım 2: Redeploy
1. Vercel Dashboard → **Deployments**
2. En son deployment'ın yanındaki **⋯** (3 nokta) → **Redeploy**
3. Veya:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

### Adım 3: Test
Frontend URL'inizi açın ve şunları kontrol edin:
1. Login sayfası açılıyor mu?
2. Console'da network hatası var mı?
3. API istekleri backend'e gidiyor mu?

---

## 4. Local Development

### Backend
```bash
cd backend

# .env dosyası oluşturun
cat > .env << EOF
MONGO_URL=your_mongodb_connection_string
DB_NAME=velora_voip
ELEVENLABS_API_KEY=your_elevenlabs_key
CORS_ORIGINS=http://localhost:3000
EOF

# Sanal ortam oluştur
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Sunucuyu başlat
uvicorn server:app --reload --port 8000
```

### Frontend
```bash
cd frontend

# .env dosyası oluşturun
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start
```

---

## 5. Sorun Giderme

### Backend Bağlantı Hatası (ERR_CONNECTION_REFUSED)
**Sorun:** Frontend backend'e bağlanamıyor.

**Çözüm:**
1. Render.com'da backend'in çalıştığını kontrol edin
2. Vercel'da `REACT_APP_BACKEND_URL` değişkeninin doğru olduğunu kontrol edin
3. Vercel'da redeploy yapın
4. Backend URL'ine tarayıcıdan `/docs` ekleyerek erişmeyi deneyin

### CORS Hatası
**Sorun:** CORS policy hatası alıyorsunuz.

**Çözüm:**
1. Backend'de `CORS_ORIGINS` environment variable'ını kontrol edin
2. Frontend URL'inizi CORS_ORIGINS'e ekleyin:
   ```
   CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
   ```

### MongoDB Bağlantı Hatası
**Sorun:** Backend MongoDB'ye bağlanamıyor.

**Çözüm:**
1. MongoDB Atlas'ta Network Access → 0.0.0.0/0 ekli mi kontrol edin
2. Connection string'de username ve password doğru mu kontrol edin
3. Backend logs'u Render.com'da kontrol edin

### Otomatik Arama Çalışmıyor
**Sorun:** Numara ekleyemiyorsunuz veya arama başlatamıyorsunuz.

**Çözüm:**
1. Console'da network hatalarını kontrol edin
2. Backend'de `/api/voip-crm/auto-dialer/status/:customerId` endpoint'i çalışıyor mu test edin
3. ElevenLabs API key'in geçerli olduğundan emin olun

---

## 6. Monitoring

### Backend Logs (Render.com)
1. Render Dashboard → Service seçin
2. **Logs** sekmesi
3. Real-time log akışını izleyin

### Frontend Logs (Vercel)
1. Vercel Dashboard → Deployment seçin
2. **Functions** veya **Runtime Logs**
3. Tarayıcı console'u da kontrol edin

---

## 7. Üretim İyileştirmeleri

### Backend
- [ ] MongoDB indexes ekleyin (performans için)
- [ ] Rate limiting ekleyin (güvenlik için)
- [ ] API key authentication ekleyin
- [ ] SSL/TLS sertifikası (Render otomatik sağlar)
- [ ] Render'ı Free tier'dan ücretli plana yükseltin (cold start önlemek için)

### Frontend
- [ ] Environment-specific config dosyaları
- [ ] Error boundary components
- [ ] Analytics entegrasyonu
- [ ] SEO optimizasyonu

---

## 8. Alternatif Deployment Seçenekleri

### Backend
- **Railway.app** (Render alternatifi)
- **Heroku** (Ücretli)
- **AWS EC2** (Daha karmaşık)
- **DigitalOcean App Platform**

### Frontend
- **Netlify** (Vercel alternatifi)
- **AWS Amplify**
- **Cloudflare Pages**

---

## Destek

Sorunlarla karşılaşırsanız:
1. Backend logs kontrol edin
2. Frontend console errors kontrol edin
3. Network requests kontrol edin (Browser DevTools → Network)
4. [GitHub Issues](https://github.com/yourusername/velora-voip/issues) açın

---

**Güncelleme:** {current_date}
**Versiyon:** 1.0.0
