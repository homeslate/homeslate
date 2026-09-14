import { fileURLToPath } from "node:url";
import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react";

const workspaceSrc = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  plugins: lazyPlugins(() => [react()]),
  resolve: {
    alias: {
      "@homeslate/widgets/styles": workspaceSrc("./packages/widgets/src/styles.ts"),
      "@homeslate/display/styles": workspaceSrc("./packages/display/src/styles.ts"),
      "@homeslate/editor/styles": workspaceSrc("./packages/editor/src/styles.ts"),
      "@homeslate/schema": workspaceSrc("./packages/schema/src/index.ts"),
      "@homeslate/google": workspaceSrc("./packages/google/src/index.ts"),
      "@homeslate/widgets/schemas": workspaceSrc("./packages/widgets/src/schemas.ts"),
      "@homeslate/widgets/server": workspaceSrc("./packages/widgets/src/server.ts"),
      "@homeslate/widgets": workspaceSrc("./packages/widgets/src/index.ts"),
      "@homeslate/display/canvas": workspaceSrc("./packages/display/src/canvas/index.ts"),
      "@homeslate/display": workspaceSrc("./packages/display/src/index.ts"),
      "@homeslate/editor": workspaceSrc("./packages/editor/src/index.ts"),
      "@homeslate/adapters": workspaceSrc("./packages/adapters/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    include: [
      "packages/schema/src/**/*.test.ts",
      "packages/google/src/**/*.test.ts",
      "packages/widgets/src/**/*.test.ts",
      "packages/display/src/**/*.test.ts",
      "packages/editor/src/**/*.test.ts",
      "packages/adapters/src/**/*.test.ts",
      "apps/reference/src/**/*.test.ts",
    ],
    globals: false,
    css: false,
  },
  fmt: {
    semi: true,
    ignorePatterns: ["docs/**", ".docs/**"],
  },
  lint: {
    plugins: ["oxc", "typescript", "unicorn", "react"],
    ignorePatterns: ["dist", ".netlify/**", ".claude/**"],
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    env: {
      builtin: true,
      browser: true,
    },
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-namespace": "error",
      "react/rules-of-hooks": "error",
      "react/exhaustive-deps": "warn",
      "react/only-export-components": "off",
    },
  },
});
