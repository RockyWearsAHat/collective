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
    "process.env.BUCKET": JSON.stringify(env.BUCKET),
    "process.env.DEFAULT_REGION": JSON.stringify(env.DEFAULT_REGION),
    "process.env.ENV_AWS_ACCESS_KEY_ID": JSON.stringify(
      env.ENV_AWS_ACCESS_KEY_ID
    ),
    "process.env.ENV_AWS_SECRET_ACCESS_KEY": JSON.stringify(
      env.ENV_AWS_SECRET_ACCESS_KEY
    ),
    "process.env.RS256KEYPUB": JSON.stringify(env.RS256KEYPUB),
    "process.env.RS256KEYPUB1": JSON.stringify(env.RS256KEYPUB1),
    "process.env.RS256KEYPUB2": JSON.stringify(env.RS256KEYPUB2),
    "process.env.RS256KEYPUB3": JSON.stringify(env.RS256KEYPUB3),
    "process.env.RS256KEYPUB4": JSON.stringify(env.RS256KEYPUB4),
    "process.env.RS256KEY1": JSON.stringify(env.RS256KEY1),
    "process.env.RS256KEY2": JSON.stringify(env.RS256KEY2),
    "process.env.RS256KEY3": JSON.stringify(env.RS256KEY3),
    "process.env.RS256KEY4": JSON.stringify(env.RS256KEY4),
    "process.env.RS256KEY5": JSON.stringify(env.RS256KEY5),
    "process.env.RS256KEY6": JSON.stringify(env.RS256KEY6),
    "process.env.RS256KEY7": JSON.stringify(env.RS256KEY7),
    "process.env.RS256KEY8": JSON.stringify(env.RS256KEY8),
    "process.env.RS256KEY9": JSON.stringify(env.RS256KEY9),
    "process.env.RS256KEY10": JSON.stringify(env.RS256KEY10),
    "process.env.RS256KEY11": JSON.stringify(env.RS256KEY11),
    "process.env.RS256KEY12": JSON.stringify(env.RS256KEY12),
    "process.env.RS256KEY13": JSON.stringify(env.RS256KEY13)
  },
  plugins: [react(), express("server/server.ts")],
  build: {
    outDir: "build"
  }
});
