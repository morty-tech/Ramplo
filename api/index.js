const express = require('express');
const path = require('path');

// Create a simple proxy to the built server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import the server routes dynamically
let serverApp = null;

async function getServerApp() {
  if (!serverApp) {
    try {
      // Import the built server
      const serverModule = require(path.join(__dirname, '../dist/index.js'));
      // If the server exports an app, use it; otherwise create our own
      serverApp = serverModule.app || serverModule.default || app;
    } catch (error) {
      console.error('Failed to load server:', error);
      // Fallback: create a simple API response
      serverApp = express();
      serverApp.use('*', (req, res) => {
        res.status(503).json({ error: 'API temporarily unavailable' });
      });
    }
  }
  return serverApp;
}

module.exports = async (req, res) => {
  try {
    const server = await getServerApp();
    return server(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};