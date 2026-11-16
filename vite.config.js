import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Rutes relatives: l'app compilada funciona en qualsevol carpeta o servidor.
  base: './',
  plugins: [react(), tailwindcss()],
  server: { host: true, port: 5180 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/proves.setup.js'],
    css: false,
  },
});
