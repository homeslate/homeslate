import { useCallback, useEffect, useState } from "react";
import {
  HomeAssistantHttpError,
  callHomeAssistantService,
  fetchEntities,
  fetchEntity,
} from "../services/homeAssistant";
import type { HomeAssistantEntitySummary } from "../widgets/homeAssistant";
import { getNextPollDelay } from "./polling";

const ENTITY_POLL_INTERVAL_MS = 30 * 1000;

export type UseEntitiesResult = {
  entities: HomeAssistantEntitySummary[];
  isLoading: boolean;
  error: string | null;
  status: number | null;
  refresh: () => void;
};

/**
 * Load the entity summaries for one allowlisted domain, for a widget's settings
 * picker. Generic over the domain: the registry on the server decides what is
 * valid, so a new widget reuses this without a new hook.
 */
export function useEntities(domain: string, failureCopy: string): UseEntitiesResult {
  const [entities, setEntities] = useState<HomeAssistantEntitySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      setEntities(await fetchEntities(domain, failureCopy));
      setError(null);
      setStatus(200);
    } catch (err) {
      setError(err instanceof Error ? err.message : failureCopy);
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
    } finally {
      setIsLoading(false);
    }
  }, [domain, failureCopy]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { entities, isLoading, error, status, refresh: fetchData };
}

/** A stable caller for allowlisted Home Assistant services. */
export type HomeAssistantServiceCaller = (
  domain: string,
  service: string,
  entityId: string,
  data?: Record<string, unknown>,
) => Promise<void>;

/** Build the same-origin service caller, with a `failureCopy` fallback message. */
export function useHomeAssistantService(failureCopy: string): HomeAssistantServiceCaller {
  return useCallback(
    (domain, service, entityId, data) =>
      callHomeAssistantService(domain, service, entityId, data ?? {}, failureCopy),
    [failureCopy],
  );
}

export type UseEntityOptions = {
  /** Domain of the entity, e.g. `"climate"`. */
  domain: string;
  /** Fallback message when a fetch fails without a server body. */
  fetchFailureCopy: string;
  /** Fallback message when a service call fails without a server body. */
  callFailureCopy: string;
  /** Poll cadence. Defaults to 30s. */
  pollIntervalMs?: number;
};

export type UseEntityResult<T> = {
  entity: T | null;
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
  /** Call a service on this entity, with an optional optimistic merge + refresh. */
  call: (
    service: string,
    data: Record<string, unknown>,
    optimistic?: (current: T) => T,
  ) => Promise<void>;
};

/**
 * Fetch one entity's mapped state, poll it, and expose a service-call runner.
 * The generic form of `useThermostat`'s data half; new single-entity widgets
 * build on this instead of hand-rolling polling + optimistic control.
 */
export function useEntity<T>(entityId: string, options: UseEntityOptions): UseEntityResult<T> {
  const {
    domain,
    fetchFailureCopy,
    callFailureCopy,
    pollIntervalMs = ENTITY_POLL_INTERVAL_MS,
  } = options;
  const [entity, setEntity] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controlError, setControlError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [pending, setPending] = useState(false);
  const callService = useHomeAssistantService(callFailureCopy);

  const fetchData = useCallback(async () => {
    if (!entityId) {
      setEntity(null);
      setError(null);
      setStatus(null);
      setLastUpdated(null);
      setConsecutiveFailures(0);
      return;
    }

    setIsLoading(true);
    try {
      const next = await fetchEntity<T>(entityId, fetchFailureCopy);
      setEntity(next);
      setError(null);
      setStatus(200);
      setLastUpdated(Date.now());
      setConsecutiveFailures(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : fetchFailureCopy);
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
      setConsecutiveFailures((value) => value + 1);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, fetchFailureCopy]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!entityId) return;
    const timeout = setTimeout(fetchData, getNextPollDelay(pollIntervalMs, consecutiveFailures));
    return () => clearTimeout(timeout);
  }, [consecutiveFailures, fetchData, entityId, pollIntervalMs]);

  const call = useCallback(
    async (service: string, data: Record<string, unknown>, optimistic?: (current: T) => T) => {
      if (!entityId) return;
      setPending(true);
      setControlError(null);
      if (optimistic) setEntity((current) => (current ? optimistic(current) : current));
      try {
        await callService(domain, service, entityId, data);
      } catch (err) {
        setControlError(err instanceof Error ? err.message : callFailureCopy);
      } finally {
        await fetchData();
        setPending(false);
      }
    },
    [callService, callFailureCopy, domain, entityId, fetchData],
  );

  return {
    entity,
    isLoading,
    error,
    controlError,
    status,
    lastUpdated,
    pending,
    refresh: fetchData,
    call,
  };
}
