# Velora VoIP Frontend

This project is a CRA/CRACO + React Router frontend with Vercel Serverless Functions for **SippySoft**, **Issabel**, and **ElevenLabs** integrations.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure credentials in .env.local
# Then start the development server
npm start
```

---

## 🔌 Integrations

This project includes three production-ready server-side integrations:

### 1. SippySoft (XML-RPC)
### 2. Issabel (pbxapi)
### 3. ElevenLabs (TTS/Voice)

All integrations are **server-side only** – API keys and credentials never reach the frontend.

---

## 📦 API Structure

```
api/
├── sippy/
│   ├── index.js         # Main RPC proxy
│   └── health.js        # Health check
├── issabel/
│   ├── auth.js          # JWT token management
│   ├── health.js        # Health check
│   ├── proxy.js         # Generic proxy helper
│   ├── extensions.js    # Extensions endpoint
│   ├── trunks.js        # Trunks endpoint
│   ├── queues.js        # Queues endpoint
│   ├── ivr.js           # IVR endpoint
│   ├── inboundroutes.js # Inbound routes endpoint
│   └── outboundroutes.js# Outbound routes endpoint
└── elevenlabs/
    ├── voices.js        # List voices
    └── tts.js           # Text-to-speech
```

---

## ⚙️ Configuration

### Required Environment Variables

See `.env.example` for full configuration. Key variables:

#### SippySoft
```env
SIPPY_RPC_URL=https://your-sippy-server.com/RPC2
SIPPY_RPC_USER=ssp-root
SIPPY_RPC_PASS=your-password
```

#### Issabel
```env
ISSABEL_BASE_URL=http://185.8.12.117
ISSABEL_USERNAME=admin
ISSABEL_PASSWORD=***
```

#### ElevenLabs
```env
ELEVENLABS_API_KEY=your-api-key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

---

## 🧪 Testing Integrations

### Web UI
Navigate to **Integrations** page in the app to test all three integrations with a visual interface.

### cURL Examples

#### SippySoft Health Check
```bash
curl http://localhost:3000/api/sippy/health
```

**Response:**
```json
{
  "ok": true,
  "code": "OK",
  "message": "Sippy RPC connection successful",
  "details": {
    "rpcUrl": "https://***",
    "authMode": "digest/basic",
    "testMethod": "system.listMethods"
  }
}
```

#### Issabel Health Check
```bash
curl http://localhost:3000/api/issabel/health
```

**Response:**
```json
{
  "ok": true,
  "code": "OK",
  "message": "Issabel connection successful",
  "details": {
    "baseUrl": "http://185.8.12.117",
    "username": "admin",
    "authenticated": true
  }
}
```

#### Issabel Extensions (Example)
```bash
curl http://localhost:3000/api/issabel/extensions
```

#### ElevenLabs Voices
```bash
curl http://localhost:3000/api/elevenlabs/voices
```

**Response:**
```json
{
  "ok": true,
  "code": "OK",
  "data": {
    "voices": [
      {
        "voice_id": "21m00Tcm4TlvDq8ikWAM",
        "name": "Rachel",
        "category": "premade"
      }
    ]
  }
}
```

#### ElevenLabs Text-to-Speech
```bash
curl -X POST http://localhost:3000/api/elevenlabs/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, this is a test."}'
```

**Response:**
```json
{
  "ok": true,
  "code": "OK",
  "data": {
    "audio": "base64-encoded-audio-data...",
    "format": "mp3_44100_128",
    "voice_id": "21m00Tcm4TlvDq8ikWAM",
    "text_length": 23
  }
}
```

---

## 🔧 Issabel Controller Discovery

To discover available Issabel pbxapi controllers:

```bash
ssh admin@185.8.12.117
ls -1 /var/www/html/pbxapi/controllers
```

Common controllers:
- `extensions`
- `trunks`
- `queues`
- `ivr`
- `inboundroutes`
- `outboundroutes`
- `recordings`
- `announcements`

---

## 🐛 Troubleshooting

### SippySoft "Unauthorized" Error
- Verify `SIPPY_RPC_USER` and `SIPPY_RPC_PASS` are correct
- The integration auto-detects Digest or Basic auth
- Check if retry mechanism (1 retry with 1s backoff) is exhausted

### Issabel "Unauthorized" Error
- Check `ISSABEL_USERNAME` and `ISSABEL_PASSWORD`
- Token is cached in-memory and auto-refreshes before expiry
- 401 triggers automatic re-authentication (1 retry)

### ElevenLabs "Rate Limit" Error
- Check your ElevenLabs account quota
- Consider caching TTS results for repeated text

### General Timeout Errors
- All integrations use 15s timeout
- Check network connectivity and firewall rules

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
