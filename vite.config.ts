import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import commonjs from '@rollup/plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy 0G indexer API calls to avoid CORS issues
      '/api/0g': {
        target: 'https://indexer-storage-testnet-standard.0g.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/0g/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to 0G:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from 0G:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Proxy for 0G turbo indexer
      '/api/0g-turbo': {
        target: 'https://indexer-storage-testnet-turbo.0g.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/0g-turbo/, ''),
      },
      // Proxy for 0G storage nodes if needed
      '/api/0g-storage': {
        target: 'https://rpc-storage-testnet.0g.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/0g-storage/, ''),
      }
    }
  },
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      include: ['crypto', 'stream', 'util', 'buffer', 'process', 'events'],
    }),
    commonjs({
      include: [/node_modules/],
      requireReturnsDefault: 'auto',
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
    },
  },
  define: {
    // Fix for "process is not defined" error
    global: 'globalThis',
    'process.env': {},
    // Additional polyfills for Web3 compatibility
    'process.version': '"v18.0.0"',
    'process.browser': 'true'
  },
  optimizeDeps: {
    include: [
      'wagmi', 
      'viem', 
      '@tanstack/react-query',
      'js-sha3'
    ],
    exclude: [],
    force: true,
  }
}));
