import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import typestyles from "@typestyles/vite";

export default defineConfig({
  build: { outDir: "dist" },
  plugins: [react(), typestyles({ extract: { modules: ["typestyles-entry.ts"] } })],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
});
