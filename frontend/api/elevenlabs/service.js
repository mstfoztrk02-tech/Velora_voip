const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");

// In-memory cache for voices (10 minutes TTL)
let voicesCache = {
  data: null,
  expiresAt: null,
};

// TTS asset cache (hash-based idempotency)
const ttsAssets = new Map(); // hash -> { audioId, path, format, voiceId, createdAt }

const TTS_STORAGE_DIR = path.join("/tmp", "tts-assets"); // Vercel /tmp (ephemeral)
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Initialize TTS storage directory
 */
async function ensureStorageDir() {
  try {
    await fs.mkdir(TTS_STORAGE_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

/**
 * Generate hash for text + voiceId (idempotency key)
 */
function generateHash(text, voiceId) {
  return crypto
    .createHash("sha256")
    .update(`${text}:${voiceId}`)
    .digest("hex")
    .substring(0, 16);
}

/**
 * Fetch voices with caching
 */
async function getVoicesCached(apiKey, baseUrl) {
  const now = Date.now();

  if (voicesCache.data && voicesCache.expiresAt > now) {
    return voicesCache.data;
  }

  const response = await axios.get(`${baseUrl}/v1/voices`, {
    headers: {
      "xi-api-key": apiKey,
    },
    timeout: 15000,
  });

  voicesCache = {
    data: response.data,
    expiresAt: now + CACHE_TTL,
  };

  return response.data;
}

/**
 * Generate TTS audio with caching and file storage
 * @returns {audioId, audioUrl, format, voiceId, cached}
 */
async function generateTTS({
  text,
  voiceId,
  apiKey,
  baseUrl,
  format = "mp3_44100_128",
  modelId = "eleven_monolingual_v1",
}) {
  if (!text || !voiceId || !apiKey) {
    throw new Error("Missing required parameters: text, voiceId, apiKey");
  }

  await ensureStorageDir();

  // Check cache (idempotency)
  const hash = generateHash(text, voiceId);

  if (ttsAssets.has(hash)) {
    const cached = ttsAssets.get(hash);
    return {
      audioId: cached.audioId,
      audioUrl: `/api/tts/${cached.audioId}`,
      format: cached.format,
      voiceId: cached.voiceId,
      cached: true,
    };
  }

  // Generate new TTS
  const response = await axios.post(
    `${baseUrl}/v1/text-to-speech/${voiceId}`,
    {
      text,
      model_id: modelId,
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
      params: { output_format: format },
      responseType: "arraybuffer",
      timeout: 30000, // TTS can take longer
    }
  );

  // Save to file
  const audioId = `${hash}-${Date.now()}`;
  const extension = format.includes("mp3") ? "mp3" : "wav";
  const filename = `${audioId}.${extension}`;
  const filePath = path.join(TTS_STORAGE_DIR, filename);

  await fs.writeFile(filePath, response.data);

  // Cache metadata
  ttsAssets.set(hash, {
    audioId,
    path: filePath,
    format: extension,
    voiceId,
    createdAt: Date.now(),
  });

  return {
    audioId,
    audioUrl: `/api/tts/${audioId}`,
    format: extension,
    voiceId,
    cached: false,
  };
}

/**
 * Get TTS file by audioId
 */
async function getTTSFile(audioId) {
  for (const [hash, asset] of ttsAssets.entries()) {
    if (asset.audioId === audioId) {
      const fileBuffer = await fs.readFile(asset.path);
      return {
        buffer: fileBuffer,
        format: asset.format,
        contentType: asset.format === "mp3" ? "audio/mpeg" : "audio/wav",
      };
    }
  }

  // Fallback: check filesystem
  const mp3Path = path.join(TTS_STORAGE_DIR, `${audioId}.mp3`);
  const wavPath = path.join(TTS_STORAGE_DIR, `${audioId}.wav`);

  try {
    const fileBuffer = await fs.readFile(mp3Path);
    return {
      buffer: fileBuffer,
      format: "mp3",
      contentType: "audio/mpeg",
    };
  } catch (e1) {
    try {
      const fileBuffer = await fs.readFile(wavPath);
      return {
        buffer: fileBuffer,
        format: "wav",
        contentType: "audio/wav",
      };
    } catch (e2) {
      throw new Error("Audio file not found");
    }
  }
}

/**
 * Cleanup old TTS files (older than 24 hours)
 */
async function cleanupOldAssets() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [hash, asset] of ttsAssets.entries()) {
    if (now - asset.createdAt > maxAge) {
      try {
        await fs.unlink(asset.path);
        ttsAssets.delete(hash);
      } catch (error) {
        // File already deleted
      }
    }
  }
}

// Run cleanup every hour
setInterval(cleanupOldAssets, 60 * 60 * 1000);

module.exports = {
  getVoicesCached,
  generateTTS,
  getTTSFile,
  cleanupOldAssets,
};
