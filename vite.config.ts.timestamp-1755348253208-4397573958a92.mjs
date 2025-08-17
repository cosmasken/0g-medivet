// vite.config.ts
import { defineConfig } from "file:///home/groot/Code/akindo/zerog-labs/medivet/node_modules/vite/dist/node/index.js";
import react from "file:///home/groot/Code/akindo/zerog-labs/medivet/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///home/groot/Code/akindo/zerog-labs/medivet/node_modules/lovable-tagger/dist/index.js";
import { nodePolyfills } from "file:///home/groot/Code/akindo/zerog-labs/medivet/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "/home/groot/Code/akindo/zerog-labs/medivet";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      // Override the default polyfills for specific modules.
      overrides: {
        // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
        fs: "memfs",
        crypto: "crypto-browserify"
      },
      // Whether to polyfill these modules.
      include: [
        "crypto",
        "stream",
        "util",
        "buffer",
        "process",
        "events"
      ],
      // Whether to exclude specific modules from being polyfilled.
      exclude: [
        "http",
        // Excludes the polyfill for `http` and `node:http`.
        "fs"
        // Excludes the polyfill for `fs` and `node:fs`.
      ]
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      // Additional aliases for better Node.js compatibility
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      util: "util",
      buffer: "buffer"
    }
  },
  define: {
    // Fix for "process is not defined" error
    global: "globalThis",
    "process.env": {},
    // Additional polyfills for Web3 compatibility
    "process.version": '"v18.0.0"',
    "process.browser": "true"
  },
  optimizeDeps: {
    include: [
      "wagmi",
      "viem",
      "@tanstack/react-query",
      "crypto",
      "stream",
      "util",
      "buffer",
      "events"
    ],
    exclude: ["@0glabs/0g-ts-sdk"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ncm9vdC9Db2RlL2FraW5kby96ZXJvZy1sYWJzL21lZGl2ZXRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2dyb290L0NvZGUvYWtpbmRvL3plcm9nLWxhYnMvbWVkaXZldC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9ncm9vdC9Db2RlL2FraW5kby96ZXJvZy1sYWJzL21lZGl2ZXQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbm9kZVBvbHlmaWxscyh7XG4gICAgICAvLyBXaGV0aGVyIHRvIHBvbHlmaWxsIGBub2RlOmAgcHJvdG9jb2wgaW1wb3J0cy5cbiAgICAgIHByb3RvY29sSW1wb3J0czogdHJ1ZSxcbiAgICAgIC8vIFdoZXRoZXIgdG8gcG9seWZpbGwgc3BlY2lmaWMgZ2xvYmFscy5cbiAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgQnVmZmVyOiB0cnVlLFxuICAgICAgICBnbG9iYWw6IHRydWUsXG4gICAgICAgIHByb2Nlc3M6IHRydWUsXG4gICAgICB9LFxuICAgICAgLy8gT3ZlcnJpZGUgdGhlIGRlZmF1bHQgcG9seWZpbGxzIGZvciBzcGVjaWZpYyBtb2R1bGVzLlxuICAgICAgb3ZlcnJpZGVzOiB7XG4gICAgICAgIC8vIFNpbmNlIGBmc2AgaXMgbm90IHN1cHBvcnRlZCBpbiBicm93c2Vycywgd2UgY2FuIHVzZSB0aGUgYG1lbWZzYCBwYWNrYWdlIHRvIHBvbHlmaWxsIGl0LlxuICAgICAgICBmczogJ21lbWZzJyxcbiAgICAgICAgY3J5cHRvOiAnY3J5cHRvLWJyb3dzZXJpZnknLFxuICAgICAgfSxcbiAgICAgIC8vIFdoZXRoZXIgdG8gcG9seWZpbGwgdGhlc2UgbW9kdWxlcy5cbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ2NyeXB0bycsXG4gICAgICAgICdzdHJlYW0nLFxuICAgICAgICAndXRpbCcsXG4gICAgICAgICdidWZmZXInLFxuICAgICAgICAncHJvY2VzcycsXG4gICAgICAgICdldmVudHMnLFxuICAgICAgXSxcbiAgICAgIC8vIFdoZXRoZXIgdG8gZXhjbHVkZSBzcGVjaWZpYyBtb2R1bGVzIGZyb20gYmVpbmcgcG9seWZpbGxlZC5cbiAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgJ2h0dHAnLCAvLyBFeGNsdWRlcyB0aGUgcG9seWZpbGwgZm9yIGBodHRwYCBhbmQgYG5vZGU6aHR0cGAuXG4gICAgICAgICdmcycsIC8vIEV4Y2x1ZGVzIHRoZSBwb2x5ZmlsbCBmb3IgYGZzYCBhbmQgYG5vZGU6ZnNgLlxuICAgICAgXSxcbiAgICB9KSxcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgLy8gQWRkaXRpb25hbCBhbGlhc2VzIGZvciBiZXR0ZXIgTm9kZS5qcyBjb21wYXRpYmlsaXR5XG4gICAgICBjcnlwdG86ICdjcnlwdG8tYnJvd3NlcmlmeScsXG4gICAgICBzdHJlYW06ICdzdHJlYW0tYnJvd3NlcmlmeScsXG4gICAgICB1dGlsOiAndXRpbCcsXG4gICAgICBidWZmZXI6ICdidWZmZXInLFxuICAgIH0sXG4gIH0sXG4gIGRlZmluZToge1xuICAgIC8vIEZpeCBmb3IgXCJwcm9jZXNzIGlzIG5vdCBkZWZpbmVkXCIgZXJyb3JcbiAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgICAncHJvY2Vzcy5lbnYnOiB7fSxcbiAgICAvLyBBZGRpdGlvbmFsIHBvbHlmaWxscyBmb3IgV2ViMyBjb21wYXRpYmlsaXR5XG4gICAgJ3Byb2Nlc3MudmVyc2lvbic6ICdcInYxOC4wLjBcIicsXG4gICAgJ3Byb2Nlc3MuYnJvd3Nlcic6ICd0cnVlJ1xuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICAnd2FnbWknLCBcbiAgICAgICd2aWVtJywgXG4gICAgICAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JyxcbiAgICAgICdjcnlwdG8nLFxuICAgICAgJ3N0cmVhbScsXG4gICAgICAndXRpbCcsXG4gICAgICAnYnVmZmVyJyxcbiAgICAgICdldmVudHMnXG4gICAgXSxcbiAgICBleGNsdWRlOiBbJ0AwZ2xhYnMvMGctdHMtc2RrJ11cbiAgfVxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVCxTQUFTLG9CQUFvQjtBQUM3VSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMscUJBQXFCO0FBSjlCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQTtBQUFBLE1BRVosaUJBQWlCO0FBQUE7QUFBQSxNQUVqQixTQUFTO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsTUFDWDtBQUFBO0FBQUEsTUFFQSxXQUFXO0FBQUE7QUFBQSxRQUVULElBQUk7QUFBQSxRQUNKLFFBQVE7QUFBQSxNQUNWO0FBQUE7QUFBQSxNQUVBLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLFNBQVM7QUFBQSxRQUNQO0FBQUE7QUFBQSxRQUNBO0FBQUE7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxTQUFTLGlCQUNULGdCQUFnQjtBQUFBLEVBQ2xCLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBO0FBQUEsTUFFcEMsUUFBUTtBQUFBLE1BQ1IsUUFBUTtBQUFBLE1BQ1IsTUFBTTtBQUFBLE1BQ04sUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUE7QUFBQSxJQUVOLFFBQVE7QUFBQSxJQUNSLGVBQWUsQ0FBQztBQUFBO0FBQUEsSUFFaEIsbUJBQW1CO0FBQUEsSUFDbkIsbUJBQW1CO0FBQUEsRUFDckI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxtQkFBbUI7QUFBQSxFQUMvQjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
