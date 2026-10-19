import { describe, expect, it } from "vite-plus/test";
import {
  lockNeedsConfirm,
  lockStateLabel,
  lockSupportsOpen,
  lockTone,
  type HomeAssistantLock,
} from "./homeAssistantLock";

const lock = (overrides: Partial<HomeAssistantLock>): HomeAssistantLock => ({
  kind: "lock",
  entityId: "lock.x",
  name: "X",
  state: "locked",
  isLocked: true,
  supportsOpen: false,
  available: true,
  ...overrides,
});

describe("lockStateLabel", () => {
  it("reads the lock states", () => {
    expect(lockStateLabel(lock({ state: "locked" }))).toBe("Locked");
    expect(lockStateLabel(lock({ state: "unlocked" }))).toBe("Unlocked");
    expect(lockStateLabel(lock({ state: "jammed" }))).toBe("Jammed");
    expect(lockStateLabel(lock({ state: "unlocking" }))).toBe("Unlocking");
  });

  it("falls back to the raw state and unavailable", () => {
    expect(lockStateLabel(lock({ state: "weird" }))).toBe("weird");
    expect(lockStateLabel(lock({ available: false }))).toBe("Unavailable");
  });
});

describe("lockTone", () => {
  it("flags unlocked and jammed as attention states", () => {
    expect(lockTone(lock({ state: "locked" }))).toBe("success");
    expect(lockTone(lock({ state: "unlocking" }))).toBe("warning");
    expect(lockTone(lock({ state: "unlocked" }))).toBe("danger");
    expect(lockTone(lock({ state: "jammed" }))).toBe("danger");
    expect(lockTone(lock({ available: false }))).toBe("neutral");
  });
});

describe("lockSupportsOpen", () => {
  it("reads the feature bit", () => {
    expect(lockSupportsOpen(lock({ supportsOpen: true }))).toBe(true);
    expect(lockSupportsOpen(lock({ supportsOpen: false }))).toBe(false);
  });
});

describe("lockNeedsConfirm", () => {
  it("confirms unlock and open, but not lock", () => {
    expect(lockNeedsConfirm(lock({}), "lock")).toBe(false);
    expect(lockNeedsConfirm(lock({}), "unlock")).toBe(true);
    expect(lockNeedsConfirm(lock({}), "open")).toBe(true);
    expect(lockNeedsConfirm(lock({ available: false }), "unlock")).toBe(false);
  });
});
