import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { createHomeslateServer } from "./createHomeslateServer";
import { HomeAssistantTransportError, type HomeAssistantTransport } from "./homeAssistant";

const originalFetch = globalThis.fetch;

const jsonOk = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const climateState = {
  entity_id: "climate.living_room",
  state: "heat",
  attributes: {
    friendly_name: "Living Room",
    current_temperature: 19.4,
    temperature: 21,
    temperature_unit: "C",
    hvac_action: "heating",
    hvac_modes: ["off", "heat", "cool"],
  },
};

describe("/api/homeassistant", () => {
  let dataDir = "";

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    if (dataDir) await rm(dataDir, { recursive: true, force: true });
  });

  async function app(homeAssistant?: {
    baseUrl?: string;
    token?: string;
    transport?: HomeAssistantTransport;
  }) {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-ref-"));
    return createHomeslateServer({ dataDir, homeAssistant });
  }

  it("returns 501 when Home Assistant is unconfigured", async () => {
    const hono = await app();
    expect((await hono.request("/api/homeassistant/entities?domain=climate")).status).toBe(501);
    expect((await hono.request("/api/homeassistant/states/climate.living_room")).status).toBe(501);
    expect(
      (
        await hono.request("/api/homeassistant/services/climate/set_temperature", {
          method: "POST",
          body: JSON.stringify({ entity_id: "climate.living_room", temperature: 21 }),
        })
      ).status,
    ).toBe(501);
  });

  it("rejects unknown domains and bad entity ids before fetching", async () => {
    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    expect((await hono.request("/api/homeassistant/entities?domain=weird")).status).toBe(400);
    expect((await hono.request("/api/homeassistant/states/weird.thing")).status).toBe(400);
    expect((await hono.request("/api/homeassistant/states/climate.LivingRoom")).status).toBe(400);
  });

  it("lists only climate entities sorted by name", async () => {
    globalThis.fetch = async () =>
      jsonOk([
        { entity_id: "light.kitchen", state: "on", attributes: {} },
        { entity_id: "climate.zebra", state: "off", attributes: { friendly_name: "Zebra" } },
        { entity_id: "climate.attic", state: "heat", attributes: { friendly_name: "Attic" } },
      ]);

    const hono = await app({ baseUrl: "http://ha.test:8123/", token: "test-token" });
    const response = await hono.request("/api/homeassistant/entities?domain=climate");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      entities: [
        { entityId: "climate.attic", name: "Attic", state: "heat" },
        { entityId: "climate.zebra", name: "Zebra", state: "off" },
      ],
    });
  });

  it("maps a climate state and returns 404 when Home Assistant has none", async () => {
    const calls: Array<{ url: string; authorization: string | null }> = [];
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      calls.push({ url, authorization: new Headers(init?.headers).get("Authorization") });
      if (url.includes("climate.den")) return new Response("{}", { status: 404 });
      return jsonOk(climateState);
    };

    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    const response = await hono.request("/api/homeassistant/states/climate.living_room");
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      entityId: "climate.living_room",
      hvacMode: "heat",
      action: "heating",
      targetTemperature: 21,
    });
    expect(calls[0]?.url).toBe("http://ha.test:8123/api/states/climate.living_room");
    expect(calls[0]?.authorization).toBe("Bearer test-token");

    expect((await hono.request("/api/homeassistant/states/climate.den")).status).toBe(404);
  });

  it("returns 502 when Home Assistant fails", async () => {
    globalThis.fetch = async () => new Response("boom", { status: 500 });
    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    expect((await hono.request("/api/homeassistant/states/climate.living_room")).status).toBe(502);
  });

  it("forwards an allowlisted service call with the exact payload", async () => {
    const calls: Array<{ url: string; body: unknown; authorization: string | null }> = [];
    globalThis.fetch = async (input, init) => {
      calls.push({
        url: String(input),
        body: init?.body ? JSON.parse(String(init.body)) : null,
        authorization: new Headers(init?.headers).get("Authorization"),
      });
      return jsonOk([]);
    };

    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    const response = await hono.request("/api/homeassistant/services/climate/set_temperature", {
      method: "POST",
      body: JSON.stringify({ entity_id: "climate.living_room", temperature: 22, junk: true }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(calls[0]?.url).toBe("http://ha.test:8123/api/services/climate/set_temperature");
    expect(calls[0]?.authorization).toBe("Bearer test-token");
    expect(calls[0]?.body).toEqual({ entity_id: "climate.living_room", temperature: 22 });
  });

  it("rejects unknown services and invalid service data without fetching", async () => {
    let fetchCount = 0;
    globalThis.fetch = async () => {
      fetchCount += 1;
      return jsonOk([]);
    };
    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });

    expect(
      (
        await hono.request("/api/homeassistant/services/climate/reload", {
          method: "POST",
          body: JSON.stringify({ entity_id: "climate.living_room" }),
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await hono.request("/api/homeassistant/services/climate/set_temperature", {
          method: "POST",
          body: JSON.stringify({ entity_id: "climate.living_room" }),
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await hono.request("/api/homeassistant/services/climate/set_hvac_mode", {
          method: "POST",
          body: JSON.stringify({ entity_id: "light.kitchen", hvac_mode: "cool" }),
        })
      ).status,
    ).toBe(400);
    expect(fetchCount).toBe(0);
  });

  it("returns 501 for todo routes when Home Assistant is unconfigured", async () => {
    const hono = await app();
    expect((await hono.request("/api/homeassistant/entities?domain=todo")).status).toBe(501);
    expect((await hono.request("/api/homeassistant/todo/todo.shopping/items")).status).toBe(501);
    expect(
      (
        await hono.request("/api/homeassistant/services/todo/add_item", {
          method: "POST",
          body: JSON.stringify({ entity_id: "todo.shopping", item: "Milk" }),
        })
      ).status,
    ).toBe(501);
  });

  it("lists only todo entities sorted by name", async () => {
    globalThis.fetch = async () =>
      jsonOk([
        { entity_id: "todo.zebra", state: "1", attributes: { friendly_name: "Zebra" } },
        { entity_id: "sensor.light", state: "on", attributes: {} },
        { entity_id: "todo.attic", state: "0", attributes: { friendly_name: "Attic" } },
      ]);

    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    const response = await hono.request("/api/homeassistant/entities?domain=todo");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      entities: [
        { entityId: "todo.attic", name: "Attic", state: "0" },
        { entityId: "todo.zebra", name: "Zebra", state: "1" },
      ],
    });
  });

  it("maps todo items through the return_response service call", async () => {
    const calls: Array<{ url: string; body: unknown; authorization: string | null }> = [];
    globalThis.fetch = async (input, init) => {
      calls.push({
        url: String(input),
        body: init?.body ? JSON.parse(String(init.body)) : null,
        authorization: new Headers(init?.headers).get("Authorization"),
      });
      return jsonOk({
        "todo.shopping": {
          items: [
            { uid: "1", summary: "Milk", status: "needs_action" },
            { uid: "2", summary: "Bread", status: "completed" },
            { summary: "Eggs" },
          ],
        },
      });
    };

    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    const response = await hono.request("/api/homeassistant/todo/todo.shopping/items");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: [
        { uid: "1", summary: "Milk", status: "needs_action" },
        { uid: "2", summary: "Bread", status: "completed" },
        { uid: "Eggs", summary: "Eggs", status: "needs_action" },
      ],
    });
    expect(calls[0]?.url).toBe("http://ha.test:8123/api/services/todo/get_items?return_response");
    expect(calls[0]?.authorization).toBe("Bearer test-token");
    expect(calls[0]?.body).toEqual({ entity_id: "todo.shopping" });
  });

  it("forwards an allowlisted todo service call with the exact payload", async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    globalThis.fetch = async (input, init) => {
      calls.push({
        url: String(input),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      return jsonOk([]);
    };

    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    const response = await hono.request("/api/homeassistant/services/todo/add_item", {
      method: "POST",
      body: JSON.stringify({ entity_id: "todo.shopping", item: "Milk", junk: true }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(calls[0]?.url).toBe("http://ha.test:8123/api/services/todo/add_item");
    expect(calls[0]?.body).toEqual({ entity_id: "todo.shopping", item: "Milk" });
  });

  it("rejects non-todo entities, unknown services, and invalid todo data without fetching", async () => {
    let fetchCount = 0;
    globalThis.fetch = async () => {
      fetchCount += 1;
      return jsonOk([]);
    };
    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });

    expect((await hono.request("/api/homeassistant/todo/climate.living_room/items")).status).toBe(
      400,
    );
    expect(
      (
        await hono.request("/api/homeassistant/services/todo/reload", {
          method: "POST",
          body: JSON.stringify({ entity_id: "todo.shopping" }),
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await hono.request("/api/homeassistant/services/todo/add_item", {
          method: "POST",
          body: JSON.stringify({ entity_id: "todo.shopping" }),
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await hono.request("/api/homeassistant/services/todo/add_item", {
          method: "POST",
          body: JSON.stringify({ entity_id: "light.kitchen", item: "Milk" }),
        })
      ).status,
    ).toBe(400);
    expect(fetchCount).toBe(0);
  });

  it("uses an injected transport instead of fetch", async () => {
    let fetchCount = 0;
    globalThis.fetch = async () => {
      fetchCount += 1;
      return jsonOk([]);
    };
    const calls: string[] = [];
    const transport: HomeAssistantTransport = {
      async listEntities(domain) {
        calls.push(`list:${domain}`);
        return [{ entityId: "climate.attic", name: "Attic", state: "off" }];
      },
      async getEntity() {
        calls.push("get");
        return null;
      },
      async callService(domain, service) {
        calls.push(`call:${domain}/${service}`);
      },
    };

    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token", transport });
    const list = await hono.request("/api/homeassistant/entities?domain=climate");
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual({
      entities: [{ entityId: "climate.attic", name: "Attic", state: "off" }],
    });
    expect((await hono.request("/api/homeassistant/states/climate.attic")).status).toBe(404);
    expect(
      (
        await hono.request("/api/homeassistant/services/climate/turn_off", {
          method: "POST",
          body: JSON.stringify({ entity_id: "climate.attic" }),
        })
      ).status,
    ).toBe(200);

    expect(calls).toEqual(["list:climate", "get", "call:climate/turn_off"]);
    expect(fetchCount).toBe(0);
  });

  it("returns a generic entity for a domain without a mapper", async () => {
    globalThis.fetch = async () =>
      jsonOk({
        entity_id: "todo.shopping",
        state: "2",
        attributes: { friendly_name: "Shopping", hidden: 1 },
      });

    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    const response = await hono.request("/api/homeassistant/states/todo.shopping");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      entityId: "todo.shopping",
      name: "Shopping",
      state: "2",
      unit: null,
      deviceClass: null,
      supportedFeatures: null,
      attributes: {},
    });
  });

  it("maps transport errors to their own status and copy", async () => {
    const hono = await app({
      transport: {
        async listEntities() {
          throw new HomeAssistantTransportError(503, "agent offline");
        },
        async getEntity() {
          throw new HomeAssistantTransportError(504, "timed out");
        },
        async callService() {
          throw new HomeAssistantTransportError(503, "agent offline");
        },
      },
    });

    const list = await hono.request("/api/homeassistant/entities?domain=climate");
    expect(list.status).toBe(503);
    expect(await list.json()).toEqual({ error: "agent offline" });

    const state = await hono.request("/api/homeassistant/states/climate.attic");
    expect(state.status).toBe(504);
    expect(await state.json()).toEqual({ error: "timed out" });

    const call = await hono.request("/api/homeassistant/services/climate/turn_off", {
      method: "POST",
      body: JSON.stringify({ entity_id: "climate.attic" }),
    });
    expect(call.status).toBe(503);
  });

  it("reports status for unconfigured, direct, and relay transports", async () => {
    const bare = await app();
    expect(await (await bare.request("/api/homeassistant/status")).json()).toEqual({
      configured: false,
      transport: null,
      connected: false,
      haReachable: null,
    });

    const direct = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    expect(await (await direct.request("/api/homeassistant/status")).json()).toEqual({
      configured: true,
      transport: "direct",
      connected: true,
      haReachable: true,
    });

    const relay = await app({
      transport: {
        async listEntities() {
          return [];
        },
        async getEntity() {
          return null;
        },
        async callService() {},
        async status() {
          return { connected: false, haReachable: false };
        },
      },
    });
    expect(await (await relay.request("/api/homeassistant/status")).json()).toEqual({
      configured: true,
      transport: "relay",
      connected: false,
      haReachable: false,
    });
  });
});

describe("/api/homeassistant weather + calendar", () => {
  let dataDir = "";

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    if (dataDir) await rm(dataDir, { recursive: true, force: true });
  });

  async function app(homeAssistant?: {
    baseUrl?: string;
    token?: string;
    transport?: HomeAssistantTransport;
  }) {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-ref-"));
    return createHomeslateServer({ dataDir, homeAssistant });
  }

  it("returns 501 when Home Assistant is unconfigured", async () => {
    const hono = await app();
    expect((await hono.request("/api/homeassistant/weather/weather.home/forecast")).status).toBe(
      501,
    );
    expect((await hono.request("/api/homeassistant/calendar/calendar.home/events")).status).toBe(
      501,
    );
  });

  it("rejects bad weather and calendar entity ids before fetching", async () => {
    let fetchCount = 0;
    globalThis.fetch = async () => {
      fetchCount += 1;
      return jsonOk({});
    };
    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });

    expect((await hono.request("/api/homeassistant/weather/sensor.outdoor/forecast")).status).toBe(
      400,
    );
    expect((await hono.request("/api/homeassistant/calendar/weather.home/events")).status).toBe(
      400,
    );
    expect(fetchCount).toBe(0);
  });

  it("maps a weather forecast through the return_response service call", async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    globalThis.fetch = async (input, init) => {
      calls.push({ url: String(input), body: init?.body ? JSON.parse(String(init.body)) : null });
      return jsonOk({
        "weather.home": {
          forecast: [
            { datetime: "2026-10-19T12:00:00+00:00", condition: "sunny", temperature: 21.5 },
            {
              datetime: "2026-10-20T12:00:00+00:00",
              condition: "rainy",
              temperature: 17,
              templow: 11,
            },
          ],
        },
      });
    };

    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    const response = await hono.request(
      "/api/homeassistant/weather/weather.home/forecast?type=daily",
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      forecast: [
        {
          datetime: "2026-10-19T12:00:00+00:00",
          condition: "sunny",
          temperature: 21.5,
          templow: null,
          precipitationProbability: null,
          isDay: true,
        },
        {
          datetime: "2026-10-20T12:00:00+00:00",
          condition: "rainy",
          temperature: 17,
          templow: 11,
          precipitationProbability: null,
          isDay: true,
        },
      ],
    });
    expect(calls[0]?.url).toBe(
      "http://ha.test:8123/api/services/weather/get_forecasts?return_response",
    );
    expect(calls[0]?.body).toEqual({ entity_id: "weather.home", type: "daily" });
  });

  it("maps calendar events through the return_response service call", async () => {
    const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
    globalThis.fetch = async (input, init) => {
      calls.push({
        url: String(input),
        body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {},
      });
      return jsonOk({
        "calendar.home": {
          events: [
            {
              summary: "Standup",
              uid: "abc",
              start: { dateTime: "2026-10-19T09:00:00+00:00" },
              end: { dateTime: "2026-10-19T09:30:00+00:00" },
              location: "Zoom",
            },
            {
              summary: "Holiday",
              start: { date: "2026-10-20" },
              end: { date: "2026-10-21" },
            },
          ],
        },
      });
    };

    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    const response = await hono.request(
      "/api/homeassistant/calendar/calendar.home/events?daysAhead=7",
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      events: [
        {
          id: "abc",
          title: "Standup",
          location: "Zoom",
          start: "2026-10-19T09:00:00+00:00",
          end: "2026-10-19T09:30:00+00:00",
          allDay: false,
        },
        {
          id: "2026-10-20-1",
          title: "Holiday",
          start: "2026-10-20",
          end: "2026-10-21",
          allDay: true,
        },
      ],
    });
    expect(calls[0]?.url).toBe(
      "http://ha.test:8123/api/services/calendar/get_events?return_response",
    );
    expect(calls[0]?.body.entity_id).toBe("calendar.home");
    expect(typeof calls[0]?.body.start_date_time).toBe("string");
    expect(typeof calls[0]?.body.end_date_time).toBe("string");
  });
});

describe("/api/homeassistant image proxy", () => {
  let dataDir = "";

  afterEach(async () => {
    if (dataDir) await rm(dataDir, { recursive: true, force: true });
  });

  async function app(homeAssistant?: {
    baseUrl?: string;
    token?: string;
    transport?: HomeAssistantTransport;
  }) {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-ref-"));
    return createHomeslateServer({ dataDir, homeAssistant });
  }

  it("returns 501 for a valid path when Home Assistant is unconfigured", async () => {
    const hono = await app();
    const path = encodeURIComponent("/api/media_player_proxy/media_player.kitchen");
    expect((await hono.request(`/api/homeassistant/image?path=${path}`)).status).toBe(501);
  });

  it("rejects arbitrary paths before fetching", async () => {
    const hono = await app({
      transport: {
        async listEntities() {
          return [];
        },
        async getEntity() {
          return null;
        },
        async callService() {},
        async fetchImage() {
          throw new Error("should not fetch");
        },
      },
    });
    for (const path of [
      "/api/states",
      "/etc/passwd",
      "https://evil.test/api/media_player_proxy/x",
    ]) {
      expect(
        (await hono.request(`/api/homeassistant/image?path=${encodeURIComponent(path)}`)).status,
      ).toBe(400);
    }
  });

  it("serves allowlisted artwork through the transport and caches it", async () => {
    let calls = 0;
    const body = new Uint8Array([112, 110, 103]).buffer as ArrayBuffer;
    const hono = await app({
      transport: {
        async listEntities() {
          return [];
        },
        async getEntity() {
          return null;
        },
        async callService() {},
        async fetchImage(path) {
          calls += 1;
          expect(path).toBe("/api/media_player_proxy/media_player.kitchen?token=abc");
          return { contentType: "image/png", body };
        },
      },
    });

    const path = encodeURIComponent("/api/media_player_proxy/media_player.kitchen?token=abc");
    const first = await hono.request(`/api/homeassistant/image?path=${path}`);
    expect(first.status).toBe(200);
    expect(first.headers.get("content-type")).toBe("image/png");
    expect((await first.arrayBuffer()).byteLength).toBe(3);

    const second = await hono.request(`/api/homeassistant/image?path=${path}`);
    expect(second.status).toBe(200);
    expect(calls).toBe(1);

    const busted = await hono.request(`/api/homeassistant/image?path=${path}&t=123`);
    expect(busted.status).toBe(200);
    expect(calls).toBe(2);
  });
});
