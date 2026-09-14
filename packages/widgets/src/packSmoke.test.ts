import { describe, expect, it } from "vite-plus/test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const widgetsDist = join(dirname(fileURLToPath(import.meta.url)), "../dist");
const displayDist = join(widgetsDist, "../../display/dist");
const editorDist = join(widgetsDist, "../../editor/dist");
const adaptersDist = join(widgetsDist, "../../adapters/dist");

function listed(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, encoding: "utf8" });
}

describe("vp pack artifacts", () => {
  it("emits styles entry and no CSS modules", () => {
    expect(listed(widgetsDist).length, "run vp run build first").toBeGreaterThan(0);
    for (const dir of [widgetsDist, displayDist, editorDist]) {
      const files = listed(dir);
      expect(
        files.some((file) => /styles\.(js|mjs|d\.ts|d\.mts)$/.test(file)),
        dir,
      ).toBe(true);
      expect(files.filter((file) => file.includes(".module.css"))).toEqual([]);
    }
  });

  it("keeps adapters on node:sqlite", () => {
    const files = listed(adaptersDist).filter(
      (file) => file.endsWith(".js") || file.endsWith(".mjs"),
    );
    const source = files.map((file) => readFileSync(join(adaptersDist, file), "utf8")).join("\n");
    expect(source).toContain("node:sqlite");
    expect(source).not.toMatch(/from ["']sqlite["']/);
  });
});
