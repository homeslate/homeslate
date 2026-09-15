import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Application } from "typedoc";

const docsRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const apiDir = join(docsRoot, "content/docs/api");
const pluginPath = fileURLToPath(new URL("./typedoc-frontmatter.mjs", import.meta.url));

/** @typedef {{ id: string, entry: string, dest: string, title: string, description: string }} ApiEntry */

/** @type {ApiEntry[]} */
const ENTRIES = [
  {
    id: "schema",
    entry: "packages/schema/src/index.ts",
    dest: "api/schema.md",
    title: "@homeslate/schema",
    description: "Public API for @homeslate/schema",
  },
  {
    id: "google",
    entry: "packages/google/src/index.ts",
    dest: "api/google.md",
    title: "@homeslate/google",
    description: "Public API for @homeslate/google",
  },
  {
    id: "widgets",
    entry: "packages/widgets/src/index.ts",
    dest: "api/widgets.md",
    title: "@homeslate/widgets",
    description: "Public API for @homeslate/widgets",
  },
  {
    id: "widgets-schemas",
    entry: "packages/widgets/src/schemas.ts",
    dest: "api/widgets/schemas.md",
    title: "@homeslate/widgets/schemas",
    description: "Public API for @homeslate/widgets/schemas",
  },
  {
    id: "widgets-server",
    entry: "packages/widgets/src/server.ts",
    dest: "api/widgets/server.md",
    title: "@homeslate/widgets/server",
    description: "Public API for @homeslate/widgets/server",
  },
  {
    id: "display",
    entry: "packages/display/src/index.ts",
    dest: "api/display.md",
    title: "@homeslate/display",
    description: "Public API for @homeslate/display",
  },
  {
    id: "display-canvas",
    entry: "packages/display/src/canvas/index.ts",
    dest: "api/display/canvas.md",
    title: "@homeslate/display/canvas",
    description: "Public API for @homeslate/display/canvas",
  },
  {
    id: "editor",
    entry: "packages/editor/src/index.ts",
    dest: "api/editor.md",
    title: "@homeslate/editor",
    description: "Public API for @homeslate/editor",
  },
  {
    id: "adapters",
    entry: "packages/adapters/src/index.ts",
    dest: "api/adapters.md",
    title: "@homeslate/adapters",
    description: "Public API for @homeslate/adapters",
  },
];

function listMarkdownFiles(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listMarkdownFiles(path));
    else if (entry.name.endsWith(".md")) files.push(path);
  }
  return files;
}

function pickMarkdown(tmpDir) {
  const nestedIndex = listMarkdownFiles(tmpDir).find((path) => path.endsWith("/index.md"));
  if (nestedIndex) return nestedIndex;
  const files = listMarkdownFiles(tmpDir);
  if (files.length !== 1) {
    console.error(`Expected one markdown file in ${tmpDir}, found ${files.length}:`);
    for (const file of files) console.error(`  ${file}`);
    process.exit(1);
  }
  return files[0];
}

function hasTitleFrontmatter(path) {
  return /^---\r?\n[\s\S]*?^title:/m.test(readFileSync(path, "utf8"));
}

async function generateOne(row) {
  const tmp = join(apiDir, ".tmp", row.id);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  process.env.HOMESLATE_API_TITLE = row.title;
  process.env.HOMESLATE_API_DESCRIPTION = row.description;

  const app = await Application.bootstrapWithPlugins({
    entryPoints: [join(repoRoot, row.entry)],
    tsconfig: join(repoRoot, "tsconfig.app.json"),
    plugin: ["typedoc-plugin-markdown", "typedoc-plugin-frontmatter", pluginPath],
    out: tmp,
    readme: "none",
    exclude: ["**/*.test.ts"],
    skipErrorChecking: true,
    hideGenerator: true,
    entryFileName: "index.md",
    outputFileStrategy: "modules",
    hidePageHeader: true,
    hideBreadcrumbs: true,
    hidePageTitle: true,
  });

  const project = await app.convert();
  if (!project) {
    console.error(`TypeDoc convert failed for ${row.entry}`);
    process.exit(1);
  }
  await app.generateOutputs(project);

  const dest = join(docsRoot, "content/docs", row.dest);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(pickMarkdown(tmp), dest);
  rmSync(tmp, { recursive: true, force: true });
}

async function main() {
  rmSync(apiDir, { recursive: true, force: true });
  mkdirSync(apiDir, { recursive: true });
  for (const row of ENTRIES) await generateOne(row);
  rmSync(join(apiDir, ".tmp"), { recursive: true, force: true });
  for (const row of ENTRIES) {
    const dest = join(docsRoot, "content/docs", row.dest);
    if (!existsSync(dest)) {
      console.error(`Missing generated API page: ${dest}`);
      process.exit(1);
    }
    if (!hasTitleFrontmatter(dest)) {
      console.error(`Generated API page is missing title frontmatter: ${dest}`);
      process.exit(1);
    }
  }
}

await main();
