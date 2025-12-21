const { makeAuthenticatedRequest } = require("./auth");

// Supported Issabel resources
const SUPPORTED_RESOURCES = [
  "extensions",
  "trunks",
  "queues",
  "ivr",
  "inboundroutes",
  "outboundroutes",
];

module.exports = async function handler(req, res) {
  const { resource } = req.query;

  if (!resource || !SUPPORTED_RESOURCES.includes(resource)) {
    return res.status(404).json({
      ok: false,
      code: "NOT_FOUND",
      message: `Resource '${resource}' not found`,
      details: `Supported resources: ${SUPPORTED_RESOURCES.join(", ")}`,
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
    const options = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (req.query && Object.keys(req.query).length > 1) {
      const { resource: _, ...queryParams } = req.query;
      options.params = queryParams;
    }

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      options.data = req.body;
    }

    const data = await makeAuthenticatedRequest(
      baseUrl,
      username,
      password,
      `/pbxapi/${resource}`,
      options
    );

    return res.status(200).json({
      ok: true,
      code: "OK",
      data,
    });
  } catch (error) {
    const errorMsg = error?.message || String(error);
    const statusCode = error.response?.status || 502;

    let code = "PROXY_ERROR";
    let message = `Failed to fetch ${resource}`;
    let details = errorMsg;

    if (
      errorMsg.includes("ECONNREFUSED") ||
      errorMsg.includes("ETIMEDOUT") ||
      errorMsg.includes("ENOTFOUND")
    ) {
      code = "TIMEOUT";
      message = "Cannot connect to Issabel server";
      details = `Connection failed for ${resource}. Check if server is reachable.`;
    } else if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
      code = "UNAUTHORIZED";
      message = "Authentication failed";
      details = "Token expired or invalid. Check credentials.";
    } else if (errorMsg.includes("404")) {
      code = "NOT_FOUND";
      message = `Resource '${resource}' not found`;
      details = `The endpoint /pbxapi/${resource} does not exist on this Issabel server.`;
    }

    return res.status(statusCode).json({
      ok: false,
      code,
      message,
      details,
      debug: {
        resource,
        method: req.method,
        rawError: errorMsg,
      },
    });
  }
};
