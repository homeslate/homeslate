import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { DISPLAY_PACKAGE_NAME, Display } from "@homeslate/display";

describe("@homeslate/display", () => {
  it("is importable by package name", () => {
    expect(DISPLAY_PACKAGE_NAME).toBe("@homeslate/display");
  });

  it("exports Display", () => {
    expect(typeof Display).toBe("function");
  });

  it("Display source does not import hosted persistence or auth", () => {
    const source = readFileSync(new URL("./Display.tsx", import.meta.url), "utf8");
    expect(source).not.toMatch(/AuthContext/);
    expect(source).not.toMatch(/apiClient/);
    expect(source).not.toMatch(/dashboardStore/);
    expect(source).not.toMatch(/passcode/);
    expect(source).not.toMatch(/PinInput/);
  });

  it("nests DesignSystemProvider with a compiled theme class, not inline --token-* styles", () => {
    const source = readFileSync(new URL("./Display.tsx", import.meta.url), "utf8");
    expect(source).toMatch(/from ["']@var-ui\/react["']/);
    expect(source).toMatch(/DesignSystemProvider/);
    expect(source).toMatch(/useCompiledDisplayTheme/);
    expect(source).toMatch(/customTheme=\{theme\}/);
    expect(source).toMatch(/colorMode=\{effectiveColorMode === "dark" \? "dark" : "light"\}/);
    expect(source).not.toMatch(/tokenVars/);
    expect(source).not.toMatch(/resolveDisplayThemeVars/);
    expect(source).not.toMatch(/--token-/);
    expect(source).not.toMatch(/applyToDocument/);
    expect(source).not.toMatch(/document\.documentElement/);
    expect(source).toMatch(/getCanvasBackgroundStyle/);
  });

  it("re-exports HolidayId from schema instead of duplicating the union", () => {
    const source = readFileSync(new URL("./holidays.ts", import.meta.url), "utf8");
    expect(source).toMatch(/from ['"]@homeslate\/schema['"]/);
    expect(source).toMatch(/export type \{ HolidayId \}/);
    expect(source).not.toMatch(/export type HolidayId =/);
  });

  it("exports AlarmRuntime as a named function", () => {
    const source = readFileSync(new URL("./alarms/AlarmRuntime.tsx", import.meta.url), "utf8");
    expect(source).toMatch(/export function AlarmRuntime\(/);
    expect(source).not.toMatch(/AlertRuntime/);
  });

  it("uses public VarUI tone tokens, not invented color.danger/success names", () => {
    assertNoInventedVarUiTokens(dirname(fileURLToPath(import.meta.url)));
  });
});

function walkSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkSourceFiles(full));
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (/\.test\.(ts|tsx)$/.test(entry.name)) continue;
    out.push(full);
  }
  return out;
}

function assertNoInventedVarUiTokens(root: string) {
  const files = walkSourceFiles(root);
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    expect(source, file).not.toMatch(/--var-ui-color-danger(?!-)/);
    expect(source, file).not.toMatch(/--var-ui-color-success(?!-)/);
    expect(source, file).not.toMatch(/--var-ui-radius-xs/);
  }
}
