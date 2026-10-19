import { describe, expect, it } from "vite-plus/test";
import { describeEntityTile } from "./homeAssistantTile";

const device = (overrides: Record<string, unknown>) => ({
  entityId: "light.kitchen",
  name: "Kitchen",
  domain: "light",
  isOn: true,
  brightnessPct: 50,
  percentage: null,
  supportedFeatures: 0,
  control: "brightness",
  available: true,
  ...overrides,
});

describe("describeEntityTile", () => {
  it("maps a light to a brightness control", () => {
    expect(describeEntityTile("light.kitchen", device({}))).toMatchObject({
      domain: "light",
      name: "Kitchen",
      control: "brightness",
      stateLabel: "On",
      isOn: true,
      brightnessPct: 50,
    });
  });

  it("maps switches and fans to toggles", () => {
    expect(
      describeEntityTile(
        "switch.kettle",
        device({ entityId: "switch.kettle", name: "Kettle", domain: "switch", isOn: false }),
      ),
    ).toMatchObject({ control: "toggle", stateLabel: "Off", isOn: false });

    expect(
      describeEntityTile(
        "fan.bedroom",
        device({
          entityId: "fan.bedroom",
          name: "Bedroom Fan",
          domain: "fan",
          isOn: true,
          percentage: 66,
          control: "toggle",
        }),
      ),
    ).toMatchObject({ control: "toggle", stateLabel: "On · 66%" });
  });

  it("maps a cover to position controls", () => {
    expect(
      describeEntityTile("cover.garage", {
        entityId: "cover.garage",
        name: "Garage",
        state: "open",
        position: 62,
        deviceClass: "garage",
        supportedFeatures: 15,
        isGarage: true,
        available: true,
      }),
    ).toMatchObject({ control: "position", stateLabel: "Open", position: 62, isOn: true });
  });

  it("maps media players, locks, and alarms", () => {
    expect(
      describeEntityTile("media_player.kitchen", {
        entityId: "media_player.kitchen",
        name: "Speaker",
        state: "playing",
        supportedFeatures: 0,
        available: true,
      }),
    ).toMatchObject({ control: "play-pause", stateLabel: "Playing", isOn: true });

    expect(
      describeEntityTile("lock.front", {
        kind: "lock",
        entityId: "lock.front",
        name: "Front",
        state: "locked",
        isLocked: true,
        supportsOpen: false,
        available: true,
      }),
    ).toMatchObject({ control: "lock", stateLabel: "Locked", isLocked: true });

    expect(
      describeEntityTile("alarm_control_panel.home", {
        kind: "alarm",
        entityId: "alarm_control_panel.home",
        name: "Alarm",
        state: "armed_away",
        supportedFeatures: 39,
        available: true,
      }),
    ).toMatchObject({ control: "none", stateLabel: "Armed away" });
  });

  it("renders read-only sensors, binary sensors, and climate", () => {
    expect(
      describeEntityTile("sensor.outdoor", {
        entityId: "sensor.outdoor",
        name: "Outdoor",
        state: "21.5",
        unit: "°C",
        deviceClass: "temperature",
        icon: null,
        numericValue: 21.5,
        isOn: false,
      }),
    ).toMatchObject({ control: "none", stateLabel: "21.5°C" });

    expect(
      describeEntityTile("binary_sensor.door", {
        entityId: "binary_sensor.door",
        name: "Door",
        state: "on",
        unit: null,
        deviceClass: "door",
        icon: null,
        numericValue: null,
        isOn: true,
      }),
    ).toMatchObject({ control: "none", stateLabel: "Open" });

    expect(
      describeEntityTile("climate.living", {
        entityId: "climate.living",
        name: "Living",
        hvacMode: "heat",
        action: null,
        currentTemperature: null,
        currentHumidity: null,
        targetTemperature: null,
        targetTemperatureLow: null,
        targetTemperatureHigh: null,
        unit: "°C",
        hvacModes: [],
        fanModes: [],
        fanMode: null,
        presetModes: [],
        presetMode: null,
        swingModes: [],
        swingMode: null,
        minTemp: 7,
        maxTemp: 35,
        step: 0.5,
      }),
    ).toMatchObject({ control: "none", stateLabel: "Heat" });
  });

  it("falls back to a read-only generic state for long-tail domains", () => {
    expect(
      describeEntityTile("scene.movie", {
        entityId: "scene.movie",
        name: "Movie Night",
        state: "unknown",
      }),
    ).toMatchObject({ control: "none", stateLabel: "unknown", name: "Movie Night" });
  });
});
