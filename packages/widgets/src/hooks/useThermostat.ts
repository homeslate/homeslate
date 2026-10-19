import { useCallback } from "react";
import type { ThermostatState } from "../widgets/homeAssistant";
import { useEntities, useEntity, type UseEntitiesResult } from "./useHomeAssistant";

const THERMOSTAT_POLL_INTERVAL_MS = 30 * 1000;

export type UseThermostatResult = {
  state: ThermostatState | null;
  isLoading: boolean;
  /** Fetch error (drives `WidgetDataStatus`). */
  error: string | null;
  /** Control (service call) error. */
  controlError: string | null;
  /** HTTP status of the last fetch; `501` means Home Assistant is unconfigured. */
  status: number | null;
  lastUpdated: number | null;
  pending: boolean;
  refresh: () => void;
  setTarget: (temperature: number) => Promise<void>;
  setRange: (low: number, high: number) => Promise<void>;
  setHvacMode: (mode: string) => Promise<void>;
  setFanMode: (mode: string) => Promise<void>;
  setPresetMode: (mode: string) => Promise<void>;
  setSwingMode: (mode: string) => Promise<void>;
};

/**
 * The thermostat data half is the generic `useEntity`; this hook only names the
 * climate services on top of it.
 */
export function useThermostat(entityId: string): UseThermostatResult {
  const {
    entity: state,
    isLoading,
    error,
    controlError,
    status,
    lastUpdated,
    pending,
    refresh,
    call,
  } = useEntity<ThermostatState>(entityId, {
    domain: "climate",
    fetchFailureCopy: "Failed to fetch thermostat",
    callFailureCopy: "Failed to update thermostat",
    pollIntervalMs: THERMOSTAT_POLL_INTERVAL_MS,
  });

  const setTarget = useCallback(
    (temperature: number) =>
      call("set_temperature", { temperature }, (current) => ({
        ...current,
        targetTemperature: temperature,
      })),
    [call],
  );

  const setRange = useCallback(
    (low: number, high: number) =>
      call("set_temperature", { target_temp_low: low, target_temp_high: high }, (current) => ({
        ...current,
        targetTemperatureLow: low,
        targetTemperatureHigh: high,
      })),
    [call],
  );

  const setHvacMode = useCallback(
    (hvacMode: string) =>
      call("set_hvac_mode", { hvac_mode: hvacMode }, (current) => ({ ...current, hvacMode })),
    [call],
  );

  const setFanMode = useCallback(
    (fanMode: string) =>
      call("set_fan_mode", { fan_mode: fanMode }, (current) => ({ ...current, fanMode })),
    [call],
  );

  const setPresetMode = useCallback(
    (presetMode: string) =>
      call("set_preset_mode", { preset_mode: presetMode }, (current) => ({
        ...current,
        presetMode,
      })),
    [call],
  );

  const setSwingMode = useCallback(
    (swingMode: string) =>
      call("set_swing_mode", { swing_mode: swingMode }, (current) => ({ ...current, swingMode })),
    [call],
  );

  return {
    state,
    isLoading,
    error,
    controlError,
    status,
    lastUpdated,
    pending,
    refresh,
    setTarget,
    setRange,
    setHvacMode,
    setFanMode,
    setPresetMode,
    setSwingMode,
  };
}

export type UseClimateEntitiesResult = UseEntitiesResult;

export function useClimateEntities(domain = "climate"): UseClimateEntitiesResult {
  return useEntities(domain, "Failed to load thermostats");
}
