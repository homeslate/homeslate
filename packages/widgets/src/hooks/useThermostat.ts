import { useCallback, useEffect, useState } from "react";
import { getNextPollDelay } from "./polling";
import {
  HomeAssistantHttpError,
  callThermostatService,
  fetchClimateEntities,
  fetchThermostat,
} from "../services/homeAssistant";
import type { HomeAssistantEntitySummary, ThermostatState } from "../widgets/homeAssistant";

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

export function useThermostat(entityId: string): UseThermostatResult {
  const [state, setState] = useState<ThermostatState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controlError, setControlError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [pending, setPending] = useState(false);

  const fetchData = useCallback(async () => {
    if (!entityId) {
      setState(null);
      setError(null);
      setStatus(null);
      setLastUpdated(null);
      setConsecutiveFailures(0);
      return;
    }

    setIsLoading(true);
    try {
      const next = await fetchThermostat(entityId);
      setState(next);
      setError(null);
      setStatus(200);
      setLastUpdated(Date.now());
      setConsecutiveFailures(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch thermostat");
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
      setConsecutiveFailures((value) => value + 1);
    } finally {
      setIsLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!entityId) return;
    const timeout = setTimeout(
      fetchData,
      getNextPollDelay(THERMOSTAT_POLL_INTERVAL_MS, consecutiveFailures),
    );
    return () => clearTimeout(timeout);
  }, [consecutiveFailures, fetchData, entityId]);

  const run = useCallback(
    async (
      service: string,
      data: Record<string, unknown>,
      optimistic?: (current: ThermostatState) => ThermostatState,
    ) => {
      if (!entityId) return;
      setPending(true);
      setControlError(null);
      if (optimistic) setState((current) => (current ? optimistic(current) : current));
      try {
        await callThermostatService(entityId, service, data);
      } catch (err) {
        setControlError(err instanceof Error ? err.message : "Failed to update thermostat");
      } finally {
        await fetchData();
        setPending(false);
      }
    },
    [entityId, fetchData],
  );

  const setTarget = useCallback(
    (temperature: number) =>
      run("set_temperature", { temperature }, (current) => ({
        ...current,
        targetTemperature: temperature,
      })),
    [run],
  );

  const setRange = useCallback(
    (low: number, high: number) =>
      run("set_temperature", { target_temp_low: low, target_temp_high: high }, (current) => ({
        ...current,
        targetTemperatureLow: low,
        targetTemperatureHigh: high,
      })),
    [run],
  );

  const setHvacMode = useCallback(
    (hvacMode: string) =>
      run("set_hvac_mode", { hvac_mode: hvacMode }, (current) => ({ ...current, hvacMode })),
    [run],
  );

  const setFanMode = useCallback(
    (fanMode: string) =>
      run("set_fan_mode", { fan_mode: fanMode }, (current) => ({ ...current, fanMode })),
    [run],
  );

  const setPresetMode = useCallback(
    (presetMode: string) =>
      run("set_preset_mode", { preset_mode: presetMode }, (current) => ({
        ...current,
        presetMode,
      })),
    [run],
  );

  const setSwingMode = useCallback(
    (swingMode: string) =>
      run("set_swing_mode", { swing_mode: swingMode }, (current) => ({ ...current, swingMode })),
    [run],
  );

  return {
    state,
    isLoading,
    error,
    controlError,
    status,
    lastUpdated,
    pending,
    refresh: fetchData,
    setTarget,
    setRange,
    setHvacMode,
    setFanMode,
    setPresetMode,
    setSwingMode,
  };
}

export type UseClimateEntitiesResult = {
  entities: HomeAssistantEntitySummary[];
  isLoading: boolean;
  error: string | null;
  status: number | null;
  refresh: () => void;
};

export function useClimateEntities(domain = "climate"): UseClimateEntitiesResult {
  const [entities, setEntities] = useState<HomeAssistantEntitySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      setEntities(await fetchClimateEntities(domain));
      setError(null);
      setStatus(200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load thermostats");
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
    } finally {
      setIsLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { entities, isLoading, error, status, refresh: fetchData };
}
