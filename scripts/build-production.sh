#!/bin/bash
rm -rf dist
npx vite build
NODE_ENV=production ./scripts/build-server.ts
chmod +x dist/server/index.mjs