#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting webpack build process...');

// Install dependencies
console.log('Installing dependencies...');
execSync('npm ci', { stdio: 'inherit' });

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Build frontend with webpack
console.log('Building frontend with webpack...');
try {
  execSync('npx webpack --config webpack.config.js', { 
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
try {
  execSync(`npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=${distDir}`, { 
    stdio: 'inherit' 
  });
} catch (error) {
  console.error('Backend build failed:', error.message);
  process.exit(1);
}

console.log('Build completed successfully!');