const axios = require("axios");

// In-memory token cache (ephemeral in serverless environments)
let tokenCache = {
  token: null,
  expiresAt: null,
};

/**
 * Authenticate with Issabel pbxapi and get JWT token
 * @param {string} baseUrl - Issabel base URL (e.g., http://185.8.12.117)
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<string>} JWT token
 */
async function authenticate(baseUrl, username, password) {
  try {
    // Issabel expects form-urlencoded, not JSON
    const params = new URLSearchParams();
    params.append('user', username);
    params.append('password', password);

    const config = {
      timeout: 15000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    // Disable SSL verification for self-signed certs (only in serverless)
    if (process.env.NODE_ENV !== 'production' || process.env.ISSABEL_DISABLE_TLS_VERIFY === 'true') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const response = await axios.post(
      `${baseUrl}/pbxapi/authenticate`,
      params.toString(),
      config
    );

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    }

    throw new Error("No access_token received from Issabel");
  } catch (error) {
    // Enhanced error details for debugging
    const errorInfo = {
      message: error.message,
      code: error.code,
      url: `${baseUrl}/pbxapi/authenticate`,
      username: username,
    };

    if (error.response) {
      errorInfo.status = error.response.status;
      errorInfo.statusText = error.response.statusText;
      errorInfo.data = error.response.data;
      errorInfo.headers = error.response.headers;
    }

    throw new Error(`Issabel auth failed: ${JSON.stringify(errorInfo)}`);
  }
}

/**
 * Get cached token or authenticate if needed
 * @param {string} baseUrl
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>} Valid JWT token
 */
async function getToken(baseUrl, username, password) {
  // Check if we have a valid cached token
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer before expiry

  if (tokenCache.token && tokenCache.expiresAt && tokenCache.expiresAt - now > bufferTime) {
    return tokenCache.token;
  }

  // Authenticate and cache the token
  const token = await authenticate(baseUrl, username, password);

  // Decode JWT to get expiry (simple base64 decode, no verification needed here)
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const expiresAt = payload.exp ? payload.exp * 1000 : now + 60 * 60 * 1000; // Default 1 hour if no exp

    tokenCache = {
      token,
      expiresAt,
    };
  } catch (e) {
    // If we can't decode, cache for 30 minutes
    tokenCache = {
      token,
      expiresAt: now + 30 * 60 * 1000,
    };
  }

  return token;
}

/**
 * Clear cached token (for forced re-auth)
 */
function clearToken() {
  tokenCache = {
    token: null,
    expiresAt: null,
  };
}

/**
 * Make authenticated request to Issabel with automatic retry on 401
 * @param {string} baseUrl
 * @param {string} username
 * @param {string} password
 * @param {string} endpoint - API endpoint path (e.g., '/pbxapi/extensions')
 * @param {object} options - Axios request options
 * @returns {Promise<object>} Response data
 */
async function makeAuthenticatedRequest(
  baseUrl,
  username,
  password,
  endpoint,
  options = {}
) {
  let token = await getToken(baseUrl, username, password);

  // Disable SSL verification for self-signed certs
  if (process.env.NODE_ENV !== 'production' || process.env.ISSABEL_DISABLE_TLS_VERIFY === 'true') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const requestConfig = {
    url: `${baseUrl}${endpoint}`,
    ...options,
    timeout: options.timeout || 15000,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    // If 401, clear cache and retry once
    if (error.response?.status === 401) {
      clearToken();
      token = await getToken(baseUrl, username, password);

      requestConfig.headers.Authorization = `Bearer ${token}`;
      const retryResponse = await axios(requestConfig);
      return retryResponse.data;
    }

    throw error;
  }
}

module.exports = {
  authenticate,
  getToken,
  clearToken,
  makeAuthenticatedRequest,
};
