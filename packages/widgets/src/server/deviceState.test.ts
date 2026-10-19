import { describe, expect, it } from "vite-plus/test";
import { mapDeviceEntity } from "./deviceState";

describe("mapDeviceEntity", () => {
  it("maps a light with brightness to a 0–100 control", () => {
    expect(
      mapDeviceEntity({
        entity_id: "light.kitchen",
        state: "on",
        attributes: {
          friendly_name: "Kitchen",
          brightness: 128,
          supported_features: 41,
        },
      }),
    ).toEqual({
      entityId: "light.kitchen",
      name: "Kitchen",
      domain: "light",
      isOn: true,
      brightnessPct: 50,
      percentage: null,
      supportedFeatures: 41,
      control: "brightness",
      available: true,
    });
  });

  it("clamps and rounds brightness at the ends of the scale", () => {
    expect(
      mapDeviceEntity({
        entity_id: "light.hall",
        state: "on",
        attributes: { brightness: 255 },
      }),
    ).toMatchObject({ brightnessPct: 100 });
    expect(
      mapDeviceEntity({
        entity_id: "light.hall",
        state: "on",
        attributes: { brightness: 0 },
      }),
    ).toMatchObject({ brightnessPct: 0 });
    expect(
      mapDeviceEntity({
        entity_id: "light.hall",
        state: "on",
        attributes: { brightness: 999 },
      }),
    ).toMatchObject({ brightnessPct: 100 });
  });

  it("maps a fan's speed percentage", () => {
    expect(
      mapDeviceEntity({
        entity_id: "fan.bedroom",
        state: "on",
        attributes: { friendly_name: "Bedroom Fan", percentage: 66 },
      }),
    ).toMatchObject({
      entityId: "fan.bedroom",
      domain: "fan",
      isOn: true,
      brightnessPct: null,
      percentage: 66,
      control: "toggle",
    });
  });

  it("maps switches and input booleans as plain toggles", () => {
    expect(
      mapDeviceEntity({ entity_id: "switch.kettle", state: "off", attributes: {} }),
    ).toMatchObject({ domain: "switch", isOn: false, control: "toggle", name: "switch.kettle" });
    expect(
      mapDeviceEntity({ entity_id: "input_boolean.guest", state: "on", attributes: {} }),
    ).toMatchObject({ domain: "input_boolean", isOn: true, control: "toggle" });
  });

  it("flags unavailable and unknown devices", () => {
    expect(
      mapDeviceEntity({ entity_id: "light.hall", state: "unavailable", attributes: {} }),
    ).toMatchObject({ available: false, isOn: false });
    expect(
      mapDeviceEntity({ entity_id: "light.hall", state: "unknown", attributes: {} }),
    ).toMatchObject({ available: false });
  });

  it("rejects other domains and malformed input", () => {
    expect(
      mapDeviceEntity({ entity_id: "cover.garage", state: "open", attributes: {} }),
    ).toBeNull();
    expect(mapDeviceEntity({ entity_id: "light.Bad", state: "on", attributes: {} })).toBeNull();
    expect(mapDeviceEntity(null)).toBeNull();
  });
});
