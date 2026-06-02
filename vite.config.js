import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok-free.dev'],
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
  },
});