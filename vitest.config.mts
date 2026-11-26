import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors tsconfig "paths": "@/*" -> project root.
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts", "components/**/*.tsx"],
      exclude: ["lib/types.ts", "lib/i18n/types.ts"],
      reporter: ["text-summary", "html"],
    },
  },
});
