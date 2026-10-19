import { describe, expect, it } from "vite-plus/test";
import { mapAlarmEntity } from "./alarmState";

describe("mapAlarmEntity", () => {
  it("maps an armed panel with its feature bits", () => {
    expect(
      mapAlarmEntity({
        entity_id: "alarm_control_panel.home",
        state: "armed_away",
        attributes: { friendly_name: "Home Alarm", supported_features: 39 },
      }),
    ).toEqual({
      kind: "alarm",
      entityId: "alarm_control_panel.home",
      name: "Home Alarm",
      state: "armed_away",
      supportedFeatures: 39,
      available: true,
    });
  });

  it("maps disarmed and unavailable states", () => {
    expect(
      mapAlarmEntity({ entity_id: "alarm_control_panel.home", state: "disarmed", attributes: {} }),
    ).toMatchObject({ state: "disarmed", available: true, supportedFeatures: 0 });
    expect(
      mapAlarmEntity({
        entity_id: "alarm_control_panel.home",
        state: "unavailable",
        attributes: {},
      }),
    ).toMatchObject({ available: false });
  });

  it("rejects other domains and malformed input", () => {
    expect(
      mapAlarmEntity({ entity_id: "lock.front_door", state: "locked", attributes: {} }),
    ).toBeNull();
    expect(
      mapAlarmEntity({ entity_id: "alarm_control_panel.Bad", state: "disarmed", attributes: {} }),
    ).toBeNull();
    expect(mapAlarmEntity(undefined)).toBeNull();
  });
});
