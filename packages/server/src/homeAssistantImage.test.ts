import { describe, expect, it } from "vite-plus/test";
import { createHomeAssistantClient } from "./homeAssistant";
import {
  HOME_ASSISTANT_IMAGE_CACHE_TTL_MS,
  HOME_ASSISTANT_IMAGE_MAX_BYTES,
  HomeAssistantImageError,
  homeAssistantImageContentType,
  loadHomeAssistantImage,
  normalizeHomeAssistantImagePath,
} from "./homeAssistantImage";
import { createTtlCache } from "./ttlCache";

describe("normalizeHomeAssistantImagePath", () => {
  it("accepts media, camera, person image, and local www paths", () => {
    expect(
      normalizeHomeAssistantImagePath("/api/media_player_proxy/media_player.kitchen?token=abc"),
    ).toBe("/api/media_player_proxy/media_player.kitchen?token=abc");
    expect(normalizeHomeAssistantImagePath("/api/camera_proxy/camera.front")).toBe(
      "/api/camera_proxy/camera.front",
    );
    expect(normalizeHomeAssistantImagePath("/api/image/person.dan?token=abc")).toBe(
      "/api/image/person.dan?token=abc",
    );
    expect(normalizeHomeAssistantImagePath("/local/avatars/dan.jpg")).toBe(
      "/local/avatars/dan.jpg",
    );
  });

  it("rejects arbitrary paths and URL tricks", () => {
    expect(normalizeHomeAssistantImagePath("/api/states")).toBeNull();
    expect(normalizeHomeAssistantImagePath("/etc/passwd")).toBeNull();
    expect(
      normalizeHomeAssistantImagePath("https://evil.test/api/media_player_proxy/x"),
    ).toBeNull();
    expect(normalizeHomeAssistantImagePath("//evil.test/api/media_player_proxy/x")).toBeNull();
    expect(normalizeHomeAssistantImagePath("/api/media_player_proxy/../states")).toBeNull();
    expect(normalizeHomeAssistantImagePath("/api/media_player_proxy/%2e%2e/states")).toBeNull();
    expect(normalizeHomeAssistantImagePath("/api/media_player_proxy/x\\y")).toBeNull();
    expect(normalizeHomeAssistantImagePath("api/media_player_proxy/x")).toBeNull();
    expect(normalizeHomeAssistantImagePath("/api/image/../states")).toBeNull();
    expect(normalizeHomeAssistantImagePath("/api/image/%2e%2e/states")).toBeNull();
    expect(normalizeHomeAssistantImagePath("/local/../secrets")).toBeNull();
    expect(normalizeHomeAssistantImagePath("/local/%2e%2e/secrets")).toBeNull();
    expect(normalizeHomeAssistantImagePath("/api/image")).toBeNull();
  });
});

describe("homeAssistantImageContentType", () => {
  it("keeps image types and rejects everything else", () => {
    expect(homeAssistantImageContentType("image/png")).toBe("image/png");
    expect(homeAssistantImageContentType("text/html")).toBe("application/octet-stream");
    expect(homeAssistantImageContentType(null)).toBe("application/octet-stream");
  });
});

describe("loadHomeAssistantImage", () => {
  const path = "/api/media_player_proxy/media_player.kitchen";
  const image = { contentType: "image/png", body: new ArrayBuffer(4) };

  it("fetches once and then serves from the cache", async () => {
    const cache = createTtlCache<typeof image>();
    let calls = 0;
    const fetchImage = async () => {
      calls += 1;
      return image;
    };

    const first = await loadHomeAssistantImage({ path, cache, now: 1000, fetchImage });
    const second = await loadHomeAssistantImage({ path, cache, now: 1001, fetchImage });
    expect(first).toEqual(image);
    expect(second).toBe(first);
    expect(calls).toBe(1);

    await loadHomeAssistantImage({
      path,
      cache,
      now: 1000 + HOME_ASSISTANT_IMAGE_CACHE_TTL_MS + 1,
      fetchImage,
    });
    expect(calls).toBe(2);
  });

  it("rejects invalid paths and oversized images", async () => {
    const cache = createTtlCache<typeof image>();
    await expect(
      loadHomeAssistantImage({
        path: "/api/states",
        cache,
        now: 1,
        fetchImage: async () => image,
      }),
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      loadHomeAssistantImage({
        path,
        cache,
        now: 1,
        fetchImage: async () => ({
          contentType: "image/png",
          body: new ArrayBuffer(HOME_ASSISTANT_IMAGE_MAX_BYTES + 1),
        }),
      }),
    ).rejects.toBeInstanceOf(HomeAssistantImageError);
  });
});

describe("direct transport image fetch", () => {
  it("injects the bearer token and requests the normalized path", async () => {
    const calls: Array<{ url: string; authorization: string | null }> = [];
    const client = createHomeAssistantClient({
      baseUrl: "http://ha.test:8123/",
      token: "secret",
      fetchImpl: async (input, init) => {
        calls.push({
          url: String(input),
          authorization: new Headers(init?.headers).get("authorization"),
        });
        return new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { "Content-Type": "image/jpeg" },
        });
      },
    });

    const image = await client.fetchImage?.(
      "/api/media_player_proxy/media_player.kitchen?token=abc",
    );
    expect(image).toMatchObject({ contentType: "image/jpeg" });
    expect(image?.body.byteLength).toBe(3);
    expect(calls).toEqual([
      {
        url: "http://ha.test:8123/api/media_player_proxy/media_player.kitchen?token=abc",
        authorization: "Bearer secret",
      },
    ]);
  });

  it("rejects paths outside the allowlist before fetching", async () => {
    let calls = 0;
    const client = createHomeAssistantClient({
      baseUrl: "http://ha.test:8123",
      token: "secret",
      fetchImpl: async () => {
        calls += 1;
        return new Response("");
      },
    });

    await expect(
      client.fetchImage?.("https://evil.test/api/media_player_proxy/x"),
    ).rejects.toMatchObject({
      status: 400,
    });
    expect(calls).toBe(0);
  });
});
