import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { matchingRuntimeCache, referencePwaOptions } from "./pwa";

describe("reference PWA", () => {
  it("registers an auto-updating app shell and does not cache service calls", () => {
    expect(referencePwaOptions.registerType).toBe("autoUpdate");
    expect(referencePwaOptions.devOptions.enabled).toBe(false);
    expect(referencePwaOptions.manifest.icons.map((icon) => icon.src)).toEqual([
      "/icons/icon-192.png",
      "/icons/icon-512.png",
      "/icons/icon-maskable-512.png",
    ]);
    expect(referencePwaOptions.workbox.navigateFallback).toBe("/index.html");
    const workbox = JSON.stringify(referencePwaOptions.workbox);
    expect(workbox).toContain("homeslate-images-v1");
    const patterns = referencePwaOptions.workbox.runtimeCaching.map((rule) =>
      rule.urlPattern.toString(),
    );
    expect(patterns.join("\n")).toContain("/api/homeassistant/image");
    expect(patterns.join("\n")).toContain("/api/photo-proxy");
    expect(patterns.join("\n")).not.toContain("isImageCacheCandidate");
    expect(patterns.join("\n")).not.toContain("isPublicDocumentGet");
    expect(
      matchingRuntimeCache("http://127.0.0.1/api/homeassistant/services/light/turn_on", "POST"),
    ).toBeNull();
    expect(
      matchingRuntimeCache(
        "http://127.0.0.1/api/homeassistant/image?path=%2Fapi%2Fimage%2Fa",
        "GET",
        "http://127.0.0.1",
      ),
    ).toBe("homeslate-images-v1");
    expect(
      matchingRuntimeCache("https://images.unsplash.com/photo.jpg", "GET", "http://127.0.0.1"),
    ).toBeNull();
    expect(matchingRuntimeCache("http://127.0.0.1/api/public/board", "GET")).toBe(
      "homeslate-document-v1",
    );
    const samples = [
      ["http://127.0.0.1/assets/app.js", "GET", "homeslate-static-v1"],
      ["http://127.0.0.1/api/public/board", "GET", "homeslate-document-v1"],
      ["http://127.0.0.1/api/homeassistant/image?path=a", "GET", "homeslate-images-v1"],
      ["http://127.0.0.1/api/homeassistant/services/light/turn_on", "POST", null],
      ["http://127.0.0.1/api/weather/forecast?latitude=1&longitude=2", "GET", "homeslate-data-v1"],
      ["https://images.unsplash.com/photo.jpg", "GET", null],
    ] as const;
    for (const [href, method, expected] of samples) {
      const parsed = new URL(href);
      const sameOrigin = parsed.origin === "http://127.0.0.1";
      const matched =
        referencePwaOptions.workbox.runtimeCaching.find((rule) =>
          rule.urlPattern({ url: parsed, request: { method }, sameOrigin }),
        )?.options.cacheName ?? null;
      expect(matched).toBe(expected);
      expect(matchingRuntimeCache(href, method, "http://127.0.0.1")).toBe(expected);
    }
  });

  it("is wired into the reference Vite config", () => {
    const config = readFileSync(
      fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
      "utf8",
    );
    expect(config).toContain("VitePWA");
    expect(config).toContain("referencePwaOptions");
  });
});
