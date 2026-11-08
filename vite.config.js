import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Keep the auth SDK in its own long-lived chunk so editing app code
        // doesn't re-download it on every deploy.
        manualChunks: {
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
