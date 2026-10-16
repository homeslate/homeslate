import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8");
}

describe("HomeslateApp", () => {
  it("mounts Editor and Display from packages and does not import hosted auth", () => {
    const source = read("./pages.tsx");
    expect(source).toMatch(/from ['"]@homeslate\/editor['"]/);
    expect(source).toMatch(/from ['"]@homeslate\/display['"]/);
    expect(source).not.toMatch(/AuthContext/);
    expect(source).not.toMatch(/dashboardStore/);
    expect(source).not.toMatch(/apiClient/);
    expect(source).not.toMatch(/netlify/);
    expect(source).not.toMatch(/drizzle-orm/);
  });

  it("flushes the pending editor PUT on unmount", () => {
    const source = read("./pages.tsx");
    expect(source).toMatch(/createDebouncedPersist/);
    expect(source).toMatch(/\.flush\(/);
  });

  it("routes the display list, editor, and kiosk", () => {
    const source = read("./HomeslateApp.tsx");
    expect(source).toMatch(/path="\/"\s+element=\{<DisplayListPage/);
    expect(source).toMatch(/path="\/edit\/:id"\s+element=\{<EditorPage/);
    expect(source).toMatch(/path="\/d\/:publicId"\s+element=\{<KioskPage/);
  });
});
