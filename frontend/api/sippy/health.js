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

async function callXmlRpc(url, user, pass, method, params, disableTlsVerify = false) {
  const requestBody = buildXmlRpcRequest(method, params);

  const axiosConfig = {
    method: "POST",
    url: url,
    data: requestBody,
    headers: {
      "Content-Type": "text/xml",
      "User-Agent": "Node-Client/1.0"
    },
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
    }
  }

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${response.data}`);
  }

  return parseXmlRpcResponse(response.data);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      status: "METHOD_NOT_ALLOWED",
      message: "Only GET method is allowed for health check"
    });
  }

  const rpcUrl = process.env.SIPPY_RPC_URL;
  const user = process.env.SIPPY_RPC_USER || "";
  const pass = process.env.SIPPY_RPC_PASS || "";
  const testMethod = process.env.SIPPY_TEST_METHOD || "system.listMethods";
  const disableTlsVerify = process.env.SIPPY_DISABLE_TLS_VERIFY === "true";

  if (!rpcUrl) {
    return res.status(500).json({
      ok: false,
      status: "MISCONFIG",
      message: "SIPPY_RPC_URL environment variable is not configured",
      details: "Please set SIPPY_RPC_URL in your environment variables"
    });
  }

  if (!user || !pass) {
    return res.status(500).json({
      ok: false,
      status: "MISCONFIG",
      message: "SIPPY_RPC_USER or SIPPY_RPC_PASS is missing",
      details: "Both credentials must be set in environment variables"
    });
  }

  try {
    const result = await callXmlRpc(rpcUrl, user, pass, testMethod, [], disableTlsVerify);

    return res.status(200).json({
      ok: true,
      status: "OK",
      message: "Sippy RPC connection successful",
      details: {
        rpcUrl: maskUrl(rpcUrl),
        authMode: "digest",
        testMethod,
        user: maskSecret(user),
        resultPreview: Array.isArray(result) ? result.slice(0, 5) : result,
      }
    });
  } catch (e) {
    const errorMsg = e?.message || String(e);

    let status = "RPC_ERROR";
    let message = "Sippy RPC call failed";
    let details = errorMsg;

    if (errorMsg.includes("ECONNREFUSED") || errorMsg.includes("ETIMEDOUT")) {
      status = "TIMEOUT";
      message = "Cannot connect to Sippy server";
      details = "Connection refused or timeout. Check if SIPPY_RPC_URL is correct and server is reachable.";
    } else if (errorMsg.includes("401") || errorMsg.includes("Unauthorized") || errorMsg.includes("Authentication")) {
      status = "UNAUTHORIZED";
      message = "Sippy authentication failed";
      details = "Check SIPPY_RPC_USER and SIPPY_RPC_PASS. Sippy uses HTTP Digest Authentication.";
    } else if (errorMsg.includes("404") || errorMsg.includes("Not Found")) {
      status = "MISCONFIG";
      message = "Sippy endpoint not found";
      details = "The RPC endpoint path might be wrong. Common path: /xmlapi/xmlapi";
    } else if (errorMsg.includes("DEPTH_ZERO_SELF_SIGNED_CERT") || errorMsg.includes("certificate")) {
      status = "TLS_ERROR";
      message = "TLS/SSL certificate error";
      details = "Set SIPPY_DISABLE_TLS_VERIFY=true if using self-signed certificate.";
    } else if (errorMsg.includes("Invalid XML-RPC") || errorMsg.includes("XML")) {
      status = "RPC_ERROR";
      message = "Invalid XML-RPC response";
      details = "The server response is not valid XML-RPC format. Check endpoint and credentials.";
    }

    return res.status(502).json({
      ok: false,
      status,
      message,
      details,
      debug: {
        rpcUrl: maskUrl(rpcUrl),
        authMode: "digest",
        testMethod,
        user: maskSecret(user),
        rawError: errorMsg
      }
    });
  }
};
