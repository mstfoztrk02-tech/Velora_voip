module.exports = function(app) {
  // More specific routes MUST come first!

  // Proxy /api/sippy/health requests to Vercel serverless function
  app.get('/api/sippy/health', async (req, res) => {
    try {
      // Load the serverless function handler
      const handler = require('../api/sippy/health.js');
      await handler(req, res);
    } catch (error) {
      console.error('Error in /api/sippy/health handler:', error);
      res.status(500).json({
        ok: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  });

  // Proxy /api/sippy requests to Vercel serverless function
  app.all('/api/sippy', async (req, res) => {
    try {
      // Load the serverless function handler
      const handler = require('../api/sippy.js');
      await handler(req, res);
    } catch (error) {
      console.error('Error in /api/sippy handler:', error);
      res.status(500).json({
        ok: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  });

  // Proxy /api/issabel/health requests to Vercel serverless function
  app.get('/api/issabel/health', async (req, res) => {
    try {
      const handler = require('../api/issabel/health.js');
      await handler(req, res);
    } catch (error) {
      console.error('Error in /api/issabel/health handler:', error);
      res.status(500).json({
        ok: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  });

  // Proxy /api/elevenlabs/voices requests
  app.get('/api/elevenlabs/voices', async (req, res) => {
    try {
      const handler = require('../api/elevenlabs/voices.js');
      await handler(req, res);
    } catch (error) {
      console.error('Error in /api/elevenlabs/voices handler:', error);
      res.status(500).json({
        ok: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  });

  // Proxy /api/elevenlabs/tts requests (note: this should be /api/elevenlabs/generate based on file structure)
  app.post('/api/elevenlabs/tts', async (req, res) => {
    try {
      const handler = require('../api/elevenlabs/generate.js');
      await handler(req, res);
    } catch (error) {
      console.error('Error in /api/elevenlabs/tts handler:', error);
      res.status(500).json({
        ok: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  });

  console.log('✓ API proxy middleware configured for local development');
};
