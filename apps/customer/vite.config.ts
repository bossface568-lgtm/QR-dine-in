import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '@qrdine/types': path.resolve(__dirname, '../../packages/types/src'),
      '@qrdine/lib': path.resolve(__dirname, '../../packages/lib/src'),
      '@qrdine/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@qrdine/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
