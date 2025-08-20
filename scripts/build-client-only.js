#!/usr/bin/env node

/**
 * Simplified build script for Vercel
 * Only builds the client (Vite), letting Vercel handle server TS compilation
 */

import { execSync } from 'child_process';

console.log('🔨 Building client assets for Vercel...');

try {
  // Build only the client with Vite
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Client build complete!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}