const { getTTSFile } = require("../elevenlabs/service");

module.exports = async function handler(req, res) {
  const { audioId } = req.query;

  if (!audioId) {
    return res.status(400).json({
      ok: false,
      code: "BAD_REQUEST",
      message: "Missing audioId parameter",
    });
  }

  try {
    const { buffer, contentType } = await getTTSFile(audioId);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${audioId}"`);
    res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours

    return res.status(200).send(buffer);
  } catch (error) {
    const errorMsg = error?.message || String(error);

    if (errorMsg.includes("not found")) {
      return res.status(404).json({
        ok: false,
        code: "NOT_FOUND",
        message: "Audio file not found",
        details: `Audio ID '${audioId}' does not exist or has been cleaned up`,
      });
    }

    return res.status(500).json({
      ok: false,
      code: "SERVER_ERROR",
      message: "Failed to retrieve audio file",
      details: errorMsg,
    });
  }
};
