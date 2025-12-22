# Vercel Kurulum Kılavuzu

Bu kılavuz, frontend'in Vercel'da backend ile düzgün çalışması için gerekli adımları içerir.

## Yapılan Değişiklikler

### 1. Akıllı Backend URL Tespiti
**frontend/src/services/apiClient.js** güncellendi:
- Environment variable varsa onu kullanır
- Yoksa, production'da `window.location.origin` kullanır
- Localhost'ta otomatik olarak `http://localhost:8000` kullanır

### 2. Vercel API Proxy
**frontend/vercel.json** güncellendi:
- `/api/*` istekleri backend'e yönlendirilir
- SPA routing korunur

---

## Seçenek 1: Vercel Proxy Kullanımı (ÖNERİLEN)

Bu yöntemde backend'e direkt istek atmak yerine, Vercel üzerinden proxy yapılır.

### Adım 1: vercel.json'u Düzenleyin

`frontend/vercel.json` dosyasında backend URL'inizi güncelleyin:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://BACKEND_URL.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**BACKEND_URL.onrender.com** kısmını kendi backend URL'inizle değiştirin.

### Adım 2: Deploy Edin

```bash
git add .
git commit -m "Add Vercel proxy for backend"
git push
```

Vercel otomatik olarak redeploy yapacak.

### Avantajları
✅ CORS sorunu yok (aynı origin'den istek)
✅ Environment variable gerekmez
✅ Frontend ve backend URL'i farklı olabilir

---

## Seçenek 2: Environment Variable Kullanımı

Backend'i direkt olarak çağırmak istiyorsanız.

### Adım 1: Vercel Environment Variable

Vercel Dashboard → Settings → Environment Variables:

| Name | Value | Environments |
|------|-------|--------------|
| `REACT_APP_BACKEND_URL` | `https://your-backend.onrender.com` | Production, Preview, Development |

### Adım 2: Backend'de CORS Ayarı

Backend'de CORS ayarlarını düzenleyin (zaten yapılmış olmalı):

```python
# backend/server.py
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["https://your-frontend.vercel.app", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Adım 3: Redeploy

```bash
# Vercel'da redeploy tetikle
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## Test

### 1. Console'u Kontrol Edin

Tarayıcı console'unda:
```javascript
console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL || window.location.origin);
```

### 2. Network İsteklerini Kontrol Edin

Browser DevTools → Network:
- İstekler nereye gidiyor?
- Status code 200 mü?
- CORS hatası var mı?

### 3. API Test

Manuel olarak test edin:
```
https://your-frontend.vercel.app/api/voip-crm/statistics
```

---

## Sorun Giderme

### Hata: "localhost:8000" görüyorum
**Çözüm:**
1. Tarayıcı cache'ini temizleyin (Ctrl+Shift+R)
2. Vercel'da environment variable set edilmiş mi kontrol edin
3. Redeploy yapın

### Hata: CORS Policy
**Çözüm:**
1. **Seçenek 1 kullanıyorsanız:** vercel.json'da backend URL doğru mu?
2. **Seçenek 2 kullanıyorsanız:** Backend CORS ayarlarında frontend URL'i var mı?

### Hata: 404 Not Found
**Çözüm:**
1. Backend çalışıyor mu? → `https://your-backend.onrender.com/docs`
2. vercel.json'da destination URL doğru mu?
3. API path'i doğru mu? → `/api/voip-crm/...`

---

## Öneriler

### Development (Localhost)
```bash
# Backend
cd backend
uvicorn server:app --reload --port 8000

# Frontend
cd frontend
npm start  # Otomatik olarak http://localhost:8000 kullanır
```

### Production (Vercel)
- **Seçenek 1 (Proxy)** önerilir - daha az karmaşık
- vercel.json'u güncelleyin ve deploy edin

### Staging/Preview
Vercel Preview deployments için de aynı proxy çalışır.

---

## Güvenlik

### Production'da
- Backend'de CORS'u spesifik domain'lere kısıtlayın
- API rate limiting ekleyin
- Environment variables'ı Vercel secrets olarak saklayın

### Backend URL'i Gizlemek
Seçenek 1 (Proxy) kullanırsanız, kullanıcılar backend URL'ini görmez.

---

## Sonraki Adımlar

- [ ] Backend'i Render.com'da deploy edin
- [ ] Render backend URL'ini vercel.json'a ekleyin
- [ ] Git push yapın
- [ ] Vercel'da production deployment'ı test edin
- [ ] MongoDB Atlas bağlantısını kontrol edin

---

**Güncelleme:** 2024
**Versiyon:** 1.1.0
