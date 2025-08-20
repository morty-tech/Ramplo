#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start nodemon with the configuration
const nodemon = spawn('npx', ['nodemon'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

nodemon.on('error', (err) => {
  console.error('Failed to start nodemon:', err);
  process.exit(1);
});

nodemon.on('close', (code) => {
  console.log(`Nodemon exited with code ${code}`);
  process.exit(code);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down development server...');
  nodemon.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down development server...');
  nodemon.kill('SIGTERM');
});