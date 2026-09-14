import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import { WIDGETS_PACKAGE_NAME } from "@homeslate/widgets";
import { DISPLAY_OWNER_SIGN_IN_MESSAGE } from "@homeslate/widgets/server";

describe("@homeslate/widgets", () => {
  it("is importable by package name", () => {
    expect(WIDGETS_PACKAGE_NAME).toBe("@homeslate/widgets");
  });

  it("exposes the React-free server constants on an explicit subpath", () => {
    expect(DISPLAY_OWNER_SIGN_IN_MESSAGE).toEqual(expect.any(String));
  });

  it("resolves the barrel the same way for every condition", () => {
    const manifest = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { exports: Record<string, unknown> };

    expect(manifest.exports["."]).toEqual({
      types: "./dist/index.d.mts",
      import: "./dist/index.mjs",
    });
    expect(manifest.exports["./server"]).toEqual({
      types: "./dist/server.d.mts",
      import: "./dist/server.mjs",
    });
    expect(manifest.exports["./schemas"]).toEqual({
      types: "./dist/schemas.d.mts",
      import: "./dist/schemas.mjs",
    });
    expect(manifest.exports["./styles"]).toEqual({
      types: "./dist/styles.d.mts",
      import: "./dist/styles.mjs",
    });
  });
});
