import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [".onrender.com"],
    port: 5173,
    strictPort: true
  },
  preview: {
    allowedHosts: [".onrender.com"],
    port: 4173,
    strictPort: true
  }
});

