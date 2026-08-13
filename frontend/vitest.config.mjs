// frontend/vitest.config.mjs
// Named .mjs so Vite loads it as ESM (avoids the ESM-in-CJS warning that
// occurred when a .ts config was loaded as CommonJS).
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    include: [
      "lib/**/*.test.ts",
      "lib/**/*.test.mts",
      "app/api/**/*.test.ts",
      "components/**/*.test.tsx",
    ],
  },
});