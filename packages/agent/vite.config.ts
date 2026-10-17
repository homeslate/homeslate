import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/bin.ts"],
    dts: true,
    tsconfig: "../../tsconfig.app.json",
    format: ["esm"],
    unbundle: true,
  },
});
