# SippySoft CDR Entegrasyonu Kurulum Rehberi

## Genel Bakış

Bu rehber, Velora VoIP CRM sistemine SippySoft entegrasyonunu kurmanız ve CDR (Call Detail Records) verilerini gerçek zamanlı olarak görüntülemeniz için gerekli adımları içerir.

## Yapılan Değişiklikler

### 1. Backend Entegrasyonu

#### Yeni Dosyalar:
- `backend/sippy_integration.py` - SippySoft **XML-RPC** entegrasyon modülü

#### Güncellenmiş Dosyalar:
- `backend/server.py` - Sippy router'ı eklendi
- `backend/.env` - SippySoft XML-RPC, Issabel ve ElevenLabs yapılandırmaları eklendi

#### Önemli Notlar:
- **XML-RPC Protokolü**: Backend, frontend ile aynı XML-RPC protokolünü kullanır
- **HTTP Digest Auth**: SippySoft'a bağlanmak için HTTP Digest authentication kullanılır
- **Frontend ile Senkron**: IntegrationsPage'deki credential'lar ile **tamamen aynı**

### 2. Frontend Güncellemeleri

#### Güncellenmiş Dosyalar:
- `frontend/src/pages/VoIPCRM.jsx` - Gerçek zamanlı CDR görünümü eklendi

## Kurulum Adımları

### 1. Credential'lar Frontend'den Otomatik Alınıyor

Backend, frontend'deki `.env` dosyasındaki SippySoft credential'larını kullanıyor:
- **SIPPY_RPC_URL**: XML-RPC endpoint URL'i
- **SIPPY_RPC_USER**: XML-RPC kullanıcı adı
- **SIPPY_RPC_PASS**: XML-RPC şifresi
- **SIPPY_DISABLE_TLS_VERIFY**: TLS doğrulaması (self-signed sertifikalar için)

### 2. Backend Yapılandırması

Backend `.env` dosyası frontend ile **aynı credential'ları** kullanacak şekilde ayarlanmıştır:

```env
# SippySoft XML-RPC Configuration (matching frontend)
SIPPY_RPC_URL=https://185.8.12.118/xmlapi/xmlapi
SIPPY_RPC_USER=ssp-root
SIPPY_RPC_PASS=549!x!nyk7wAM
SIPPY_DISABLE_TLS_VERIFY=true
```

**NOT:** Bu credential'lar IntegrationsPage'deki "Test Connection" butonu ile aynı bilgileri kullanır.

### 3. Backend'i Yeniden Başlatın

```bash
cd backend
python server.py
```

### 4. Entegrasyonu Test Edin

#### Test 1: IntegrationsPage üzerinden
1. Tarayıcınızda `/integrations` sayfasına gidin
2. "SippySoft Health" bölümünde "Test Connection" butonuna tıklayın
3. Yeşil onay işareti ve bağlantı detaylarını görmelisiniz

#### Test 2: Doğrudan API Endpoint
```bash
curl http://localhost:8000/api/sippy/health
```

Başarılı yanıt:
```json
{
  "ok": true,
  "message": "SippySoft API connection successful",
  "details": {
    "status": "connected",
    "api_url": "https://api.sippysoft.com",
    "account_id": "your_account_id",
    "authenticated": true,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 5. CDR Verilerini Görüntüleme

1. VoIP CRM sayfasına gidin (`/voip-crm`)
2. Sayfanın alt kısmında "Gerçek Zamanlı Çağrı Görünümü (Live)" kartını göreceksiniz
3. Bu kart SippySoft'tan CDR verilerini otomatik olarak çeker ve her 30 saniyede bir günceller
4. Manuel yenilemek için "Yenile" butonuna tıklayabilirsiniz

## API Endpoint'leri

### SippySoft Endpoints

#### 1. Health Check
```
GET /api/sippy/health
```
SippySoft API bağlantısını kontrol eder.

#### 2. CDR Listesi
```
GET /api/sippy/cdrs?limit=100&offset=0
```
Call Detail Records (CDR) verilerini getirir.

**Query Parameters:**
- `limit` (varsayılan: 100): Maksimum kayıt sayısı
- `offset` (varsayılan: 0): Sayfalama için başlangıç noktası

**Yanıt Örneği:**
```json
[
  {
    "call_id": "12345",
    "caller": "+905551234567",
    "callee": "+905559876543",
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T10:05:00Z",
    "duration": 300,
    "status": "completed",
    "direction": "outbound",
    "country": "Turkey",
    "city": "Istanbul",
    "cost": 0.15,
    "trunk": "trunk1",
    "codec": "G.711"
  }
]
```

#### 3. Test Connection
```
POST /api/sippy/test-connection
```
Özel kimlik bilgileri ile bağlantı testi yapar.

**Request Body:**
```json
{
  "api_url": "https://api.sippysoft.com",
  "api_key": "your_key",
  "api_secret": "your_secret",
  "account_id": "your_account_id"
}
```

### Diğer Entegrasyon Endpoints

#### Issabel PBX
```
GET /api/issabel/health
```

#### ElevenLabs
```
GET /api/elevenlabs/voices
POST /api/elevenlabs/tts
```

## Özellikler

### Gerçek Zamanlı CDR Görünümü

VoIPCRM sayfasındaki "Gerçek Zamanlı Çağrı Görünümü (Live)" kartı:

✅ SippySoft'tan otomatik CDR çekimi
✅ Her 30 saniyede bir otomatik yenileme
✅ Manuel yenileme butonu
✅ Yükleme durumu göstergesi
✅ Detaylı çağrı bilgileri:
  - Arayan ve aranan numaralar
  - Çağrı yönü (Gelen/Giden)
  - Çağrı durumu (completed/failed)
  - Ülke ve şehir bilgisi
  - Çağrı süresi
  - Tarih-saat bilgisi

### CDR Veri Dönüşümü

SippySoft API'den gelen veriler otomatik olarak uygulamanızın formatına dönüştürülür:
- Farklı alan isimleri normalize edilir (caller/cli/from_number → caller)
- Zaman bilgileri ISO format'a çevrilir
- Durum kodları standartlaştırılır

## Sorun Giderme

### Bağlantı Hataları

**Problem:** "SippySoft credentials not configured" hatası
**Çözüm:** `.env` dosyasında `SIPPY_API_KEY` ve `SIPPY_API_SECRET` değerlerinin doğru ayarlandığından emin olun.

**Problem:** "Authentication failed" hatası
**Çözüm:**
- API kimlik bilgilerinizi kontrol edin
- SippySoft hesabınızın aktif olduğundan emin olun
- API izinlerinizi kontrol edin

**Problem:** CDR verileri görünmüyor
**Çözüm:**
- Backend'in çalıştığından emin olun
- Tarayıcı konsolunda hata mesajlarını kontrol edin
- `/api/sippy/cdrs` endpoint'ine doğrudan istek atarak test edin

### CORS Hataları

Eğer CORS hatası alıyorsanız, `backend/.env` dosyasında:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Güvenlik Notları

⚠️ **Önemli:**
- API anahtarlarınızı asla git repository'nize commit etmeyin
- `.env` dosyası `.gitignore`'da olmalıdır
- Üretim ortamında güçlü kimlik bilgileri kullanın
- API anahtarlarını düzenli olarak yenileyin

## Sonraki Adımlar

1. ✅ CDR verilerini AI ile analiz etme
2. ✅ Spam tespiti ekleme
3. ✅ Çağrı kayıtlarını filtreleme
4. ✅ CDR verilerini raporlara dahil etme
5. ✅ Gerçek zamanlı bildirimler

## Destek

Sorularınız için:
- GitHub Issues: [Proje Repository]
- Dokümantasyon: Bu dosya
- API Dokümantasyonu: SippySoft API Docs

## Lisans

Bu entegrasyon Velora VoIP projesi kapsamında geliştirilmiştir.
