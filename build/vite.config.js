import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import express from './plugins/viteExpress.js';

// https://vitejs.dev/config/
var vite_config = defineConfig({
    server: {
        port: 4000
    },
    plugins: [react(), express("server/server.ts")],
    build: {
        outDir: "build"
    }
});

export { vite_config as default };
//# sourceMappingURL=vite.config.js.map
