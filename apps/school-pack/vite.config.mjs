import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/play-school/",
  plugins: [react()],
  server: { host: "127.0.0.1" },
});
