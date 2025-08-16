import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
    include: ['wagmi', 'viem', '@tanstack/react-query']
  }
}));
