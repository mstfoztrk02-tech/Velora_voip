const { generateTTS } = require("./service");
const { withRateLimit } = require("../utils/rate-limiter");
const { withLogging } = require("../utils/logger");
const { withValidation, validators } = require("../utils/validation");

const MAX_TEXT_LENGTH = 5000;

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Only POST method is allowed",
    });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const baseUrl = process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io";
  const defaultVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      code: "MISCONFIG",
      message: "ELEVENLABS_API_KEY not configured",
    });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { text, voiceId, format, meta } = body;

  // Validation
  try {
    validators.required(text, 'text');
    validators.string(text, 'text', { min: 1, max: MAX_TEXT_LENGTH });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      code: "INVALID_INPUT",
      message: error.message,
    });
  }

  const selectedVoiceId = voiceId || defaultVoiceId;
  const selectedFormat = format || "mp3_44100_128";

  // Log request
  if (req.logger) {
    req.logger.info('Generating TTS', {
      requestId: req.requestId,
      textLength: text.length,
      voiceId: selectedVoiceId,
      format: selectedFormat,
    });
  }

  try {
    const result = await generateTTS({
      text,
      voiceId: selectedVoiceId,
      apiKey,
      baseUrl,
      format: selectedFormat,
    });

    return res.status(200).json({
      ok: true,
      code: "OK",
      ...result,
      meta: meta || {},
    });
  } catch (error) {
    const errorMsg = error?.message || String(error);
    const statusCode = error.response?.status || 502;

    let code = "TTS_ERROR";
    let message = "Failed to generate speech";

    if (errorMsg.includes("ECONNREFUSED") || errorMsg.includes("ETIMEDOUT")) {
      code = "TIMEOUT";
      message = "Cannot connect to ElevenLabs API";
    } else if (error.response?.status === 401) {
      code = "UNAUTHORIZED";
      message = "Invalid ElevenLabs API key";
    } else if (error.response?.status === 429) {
      code = "RATE_LIMIT";
      message = "ElevenLabs API rate limit exceeded";
    } else if (error.response?.status === 400) {
      code = "BAD_REQUEST";
      message = "Invalid request to ElevenLabs";
    }

    return res.status(statusCode).json({
      ok: false,
      code,
      message,
      details: error.response?.data?.detail || errorMsg,
    });
  }
}

// Apply middleware: Rate limiting (60 req/min) + Logging
module.exports = withRateLimit(
  withLogging(handler, 'ElevenLabs:Generate'),
  { maxRequests: 60, windowMs: 60000, keyPrefix: 'elevenlabs' }
);
