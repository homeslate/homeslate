import type { SecurityTone } from "./homeAssistantLock";

/** Normalized Home Assistant `alarm_control_panel` state. */
export interface HomeAssistantAlarm {
  kind: "alarm";
  entityId: string;
  name: string;
  /** `disarmed | armed_home | armed_away | armed_night | armed_vacation | …`. */
  state: string;
  supportedFeatures: number;
  available: boolean;
}

/** Home Assistant alarm feature bits. */
export const ALARM_FEATURE_ARM_HOME = 1;
export const ALARM_FEATURE_ARM_AWAY = 2;
export const ALARM_FEATURE_ARM_NIGHT = 4;
export const ALARM_FEATURE_TRIGGER = 8;
export const ALARM_FEATURE_ARM_CUSTOM_BYPASS = 16;
export const ALARM_FEATURE_ARM_VACATION = 32;

export type AlarmArmMode = "home" | "away" | "night" | "vacation";

export interface AlarmArmOption {
  mode: AlarmArmMode;
  service: string;
  label: string;
}

const ARM_OPTIONS: Array<AlarmArmOption & { feature: number }> = [
  { mode: "home", service: "alarm_arm_home", label: "Home", feature: ALARM_FEATURE_ARM_HOME },
  { mode: "away", service: "alarm_arm_away", label: "Away", feature: ALARM_FEATURE_ARM_AWAY },
  { mode: "night", service: "alarm_arm_night", label: "Night", feature: ALARM_FEATURE_ARM_NIGHT },
  {
    mode: "vacation",
    service: "alarm_arm_vacation",
    label: "Vacation",
    feature: ALARM_FEATURE_ARM_VACATION,
  },
];

/** Only the arm modes this panel advertises, in a stable display order. */
export function alarmArmOptions(supportedFeatures: number): AlarmArmOption[] {
  return ARM_OPTIONS.filter(({ feature }) => (supportedFeatures & feature) !== 0).map(
    ({ mode, service, label }) => ({ mode, service, label }),
  );
}

export function alarmStateLabel(alarm: HomeAssistantAlarm): string {
  if (!alarm.available) return "Unavailable";
  switch (alarm.state) {
    case "disarmed":
      return "Disarmed";
    case "armed_home":
      return "Armed home";
    case "armed_away":
      return "Armed away";
    case "armed_night":
      return "Armed night";
    case "armed_vacation":
      return "Armed vacation";
    case "armed_custom_bypass":
      return "Armed custom";
    case "arming":
      return "Arming";
    case "pending":
      return "Pending";
    case "disarming":
      return "Disarming";
    case "triggered":
      return "Triggered";
    default:
      return alarm.state;
  }
}

export function alarmIsArmed(alarm: HomeAssistantAlarm): boolean {
  return alarm.state.startsWith("armed_");
}

export function alarmTone(alarm: HomeAssistantAlarm): SecurityTone {
  if (!alarm.available) return "neutral";
  if (alarm.state.startsWith("armed_")) return "success";
  if (alarm.state === "arming" || alarm.state === "pending" || alarm.state === "disarming") {
    return "warning";
  }
  return "danger";
}

/** Disarming always needs a confirmation step. */
export function alarmNeedsDisarmConfirm(alarm: HomeAssistantAlarm): boolean {
  return alarm.available && alarm.state !== "disarmed";
}
