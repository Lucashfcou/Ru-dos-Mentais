import { defineConfig } from "vite";

export default defineConfig({
  build: { target: "es2022", chunkSizeWarningLimit: 600 },
  test: { environment: "jsdom", include: ["tests/**/*.test.js"] },
});
