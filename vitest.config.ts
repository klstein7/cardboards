import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    environmentMatchGlobs: [["src/**/*.test.tsx", "jsdom"]],
    globals: true,
    setupFiles: ["./test/setup.ts", "./src/test/setup-env.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/setup.ts",
        ".next/",
        "src/components/ui/",
      ],
      include: ["src/server/services/**/*.ts"],
    },
    include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
});
