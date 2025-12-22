# Vercel'da Backend URL'inizi Bulma ve Kontrol

## Adım 1: Vercel Dashboard'a Gidin

1. https://vercel.com/dashboard adresine gidin
2. Giriş yapın

## Adım 2: Backend Project'i Bulun

Dashboard'da 2 project görmelisiniz:
- 🎨 **Frontend project** (muhtemelen: velora-voip, velora-frontend, vs.)
- ⚙️ **Backend project** (muhtemelen: velora-backend, velora-voip-backend, vs.)

Backend project'e tıklayın.

## Adım 3: Production URL'i Kopyalayın

Backend project sayfasında:

1. Üst tarafta **Domains** bölümüne bakın
2. Production URL'ini göreceksiniz:
   ```
   https://xxx-backend.vercel.app
   ```
   veya
   ```
   https://velora-voip-backend-xxx.vercel.app
   ```

3. Bu URL'i **kopyalayın**

## Adım 4: Backend'in Çalıştığını Test Edin

### Terminal'de Test:
```bash
curl https://YOUR-BACKEND-URL.vercel.app/docs
```

### Tarayıcıda Test:
Tarayıcınızda açın:
```
https://YOUR-BACKEND-URL.vercel.app/docs
```

## Olası Sonuçlar

### ✅ Başarılı (FastAPI Swagger UI görünüyor)
Backend çalışıyor! Şimdi frontend'i düzeltelim:

`frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND-URL.vercel.app/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Git push yapın:
```bash
git add frontend/vercel.json
git commit -m "Fix backend URL"
git push
```

### ⚠️ Authentication Required
Vercel deployment protection aktif. İki çözüm:

**Çözüm 1: Protection'ı Kaldırın**
1. Backend project → Settings → Deployment Protection
2. "Standard Protection" veya "Off" seçin
3. Save

**Çözüm 2: Render.com'a Taşıyın**
Backend'i Render.com'a deploy edin (MIGRATE_BACKEND.md)

### ❌ 404 Not Found veya Hata
Backend düzgün deploy edilmemiş. İki seçenek:

**Seçenek 1: Backend'i Vercel'da Düzelt**
1. Backend project → Settings → General
2. **Root Directory** kontrol edin: `backend` olmalı
3. **Build Command** kontrol edin: `pip install -r requirements.txt`
4. **Output Directory** boş bırakın
5. Redeploy: Deployments → Latest → Redeploy

**Seçenek 2: Render.com'a Taşıyın** (Önerilen)
MIGRATE_BACKEND.md dosyasındaki adımları takip edin.

## Adım 5: Logs'u Kontrol Edin

Backend project'te:
1. **Deployments** sekmesi
2. En son deployment'a tıklayın
3. **View Function Logs** veya **Build Logs**

Hata varsa burada görünür.

## Yaygın Hatalar

### "Module not found: Can't resolve 'fastapi'"
**Çözüm:** `requirements.txt` eksik veya yanlış
- Backend klasöründe `requirements.txt` var mı?
- Doğru içeriği var mı?

### "Python version not supported"
**Çözüm:** Python version belirtin
- Backend project → Settings → General
- **Python Version:** 3.11 seçin

### "No Python files found"
**Çözüm:** Root directory yanlış
- Settings → General → Root Directory: `backend`

## Backend URL Formatları

Vercel backend URL'leri şu formatlarda olabilir:

```
https://velora-backend.vercel.app
https://velora-voip-backend.vercel.app
https://backend-velora.vercel.app
https://velora-voip-backend-xxx.vercel.app  (preview)
```

## Sonraki Adım

Backend URL'inizi buraya yazın, birlikte kontrol edelim:
```
Backend URL: _______________________________
```

Sonuç:
- [ ] ✅ Backend çalışıyor
- [ ] ⚠️ Authentication gerekiyor
- [ ] ❌ Hata alıyorum

Duruma göre çözümü birlikte bulalım!
