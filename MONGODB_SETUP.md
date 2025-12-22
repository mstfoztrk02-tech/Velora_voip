# MongoDB Kurulum Kılavuzu

## Seçenek 1: MongoDB Atlas (ÖNERİLEN - Cloud & Ücretsiz)

### Adım 1: MongoDB Atlas Hesabı Oluşturun
1. https://www.mongodb.com/cloud/atlas adresine gidin
2. "Try Free" → Kayıt olun (Google ile de giriş yapabilirsiniz)

### Adım 2: Cluster Oluşturun
1. **Create a deployment** → **FREE** seçin
2. **Cloud Provider:** AWS (veya istediğiniz)
3. **Region:** Frankfurt (veya size yakın)
4. **Cluster Name:** velora-voip (veya istediğiniz)
5. **Create Deployment**

### Adım 3: Database User Oluşturun
Cluster oluştuktan sonra:
1. **Username:** `veloraadmin` (veya istediğiniz)
2. **Password:** Güçlü bir şifre oluşturun (KAYDEDIN!)
3. **Create Database User**

### Adım 4: Network Access
1. **Add IP Address**
2. **Allow Access from Anywhere** (0.0.0.0/0)
3. **Confirm**

⚠️ **Güvenlik Notu:** Production'da sadece Render.com IP'sini ekleyin

### Adım 5: Connection String
1. **Connect** → **Drivers** → **Python**
2. Connection string'i kopyalayın:
   ```
   mongodb+srv://veloraadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. `<password>` yerine şifrenizi yazın

### Adım 6: Backend .env Güncelleyin
`backend/.env` dosyasını açın:

```bash
# MONGO_URL=mongodb://localhost:27017
MONGO_URL=mongodb+srv://veloraadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=velora_voip
```

### Adım 7: Backend'i Yeniden Başlatın
```bash
# Eski backend'i durdurun (Ctrl+C)
# Yeni backend'i başlatın
cd backend
uvicorn server:app --reload --port 8000
```

### Test Edin
```bash
curl http://localhost:8000/api/voip-crm/auto-dialer/status/demo-customer
```

---

## Seçenek 2: Local MongoDB (Windows)

### Adım 1: MongoDB İndirin
1. https://www.mongodb.com/try/download/community
2. Windows için .msi dosyasını indirin
3. Kurulumu yapın

### Adım 2: MongoDB Servisini Başlatın
```bash
# Yönetici olarak CMD açın
net start MongoDB
```

Veya:
```bash
# MongoDB'yi manuel başlatın
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

⚠️ **Not:** İlk defa çalıştırıyorsanız `C:\data\db` klasörünü oluşturun:
```bash
mkdir C:\data\db
```

### Adım 3: Backend'i Yeniden Başlatın
```bash
cd backend
uvicorn server:app --reload --port 8000
```

---

## Sorun Giderme

### "Authentication failed" hatası
**Çözüm:** Connection string'deki şifreyi kontrol edin. Özel karakterler varsa URL encode edin.

### "Network timeout" hatası
**Çözüm:** MongoDB Atlas'ta Network Access → 0.0.0.0/0 eklenmiş mi kontrol edin.

### "Connection refused" hatası
**Çözüm:**
- Local MongoDB: MongoDB servisi çalışıyor mu? → `net start MongoDB`
- Atlas: İnternet bağlantınızı kontrol edin

---

## Production (Render.com) İçin

Render.com'da Environment Variables:
```
MONGO_URL=mongodb+srv://veloraadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=velora_voip
```

---

**ÖNERİ:** MongoDB Atlas kullanın - daha kolay, ücretsiz ve güvenilir!
