const { makeAuthenticatedRequest } = require("./auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Only GET method is allowed",
    });
  }

  const baseUrl = process.env.ISSABEL_BASE_URL;
  const username = process.env.ISSABEL_USERNAME;
  const password = process.env.ISSABEL_PASSWORD;

  if (!baseUrl || !username || !password) {
    return res.status(500).json({
      ok: false,
      code: "MISCONFIG",
      message: "Issabel configuration missing",
      details: "Please set ISSABEL_BASE_URL, ISSABEL_USERNAME, and ISSABEL_PASSWORD",
    });
  }

  try {
    // Try to get extensions as a health check (lightweight query)
    const data = await makeAuthenticatedRequest(
      baseUrl,
      username,
      password,
      "/pbxapi/extensions",
      {
        method: "GET",
        params: { limit: 1 },
      }
    );

    return res.status(200).json({
      ok: true,
      code: "OK",
      message: "Issabel connection successful",
      details: {
        baseUrl: baseUrl.replace(/\/+$/, ""),
        username,
        authenticated: true,
        dataReceived: !!data,
      },
    });
  } catch (error) {
    const errorMsg = error?.message || String(error);

    let code = "CONNECTION_ERROR";
    let message = "Issabel health check failed";
    let details = errorMsg;

    if (
      errorMsg.includes("ECONNREFUSED") ||
      errorMsg.includes("ETIMEDOUT") ||
      errorMsg.includes("ENOTFOUND")
    ) {
      code = "TIMEOUT";
      message = "Cannot connect to Issabel server";
      details = `Connection failed. Check if ISSABEL_BASE_URL (${baseUrl}) is correct and server is reachable.`;
    } else if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
      code = "UNAUTHORIZED";
      message = "Issabel authentication failed";
      details = "Check ISSABEL_USERNAME and ISSABEL_PASSWORD credentials.";
    } else if (errorMsg.includes("404") || errorMsg.includes("Not Found")) {
      code = "NOT_FOUND";
      message = "Issabel API endpoint not found";
      details = `Check if ${baseUrl}/pbxapi is the correct endpoint path.`;
    } else if (errorMsg.includes("No token received")) {
      code = "AUTH_ERROR";
      message = "Failed to get authentication token";
      details = "Issabel did not return a valid JWT token. Check credentials and API availability.";
    }

    return res.status(502).json({
      ok: false,
      code,
      message,
      details,
      debug: {
        baseUrl,
        username,
        rawError: errorMsg,
      },
    });
  }
};
