import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
      include: ['fs', 'fs/promises', 'path', 'crypto', 'stream', 'util', 'events', 'buffer'],
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
      'fs': 'node-stdlib-browser/esm/fs',
      'fs/promises': 'node-stdlib-browser/esm/fs/promises',
      'node:fs/promises': 'node-stdlib-browser/esm/fs/promises',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', 'crypto-browserify', 'stream-browserify', 'util', 'events', 'path-browserify', 'vm-browserify', 'node-stdlib-browser']
  }
}));
