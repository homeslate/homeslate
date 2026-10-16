import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

describe("reference listen entry", () => {
  it("defaults HOMESLATE_PUBLIC_BASE_URL to the Vite dev origin when unset", () => {
    const source = readFileSync(new URL("./listen.ts", import.meta.url), "utf8");
    expect(source).toMatch(
      /HOMESLATE_PUBLIC_BASE_URL\?\.trim\(\)\s*\|\|\s*["']http:\/\/127\.0\.0\.1:5174["']/,
    );
  });

  it("honors HOMESLATE_DATA_DIR so the sqlite and token store can live on a volume", () => {
    const source = readFileSync(new URL("./listen.ts", import.meta.url), "utf8");
    expect(source).toMatch(/HOMESLATE_DATA_DIR/);
  });

  it("falls back to the in-repo data dir for `pnpm dev:reference`", () => {
    const source = readFileSync(new URL("./listen.ts", import.meta.url), "utf8");
    expect(source).toMatch(/new URL\(["']\.\.\/\.\.\/data/);
  });

  it("reads HOMESLATE_PUBLIC_BASE_URL from the environment for reverse-proxy hosts", () => {
    const source = readFileSync(new URL("./listen.ts", import.meta.url), "utf8");
    expect(source).toMatch(/HOMESLATE_PUBLIC_BASE_URL/);
    expect(source).toMatch(/publicBaseUrl/);
  });

  it("prints the resolved public base URL so the operator opens the right origin", () => {
    const source = readFileSync(new URL("./listen.ts", import.meta.url), "utf8");
    expect(source).toMatch(/Open the UI at \$\{publicBaseUrl\}/);
  });

  it("binds all interfaces by default so the published Docker port can reach it", () => {
    // Docker forwards a published port to the container's bridge address,
    // not its loopback, so a 127.0.0.1 bind leaves the port unreachable
    // even though the in-container healthcheck passes.
    const source = readFileSync(new URL("./listen.ts", import.meta.url), "utf8");
    expect(source).toMatch(/HOMESLATE_HOSTNAME\?\.trim\(\)\s*\|\|\s*["']0\.0\.0\.0["']/);
    expect(source).toMatch(/\bhostname,/);
  });
});
