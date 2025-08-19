#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting Node.js build process...');

// Install dependencies
console.log('Installing dependencies...');
execSync('npm ci', { stdio: 'inherit' });

// Create dist directory
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(distDir, 'public');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Build frontend using the main vite config
console.log('Building frontend...');

try {
  // Set production environment and build from root
  execSync('npx vite build --config vite.config.ts', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });
} catch (error) {
  console.error('Frontend build failed:', error.message);
  process.exit(1);
}

// Build backend
console.log('Building backend...');
const backendCmd = `npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=${distDir}`;

try {
  execSync(backendCmd, { stdio: 'inherit' });
} catch (error) {
  console.error('Backend build failed:', error.message);
  process.exit(1);
}

console.log('Build completed successfully!');