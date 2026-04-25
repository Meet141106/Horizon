import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'landing.html'),
        app: resolve(__dirname, 'index.html'),
      }
    }
  }
});
