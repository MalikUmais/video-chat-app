import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: '0.0.0.0', // binds to all network interfaces
    port: 5173,
    allowedHosts: [
      '0.0.0.0',
      '*'
    ]
    // https: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      // To exclude specific polyfills, add them to this list
      exclude: [
        'fs', // Excludes the polyfill for 'fs' and 'node:fs'
      ],
      // Whether to polyfill specific globals
      globals: {
        global: true,
        process: true,
        Buffer: true,
      },
    }),
  ],
});