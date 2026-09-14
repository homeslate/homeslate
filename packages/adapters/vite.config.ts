import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    dts: true,
    tsconfig: "./tsconfig.json",
    format: ["esm"],
    unbundle: true,
    deps: {
      neverBundle: ["@homeslate/google", "@homeslate/schema", "@homeslate/widgets"],
    },
  },
});
