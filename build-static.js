#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting static build process...');

// Install dependencies
console.log('Installing dependencies...');
execSync('npm ci', { stdio: 'inherit' });

// Create dist directory
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(distDir, 'public');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });

// Create a minimal package.json for client build
const clientPkg = {
  "name": "ramplo-client",
  "type": "module",
  "scripts": {
    "build": "vite build"
  }
};

fs.writeFileSync(
  path.join(__dirname, 'client', 'package.json'), 
  JSON.stringify(clientPkg, null, 2)
);

// Create minimal vite config for client
const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve('../client/src'),
      '@shared': resolve('../shared'),
      '@assets': resolve('../attached_assets'),
    },
  },
  build: {
    outDir: '../dist/public',
    emptyOutDir: false,
  },
});`;

fs.writeFileSync(
  path.join(__dirname, 'client', 'vite.config.js'), 
  viteConfig
);

// Build frontend from client directory
console.log('Building frontend...');
try {
  execSync('npm run build', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, 'client'),
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

// Clean up temporary files
fs.unlinkSync(path.join(__dirname, 'client', 'package.json'));
fs.unlinkSync(path.join(__dirname, 'client', 'vite.config.js'));

console.log('Build completed successfully!');