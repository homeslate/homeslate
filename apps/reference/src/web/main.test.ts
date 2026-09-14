import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

describe("reference Vite entry", () => {
  it("does not load Mantine CSS", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    expect(source).not.toMatch(/@mantine\//);
  });

  it("wraps the tree in DesignSystemProvider", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    expect(source).toMatch(/DesignSystemProvider/);
  });
});
