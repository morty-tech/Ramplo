#!/bin/bash
set -e

echo "Starting build process..."

# Install dependencies
npm ci

# Run build
./node_modules/.bin/vite build
./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"