// Maps every published `@homeslate/*` export onto its TypeScript source so
// `pnpm dev:reference` runs the workspace files instead of `dist/`.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));

const aliases = new Map<string, string>();

for (const name of readdirSync(join(repoRoot, "packages"))) {
  const pkgDir = join(repoRoot, "packages", name);
  const manifestPath = join(pkgDir, "package.json");
  if (!existsSync(manifestPath)) continue;

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    name?: string;
    exports?: Record<string, unknown>;
  };
  if (!manifest.name?.startsWith("@homeslate/") || !manifest.exports) continue;

  for (const [subpath, value] of Object.entries(manifest.exports)) {
    const published = publishedImport(value);
    if (!published?.startsWith("./dist/") || !published.endsWith(".mjs")) continue;

    const sourceRel = `${published.slice("./dist/".length, -".mjs".length)}.ts`;
    const source = join(pkgDir, "src", sourceRel);
    if (!existsSync(source)) {
      throw new Error(
        `${manifest.name} export ${subpath} has no source file at ${relative(repoRoot, source)}`,
      );
    }

    const specifier = subpath === "." ? manifest.name : `${manifest.name}${subpath.slice(1)}`;
    aliases.set(specifier, source);
  }
}

if (aliases.size === 0) {
  throw new Error(`No @homeslate packages found under ${repoRoot}`);
}

export function workspacePackageUrl(specifier: string): string | undefined {
  const source = aliases.get(specifier);
  return source ? pathToFileURL(source).href : undefined;
}

function publishedImport(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "import" in value && typeof value.import === "string") {
    return value.import;
  }
  return undefined;
}
