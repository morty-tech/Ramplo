const express = require('express');
const { registerRoutes } = require('../dist/index.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function initializeApp() {
  if (!initialized) {
    await registerRoutes(app);
    initialized = true;
  }
}

module.exports = async (req, res) => {
  try {
    await initializeApp();
    app(req, res);
  } catch (error) {
    console.error('Error initializing app:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};