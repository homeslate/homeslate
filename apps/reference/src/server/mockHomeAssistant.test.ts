import { describe, expect, it } from "vite-plus/test";
import { knownDomains } from "@homeslate/widgets/server";
import { createMockHomeAssistant, type MockEntity } from "./mockHomeAssistant";

const authorization = { authorization: "Bearer test-token" };
const jsonHeaders = { ...authorization, "content-type": "application/json" };

function post(mock: ReturnType<typeof createMockHomeAssistant>, path: string, body: unknown) {
  return mock.app.request(`/api/services/${path}`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
}

async function state(
  mock: ReturnType<typeof createMockHomeAssistant>,
  entityId: string,
): Promise<MockEntity> {
  const response = await mock.app.request(`/api/states/${entityId}`, { headers: authorization });
  return (await response.json()) as MockEntity;
}

describe("mock Home Assistant", () => {
  it("requires the configured bearer token", async () => {
    const mock = createMockHomeAssistant({ token: "test-token" });
    expect((await mock.app.request("/api/states")).status).toBe(401);
    expect((await mock.app.request("/api/states", { headers: authorization })).status).toBe(200);
  });

  it("covers every domain the widget registry knows", async () => {
    const mock = createMockHomeAssistant({ token: "test-token" });
    const response = await mock.app.request("/api/states", { headers: authorization });
    const states = (await response.json()) as MockEntity[];
    const domains = new Set(states.map((entry) => entry.entity_id.split(".")[0]));

    for (const domain of knownDomains()) {
      expect(domains.has(domain), `missing a ${domain} fixture`).toBe(true);
    }
  });

  it("mutates lights, switches, fans, and booleans", async () => {
    const mock = createMockHomeAssistant({ token: "test-token" });

    await post(mock, "light/turn_on", { entity_id: "light.kitchen", brightness_pct: 30 });
    expect(await state(mock, "light.kitchen")).toMatchObject({
      state: "on",
      attributes: { brightness: 77 },
    });

    await post(mock, "switch/turn_on", { entity_id: "switch.kettle" });
    expect((await state(mock, "switch.kettle")).state).toBe("on");

    await post(mock, "input_boolean/toggle", { entity_id: "input_boolean.guest_mode" });
    expect((await state(mock, "input_boolean.guest_mode")).state).toBe("on");

    await post(mock, "fan/set_percentage", { entity_id: "fan.bedroom", percentage: 40 });
    expect(await state(mock, "fan.bedroom")).toMatchObject({
      state: "on",
      attributes: { percentage: 40 },
    });
    await post(mock, "fan/oscillate", { entity_id: "fan.bedroom", oscillating: false });
    await post(mock, "fan/set_preset_mode", { entity_id: "fan.bedroom", preset_mode: "normal" });
    expect((await state(mock, "fan.bedroom")).attributes).toMatchObject({
      oscillating: false,
      preset_mode: "normal",
    });
  });

  it("mutates covers, locks, alarms, and media players", async () => {
    const mock = createMockHomeAssistant({ token: "test-token" });

    await post(mock, "cover/set_cover_position", {
      entity_id: "cover.garage_door",
      position: 25,
    });
    expect(await state(mock, "cover.garage_door")).toMatchObject({
      state: "open",
      attributes: { current_position: 25 },
    });

    await post(mock, "lock/unlock", { entity_id: "lock.front_door" });
    expect((await state(mock, "lock.front_door")).state).toBe("unlocked");

    await post(mock, "alarm_control_panel/alarm_arm_home", {
      entity_id: "alarm_control_panel.home",
    });
    expect((await state(mock, "alarm_control_panel.home")).state).toBe("armed_home");

    await post(mock, "media_player/volume_set", {
      entity_id: "media_player.kitchen",
      volume_level: 0.8,
    });
    await post(mock, "media_player/media_play_pause", { entity_id: "media_player.kitchen" });
    expect(await state(mock, "media_player.kitchen")).toMatchObject({
      state: "paused",
      attributes: { volume_level: 0.8 },
    });
  });

  it("mutates vacuum, humidifier, water heater, update, and mower", async () => {
    const mock = createMockHomeAssistant({ token: "test-token" });

    await post(mock, "vacuum/start", { entity_id: "vacuum.downstairs" });
    await post(mock, "vacuum/set_fan_speed", {
      entity_id: "vacuum.downstairs",
      fan_speed: "quiet",
    });
    expect(await state(mock, "vacuum.downstairs")).toMatchObject({
      state: "cleaning",
      attributes: { fan_speed: "quiet" },
    });

    await post(mock, "humidifier/set_humidity", { entity_id: "humidifier.bedroom", humidity: 55 });
    expect((await state(mock, "humidifier.bedroom")).attributes.humidity).toBe(55);

    await post(mock, "water_heater/set_temperature", {
      entity_id: "water_heater.basement",
      temperature: 55,
    });
    expect((await state(mock, "water_heater.basement")).attributes.temperature).toBe(55);

    await post(mock, "update/install", { entity_id: "update.hacs" });
    expect(await state(mock, "update.hacs")).toMatchObject({
      state: "off",
      attributes: { installed_version: "1.1.0", in_progress: false },
    });

    await post(mock, "lawn_mower/start_pause", { entity_id: "lawn_mower.back_yard" });
    expect((await state(mock, "lawn_mower.back_yard")).state).toBe("mowing");
  });

  it("answers return_response reads for weather, calendar, and todo", async () => {
    const mock = createMockHomeAssistant({ token: "test-token" });

    const weather = await mock.app.request("/api/services/weather/get_forecasts?return_response", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ entity_id: "weather.home" }),
    });
    expect(await weather.json()).toMatchObject({
      "weather.home": { forecast: expect.any(Array) },
    });

    const calendar = await mock.app.request("/api/services/calendar/get_events?return_response", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ entity_id: "calendar.family" }),
    });
    expect(await calendar.json()).toMatchObject({
      "calendar.family": { events: expect.any(Array) },
    });

    const todo = await mock.app.request("/api/services/todo/get_items?return_response", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ entity_id: "todo.shopping_list" }),
    });
    const todoBody = (await todo.json()) as { "todo.shopping_list": { items: unknown[] } };
    expect(todoBody["todo.shopping_list"].items.length).toBeGreaterThan(0);
  });

  it("supports todo writes", async () => {
    const mock = createMockHomeAssistant({ token: "test-token" });

    await post(mock, "todo/add_item", { entity_id: "todo.shopping_list", item: "Coffee" });
    const first = await mock.app.request("/api/services/todo/get_items?return_response", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ entity_id: "todo.shopping_list" }),
    });
    const firstBody = (await first.json()) as {
      "todo.shopping_list": { items: Array<{ uid: string; summary: string }> };
    };
    const coffee = firstBody["todo.shopping_list"].items.find((item) => item.summary === "Coffee");
    expect(coffee).toBeDefined();

    await post(mock, "todo/update_item", {
      entity_id: "todo.shopping_list",
      item: coffee?.uid,
      status: "completed",
    });
    const second = await mock.app.request("/api/services/todo/get_items?return_response", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ entity_id: "todo.shopping_list" }),
    });
    const secondBody = (await second.json()) as {
      "todo.shopping_list": { items: Array<{ summary: string; status: string }> };
    };
    expect(
      secondBody["todo.shopping_list"].items.find((item) => item.summary === "Coffee")?.status,
    ).toBe("completed");
  });

  it("serves media-player and camera proxy images", async () => {
    const mock = createMockHomeAssistant({ token: "test-token" });
    for (const path of [
      "/api/media_player_proxy/media_player.kitchen?token=mock",
      "/api/camera_proxy/camera.front_door?token=mock",
    ]) {
      const response = await mock.app.request(path, { headers: authorization });
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("image/svg+xml");
    }
  });

  it("records notify and TTS service calls", async () => {
    const mock = createMockHomeAssistant({ token: "test-token" });

    await post(mock, "notify/send_message", {
      entity_id: "notify.kitchen",
      message: "Dinner is ready",
      title: "Kitchen",
    });
    expect((await state(mock, "notify.kitchen")).attributes).toMatchObject({
      last_message: "Dinner is ready",
      last_title: "Kitchen",
    });

    await post(mock, "tts/speak", {
      entity_id: "tts.home",
      message: "Welcome home",
      media_player_entity_id: "media_player.kitchen",
    });
    expect((await state(mock, "tts.home")).attributes).toMatchObject({
      last_message: "Welcome home",
      media_player_entity_id: "media_player.kitchen",
    });
  });

  it("rejects unknown services and can reset fixtures", async () => {
    const mock = createMockHomeAssistant({ token: "test-token" });
    expect((await post(mock, "light/reload", { entity_id: "light.kitchen" })).status).toBe(400);

    await post(mock, "light/turn_off", { entity_id: "light.kitchen" });
    expect((await state(mock, "light.kitchen")).state).toBe("off");
    mock.reset();
    expect((await state(mock, "light.kitchen")).state).toBe("on");
  });
});
