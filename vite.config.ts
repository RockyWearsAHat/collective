import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import express from "./plugins/viteExpress";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4000
  },
  plugins: [react(), express("server/server.ts")],
  build: {
    outDir: "build"
  }
});
