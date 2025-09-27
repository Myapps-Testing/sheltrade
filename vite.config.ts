import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // IPv6-compatible, you could also use '0.0.0.0'
    port: 8080,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['sheltrade-ig8i.onrender.com', 'https://sheltrade-ig8i.onrender.com']
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
