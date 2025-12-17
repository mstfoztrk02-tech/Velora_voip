const axios = require("axios");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Only GET method is allowed",
    });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const baseUrl = process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io";

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      code: "MISCONFIG",
      message: "ELEVENLABS_API_KEY environment variable is not configured",
    });
  }

  try {
    const response = await axios.get(`${baseUrl}/v1/voices`, {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    return res.status(200).json({
      ok: true,
      code: "OK",
      data: response.data,
    });
  } catch (error) {
    const errorMsg = error?.message || String(error);
    const statusCode = error.response?.status || 502;

    let code = "API_ERROR";
    let message = "Failed to fetch ElevenLabs voices";

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
    }

    return res.status(statusCode).json({
      ok: false,
      code,
      message,
      details: error.response?.data?.detail || errorMsg,
    });
  }
};
