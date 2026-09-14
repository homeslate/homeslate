import { describe, expect, it } from "vite-plus/test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const styleDirs = [join(srcDir, "widgets"), join(srcDir, "household"), join(srcDir, "alarms")];

const styleFiles = styleDirs.flatMap((dir) =>
  readdirSync(dir)
    .filter((file) => file.endsWith(".styles.ts"))
    .map((file) => join(dir, file)),
);

function stripComments(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

describe("widget TypeStyles theme tokens", () => {
  it("scans recipe files", () => {
    expect(styleFiles.length).toBeGreaterThan(0);
  });

  it("does not reference malformed or library-private theme tokens", () => {
    const offenders = styleFiles.flatMap((file) => {
      const css = stripComments(readFileSync(file, "utf8"));
      const matches = css.match(/--token-[\w-]*\$[\w-]*/g) ?? [];
      return matches.map((match) => `${file}: ${match}`);
    });

    expect(offenders).toEqual([]);
  });

  it("does not reference retired --token- CSS variables", () => {
    for (const file of styleFiles) {
      const css = stripComments(readFileSync(file, "utf8"));
      const tokenPrefix = css.match(/--token-[a-z0-9-]+/gi) ?? [];
      expect(tokenPrefix, file).toEqual([]);
    }
  });

  it("keeps widget color styling on theme-provided tokens", () => {
    const literalColorPattern =
      /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*(?!var\(--var-ui-)[^)]+\)|(?:^|[\s,(])(?:white|black)(?=[\s,);]|$)/g;

    const offenders = styleFiles.flatMap((file) => {
      const css = stripComments(readFileSync(file, "utf8"));
      return css
        .split("\n")
        .filter((line) => line.includes(":"))
        .flatMap((line) => {
          const value = line.slice(line.indexOf(":") + 1);
          const matches = value.match(literalColorPattern) ?? [];
          return matches.map((match) => `${file}: ${match.trim()}`);
        });
    });

    expect(offenders).toEqual([]);
  });
});
