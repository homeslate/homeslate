import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serve } from "@hono/node-server";
import { createHomeslateServer } from "@homeslate/server";
import { describe, expect, it } from "vite-plus/test";
import { createMockHomeAssistant } from "./mockHomeAssistant";

/**
 * Exercise the real direct Home Assistant transport against the mock over HTTP:
 * auth, list/read/service routes, return-response reads, and the image proxy.
 */
describe("reference API + mock Home Assistant", () => {
  it("drives every route shape through the direct transport", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "homeslate-mock-ha-"));
    const mock = createMockHomeAssistant({ token: "test-token" });
    let port = 0;
    const mockServer = await new Promise<ReturnType<typeof serve>>((resolve) => {
      const server = serve({ fetch: mock.app.fetch, hostname: "127.0.0.1", port: 0 }, (info) => {
        port = info.port;
        resolve(server);
      });
    });

    const app = createHomeslateServer({
      dataDir,
      homeAssistant: {
        baseUrl: `http://127.0.0.1:${port}`,
        token: "test-token",
      },
    });

    try {
      const entities = (await (
        await app.request("/api/homeassistant/entities?domain=light")
      ).json()) as { entities: Array<{ entityId: string }> };
      expect(entities.entities.map((entry) => entry.entityId)).toEqual(
        expect.arrayContaining(["light.kitchen", "light.hall"]),
      );

      expect(
        await (await app.request("/api/homeassistant/states/light.kitchen")).json(),
      ).toMatchObject({ entityId: "light.kitchen", isOn: true, brightnessPct: 50 });

      const service = await app.request("/api/homeassistant/services/light/turn_on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity_id: "light.kitchen", brightness_pct: 30 }),
      });
      expect(service.status).toBe(200);
      expect(
        await (await app.request("/api/homeassistant/states/light.kitchen")).json(),
      ).toMatchObject({ isOn: true, brightnessPct: 30 });

      const forecast = (await (
        await app.request("/api/homeassistant/weather/weather.home/forecast")
      ).json()) as { forecast: unknown[] };
      expect(forecast.forecast.length).toBeGreaterThan(0);

      const todo = (await (
        await app.request("/api/homeassistant/todo/todo.shopping_list/items")
      ).json()) as { items: unknown[] };
      expect(todo.items.length).toBeGreaterThan(0);

      const history = (await (
        await app.request("/api/homeassistant/history/sensor.outdoor_temperature?hours=24")
      ).json()) as { points: unknown[] };
      expect(history.points.length).toBeGreaterThan(1);

      const notify = await app.request("/api/homeassistant/services/notify/send_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity_id: "notify.kitchen", message: "Test notification" }),
      });
      expect(notify.status).toBe(200);

      const imagePath = encodeURIComponent(
        "/api/media_player_proxy/media_player.kitchen?token=mock",
      );
      const image = await app.request(`/api/homeassistant/image?path=${imagePath}`);
      expect(image.status).toBe(200);
      expect(image.headers.get("content-type")).toBe("image/svg+xml");
    } finally {
      await new Promise<void>((resolve) => mockServer.close(() => resolve()));
      await rm(dataDir, { recursive: true, force: true });
    }
  });
});
