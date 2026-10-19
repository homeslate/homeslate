import { afterEach, describe, expect, it } from "vite-plus/test";
import {
  HomeAssistantHttpError,
  callThermostatService,
  callTodoService,
  fetchClimateEntities,
  fetchThermostat,
  fetchTodoEntities,
  fetchTodoItems,
} from "./homeAssistant";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("fetchClimateEntities", () => {
  it("requests the climate domain and returns the list", async () => {
    let requested = "";
    globalThis.fetch = async (input) => {
      requested = String(input);
      return jsonResponse({ entities: [{ entityId: "climate.den", name: "Den", state: "heat" }] });
    };
    const entities = await fetchClimateEntities();
    expect(requested).toBe("/api/homeassistant/entities?domain=climate");
    expect(entities).toHaveLength(1);
  });

  it("throws a 501 HttpError with the server copy", async () => {
    globalThis.fetch = async () =>
      jsonResponse(
        { error: "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server." },
        501,
      );
    await expect(fetchClimateEntities()).rejects.toMatchObject({ status: 501 });
  });
});

describe("fetchThermostat", () => {
  it("requests the entity state url", async () => {
    let requested = "";
    globalThis.fetch = async (input) => {
      requested = String(input);
      return jsonResponse({ entityId: "climate.den", hvacMode: "heat" });
    };
    const state = await fetchThermostat("climate.den");
    expect(requested).toBe("/api/homeassistant/states/climate.den");
    expect(state).toMatchObject({ hvacMode: "heat" });
  });

  it("surfaces the server error message", async () => {
    globalThis.fetch = async () => jsonResponse({ error: "Entity not found" }, 404);
    await expect(fetchThermostat("climate.den")).rejects.toThrow("Entity not found");
  });

  it("surfaces a 503 agent-offline error and its copy", async () => {
    globalThis.fetch = async () =>
      jsonResponse(
        { error: "Your Home Assistant agent is offline. Check that it's running and connected." },
        503,
      );
    await expect(fetchThermostat("climate.den")).rejects.toMatchObject({
      status: 503,
      message: "Your Home Assistant agent is offline. Check that it's running and connected.",
    });
  });
});

describe("callThermostatService", () => {
  it("posts the entity id and data to the climate service url", async () => {
    const calls: Array<{ url: string; method?: string; body: unknown }> = [];
    globalThis.fetch = async (input, init) => {
      calls.push({
        url: String(input),
        method: init?.method,
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      return jsonResponse({ ok: true });
    };
    await callThermostatService("climate.den", "set_temperature", { temperature: 21 });
    expect(calls[0]).toEqual({
      url: "/api/homeassistant/services/climate/set_temperature",
      method: "POST",
      body: { entity_id: "climate.den", temperature: 21 },
    });
  });

  it("throws on failure", async () => {
    globalThis.fetch = async () => jsonResponse({ error: "Home Assistant request failed" }, 502);
    await expect(
      callThermostatService("climate.den", "set_hvac_mode", { hvac_mode: "cool" }),
    ).rejects.toBeInstanceOf(HomeAssistantHttpError);
  });
});

describe("fetchTodoEntities", () => {
  it("requests the todo domain and returns the list", async () => {
    let requested = "";
    globalThis.fetch = async (input) => {
      requested = String(input);
      return jsonResponse({ entities: [{ entityId: "todo.den", name: "Den", state: "1" }] });
    };
    const entities = await fetchTodoEntities();
    expect(requested).toBe("/api/homeassistant/entities?domain=todo");
    expect(entities).toHaveLength(1);
  });

  it("throws a 501 HttpError with the server copy", async () => {
    globalThis.fetch = async () =>
      jsonResponse(
        { error: "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server." },
        501,
      );
    await expect(fetchTodoEntities()).rejects.toMatchObject({ status: 501 });
  });
});

describe("fetchTodoItems", () => {
  it("requests the encoded items url and returns the list", async () => {
    let requested = "";
    globalThis.fetch = async (input) => {
      requested = String(input);
      return jsonResponse({ items: [{ uid: "1", summary: "Milk", status: "needs_action" }] });
    };
    const items = await fetchTodoItems("todo.den");
    expect(requested).toBe("/api/homeassistant/todo/todo.den/items");
    expect(items).toEqual([{ uid: "1", summary: "Milk", status: "needs_action" }]);
  });

  it("returns an empty list when the body has no items", async () => {
    globalThis.fetch = async () => jsonResponse({});
    expect(await fetchTodoItems("todo.den")).toEqual([]);
  });
});

describe("callTodoService", () => {
  it("posts the entity id and data to the todo service url", async () => {
    const calls: Array<{ url: string; method?: string; body: unknown }> = [];
    globalThis.fetch = async (input, init) => {
      calls.push({
        url: String(input),
        method: init?.method,
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      return jsonResponse({ ok: true });
    };
    await callTodoService("todo.den", "add_item", { item: "Milk" });
    expect(calls[0]).toEqual({
      url: "/api/homeassistant/services/todo/add_item",
      method: "POST",
      body: { entity_id: "todo.den", item: "Milk" },
    });
  });

  it("throws on failure", async () => {
    globalThis.fetch = async () => jsonResponse({ error: "Home Assistant request failed" }, 502);
    await expect(callTodoService("todo.den", "remove_item", { item: "1" })).rejects.toBeInstanceOf(
      HomeAssistantHttpError,
    );
  });
});
