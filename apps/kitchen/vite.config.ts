import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "@qrdine/types": path.resolve(__dirname, "../../packages/types/src"),
      "@qrdine/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@qrdine/lib": path.resolve(__dirname, "../../packages/lib/src"),
      "@qrdine/ui": path.resolve(__dirname, "../../packages/ui/src")
    }
  },
  server: {
    port: 3002
  }
});
