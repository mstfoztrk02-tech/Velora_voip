const axios = require("axios");
const crypto = require("crypto");
const https = require("https");
const { Readable } = require("stream");

// Reuse xmlrpc library internals for robust XML build/parse
const serializer = require("xmlrpc/lib/serializer");
const Deserializer = require("xmlrpc/lib/deserializer");

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

  const qop = digestParams.qop || "auth";
  const response = md5(`${ha1}:${digestParams.nonce}:${nc}:${cnonce}:${qop}:${ha2}`);

  let authHeader = `Digest username="${username}", realm="${digestParams.realm}", nonce="${digestParams.nonce}", uri="${uri}", response="${response}"`;

  if (digestParams.qop) {
    authHeader += `, qop=${digestParams.qop}, nc=${nc}, cnonce="${cnonce}"`;
  }

  if (digestParams.opaque) {
    authHeader += `, opaque="${digestParams.opaque}"`;
  }

  return authHeader;
}

function deserializeXmlRpcResponse(xmlString) {
  return new Promise((resolve, reject) => {
    const deserializer = new Deserializer();
    const stream = Readable.from([xmlString]);

    deserializer.deserializeMethodResponse(stream, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

async function callXmlRpc(url, user, pass, method, params, disableTlsVerify = false) {
  const requestBody = serializer.serializeMethodCall(method, params);

  const axiosConfig = {
    method: "POST",
    url,
    data: requestBody,
    headers: {
      "Content-Type": "text/xml",
      "User-Agent": "Node-Client/1.0",
    },
    timeout: 30000,
    validateStatus: null,
    responseType: "text",
  };

  if (disableTlsVerify) {
    axiosConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
  }

  // First request - expect 401 with WWW-Authenticate (Digest/Basic)
  let response = await axios(axiosConfig);

  if (response.status === 401 && response.headers["www-authenticate"]) {
    const authHeader = response.headers["www-authenticate"];

    if (authHeader.startsWith("Digest")) {
      const digestParams = parseDigestHeader(authHeader.substring(7));
      const uri = new URL(url).pathname;
      axiosConfig.headers["Authorization"] = createDigestAuthHeader(user, pass, "POST", uri, digestParams);
      response = await axios(axiosConfig);
    } else if (authHeader.startsWith("Basic")) {
      const basicAuth = Buffer.from(`${user}:${pass}`).toString("base64");
      axiosConfig.headers["Authorization"] = `Basic ${basicAuth}`;
      response = await axios(axiosConfig);
    }
  }

  if (response.status !== 200) {
    const errorData = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED: Authentication failed. Verify SIPPY_RPC_USER and SIPPY_RPC_PASS are correct.");
    }
    if (response.status === 403) {
      throw new Error(`FORBIDDEN: Access denied. User '${user}' does not have permission to access this XML-RPC method.`);
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorData}`);
  }

  const xml = typeof response.data === "string" ? response.data : String(response.data);
  return deserializeXmlRpcResponse(xml);
}

function normalizeQuery(req) {
  // Works for both Vercel (req.query) and Express (req.query)
  return req.query || {};
}

function toInt(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

function toStringOrUndefined(value) {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

function transformCdr(record) {
  const callId = record?.i_xdr ?? record?.i_account ?? "";
  const billedDuration = record?.billed_duration ?? 0;
  const resultCode = record?.result;

  return {
    call_id: String(callId || ""),
    caller: record?.cli || record?.cli_in || "Unknown",
    callee: record?.cld || record?.cld_in || "Unknown",
    start_time: record?.setup_time || new Date().toISOString(),
    end_time: record?.connect_time || null,
    duration: Number.isFinite(Number(billedDuration)) ? Number(billedDuration) : 0,
    status: resultCode === 0 || resultCode === "0" ? "completed" : "failed",
    direction: "outbound",
    country: record?.country || null,
    city: record?.description || null,
    cost: record?.cost !== undefined && record?.cost !== null ? Number(record.cost) : null,
    trunk: record?.i_account !== undefined && record?.i_account !== null ? String(record.i_account) : null,
    codec: record?.codec || (record?.remote_ip ? String(record.remote_ip).slice(0, 20) : null),
  };
}

module.exports = async function handler(req, res) {
  // Only GET is supported
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      message: "Only GET method is allowed",
    });
  }

  // Optional admin token protection (same convention as /api/sippy)
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (adminToken) {
    const auth = req.headers.authorization || "";
    if (auth !== `Bearer ${adminToken}`) {
      return res.status(401).json({
        ok: false,
        code: "UNAUTHORIZED",
        message: "Invalid or missing admin token",
      });
    }
  }

  const rpcUrl = process.env.SIPPY_RPC_URL;
  const user = process.env.SIPPY_RPC_USER || "";
  const pass = process.env.SIPPY_RPC_PASS || "";
  const disableTlsVerify = process.env.SIPPY_DISABLE_TLS_VERIFY === "true";

  if (!rpcUrl) {
    return res.status(500).json({
      ok: false,
      code: "MISCONFIG",
      message: "SIPPY_RPC_URL environment variable is not configured",
    });
  }

  if (!user || !pass) {
    return res.status(500).json({
      ok: false,
      code: "MISCONFIG",
      message: "SIPPY_RPC_USER or SIPPY_RPC_PASS is missing",
    });
  }

  const q = normalizeQuery(req);
  const limit = Math.max(1, Math.min(1000, toInt(q.limit) ?? 100));
  const offset = Math.max(0, toInt(q.offset) ?? 0);

  const iAccount = toInt(q.i_account);
  const startDate = toStringOrUndefined(q.start_date);
  const endDate = toStringOrUndefined(q.end_date);
  const type = toStringOrUndefined(q.type) || "all";

  const params = { type };
  if (iAccount !== undefined) params.i_account = iAccount;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  try {
    const result = await callXmlRpc(rpcUrl, user, pass, "getAccountCDRs", [params], disableTlsVerify);

    let cdrRecords = [];
    if (Array.isArray(result)) {
      cdrRecords = result;
    } else if (result && typeof result === "object") {
      if (Array.isArray(result.cdrs)) cdrRecords = result.cdrs;
      else if (Array.isArray(result.CDRs)) cdrRecords = result.CDRs;
    }

    const transformed = cdrRecords
      .filter(r => r && typeof r === "object")
      .map(transformCdr);

    const paginated = transformed.slice(offset, offset + limit);

    return res.status(200).json({
      ok: true,
      message: `Successfully fetched ${paginated.length} call records`,
      data: paginated,
      total: transformed.length,
    });
  } catch (e) {
    const errorMsg = e?.message || String(e);

    let code = "RPC_ERROR";
    let message = "Failed to fetch calls from SippySoft";

    if (errorMsg.includes("ECONNREFUSED") || errorMsg.includes("ETIMEDOUT")) {
      code = "TIMEOUT";
      message = "Cannot connect to Sippy server";
    } else if (errorMsg.includes("UNAUTHORIZED") || errorMsg.includes("401") || errorMsg.includes("Authentication")) {
      code = "UNAUTHORIZED";
      message = "Sippy authentication failed";
    } else if (errorMsg.includes("FORBIDDEN") || errorMsg.includes("403")) {
      code = "FORBIDDEN";
      message = "Access denied - insufficient permissions";
    } else if (errorMsg.includes("DEPTH_ZERO_SELF_SIGNED_CERT") || errorMsg.includes("certificate")) {
      code = "TLS_ERROR";
      message = "TLS/SSL certificate error";
    } else if (errorMsg.includes("XML-RPC") || errorMsg.includes("XML")) {
      code = "XML_ERROR";
      message = "Invalid XML-RPC response";
    }

    return res.status(502).json({
      ok: false,
      code,
      message,
      details: errorMsg,
    });
  }
};
