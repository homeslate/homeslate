import { alarmStateLabel } from "./homeAssistantAlarm";
import { cameraStateLabel } from "./homeAssistantCamera";
import { coverStateLabel } from "./homeAssistantCover";
import { deviceStatusLabel, type HomeAssistantDevice } from "./homeAssistantDevice";
import { fanStateLabel, type HomeAssistantFan } from "./homeAssistantFan";
import { humidifierStateLabel, type HomeAssistantHumidifier } from "./homeAssistantHumidifier";
import { lawnMowerStateLabel, type HomeAssistantLawnMower } from "./homeAssistantLawnMower";
import { lockStateLabel, type HomeAssistantLock } from "./homeAssistantLock";
import {
  mediaPlayerIsPlaying,
  mediaPlayerStateLabel,
  type HomeAssistantMediaPlayer,
} from "./homeAssistantMediaPlayer";
import { presenceLabel, type HomeAssistantPresence } from "./homeAssistantPresence";
import {
  binarySensorLabel,
  formatSensorValue,
  type HomeAssistantSensor,
} from "./homeAssistantSensor";
import { updateStateLabel, type HomeAssistantUpdate } from "./homeAssistantUpdate";
import { vacuumStateLabel, type HomeAssistantVacuum } from "./homeAssistantVacuum";
import { waterHeaterStateLabel, type HomeAssistantWaterHeater } from "./homeAssistantWaterHeater";
import { hvacModeLabel } from "./homeAssistant";
import type { HomeAssistantCover } from "./homeAssistantCover";
import type { HomeAssistantAlarm } from "./homeAssistantAlarm";
import type { HomeAssistantCamera } from "./homeAssistantCamera";
import type { ThermostatState } from "./homeAssistant";

/** The primary interaction the Entity Tile renders for a domain. */
export type EntityTileControl =
  | "toggle"
  | "brightness"
  | "position"
  | "play-pause"
  | "lock"
  | "none";

export interface EntityTileDescriptor {
  entityId: string;
  domain: string;
  name: string;
  stateLabel: string;
  control: EntityTileControl;
  available: boolean;
  isOn: boolean | null;
  brightnessPct: number | null;
  position: number | null;
  isLocked: boolean | null;
}

export const ENTITY_TILE_EMPTY_COPY = "Pick any Home Assistant entity in settings.";
export const ENTITY_TILE_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

function domainOf(entityId: string): string {
  return entityId.slice(0, entityId.indexOf("."));
}

function generic(
  entityId: string,
  entity: unknown,
): {
  name: string;
  state: string;
  available: boolean;
} {
  const record = entity && typeof entity === "object" ? (entity as Record<string, unknown>) : {};
  const name = typeof record.name === "string" && record.name ? record.name : entityId;
  const state = typeof record.state === "string" ? record.state : "unknown";
  return { name, state, available: state !== "unavailable" };
}

/**
 * Map any allowlisted entity onto the Entity Tile's primary control. The
 * normalized entity shape comes from the server mapper for its domain.
 */
export function describeEntityTile(entityId: string, entity: unknown): EntityTileDescriptor {
  const domain = domainOf(entityId);
  const fallback = generic(entityId, entity);
  const base = {
    entityId,
    domain,
    name: fallback.name,
    available: fallback.available,
    isOn: null as boolean | null,
    brightnessPct: null as number | null,
    position: null as number | null,
    isLocked: null as boolean | null,
  };

  switch (domain) {
    case "light": {
      const light = entity as HomeAssistantDevice;
      return {
        ...base,
        stateLabel: deviceStatusLabel(light),
        control: "brightness",
        isOn: light.isOn,
        brightnessPct: light.brightnessPct,
      };
    }
    case "switch":
    case "input_boolean": {
      const device = entity as HomeAssistantDevice;
      return {
        ...base,
        stateLabel: deviceStatusLabel(device),
        control: "toggle",
        isOn: device.isOn,
      };
    }
    case "fan": {
      const fan = entity as HomeAssistantFan;
      return {
        ...base,
        stateLabel: fanStateLabel(fan),
        control: "toggle",
        isOn: fan.isOn,
      };
    }
    case "cover": {
      const cover = entity as HomeAssistantCover;
      return {
        ...base,
        stateLabel: coverStateLabel(cover),
        control: "position",
        isOn: cover.state === "open" || cover.state === "opening",
        position: cover.position,
      };
    }
    case "media_player": {
      const mediaPlayer = entity as HomeAssistantMediaPlayer;
      return {
        ...base,
        stateLabel: mediaPlayerStateLabel(mediaPlayer),
        control: "play-pause",
        isOn: mediaPlayerIsPlaying(mediaPlayer),
      };
    }
    case "lock": {
      const lock = entity as HomeAssistantLock;
      return {
        ...base,
        stateLabel: lockStateLabel(lock),
        control: "lock",
        isLocked: lock.isLocked,
        available: lock.available,
      };
    }
    case "alarm_control_panel": {
      const alarm = entity as HomeAssistantAlarm;
      return {
        ...base,
        stateLabel: alarmStateLabel(alarm),
        control: "none",
        available: alarm.available,
      };
    }
    case "sensor":
    case "number":
    case "input_number": {
      const sensor = entity as HomeAssistantSensor;
      return {
        ...base,
        stateLabel: formatSensorValue(sensor),
        control: "none",
        available: sensor.state !== "unavailable" && sensor.state !== "unknown",
      };
    }
    case "binary_sensor": {
      const sensor = entity as HomeAssistantSensor;
      return {
        ...base,
        stateLabel: binarySensorLabel(sensor.deviceClass, sensor.isOn),
        control: "none",
        available: sensor.state !== "unavailable" && sensor.state !== "unknown",
      };
    }
    case "climate": {
      const climate = entity as ThermostatState;
      return {
        ...base,
        stateLabel: hvacModeLabel(climate.hvacMode),
        control: "none",
        available: climate.hvacMode !== "unavailable" && climate.hvacMode !== "unknown",
      };
    }
    case "vacuum": {
      const vacuum = entity as HomeAssistantVacuum;
      return {
        ...base,
        stateLabel: vacuumStateLabel(vacuum),
        control: "none",
        available: vacuum.available,
      };
    }
    case "humidifier": {
      const humidifier = entity as HomeAssistantHumidifier;
      return {
        ...base,
        stateLabel: humidifierStateLabel(humidifier),
        control: "none",
        available: humidifier.available,
      };
    }
    case "water_heater": {
      const waterHeater = entity as HomeAssistantWaterHeater;
      return {
        ...base,
        stateLabel: waterHeaterStateLabel(waterHeater),
        control: "none",
        available: waterHeater.available,
      };
    }
    case "lawn_mower": {
      const mower = entity as HomeAssistantLawnMower;
      return {
        ...base,
        stateLabel: lawnMowerStateLabel(mower),
        control: "none",
        available: mower.available,
      };
    }
    case "camera": {
      const camera = entity as HomeAssistantCamera;
      return {
        ...base,
        stateLabel: cameraStateLabel(camera),
        control: "none",
        available: camera.available,
      };
    }
    case "update": {
      const update = entity as HomeAssistantUpdate;
      return {
        ...base,
        stateLabel: updateStateLabel(update),
        control: "none",
        available: update.available,
      };
    }
    case "person":
    case "device_tracker": {
      const presence = entity as HomeAssistantPresence;
      return {
        ...base,
        stateLabel: presenceLabel(presence),
        control: "none",
      };
    }
    default:
      return {
        ...base,
        stateLabel: fallback.state.replace(/_/g, " "),
        control: "none",
      };
  }
}
