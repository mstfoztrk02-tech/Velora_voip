# Hızlı Çözüm: MongoDB Atlas ile 5 Dakikada Başlat

## Adım 1: MongoDB Atlas Hesabı (2 dakika)

1. https://www.mongodb.com/cloud/atlas adresine gidin
2. **Try Free** tıklayın
3. Google hesabınızla giriş yapın (en hızlısı)

## Adım 2: Free Cluster Oluşturun (2 dakika)

1. **Create a deployment** → **M0 FREE** seçin
2. **Provider:** AWS
3. **Region:** Frankfurt (eu-central-1)
4. **Cluster Name:** velora
5. **Create Deployment**

## Adım 3: Kullanıcı ve Network (1 dakika)

### Database User:
- **Username:** `admin`
- **Password:** `Velora123!` (veya kendi şifreniz - KAYDEDIN!)
- **Create Database User**

### Network Access:
- **Add IP Address**
- **Allow Access from Anywhere** (0.0.0.0/0)
- **Confirm**

## Adım 4: Connection String Alın

1. **Connect** tıklayın
2. **Drivers** seçin
3. Connection string'i kopyalayın:
   ```
   mongodb+srv://admin:<password>@velora.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. `<password>` yerine şifrenizi yazın

**Örnek:**
```
mongodb+srv://admin:Velora123!@velora.abc123.mongodb.net/?retryWrites=true&w=majority
```

## Adım 5: Backend .env Güncelleyin

`backend/.env` dosyasını açın ve MONGO_URL satırını değiştirin:

**ÖNCESİ:**
```bash
MONGO_URL=mongodb://localhost:27017
```

**SONRASI:**
```bash
MONGO_URL=mongodb+srv://admin:Velora123!@velora.abc123.mongodb.net/?retryWrites=true&w=majority
```

**Tam .env örneği:**
```bash
# MongoDB Configuration
MONGO_URL=mongodb+srv://admin:Velora123!@velora.abc123.mongodb.net/?retryWrites=true&w=majority
DB_NAME=velora_voip

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

## Adım 6: Backend'i Yeniden Başlatın

1. **Mevcut backend'i durdurun:**
   - Task ID: b63b0ec çalışıyor
   - Terminal'de `Ctrl+C` yapın veya yeni terminal açın

2. **Yeni backend'i başlatın:**
   ```bash
   cd D:\Projects\Velora_voip-main\Velora_voip-main\backend
   uvicorn server:app --reload --port 8000
   ```

3. **Başarılı mesajı görmelisiniz:**
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000
   INFO:     Application startup complete.
   ```

## Adım 7: Test Edin

### Terminal'de:
```bash
curl http://localhost:8000/api/voip-crm/auto-dialer/status/demo-customer
```

### Tarayıcıda:
```
http://localhost:8000/docs
```

**Başarılı ise:** FastAPI Swagger UI görmelisiniz ve API'ler çalışır.

## Test: Numara Ekleme

Frontend'de "Numara Ekle" butonuna basın. Artık çalışmalı!

---

## Sorun Giderme

### "Authentication failed"
**Çözüm:** Connection string'deki şifreyi kontrol edin. Özel karakterler varsa encode edin:
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`

### "Network timeout"
**Çözüm:** MongoDB Atlas → Network Access → 0.0.0.0/0 ekli mi kontrol edin.

### Hala çalışmıyor
**Çözüm:** Backend loglarını kontrol edin:
```bash
cd backend
uvicorn server:app --reload --port 8000
```

Hata mesajını buradan görebilirsiniz.

---

## Alternatif: Local MongoDB Kurulumu (Uzun)

Eğer gerçekten local MongoDB istiyorsanız:

1. https://www.mongodb.com/try/download/community
2. Windows installer'ı indirin
3. Kurulum sırasında "Install MongoDB as a Service" seçin
4. Kurulum sonrası otomatik başlar

**ÖNERİ:** MongoDB Atlas daha kolay ve production'da da kullanabilirsiniz!
