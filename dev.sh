#!/bin/bash

# Disable tsx watch mode by setting environment variable
export TSX_WATCH=false
export NODE_ENV=development

# Run tsx with explicit no-watch flag if supported, fallback to regular tsx
if tsx --help | grep -q "\-\-no-watch"; then
  echo "Starting server with tsx --no-watch..."
  exec tsx --no-watch server/index.ts
else
  echo "Starting server with tsx (watch disabled via env)..."
  exec tsx server/index.ts
fi