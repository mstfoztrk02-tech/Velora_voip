const amiClient = require("./ami-client");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Only POST method is allowed",
    });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { number, trunk, context, extension, callerid, variables } = body;

  // Validation
  if (!number) {
    return res.status(400).json({
      ok: false,
      code: "BAD_REQUEST",
      message: "Missing required parameter: number",
    });
  }

  const selectedTrunk = trunk || process.env.ISSABEL_OUTBOUND_TRUNK || "SIP/trunk";
  const selectedContext = context || process.env.ISSABEL_OUTBOUND_CONTEXT || "from-internal";
  const selectedExtension = extension || "s";

  try {
    const result = await amiClient.originate({
      channel: `${selectedTrunk}/${number}`,
      exten: selectedExtension,
      context: selectedContext,
      priority: 1,
      callerid: callerid,
      timeout: 30000,
      variables: variables || {},
    });

    return res.status(200).json({
      ok: true,
      code: "OK",
      ...result,
      call: {
        number,
        trunk: selectedTrunk,
        context: selectedContext,
        extension: selectedExtension,
      },
    });
  } catch (error) {
    const errorMsg = error?.message || String(error);

    let code = "ORIGINATE_ERROR";
    let message = "Failed to originate call";

    if (errorMsg.includes("Connection refused") || errorMsg.includes("ECONNREFUSED")) {
      code = "AMI_UNREACHABLE";
      message = "Cannot connect to Issabel AMI";
    } else if (errorMsg.includes("Authentication failed")) {
      code = "AMI_AUTH_FAILED";
      message = "AMI authentication failed";
    } else if (errorMsg.includes("timeout")) {
      code = "TIMEOUT";
      message = "AMI connection timeout";
    }

    return res.status(502).json({
      ok: false,
      code,
      message,
      details: errorMsg,
    });
  }
};
