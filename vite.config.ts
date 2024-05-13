import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import express from "./plugins/viteExpress";
// import basicSsl from "@vitejs/plugin-basic-ssl";
// basicSsl(),
// import fs from "fs";

// https://vitejs.dev/config/

const env = loadEnv("", process.cwd(), "");
export default defineConfig({
  server: {
    port: 4000
  },
  define: {
    "process.env.MONGO_USERNAME": JSON.stringify(env.MONGO_USERNAME),
    "process.env.MONGO_PASSWORD": JSON.stringify(env.MONGO_PASSWORD),
    "process.env.BUCKET": JSON.stringify(env.BUCKET)
  },
  plugins: [react(), express("server/server.ts")],
  build: {
    outDir: "build"
  }
});
