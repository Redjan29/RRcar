import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // on accepte toutes les interfaces
    port: 3001,       // nouveau port
    strictPort: true, // ne pas essayer de changer de port tout seul
  },
});
