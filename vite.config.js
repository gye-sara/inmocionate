import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['all', '.replit.dev', '.replit.app', '.trycloudflare.com', '.ngrok-free.app'],
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
  },
});