import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/play-ai-school/",
  plugins: [react()],
  server: { host: "127.0.0.1" },
});
