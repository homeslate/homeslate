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
    const source = read("./useDisplayDocument.ts");
    expect(source).toMatch(/createDebouncedPersist/);
    expect(source).toMatch(/\.flush\(/);
  });

  it("routes the display list, management, view editor, and kiosk", () => {
    const source = read("./HomeslateApp.tsx");
    expect(source).toMatch(/path="\/"\s+element=\{<DisplayListPage/);
    expect(source).toMatch(/path="\/edit\/:id"\s+element=\{<EditorPage/);
    expect(source).toMatch(/path="\/edit\/:id\/views\/:viewId"\s+element=\{<ViewEditorPage/);
    expect(source).toMatch(/path="\/d\/:publicId"\s+element=\{<KioskPage/);
  });

  it("manages multiple views through the display document helpers", () => {
    const source = read("./ViewsPanel.tsx");
    expect(source).toMatch(/from ['"]@homeslate\/display\/canvas['"]/);
    expect(source).toMatch(/\baddView\b/);
    expect(source).toMatch(/\bremoveView\b/);
    expect(source).toMatch(/\bmoveView\b/);
    expect(source).toMatch(/\bpatchView\b/);
  });

  it("wires display settings for alarms, rotation, and passcode", () => {
    const settings = read("./DisplaySettingsPanel.tsx");
    expect(settings).toMatch(/AlarmListEditor/);
    expect(settings).toMatch(/rotation/);
    expect(settings).toMatch(/PinInput/);
    expect(settings).toMatch(/onSetPasscode/);

    const pages = read("./pages.tsx");
    expect(pages).toMatch(/DisplaySettingsPanel/);
    expect(pages).toMatch(/getPublicDocument/);
    expect(pages).toMatch(/passcodeRequired/);
  });
});
