import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { authApiPlugin } from './server/authPlugin.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), authApiPlugin()],
  server: {
    port: 5173,
    host: true,
    cors: true,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          splats: ['@mkkellogg/gaussian-splats-3d'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['three', '@mkkellogg/gaussian-splats-3d'],
  },
});
