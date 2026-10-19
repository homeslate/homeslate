import { describe, expect, it } from "vite-plus/test";
import {
  ALARM_FEATURE_ARM_AWAY,
  ALARM_FEATURE_ARM_HOME,
  ALARM_FEATURE_ARM_NIGHT,
  ALARM_FEATURE_ARM_VACATION,
  alarmArmOptions,
  alarmIsArmed,
  alarmNeedsDisarmConfirm,
  alarmStateLabel,
  alarmTone,
  type HomeAssistantAlarm,
} from "./homeAssistantAlarm";

const alarm = (overrides: Partial<HomeAssistantAlarm>): HomeAssistantAlarm => ({
  kind: "alarm",
  entityId: "alarm_control_panel.x",
  name: "X",
  state: "disarmed",
  supportedFeatures: 0,
  available: true,
  ...overrides,
});

describe("alarmArmOptions", () => {
  it("returns only supported arm modes in display order", () => {
    const options = alarmArmOptions(
      ALARM_FEATURE_ARM_HOME | ALARM_FEATURE_ARM_NIGHT | ALARM_FEATURE_ARM_VACATION,
    );
    expect(options.map((option) => option.mode)).toEqual(["home", "night", "vacation"]);
    expect(options[0]).toEqual({ mode: "home", service: "alarm_arm_home", label: "Home" });
  });

  it("returns no options when the panel advertises nothing", () => {
    expect(alarmArmOptions(0)).toEqual([]);
  });

  it("includes away when supported", () => {
    expect(alarmArmOptions(ALARM_FEATURE_ARM_AWAY)).toEqual([
      { mode: "away", service: "alarm_arm_away", label: "Away" },
    ]);
  });
});

describe("alarmStateLabel", () => {
  it("reads armed and disarmed states", () => {
    expect(alarmStateLabel(alarm({ state: "disarmed" }))).toBe("Disarmed");
    expect(alarmStateLabel(alarm({ state: "armed_home" }))).toBe("Armed home");
    expect(alarmStateLabel(alarm({ state: "armed_away" }))).toBe("Armed away");
    expect(alarmStateLabel(alarm({ state: "triggered" }))).toBe("Triggered");
  });

  it("falls back and handles unavailable", () => {
    expect(alarmStateLabel(alarm({ state: "weird" }))).toBe("weird");
    expect(alarmStateLabel(alarm({ available: false }))).toBe("Unavailable");
  });
});

describe("alarmIsArmed", () => {
  it("detects armed states", () => {
    expect(alarmIsArmed(alarm({ state: "armed_night" }))).toBe(true);
    expect(alarmIsArmed(alarm({ state: "disarmed" }))).toBe(false);
  });
});

describe("alarmTone", () => {
  it("uses success for armed and danger for disarmed/triggered", () => {
    expect(alarmTone(alarm({ state: "armed_away" }))).toBe("success");
    expect(alarmTone(alarm({ state: "armed_vacation" }))).toBe("success");
    expect(alarmTone(alarm({ state: "arming" }))).toBe("warning");
    expect(alarmTone(alarm({ state: "disarmed" }))).toBe("danger");
    expect(alarmTone(alarm({ state: "triggered" }))).toBe("danger");
    expect(alarmTone(alarm({ available: false }))).toBe("neutral");
  });
});

describe("alarmNeedsDisarmConfirm", () => {
  it("only confirms when the panel is not already disarmed", () => {
    expect(alarmNeedsDisarmConfirm(alarm({ state: "armed_away" }))).toBe(true);
    expect(alarmNeedsDisarmConfirm(alarm({ state: "disarmed" }))).toBe(false);
    expect(alarmNeedsDisarmConfirm(alarm({ available: false }))).toBe(false);
  });
});
