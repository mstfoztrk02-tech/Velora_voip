const { getAMIClient } = require('./ami-client');

/**
 * @api {post} /api/issabel/hangup Hangup Active Call
 * @apiName HangupCall
 * @apiDescription Hangup an active call by channel name
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      code: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests allowed',
    });
  }

  const { channel } = req.body;

  if (!channel) {
    return res.status(400).json({
      ok: false,
      code: 'INVALID_INPUT',
      message: 'channel parameter is required',
    });
  }

  try {
    const ami = getAMIClient();
    await ami.connect();

    const result = await ami.hangup(channel);

    return res.status(200).json({
      ok: true,
      message: 'Call hangup initiated',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      code: 'AMI_ERROR',
      message: error.message || 'Failed to hangup call',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
