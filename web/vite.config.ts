import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 3000,
    strictPort: false,
  },
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: 'buffer',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
      events: 'events',
      path: 'path-browserify',
      vm: 'vm-browserify',
      'node:fs/promises': path.resolve(__dirname, './src/lib/mocks/fs-promises.js'),
      'fs/promises': path.resolve(__dirname, './src/lib/mocks/fs-promises.js'),
      'fs': path.resolve(__dirname, './src/lib/mocks/fs-promises.js'),
      'node:fs': path.resolve(__dirname, './src/lib/mocks/fs-promises.js'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', 'crypto-browserify', 'stream-browserify', 'util', 'events', 'path-browserify', 'vm-browserify', 'js-sha3', 'axios'],
    exclude: ['@0glabs/0g-ts-sdk', '@0glabs/0g-ts-sdk/browser']
  },
  build: {
    commonjsOptions: {
      include: [/js-sha3/, /axios/, /node_modules/]
    },
    sourcemap: false,
    outDir: '../dist',
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress sourcemap warnings for 0G SDK
        if (warning.code === 'SOURCEMAP_ERROR' && warning.message.includes('@0glabs/0g-ts-sdk')) {
          return;
        }
        warn(warning);
      }
    }
  }
}));
