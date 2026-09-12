import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

describe("reference listen entry", () => {
  it("points Google OAuth publicBaseUrl at the Vite origin", () => {
    const source = readFileSync(new URL("./listen.ts", import.meta.url), "utf8");
    expect(source).toMatch(/publicBaseUrl:\s*['"]http:\/\/127\.0\.0\.1:5174['"]/);
  });

  it("prints the Vite UI origin so the operator does not open the API 404", () => {
    const source = readFileSync(new URL("./listen.ts", import.meta.url), "utf8");
    expect(source).toMatch(/Open the UI at http:\/\/127\.0\.0\.1:5174/);
  });
});
