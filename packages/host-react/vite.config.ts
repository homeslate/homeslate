import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    dts: true,
    tsconfig: "../../tsconfig.app.json",
    format: ["esm"],
    unbundle: true,
    deps: {
      neverBundle: ["react", "react-dom", "react-router-dom", "react-aria-components"],
    },
  },
});
