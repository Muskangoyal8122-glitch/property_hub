import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Sab /api calls automatically backend (Express, port 5000) pe forward ho jayengi
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
