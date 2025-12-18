const amiClient = require("./ami-client");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Only GET method is allowed",
    });
  }

  try {
    const channels = await amiClient.getActiveChannels();

    return res.status(200).json({
      ok: true,
      code: "OK",
      data: {
        total: channels.length,
        channels: channels.map((ch) => ({
          channel: ch.channel,
          channelstate: ch.channelstate,
          channelstatedesc: ch.channelstatedesc,
          calleridnum: ch.calleridnum,
          calleridname: ch.calleridname,
          connectedlinenum: ch.connectedlinenum,
          connectedlinename: ch.connectedlinename,
          context: ch.context,
          extension: ch.extension,
          priority: ch.priority,
          accountcode: ch.accountcode,
          duration: ch.duration,
        })),
      },
    });
  } catch (error) {
    const errorMsg = error?.message || String(error);

    let code = "AMI_ERROR";
    let message = "Failed to get live calls";

    if (errorMsg.includes("Connection refused") || errorMsg.includes("ECONNREFUSED")) {
      code = "AMI_UNREACHABLE";
      message = "Cannot connect to Issabel AMI";
    } else if (errorMsg.includes("Authentication failed")) {
      code = "AMI_AUTH_FAILED";
      message = "AMI authentication failed";
    }

    return res.status(502).json({
      ok: false,
      code,
      message,
      details: errorMsg,
    });
  }
};
