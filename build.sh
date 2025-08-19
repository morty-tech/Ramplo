#!/bin/bash
set -e

echo "Starting build process..."

# Install dependencies
npm ci

# Run build
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"