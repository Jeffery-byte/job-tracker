import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Both prefixes are public browser configuration, never server credentials.
  envPrefix: ['VITE_', 'REACT_APP_'],
  build: { outDir: 'build' },
});
