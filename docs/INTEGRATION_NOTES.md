# SippySoft XML-RPC Integration Guide

## Overview

This document describes the SippySoft XML-RPC integration for the Velora VoIP application. The integration consists of two serverless API endpoints and a frontend UI for testing the connection.

## Architecture

```
┌─────────────────┐
│  Frontend UI    │  (IntegrationsPage.jsx)
│  (No Auth)      │
└────────┬────────┘
         │
         │ GET /api/sippy/health (No Token Required)
         │
         ▼
┌─────────────────────────────────┐
│  Vercel Serverless Function     │
│  /api/sippy/health.js           │
│  - No admin token required      │
│  - Connection test only         │
│  - Rate-limited, GET only       │
└────────────┬────────────────────┘
             │
             │ XML-RPC over HTTP(S)
             │ Basic Auth or Params Auth
             │
             ▼
┌─────────────────────────────────┐
│  SippySoft Server               │
│  XML-RPC Endpoint               │
│  (https://185.8.12.118/RPC2)    │
└─────────────────────────────────┘

┌─────────────────┐
│  Admin/Backend  │  (Optional)
│  Operations     │
└────────┬────────┘
         │
         │ POST /api/sippy (Admin Token Required)
         │ Authorization: Bearer <ADMIN_API_TOKEN>
         │
         ▼
┌─────────────────────────────────┐
│  Vercel Serverless Function     │
│  /api/sippy.js                  │
│  - Admin token required (if set)│
│  - Full RPC proxy               │
└────────────┬────────────────────┘
             │
             │ XML-RPC over HTTP(S)
             │
             ▼
┌─────────────────────────────────┐
│  SippySoft Server               │
└─────────────────────────────────┘
```

## API Endpoints

### 1. `/api/sippy/health` - Health Check Endpoint

**Purpose**: Test Sippy connection without requiring admin authentication.

**Method**: `GET` only

**Authentication**: None (publicly accessible, but rate-limited)

**Response Format**:

```json
// Success
{
  "ok": true,
  "status": "OK",
  "message": "Sippy RPC connection successful",
  "details": {
    "rpcUrl": "https://185.8.12.118/***",
    "authMode": "basic",
    "testMethod": "system.listMethods",
    "user": "ss***ot",
    "resultPreview": ["method1", "method2", "..."]
  }
}

// Error
{
  "ok": false,
  "status": "TIMEOUT|UNAUTHORIZED|MISCONFIG|TLS_ERROR|RPC_ERROR",
  "message": "Human-readable error message",
  "details": "Troubleshooting suggestions",
  "debug": {
    "rpcUrl": "https://185.8.12.118/***",
    "authMode": "basic",
    "testMethod": "system.listMethods",
    "user": "ss***ot",
    "rawError": "Original error message"
  }
}
```

**Status Codes**:
- `OK`: Connection successful
- `UNAUTHORIZED`: Authentication failed (wrong credentials)
- `TIMEOUT`: Connection timeout or refused
- `MISCONFIG`: Configuration error (missing env vars, wrong endpoint path)
- `TLS_ERROR`: SSL/TLS certificate error
- `RPC_ERROR`: Other XML-RPC errors
- `METHOD_NOT_ALLOWED`: Non-GET request

### 2. `/api/sippy` - Full RPC Proxy

**Purpose**: Execute arbitrary XML-RPC methods on Sippy server.

**Methods**: `GET` (test), `POST` (execute)

**Authentication**: Admin token (if `ADMIN_API_TOKEN` is set)

**Headers** (if admin token is configured):
```
Authorization: Bearer <ADMIN_API_TOKEN>
```

**POST Request Body**:
```json
{
  "method": "account.add_account",
  "params": ["param1", "param2"]
}
```

**Response Format**: Same as `/api/sippy/health`

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SIPPY_RPC_URL` | Sippy XML-RPC endpoint URL | `https://185.8.12.118/RPC2` |
| `SIPPY_RPC_USER` | Sippy RPC username | `ssp-root` |
| `SIPPY_RPC_PASS` | Sippy RPC password | `549!x!nyk7wAM` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SIPPY_AUTH_MODE` | Authentication mode: `basic` or `params` | `basic` |
| `SIPPY_TEST_METHOD` | RPC method for health check | `system.listMethods` |
| `SIPPY_DISABLE_TLS_VERIFY` | Disable TLS cert verification for self-signed certs | `false` |
| `ADMIN_API_TOKEN` | Admin token for `/api/sippy` endpoint | (none) |

### Configuration in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the required variables for each environment (Production, Preview, Development)
4. Redeploy to apply changes

### Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Sippy credentials in `.env.local`

3. Start the development server:
   ```bash
   npm start
   ```

## Authentication Modes

### Basic Auth (Recommended)

```env
SIPPY_AUTH_MODE=basic
```

Credentials are sent via HTTP Authorization header:
```
Authorization: Basic base64(username:password)
```

This is the standard and most secure method.

### Params Auth

```env
SIPPY_AUTH_MODE=params
```

Credentials are sent as RPC method parameters:
```javascript
client.methodCall("system.listMethods", ["ssp-root", "password"], callback)
```

Use this if your Sippy server requires credentials as parameters.

## Frontend Integration

The `IntegrationsPage.jsx` component:

1. **Automatically tests** the connection on page load
2. **Displays status** with icons and colors:
   - ✅ Green: Connected (OK)
   - ❌ Red: Connection failed
   - 🔒 Lock: Authentication error (UNAUTHORIZED)
   - ⏱️ Timer: Timeout
   - ⚙️ Gear: Configuration error
   - 🔐 Secure: TLS/SSL error
3. **Shows details** on success (masked credentials, test method, result preview)
4. **Shows debug info** on failure (collapsed by default)
5. **No admin token required** - uses `/api/sippy/health` endpoint

## Troubleshooting

### Issue: "Unauthorized" Error

**Possible Causes**:
- Wrong `SIPPY_RPC_USER` or `SIPPY_RPC_PASS`
- Wrong `SIPPY_AUTH_MODE` (try switching between `basic` and `params`)
- Sippy server requires additional authentication

**Solutions**:
1. Verify credentials in Sippy admin panel
2. Try changing `SIPPY_AUTH_MODE` to `params`
3. Check Sippy logs for authentication errors

### Issue: "Timeout" or "Connection Refused"

**Possible Causes**:
- Wrong `SIPPY_RPC_URL`
- Sippy server is down or unreachable
- Firewall blocking connection
- Wrong endpoint path (not `/RPC2`)

**Solutions**:
1. Verify Sippy server is running: `curl -I https://185.8.12.118`
2. Try different endpoint paths:
   - `/RPC2` (most common)
   - `/xmlrpc`
   - `/RPC`
   - Check Sippy documentation for your version
3. Check firewall rules and network connectivity
4. Test from Vercel's network (deploy and check production logs)

### Issue: "TLS/SSL Certificate Error"

**Possible Causes**:
- Self-signed certificate
- Expired certificate
- Certificate hostname mismatch

**Solutions**:
1. **Quick Fix (Self-Signed Certificates)**: Set environment variable in Vercel:
   ```env
   SIPPY_DISABLE_TLS_VERIFY=true
   ```
   Then redeploy. This disables certificate verification.

   **⚠️ WARNING**: This reduces security. Only use if your Sippy server has a self-signed certificate that you trust.

2. **Recommended (Production)**: Use a valid SSL certificate on your Sippy server:
   - Let's Encrypt (free, automated)
   - Commercial CA certificate
   - This is the most secure solution

### Issue: "Endpoint Not Found" (404)

**Possible Causes**:
- Wrong RPC endpoint path in `SIPPY_RPC_URL`

**Solutions**:
1. Try common paths:
   - `https://185.8.12.118/RPC2`
   - `https://185.8.12.118/xmlrpc`
   - `https://185.8.12.118/RPC`
2. Check Sippy documentation for your specific version
3. Use Sippy admin panel to find the correct endpoint

### Issue: Frontend Shows "MISCONFIG"

**Possible Causes**:
- Missing required environment variables

**Solutions**:
1. Ensure all required variables are set in Vercel dashboard
2. Redeploy after adding environment variables
3. Check Vercel function logs for specific missing variables

## Security Best Practices

1. **Never expose Sippy credentials to frontend**
   - Credentials are only in server-side environment variables
   - Frontend only calls `/api/sippy/health` (no credentials needed)

2. **Use HTTPS in production**
   - Always use `https://` URLs for Sippy endpoints
   - Use valid SSL certificates (not self-signed)

3. **Set admin token for production**
   - Set `ADMIN_API_TOKEN` to protect `/api/sippy` endpoint
   - Use a strong, random token (e.g., `openssl rand -base64 32`)

4. **Credentials are masked in logs**
   - All API responses mask sensitive data
   - Usernames: `ss***ot`
   - Passwords: never logged
   - URLs: credentials stripped

5. **Rate limiting**
   - `/api/sippy/health` is GET-only to prevent abuse
   - Consider adding Vercel Edge Middleware for additional rate limiting

## Testing

### Manual Testing

1. **Health Check**:
   ```bash
   curl https://your-app.vercel.app/api/sippy/health
   ```

2. **RPC Call** (requires admin token):
   ```bash
   curl -X POST https://your-app.vercel.app/api/sippy \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"method":"system.listMethods","params":[]}'
   ```

### Frontend Testing

1. Navigate to the Integrations page in your app
2. Click "Bağlantıyı Yeniden Test Et"
3. Check status indicator and details

## Changelog

### v2.0 (Current)
- ✅ Separated health check endpoint (`/api/sippy/health`)
- ✅ Removed frontend admin token requirement
- ✅ Added comprehensive error categorization
- ✅ Improved UI with status indicators and debug info
- ✅ Added credential masking in all responses
- ✅ Added TLS certificate validation
- ✅ Added detailed troubleshooting guides

### v1.0 (Old)
- ❌ Frontend required admin token (caused "Unauthorized" errors)
- ❌ Single endpoint for both health check and RPC calls
- ❌ Poor error messages
- ❌ No credential masking

## Support

For issues or questions:
1. Check this document's Troubleshooting section
2. Review Vercel function logs
3. Check Sippy server logs
4. Open an issue in the repository
