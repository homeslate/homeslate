import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/schemas.ts", "src/server.ts", "src/styles.ts"],
    dts: true,
    tsconfig: "../../tsconfig.app.json",
    format: ["esm"],
    unbundle: true,
    deps: {
      neverBundle: ["react", "react-dom", "typestyles", "@homeslate/schema"],
    },
  },
});
