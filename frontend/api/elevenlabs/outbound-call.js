/**
 * ElevenLabs Twilio Outbound Call API
 * Initiates an outbound call using ElevenLabs conversational AI agent
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agentId, agentPhoneNumberId, toNumber } = req.body;

    // Validation
    if (!agentId || !agentPhoneNumberId || !toNumber) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['agentId', 'agentPhoneNumberId', 'toNumber']
      });
    }

    // ElevenLabs API configuration
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_6958a19e56f95f6527d6824701ffb181ac6db0ce455b7776';
    const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/convai/twilio/outbound-call';

    // Make request to ElevenLabs API
    const response = await fetch(ELEVENLABS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        agent_id: agentId,
        agent_phone_number_id: agentPhoneNumberId,
        to_number: toNumber
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'ElevenLabs API error',
        details: data
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Outbound call initiated successfully',
      data: {
        conversationId: data.conversation_id,
        callSid: data.callSid,
        status: data.success ? 'initiated' : 'failed'
      }
    });

  } catch (error) {
    console.error('ElevenLabs outbound call error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
