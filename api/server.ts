import express from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let initialized = false;
let server: any;

async function initializeApp() {
  if (!initialized) {
    server = await registerRoutes(app);
    // Don't serve static files in Vercel - handled by platform
    initialized = true;
  }
  return app;
}

export default async (req: any, res: any) => {
  const app = await initializeApp();
  app(req, res);
};