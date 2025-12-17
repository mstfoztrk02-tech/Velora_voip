const axios = require("axios");

const MAX_TEXT_LENGTH = 5000;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Only POST method is allowed",
    });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const baseUrl = process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io";
  const defaultVoiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      code: "MISCONFIG",
      message: "ELEVENLABS_API_KEY environment variable is not configured",
    });
  }

  // Input validation
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const text = body?.text;
  const voiceId = body?.voice_id || defaultVoiceId;
  const outputFormat = body?.output_format || "mp3_44100_128"; // Can be: mp3_44100_128, pcm_16000, pcm_22050, pcm_24000, ulaw_8000

  if (!text || typeof text !== "string") {
    return res.status(400).json({
      ok: false,
      code: "BAD_REQUEST",
      message: "Missing or invalid 'text' parameter",
    });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      ok: false,
      code: "PAYLOAD_TOO_LARGE",
      message: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`,
    });
  }

  if (!voiceId || typeof voiceId !== "string") {
    return res.status(400).json({
      ok: false,
      code: "BAD_REQUEST",
      message: "Missing or invalid 'voice_id' parameter",
    });
  }

  try {
    const response = await axios.post(
      `${baseUrl}/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        params: {
          output_format: outputFormat,
        },
        responseType: "arraybuffer",
        timeout: 15000,
      }
    );

    // Convert to base64 for JSON response
    const audioBase64 = Buffer.from(response.data).toString("base64");

    return res.status(200).json({
      ok: true,
      code: "OK",
      data: {
        audio: audioBase64,
        format: outputFormat,
        voice_id: voiceId,
        text_length: text.length,
      },
    });
  } catch (error) {
    const errorMsg = error?.message || String(error);
    const statusCode = error.response?.status || 502;

    let code = "API_ERROR";
    let message = "Failed to generate speech";

    if (
      errorMsg.includes("ECONNREFUSED") ||
      errorMsg.includes("ETIMEDOUT") ||
      errorMsg.includes("ENOTFOUND")
    ) {
      code = "TIMEOUT";
      message = "Cannot connect to ElevenLabs API";
    } else if (error.response?.status === 401) {
      code = "UNAUTHORIZED";
      message = "Invalid ElevenLabs API key";
    } else if (error.response?.status === 429) {
      code = "RATE_LIMIT";
      message = "ElevenLabs API rate limit exceeded";
    } else if (error.response?.status === 403) {
      code = "FORBIDDEN";
      message = "Access forbidden - check API key permissions";
    } else if (error.response?.status === 400) {
      code = "BAD_REQUEST";
      message = "Invalid request parameters";
    } else if (error.response?.status === 404) {
      code = "NOT_FOUND";
      message = "Voice ID not found";
    }

    return res.status(statusCode).json({
      ok: false,
      code,
      message,
      details: error.response?.data?.detail || errorMsg,
    });
  }
};
