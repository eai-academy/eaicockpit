import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:7373",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://127.0.0.1:7373",
        ws: true,
      },
    },
  },
});
