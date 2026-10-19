import { describe, expect, it } from "vite-plus/test";
import {
  COVER_FEATURE_CLOSE,
  COVER_FEATURE_OPEN,
  COVER_FEATURE_SET_POSITION,
  COVER_FEATURE_STOP,
  coverIsOpen,
  coverNeedsOpenConfirm,
  coverStateLabel,
  coverSupports,
  getCoversSizeTier,
  type HomeAssistantCover,
} from "./homeAssistantCover";

const cover = (overrides: Partial<HomeAssistantCover>): HomeAssistantCover => ({
  entityId: "cover.x",
  name: "X",
  state: "closed",
  position: null,
  deviceClass: null,
  supportedFeatures: 0,
  isGarage: false,
  available: true,
  ...overrides,
});

describe("coverStateLabel", () => {
  it("reads the common cover states", () => {
    expect(coverStateLabel(cover({ state: "open" }))).toBe("Open");
    expect(coverStateLabel(cover({ state: "closed" }))).toBe("Closed");
    expect(coverStateLabel(cover({ state: "opening" }))).toBe("Opening");
    expect(coverStateLabel(cover({ state: "closing" }))).toBe("Closing");
  });

  it("falls back to the raw state and unavailable", () => {
    expect(coverStateLabel(cover({ state: "jammed" }))).toBe("jammed");
    expect(coverStateLabel(cover({ available: false }))).toBe("Unavailable");
  });
});

describe("coverIsOpen", () => {
  it("treats open and mid-open as open", () => {
    expect(coverIsOpen(cover({ state: "open" }))).toBe(true);
    expect(coverIsOpen(cover({ state: "opening" }))).toBe(true);
    expect(coverIsOpen(cover({ state: "closed" }))).toBe(false);
  });
});

describe("coverSupports", () => {
  it("reads the cover feature bits", () => {
    const features = cover({
      supportedFeatures: COVER_FEATURE_OPEN | COVER_FEATURE_CLOSE | COVER_FEATURE_SET_POSITION,
    });
    expect(coverSupports(features, COVER_FEATURE_OPEN)).toBe(true);
    expect(coverSupports(features, COVER_FEATURE_SET_POSITION)).toBe(true);
    expect(coverSupports(features, COVER_FEATURE_STOP)).toBe(false);
  });
});

describe("garage confirmation", () => {
  it("only asks for garage doors", () => {
    expect(coverNeedsOpenConfirm(cover({ isGarage: true }))).toBe(true);
    expect(coverNeedsOpenConfirm(cover({ isGarage: false }))).toBe(false);
  });
});

describe("getCoversSizeTier", () => {
  it("steps compact → medium → full with size", () => {
    expect(getCoversSizeTier(2, 1)).toBe("compact");
    expect(getCoversSizeTier(3, 3)).toBe("medium");
    expect(getCoversSizeTier(5, 4)).toBe("full");
  });
});
