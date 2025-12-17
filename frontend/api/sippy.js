const axios = require("axios");
const crypto = require("crypto");
const https = require("https");

function maskUrl(u) {
  try {
    const url = new URL(u);
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return "invalid-url";
  }
}

function maskSecret(s) {
  if (!s || s.length <= 4) return "***";
  return s.substring(0, 2) + "***" + s.substring(s.length - 2);
}

function buildXmlRpcRequest(method, params) {
  let paramsXml = "";

  if (params && params.length > 0) {
    const paramValues = params.map(param => {
      if (typeof param === "string") {
        return `<param><value><string>${param}</string></value></param>`;
      } else if (typeof param === "number") {
        return `<param><value><int>${param}</int></value></param>`;
      } else if (typeof param === "object" && param !== null) {
        const members = Object.entries(param).map(([key, val]) => {
          let valueTag;
          if (typeof val === "string") {
            valueTag = `<string>${val}</string>`;
          } else if (typeof val === "number") {
            valueTag = `<int>${val}</int>`;
          } else if (typeof val === "boolean") {
            valueTag = `<boolean>${val ? 1 : 0}</boolean>`;
          } else {
            valueTag = `<string>${String(val)}</string>`;
          }
          return `<member><name>${key}</name><value>${valueTag}</value></member>`;
        }).join("");
        return `<param><value><struct>${members}</struct></value></param>`;
      }
      return `<param><value><string>${String(param)}</string></value></param>`;
    }).join("");
    paramsXml = `<params>${paramValues}</params>`;
  } else {
    paramsXml = "<params></params>";
  }

  return `<?xml version="1.0"?>
<methodCall>
  <methodName>${method}</methodName>
  ${paramsXml}
</methodCall>`;
}

function parseXmlRpcResponse(xmlString) {
  if (xmlString.includes("<fault>")) {
    const faultMatch = xmlString.match(/<string>(.*?)<\/string>/);
    throw new Error(faultMatch ? faultMatch[1] : "XML-RPC fault");
  }

  const arrayMatch = xmlString.match(/<array><data>(.*?)<\/data><\/array>/s);
  if (arrayMatch) {
    const values = [];
    const valueMatches = arrayMatch[1].matchAll(/<value><string>(.*?)<\/string><\/value>/g);
    for (const match of valueMatches) {
      values.push(match[1]);
    }
    return values;
  }

  const structMatch = xmlString.match(/<struct>(.*?)<\/struct>/s);
  if (structMatch) {
    const result = {};
    const memberMatches = structMatch[1].matchAll(/<member><name>(.*?)<\/name><value>(?:<string>)?(.*?)(?:<\/string>)?<\/value><\/member>/g);
    for (const match of memberMatches) {
      result[match[1]] = match[2];
    }
    return result;
  }

  const stringMatch = xmlString.match(/<value><string>(.*?)<\/string><\/value>/);
  if (stringMatch) return stringMatch[1];

  const intMatch = xmlString.match(/<value><int>(.*?)<\/int><\/value>/);
  if (intMatch) return parseInt(intMatch[1], 10);

  return xmlString;
}

function md5(data) {
  return crypto.createHash("md5").update(data).digest("hex");
}

function parseDigestHeader(header) {
  const parts = {};
  const matches = header.matchAll(/(\w+)=(?:"([^"]+)"|([^\s,]+))/g);
  for (const match of matches) {
    parts[match[1]] = match[2] || match[3];
  }
  return parts;
}

function createDigestAuthHeader(username, password, method, uri, digestParams) {
  const ha1 = md5(`${username}:${digestParams.realm}:${password}`);
  const ha2 = md5(`${method}:${uri}`);

  const nc = "00000001";
  const cnonce = md5(Math.random().toString());

  const response = md5(`${ha1}:${digestParams.nonce}:${nc}:${cnonce}:${digestParams.qop || "auth"}:${ha2}`);

  let authHeader = `Digest username="${username}", realm="${digestParams.realm}", nonce="${digestParams.nonce}", uri="${uri}", response="${response}"`;

  if (digestParams.qop) {
    authHeader += `, qop=${digestParams.qop}, nc=${nc}, cnonce="${cnonce}"`;
  }

  if (digestParams.opaque) {
    authHeader += `, opaque="${digestParams.opaque}"`;
  }

  return authHeader;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callXmlRpc(url, user, pass, method, params, disableTlsVerify = false, retryCount = 0) {
  const requestBody = buildXmlRpcRequest(method, params);

  const axiosConfig = {
    method: "POST",
    url: url,
    data: requestBody,
    headers: {
      "Content-Type": "text/xml",
      "User-Agent": "Node-Client/1.0"
    },
    timeout: 15000,
    validateStatus: null
  };

  if (disableTlsVerify) {
    axiosConfig.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
  }

  // First request - expect 401 with WWW-Authenticate
  let response = await axios(axiosConfig);

  if (response.status === 401 && response.headers["www-authenticate"]) {
    const authHeader = response.headers["www-authenticate"];

    if (authHeader.startsWith("Digest")) {
      const digestParams = parseDigestHeader(authHeader.substring(7));
      const uri = new URL(url).pathname;
      const authorizationHeader = createDigestAuthHeader(user, pass, "POST", uri, digestParams);

      axiosConfig.headers["Authorization"] = authorizationHeader;

      // Second request with digest auth
      response = await axios(axiosConfig);
    } else if (authHeader.startsWith("Basic")) {
      // Some Sippy versions use Basic auth
      const basicAuth = Buffer.from(`${user}:${pass}`).toString("base64");
      axiosConfig.headers["Authorization"] = `Basic ${basicAuth}`;
      response = await axios(axiosConfig);
    }
  }

  // Retry on 401/403 (auth issues) once with exponential backoff
  if ((response.status === 401 || response.status === 403) && retryCount === 0) {
    await sleep(1000); // 1 second backoff
    return callXmlRpc(url, user, pass, method, params, disableTlsVerify, retryCount + 1);
  }

  if (response.status !== 200) {
    const errorData = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    if (response.status === 401) {
      throw new Error(`UNAUTHORIZED: Authentication failed. Verify SIPPY_RPC_USER and SIPPY_RPC_PASS are correct. Server requires valid credentials for XML-RPC access.`);
    } else if (response.status === 403) {
      throw new Error(`FORBIDDEN: Access denied. User '${user}' does not have permission to access this XML-RPC method. Check user permissions in Sippy configuration.`);
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorData}`);
  }

  return parseXmlRpcResponse(response.data);
}

module.exports = async function handler(req, res) {
  // Admin token koruması (opsiyonel)
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (adminToken) {
    const auth = req.headers.authorization || "";
    if (auth !== `Bearer ${adminToken}`) {
      return res.status(401).json({
        ok: false,
        code: "UNAUTHORIZED",
        message: "Invalid or missing admin token"
      });
    }
  }

  const rpcUrl = process.env.SIPPY_RPC_URL;
  const user = process.env.SIPPY_RPC_USER || "";
  const pass = process.env.SIPPY_RPC_PASS || "";
  const testMethod = process.env.SIPPY_TEST_METHOD || "system.listMethods";
  const disableTlsVerify = process.env.SIPPY_DISABLE_TLS_VERIFY === "true";

  if (!rpcUrl) {
    return res.status(500).json({
      ok: false,
      code: "MISCONFIG",
      message: "SIPPY_RPC_URL environment variable is not configured"
    });
  }

  if (!user || !pass) {
    return res.status(500).json({
      ok: false,
      code: "MISCONFIG",
      message: "SIPPY_RPC_USER or SIPPY_RPC_PASS is missing"
    });
  }

  try {
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const method = body?.method;
      const params = Array.isArray(body?.params) ? body.params : [];

      if (!method) {
        return res.status(400).json({
          ok: false,
          code: "BAD_REQUEST",
          message: "Missing body.method parameter"
        });
      }

      const result = await callXmlRpc(rpcUrl, user, pass, method, params, disableTlsVerify);
      return res.status(200).json({
        ok: true,
        code: "OK",
        method,
        result
      });
    }

    // GET - connection test
    const result = await callXmlRpc(rpcUrl, user, pass, testMethod, [], disableTlsVerify);

    return res.status(200).json({
      ok: true,
      code: "OK",
      message: "Sippy RPC connection successful",
      details: {
        rpcUrl: maskUrl(rpcUrl),
        authMode: "digest/basic",
        testMethod,
        user: maskSecret(user),
        resultPreview: Array.isArray(result) ? result.slice(0, 10) : result,
      }
    });
  } catch (e) {
    const errorMsg = e?.message || String(e);

    let code = "RPC_ERROR";
    let message = "Sippy RPC call failed";

    if (errorMsg.includes("ECONNREFUSED") || errorMsg.includes("ETIMEDOUT")) {
      code = "TIMEOUT";
      message = "Cannot connect to Sippy server";
    } else if (errorMsg.includes("UNAUTHORIZED") || errorMsg.includes("401") || errorMsg.includes("Authentication")) {
      code = "UNAUTHORIZED";
      message = "Sippy authentication failed after retry";
    } else if (errorMsg.includes("FORBIDDEN") || errorMsg.includes("403")) {
      code = "FORBIDDEN";
      message = "Access denied - insufficient permissions";
    } else if (errorMsg.includes("404") || errorMsg.includes("Not Found")) {
      code = "NOT_FOUND";
      message = "Sippy endpoint not found";
    } else if (errorMsg.includes("DEPTH_ZERO_SELF_SIGNED_CERT") || errorMsg.includes("certificate")) {
      code = "TLS_ERROR";
      message = "TLS/SSL certificate error";
    } else if (errorMsg.includes("Invalid XML-RPC") || errorMsg.includes("XML")) {
      code = "XML_ERROR";
      message = "Invalid XML-RPC response";
    }

    return res.status(502).json({
      ok: false,
      code,
      message,
      details: errorMsg
    });
  }
};
