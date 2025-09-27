import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Render expects this folder
  },
  server: {
    port: 3000,
    strictPort: true,
    allowedHosts: ['sheltrade-d2pl.onrender.com']
  },
});
