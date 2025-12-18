/**
 * Debug endpoint to check Issabel configuration (no real API calls)
 */
module.exports = async function handler(req, res) {
  const baseUrl = process.env.ISSABEL_BASE_URL;
  const username = process.env.ISSABEL_USERNAME;
  const password = process.env.ISSABEL_PASSWORD;
  const disableTLS = process.env.ISSABEL_DISABLE_TLS_VERIFY;

  return res.status(200).json({
    ok: true,
    config: {
      baseUrl: baseUrl ? `${baseUrl.substring(0, 20)}... (${baseUrl.length} chars)` : "NOT SET",
      username: username ? `${username.substring(0, 3)}*** (${username.length} chars)` : "NOT SET",
      password: password ? `****** (${password.length} chars)` : "NOT SET",
      disableTLS: disableTLS || "NOT SET",
      nodeEnv: process.env.NODE_ENV,
    },
    test: {
      fullAuthUrl: baseUrl ? `${baseUrl}/pbxapi/authenticate` : "N/A",
      canBuildParams: typeof URLSearchParams !== 'undefined',
    }
  });
};
