import { beforeEach, describe, expect, it } from "vite-plus/test";
import {
  buildServicePayload,
  entityDomain,
  getDomainSpec,
  isAllowedService,
  isKnownDomain,
  isValidEntityId,
  knownDomains,
  mapEntity,
  registerDomainSpec,
} from "./domains";

describe("entityDomain", () => {
  it("reads the domain slug before the first dot", () => {
    expect(entityDomain("light.kitchen")).toBe("light");
    expect(entityDomain("climate.living_room")).toBe("climate");
    expect(entityDomain("binary_sensor.front_door")).toBe("binary_sensor");
  });

  it("rejects ids without a domain or object", () => {
    expect(entityDomain("nope")).toBeNull();
    expect(entityDomain("climate.")).toBeNull();
    expect(entityDomain(".kitchen")).toBeNull();
    expect(entityDomain("Climate.LivingRoom")).toBeNull();
  });
});

describe("the seeded domain registry", () => {
  it("knows the seeded domains", () => {
    expect(isKnownDomain("climate")).toBe(true);
    expect(isKnownDomain("todo")).toBe(true);
    expect(isKnownDomain("light")).toBe(true);
    expect(isKnownDomain("weird")).toBe(false);
    expect(knownDomains()).toEqual(expect.arrayContaining(["climate", "todo", "light"]));
  });

  it("validates entity ids per domain", () => {
    expect(isValidEntityId("climate", "climate.living_room")).toBe(true);
    expect(isValidEntityId("climate", "light.kitchen")).toBe(false);
    expect(isValidEntityId("climate", "climate.LivingRoom")).toBe(false);
    expect(isValidEntityId("climate", "climate../x")).toBe(false);
    expect(isValidEntityId("todo", "todo.shopping_list")).toBe(true);
    expect(isValidEntityId("todo", "climate.living_room")).toBe(false);
    expect(isValidEntityId("light", "light.kitchen")).toBe(true);
    expect(isValidEntityId("light", "switch.kitchen")).toBe(false);
  });

  it("allowlists services per domain", () => {
    expect(isAllowedService("climate", "set_temperature")).toBe(true);
    expect(isAllowedService("climate", "reload")).toBe(false);
    expect(isAllowedService("todo", "add_item")).toBe(true);
    expect(isAllowedService("todo", "remove_item")).toBe(true);
    expect(isAllowedService("todo", "reload")).toBe(false);
    expect(isAllowedService("light", "turn_on")).toBe(true);
    expect(isAllowedService("light", "reload")).toBe(false);
  });

  it("delegates payload building to the domain and drops unknown keys", () => {
    expect(
      buildServicePayload("climate", "set_temperature", "climate.den", {
        temperature: 21,
        junk: true,
      }),
    ).toEqual({ entity_id: "climate.den", temperature: 21 });
    expect(buildServicePayload("climate", "reload", "climate.den", {})).toBeNull();
    expect(
      buildServicePayload("climate", "set_temperature", "light.x", { temperature: 21 }),
    ).toBeNull();
    expect(
      buildServicePayload("todo", "add_item", "todo.shopping", { item: "Milk", junk: 1 }),
    ).toEqual({ entity_id: "todo.shopping", item: "Milk" });
    expect(buildServicePayload("todo", "get_items", "todo.shopping", {})).toEqual({
      entity_id: "todo.shopping",
    });
  });

  it("maps climate through its mapper and everything else generically", () => {
    expect(
      mapEntity("climate", {
        entity_id: "climate.den",
        state: "heat",
        attributes: { temperature_unit: "C" },
      }),
    ).toMatchObject({ entityId: "climate.den", hvacMode: "heat", unit: "°C" });

    expect(mapEntity("todo", { entity_id: "todo.shopping", state: "1", attributes: {} })).toEqual({
      entityId: "todo.shopping",
      name: "todo.shopping",
      state: "1",
      unit: null,
      deviceClass: null,
      supportedFeatures: null,
      attributes: {},
    });
  });

  it("exposes the spec for a known domain", () => {
    expect(getDomainSpec("climate")?.entityId.test("climate.den")).toBe(true);
    expect(getDomainSpec("nope")).toBeNull();
  });
});

describe("registerDomainSpec", () => {
  registerDomainSpec({
    domain: "test_widget",
    entityId: /^test_widget\.[a-z0-9_]+$/,
    services: { set_value: ["value"], clear: [] },
  });

  it("adds a generic domain with a scalar allowlist", () => {
    expect(isKnownDomain("test_widget")).toBe(true);
    expect(isAllowedService("test_widget", "set_value")).toBe(true);
    expect(
      buildServicePayload("test_widget", "set_value", "test_widget.a", {
        value: 5,
        junk: "x",
      }),
    ).toEqual({ entity_id: "test_widget.a", value: 5 });
    expect(buildServicePayload("test_widget", "set_value", "test_widget.a", { value: "" })).toEqual(
      { entity_id: "test_widget.a" },
    );
    expect(buildServicePayload("test_widget", "nope", "test_widget.a", {})).toBeNull();
    expect(buildServicePayload("test_widget", "clear", "other.a", {})).toBeNull();
  });
});

describe("registry state is per-file", () => {
  beforeEach(() => {
    // Registering a synthetic domain must not disturb the seeded ones.
    expect(isKnownDomain("climate")).toBe(true);
  });

  it("keeps the seeded domains available", () => {
    expect(isKnownDomain("climate")).toBe(true);
    expect(isKnownDomain("todo")).toBe(true);
  });
});

describe("the phase 1 widget domains", () => {
  it("knows the sensor, scene, presence, weather, and calendar families", () => {
    for (const domain of [
      "sensor",
      "binary_sensor",
      "number",
      "input_number",
      "scene",
      "script",
      "button",
      "input_button",
      "person",
      "device_tracker",
      "zone",
      "weather",
      "calendar",
    ]) {
      expect(isKnownDomain(domain), domain).toBe(true);
    }
  });

  it("allowlists the fire-and-forget and return-response services", () => {
    expect(isAllowedService("scene", "turn_on")).toBe(true);
    expect(isAllowedService("scene", "reload")).toBe(false);
    expect(isAllowedService("button", "press")).toBe(true);
    expect(isAllowedService("script", "toggle")).toBe(true);
    expect(isAllowedService("weather", "get_forecasts")).toBe(true);
    expect(isAllowedService("calendar", "get_events")).toBe(true);
    expect(isAllowedService("sensor", "set_value")).toBe(false);
  });

  it("validates entity ids and maps the new families", () => {
    expect(isValidEntityId("sensor", "sensor.outdoor_temperature")).toBe(true);
    expect(isValidEntityId("sensor", "binary_sensor.front_door")).toBe(false);
    expect(isValidEntityId("person", "person.dan")).toBe(true);

    expect(
      mapEntity("sensor", {
        entity_id: "sensor.outdoor_temperature",
        state: "21.5",
        attributes: { unit_of_measurement: "°C" },
      }),
    ).toMatchObject({ entityId: "sensor.outdoor_temperature", numericValue: 21.5, unit: "°C" });

    expect(
      mapEntity("person", { entity_id: "person.dan", state: "home", attributes: {} }),
    ).toMatchObject({ entityId: "person.dan", isHome: true });
  });

  it("builds weather and calendar service payloads", () => {
    expect(
      buildServicePayload("weather", "get_forecasts", "weather.home", { type: "daily" }),
    ).toEqual({ entity_id: "weather.home", type: "daily" });
    expect(
      buildServicePayload("calendar", "get_events", "calendar.home", {
        start_date_time: "2026-10-19T00:00:00Z",
        end_date_time: "2026-10-26T00:00:00Z",
        junk: true,
      }),
    ).toEqual({
      entity_id: "calendar.home",
      start_date_time: "2026-10-19T00:00:00Z",
      end_date_time: "2026-10-26T00:00:00Z",
    });
  });
});

describe("the phase 2 device and cover domains", () => {
  it("knows the on/off device family and covers", () => {
    for (const domain of ["light", "switch", "input_boolean", "fan", "cover"]) {
      expect(isKnownDomain(domain), domain).toBe(true);
    }
  });

  it("allowlists device and cover services", () => {
    expect(isAllowedService("light", "turn_on")).toBe(true);
    expect(isAllowedService("light", "turn_off")).toBe(true);
    expect(isAllowedService("switch", "toggle")).toBe(true);
    expect(isAllowedService("fan", "turn_on")).toBe(true);
    expect(isAllowedService("cover", "open_cover")).toBe(true);
    expect(isAllowedService("cover", "close_cover")).toBe(true);
    expect(isAllowedService("cover", "stop_cover")).toBe(true);
    expect(isAllowedService("cover", "set_cover_position")).toBe(true);
    expect(isAllowedService("cover", "set_position")).toBe(false);
    expect(isAllowedService("light", "reload")).toBe(false);
  });

  it("validates device and cover entity ids", () => {
    expect(isValidEntityId("light", "light.kitchen")).toBe(true);
    expect(isValidEntityId("light", "switch.kitchen")).toBe(false);
    expect(isValidEntityId("input_boolean", "input_boolean.guest_mode")).toBe(true);
    expect(isValidEntityId("cover", "cover.garage_door")).toBe(true);
    expect(isValidEntityId("cover", "light.kitchen")).toBe(false);
  });

  it("builds device payloads and drops keys the domain does not accept", () => {
    expect(
      buildServicePayload("light", "turn_on", "light.kitchen", {
        brightness_pct: 40,
        transition: 2,
        junk: true,
      }),
    ).toEqual({ entity_id: "light.kitchen", brightness_pct: 40, transition: 2 });
    expect(buildServicePayload("light", "turn_off", "light.kitchen", {})).toEqual({
      entity_id: "light.kitchen",
    });
    expect(
      buildServicePayload("switch", "turn_on", "switch.kettle", { brightness_pct: 40 }),
    ).toEqual({ entity_id: "switch.kettle" });
    expect(buildServicePayload("fan", "toggle", "fan.bedroom", {})).toEqual({
      entity_id: "fan.bedroom",
    });
  });

  it("builds cover payloads, including a clamped pass-through position", () => {
    expect(buildServicePayload("cover", "open_cover", "cover.garage", {})).toEqual({
      entity_id: "cover.garage",
    });
    expect(
      buildServicePayload("cover", "set_cover_position", "cover.blind", {
        position: 30,
        junk: true,
      }),
    ).toEqual({ entity_id: "cover.blind", position: 30 });
    expect(buildServicePayload("cover", "set_cover_position", "cover.blind", {})).toEqual({
      entity_id: "cover.blind",
    });
  });

  it("maps devices and covers through their mappers", () => {
    expect(
      mapEntity("light", {
        entity_id: "light.kitchen",
        state: "on",
        attributes: { friendly_name: "Kitchen", brightness: 128, supported_features: 41 },
      }),
    ).toMatchObject({
      entityId: "light.kitchen",
      domain: "light",
      isOn: true,
      brightnessPct: 50,
      control: "brightness",
    });

    expect(
      mapEntity("cover", {
        entity_id: "cover.garage",
        state: "open",
        attributes: {
          friendly_name: "Garage",
          device_class: "garage",
          current_position: 62,
          supported_features: 15,
        },
      }),
    ).toMatchObject({
      entityId: "cover.garage",
      state: "open",
      position: 62,
      isGarage: true,
      available: true,
    });
  });
});
