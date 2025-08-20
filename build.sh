#!/bin/bash

# Vercel Build Script for RampLO
echo "🚀 Building RampLO for Vercel deployment..."

# Install dependencies
npm install

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Copy server files to output directory
echo "🔧 Preparing server files..."
mkdir -p dist/server
cp -r server/* dist/server/
cp -r shared dist/
cp package.json dist/
cp tsconfig.json dist/

echo "✅ Build complete!"