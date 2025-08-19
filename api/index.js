// Vercel serverless function entry point
import express from 'express';
import { registerRoutes } from '../server/routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize the app
let initialized = false;

async function initializeApp() {
  if (!initialized) {
    await registerRoutes(app);
    initialized = true;
  }
}

export default async function handler(req, res) {
  await initializeApp();
  app(req, res);
}