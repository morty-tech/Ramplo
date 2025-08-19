import { defineConfig } from 'vite';
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
});