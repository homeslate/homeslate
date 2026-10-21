import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

const source = readFileSync(new URL("./builtins.ts", import.meta.url), "utf8");

/** Every `React.lazy` factory in the registry, as module path plus export name. */
function lazyLoads(): Array<{ file: string; exportName: string }> {
  const loads: Array<{ file: string; exportName: string }> = [];
  const pattern = /import\("\.\/widgets\/([^"]+)"\)\.then\(\(m\) => \(\{[\s\S]*?default: m\.(\w+)/g;
  for (const match of source.matchAll(pattern)) {
    loads.push({ file: match[1], exportName: match[2] });
  }
  return loads;
}

describe("widget lazy exports", () => {
  it("finds a component for every lazy widget and settings load", async () => {
    const loads = lazyLoads();
    expect(loads.length).toBeGreaterThan(40);

    const failures = (
      await Promise.all(
        loads.map(async (load) => {
          const module = (await import(`./widgets/${load.file}.tsx`)) as Record<string, unknown>;
          return typeof module[load.exportName] === "function"
            ? null
            : `${load.file}.${load.exportName}`;
        }),
      )
    ).filter((failure) => failure != null);
    expect(failures).toEqual([]);
  });
});
