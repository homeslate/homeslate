import { describe, expect, it } from "vite-plus/test";
import { isImageCacheCandidate } from "./imageCachePolicy";

describe("imageCachePolicy", () => {
  it("accepts image proxy and photo urls and rejects API calls", () => {
    expect(
      isImageCacheCandidate(
        new URL("http://localhost/api/homeassistant/image?path=%2Fapi%2Fimage%2Fa"),
        "GET",
      ),
    ).toBe(true);
    expect(isImageCacheCandidate(new URL("http://localhost/api/photo-proxy?key=abc"), "GET")).toBe(
      true,
    );
    expect(isImageCacheCandidate(new URL("http://localhost/photos/kitchen.png"), "GET")).toBe(true);
    expect(
      isImageCacheCandidate(
        new URL("https://images.unsplash.com/photo.jpg"),
        "GET",
        "http://localhost",
      ),
    ).toBe(false);
    expect(
      isImageCacheCandidate(
        new URL("http://localhost/api/homeassistant/services/light/turn_on"),
        "GET",
      ),
    ).toBe(false);
    expect(isImageCacheCandidate(new URL("http://localhost/api/public/board"), "GET")).toBe(false);
    expect(isImageCacheCandidate(new URL("http://localhost/api/photo-upload"), "POST")).toBe(false);
  });
});
