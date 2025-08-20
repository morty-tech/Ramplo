#!/usr/bin/env node

/**
 * Build script for Vercel deployment
 * Builds client assets and copies them to /public for automatic serving
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Building for Vercel deployment...');

// Build client assets with Vite
console.log('📦 Building client assets...');
execSync('vite build', { stdio: 'inherit' });

// Ensure public directory exists
const publicDir = path.resolve('./public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy built assets from dist to public
const distDir = path.resolve('./dist');
if (fs.existsSync(distDir)) {
  console.log('📂 Copying assets to /public...');
  
  // Copy all files from dist to public
  const copyRecursive = (src, dest) => {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const files = fs.readdirSync(src);
      files.forEach(file => {
        copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  
  const files = fs.readdirSync(distDir);
  files.forEach(file => {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(publicDir, file);
    copyRecursive(srcPath, destPath);
  });
  
  console.log('✅ Assets copied to /public');
} else {
  console.warn('⚠️ No dist directory found');
}

console.log('🚀 Vercel build complete!');