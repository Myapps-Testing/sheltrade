import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Render expects this folder
  },
  server: {
    port: 3000, // Render will map this automatically
    strictPort: true,
    allwedHosts: ['https://sheltrade-d2pl.onrender.com', 'sheltrade-d2pl.onrender.com']
  },
});
