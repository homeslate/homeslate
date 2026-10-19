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

describe("the phase 3 controller domains", () => {
  it("knows the security, media, fan, vacuum, humidifier, and water heater domains", () => {
    for (const domain of [
      "lock",
      "alarm_control_panel",
      "media_player",
      "fan",
      "vacuum",
      "humidifier",
      "water_heater",
    ]) {
      expect(isKnownDomain(domain), domain).toBe(true);
    }
  });

  it("allowlists the controller services", () => {
    expect(isAllowedService("lock", "lock")).toBe(true);
    expect(isAllowedService("lock", "unlock")).toBe(true);
    expect(isAllowedService("lock", "open")).toBe(true);
    expect(isAllowedService("alarm_control_panel", "alarm_arm_home")).toBe(true);
    expect(isAllowedService("alarm_control_panel", "alarm_disarm")).toBe(true);
    expect(isAllowedService("alarm_control_panel", "alarm_trigger")).toBe(false);
    expect(isAllowedService("media_player", "media_play_pause")).toBe(true);
    expect(isAllowedService("media_player", "volume_set")).toBe(true);
    expect(isAllowedService("media_player", "select_source")).toBe(true);
    expect(isAllowedService("fan", "set_percentage")).toBe(true);
    expect(isAllowedService("fan", "set_preset_mode")).toBe(true);
    expect(isAllowedService("fan", "oscillate")).toBe(true);
    expect(isAllowedService("vacuum", "return_to_base")).toBe(true);
    expect(isAllowedService("vacuum", "set_fan_speed")).toBe(true);
    expect(isAllowedService("humidifier", "set_humidity")).toBe(true);
    expect(isAllowedService("water_heater", "set_temperature")).toBe(true);
    expect(isAllowedService("water_heater", "set_operation_mode")).toBe(true);
  });

  it("validates entity ids per domain", () => {
    expect(isValidEntityId("lock", "lock.front_door")).toBe(true);
    expect(isValidEntityId("lock", "lock.Bad")).toBe(false);
    expect(isValidEntityId("alarm_control_panel", "alarm_control_panel.home")).toBe(true);
    expect(isValidEntityId("media_player", "media_player.kitchen")).toBe(true);
    expect(isValidEntityId("vacuum", "vacuum.downstairs")).toBe(true);
    expect(isValidEntityId("humidifier", "humidifier.bedroom")).toBe(true);
    expect(isValidEntityId("water_heater", "water_heater.basement")).toBe(true);
    expect(isValidEntityId("water_heater", "humidifier.bedroom")).toBe(false);
  });

  it("keeps booleans in allowlisted service payloads", () => {
    expect(
      buildServicePayload("media_player", "volume_mute", "media_player.kitchen", {
        is_volume_muted: true,
      }),
    ).toEqual({ entity_id: "media_player.kitchen", is_volume_muted: true });
    expect(buildServicePayload("fan", "oscillate", "fan.bedroom", { oscillating: false })).toEqual({
      entity_id: "fan.bedroom",
      oscillating: false,
    });
    expect(
      buildServicePayload("media_player", "volume_set", "media_player.kitchen", {
        volume_level: 0.4,
        junk: true,
      }),
    ).toEqual({ entity_id: "media_player.kitchen", volume_level: 0.4 });
    expect(
      buildServicePayload("vacuum", "set_fan_speed", "vacuum.downstairs", {
        fan_speed: "turbo",
      }),
    ).toEqual({ entity_id: "vacuum.downstairs", fan_speed: "turbo" });
  });

  it("builds security and climate-auxiliary payloads", () => {
    expect(buildServicePayload("lock", "unlock", "lock.front_door", {})).toEqual({
      entity_id: "lock.front_door",
    });
    expect(
      buildServicePayload("alarm_control_panel", "alarm_arm_home", "alarm_control_panel.home", {}),
    ).toEqual({ entity_id: "alarm_control_panel.home" });
    expect(
      buildServicePayload("humidifier", "set_humidity", "humidifier.bedroom", { humidity: 45 }),
    ).toEqual({ entity_id: "humidifier.bedroom", humidity: 45 });
    expect(
      buildServicePayload("humidifier", "set_mode", "humidifier.bedroom", { mode: "auto" }),
    ).toEqual({ entity_id: "humidifier.bedroom", mode: "auto" });
    expect(
      buildServicePayload("water_heater", "set_temperature", "water_heater.basement", {
        temperature: 52,
      }),
    ).toEqual({ entity_id: "water_heater.basement", temperature: 52 });
    expect(
      buildServicePayload("water_heater", "set_operation_mode", "water_heater.basement", {
        operation_mode: "eco",
      }),
    ).toEqual({ entity_id: "water_heater.basement", operation_mode: "eco" });
    expect(buildServicePayload("vacuum", "start", "vacuum.downstairs", {})).toEqual({
      entity_id: "vacuum.downstairs",
    });
  });

  it("maps the controller families through their mappers", () => {
    expect(
      mapEntity("lock", {
        entity_id: "lock.front_door",
        state: "locked",
        attributes: { supported_features: 1 },
      }),
    ).toMatchObject({ kind: "lock", isLocked: true, supportsOpen: true });

    expect(
      mapEntity("alarm_control_panel", {
        entity_id: "alarm_control_panel.home",
        state: "armed_away",
        attributes: { supported_features: 39 },
      }),
    ).toMatchObject({ kind: "alarm", state: "armed_away", supportedFeatures: 39 });

    expect(
      mapEntity("media_player", {
        entity_id: "media_player.kitchen",
        state: "playing",
        attributes: { media_title: "Song", volume_level: 0.5 },
      }),
    ).toMatchObject({ title: "Song", volumeLevel: 0.5, state: "playing" });

    expect(
      mapEntity("fan", {
        entity_id: "fan.bedroom",
        state: "on",
        attributes: { percentage: 66, preset_modes: ["normal"], oscillating: true },
      }),
    ).toMatchObject({ domain: "fan", percentage: 66, presetModes: ["normal"], oscillating: true });

    expect(
      mapEntity("vacuum", {
        entity_id: "vacuum.downstairs",
        state: "docked",
        attributes: { battery_level: 72 },
      }),
    ).toMatchObject({ state: "docked", batteryLevel: 72 });
  });
});

describe("the phase 4 data and niche domains", () => {
  it("knows the camera, update, and lawn mower domains", () => {
    for (const domain of ["camera", "update", "lawn_mower"]) {
      expect(isKnownDomain(domain), domain).toBe(true);
    }
  });

  it("allowlists the update and lawn mower services", () => {
    expect(isAllowedService("camera", "turn_on")).toBe(false);
    expect(isAllowedService("update", "install")).toBe(true);
    expect(isAllowedService("update", "skip")).toBe(true);
    expect(isAllowedService("update", "reload")).toBe(false);
    expect(isAllowedService("lawn_mower", "start_pause")).toBe(true);
    expect(isAllowedService("lawn_mower", "dock")).toBe(true);
    expect(isAllowedService("lawn_mower", "stop")).toBe(true);
    expect(isAllowedService("lawn_mower", "start")).toBe(false);
  });

  it("validates the new entity ids", () => {
    expect(isValidEntityId("camera", "camera.front_door")).toBe(true);
    expect(isValidEntityId("camera", "camera.Bad")).toBe(false);
    expect(isValidEntityId("update", "update.hacs")).toBe(true);
    expect(isValidEntityId("lawn_mower", "lawn_mower.back_yard")).toBe(true);
    expect(isValidEntityId("lawn_mower", "vacuum.downstairs")).toBe(false);
  });

  it("builds update and lawn mower payloads", () => {
    expect(buildServicePayload("update", "install", "update.hacs", {})).toEqual({
      entity_id: "update.hacs",
    });
    expect(buildServicePayload("update", "skip", "update.hacs", {})).toEqual({
      entity_id: "update.hacs",
    });
    expect(buildServicePayload("lawn_mower", "start_pause", "lawn_mower.back_yard", {})).toEqual({
      entity_id: "lawn_mower.back_yard",
    });
    expect(buildServicePayload("lawn_mower", "dock", "lawn_mower.back_yard", {})).toEqual({
      entity_id: "lawn_mower.back_yard",
    });
    expect(buildServicePayload("lawn_mower", "stop", "lawn_mower.back_yard", {})).toEqual({
      entity_id: "lawn_mower.back_yard",
    });
  });

  it("maps the new domains through their mappers", () => {
    expect(
      mapEntity("camera", {
        entity_id: "camera.front_door",
        state: "idle",
        attributes: { friendly_name: "Front Door" },
      }),
    ).toMatchObject({ entityId: "camera.front_door", name: "Front Door", state: "idle" });

    expect(
      mapEntity("update", {
        entity_id: "update.hacs",
        state: "on",
        attributes: { installed_version: "1.0", latest_version: "1.1" },
      }),
    ).toMatchObject({ state: "on", installedVersion: "1.0", latestVersion: "1.1" });

    expect(
      mapEntity("lawn_mower", {
        entity_id: "lawn_mower.back_yard",
        state: "mowing",
        attributes: {},
      }),
    ).toMatchObject({ state: "mowing", available: true });
  });
});
