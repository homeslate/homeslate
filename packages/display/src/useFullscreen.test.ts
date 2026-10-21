import { describe, expect, it } from "vite-plus/test";
import { bindFullscreen, type FullscreenHost } from "./useFullscreen";

function host(): FullscreenHost & { element: Element | null } {
  let fullscreenElement: Element | null = null;
  const listeners = new Set<() => void>();
  const element = {};
  return {
    element: null,
    get fullscreenElement() {
      return fullscreenElement;
    },
    documentElement: {
      requestFullscreen: async () => {
        fullscreenElement = element as unknown as Element;
      },
    },
    exitFullscreen: async () => {
      fullscreenElement = null;
    },
    addEventListener: (_type, listener) => {
      listeners.add(listener);
    },
    removeEventListener: (_type, listener) => {
      listeners.delete(listener);
    },
  };
}

describe("useFullscreen", () => {
  it("enters and exits fullscreen", async () => {
    const api = bindFullscreen(host());
    expect(api.supported).toBe(true);
    expect(api.isFullscreen()).toBe(false);
    await api.enter();
    expect(api.isFullscreen()).toBe(true);
    await api.exit();
    expect(api.isFullscreen()).toBe(false);
  });

  it("no-ops when fullscreen is unsupported", async () => {
    const api = bindFullscreen(null);
    expect(api.supported).toBe(false);
    await expect(api.enter()).resolves.toBeUndefined();
    await expect(api.exit()).resolves.toBeUndefined();
  });
});
