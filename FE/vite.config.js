import { defineConfig } from "vite";
import react      from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 5173,
    // ── Bỏ comment block này khi Laravel sẵn sàng ─────────────────────────
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:8000",
    //     changeOrigin: true,
    //   },
    // },
    // ────────────────────────────────────────────────────────────────────────
  },
});