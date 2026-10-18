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

  it("rejects non-climate domains and bad entity ids before fetching", async () => {
    const hono = await app({ baseUrl: "http://ha.test:8123", token: "test-token" });
    expect((await hono.request("/api/homeassistant/entities?domain=light")).status).toBe(400);
    expect((await hono.request("/api/homeassistant/states/light.kitchen")).status).toBe(400);
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

  it("uses an injected transport instead of fetch", async () => {
    let fetchCount = 0;
    globalThis.fetch = async () => {
      fetchCount += 1;
      return jsonOk([]);
    };
    const calls: string[] = [];
    const transport: HomeAssistantTransport = {
      async listClimateEntities() {
        calls.push("list");
        return [{ entityId: "climate.attic", name: "Attic", state: "off" }];
      },
      async getClimateState() {
        calls.push("get");
        return null;
      },
      async callClimateService() {
        calls.push("call");
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

    expect(calls).toEqual(["list", "get", "call"]);
    expect(fetchCount).toBe(0);
  });

  it("maps transport errors to their own status and copy", async () => {
    const hono = await app({
      transport: {
        async listClimateEntities() {
          throw new HomeAssistantTransportError(503, "agent offline");
        },
        async getClimateState() {
          throw new HomeAssistantTransportError(504, "timed out");
        },
        async callClimateService() {
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
        async listClimateEntities() {
          return [];
        },
        async getClimateState() {
          return null;
        },
        async callClimateService() {},
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
