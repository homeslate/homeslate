import { alarmStateLabel, alarmTone } from "./homeAssistantAlarm";
import type { HomeAssistantAlarm } from "./homeAssistantAlarm";
import type { HomeAssistantCover } from "./homeAssistantCover";
import type { HomeAssistantDevice } from "./homeAssistantDevice";
import type { HomeAssistantPresence } from "./homeAssistantPresence";
import type { HomeAssistantSensor } from "./homeAssistantSensor";

/** Every normalized entity a Home Status roll-up can read. */
export type HomeStatusEntity =
  | HomeAssistantDevice
  | HomeAssistantCover
  | HomeAssistantSensor
  | HomeAssistantAlarm
  | HomeAssistantPresence;

export type HomeStatusTone = "success" | "danger" | "warning" | "neutral";

export interface HomeStatusRow {
  id: string;
  label: string;
  value: string;
  tone: HomeStatusTone;
}

export const HOME_STATUS_EMPTY_COPY = "Pick a few entities to summarize in settings.";
export const HOME_STATUS_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

const OPENING_CLASSES = new Set(["door", "window", "garage_door", "opening"]);
const TEMPERATURE_UNITS = new Set(["°C", "°F", "C", "F"]);

function domainOf(entityId: string): string {
  return entityId.slice(0, entityId.indexOf("."));
}

function withoutDomain<T>(entities: HomeStatusEntity[], domain: string): T[] {
  return entities.filter((entity) => domainOf(entity.entityId) === domain) as T[];
}

function isOpenCover(cover: HomeAssistantCover): boolean {
  return cover.state === "open" || cover.state === "opening";
}

/** Build the ordered roll-up rows the Home Status widget renders. */
export function summarizeHomeStatus(entities: HomeStatusEntity[]): HomeStatusRow[] {
  const rows: HomeStatusRow[] = [];

  const lights = withoutDomain<HomeAssistantDevice>(entities, "light");
  if (lights.length > 0) {
    const on = lights.filter((light) => light.isOn).length;
    rows.push({
      id: "lights",
      label: "Lights",
      value: on === 0 ? "All off" : `${on} on`,
      tone: "neutral",
    });
  }

  const covers = withoutDomain<HomeAssistantCover>(entities, "cover");
  if (covers.length > 0) {
    const open = covers.filter(isOpenCover).length;
    rows.push({
      id: "covers",
      label: "Covers",
      value: open === 0 ? "All closed" : `${open} open`,
      tone: open === 0 ? "neutral" : "warning",
    });
  }

  const binarySensors = withoutDomain<HomeAssistantSensor>(entities, "binary_sensor");
  const openingSensors = binarySensors.filter((sensor) =>
    OPENING_CLASSES.has(sensor.deviceClass ?? ""),
  );
  if (openingSensors.length > 0) {
    const open = openingSensors.filter((sensor) => sensor.isOn).length;
    rows.push({
      id: "openings",
      label: "Doors & windows",
      value: open === 0 ? "All closed" : `${open} open`,
      tone: open === 0 ? "neutral" : "warning",
    });
  }

  for (const alarm of withoutDomain<HomeAssistantAlarm>(entities, "alarm_control_panel")) {
    rows.push({
      id: `alarm-${alarm.entityId}`,
      label: alarm.name,
      value: alarmStateLabel(alarm),
      tone: alarmTone(alarm),
    });
  }

  const people = entities.filter((entity) => {
    const domain = domainOf(entity.entityId);
    return domain === "person" || domain === "device_tracker";
  }) as HomeAssistantPresence[];
  if (people.length > 0) {
    const home = people.filter((person) => person.isHome).length;
    rows.push({
      id: "presence",
      label: "People",
      value: home === 0 ? "Nobody home" : `${home} home`,
      tone: home === 0 ? "warning" : "success",
    });
  }

  for (const sensor of withoutDomain<HomeAssistantSensor>(entities, "sensor")) {
    if (sensor.numericValue === null || !TEMPERATURE_UNITS.has(sensor.unit ?? "")) continue;
    const unit = sensor.unit === "C" ? "°C" : sensor.unit === "F" ? "°F" : (sensor.unit ?? "");
    rows.push({
      id: `temperature-${sensor.entityId}`,
      label: sensor.name,
      value: `${Math.round(sensor.numericValue * 10) / 10}${unit}`,
      tone: "neutral",
    });
  }

  return rows;
}
