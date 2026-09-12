import { describe, expect, it } from "vite-plus/test";
import { isAnnouncementVisible } from "./announcement";

describe("isAnnouncementVisible", () => {
  const now = new Date("2026-09-11T12:00:00Z");

  it("is visible when no window is set", () => {
    expect(isAnnouncementVisible(now)).toBe(true);
  });

  it("hides before showFrom and shows at showFrom", () => {
    expect(isAnnouncementVisible(now, "2026-09-11T13:00:00Z")).toBe(false);
    expect(isAnnouncementVisible(now, "2026-09-11T12:00:00Z")).toBe(true);
  });

  it("hides at and after showUntil", () => {
    expect(isAnnouncementVisible(now, undefined, "2026-09-11T12:00:00Z")).toBe(false);
    expect(isAnnouncementVisible(now, undefined, "2026-09-11T12:00:01Z")).toBe(true);
  });
});
