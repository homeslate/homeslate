import { useCallback, useEffect, useState } from "react";
import { getNextPollDelay } from "./polling";
import { HomeAssistantHttpError, fetchTodoItems } from "../services/homeAssistant";
import type { HomeAssistantTodoItem } from "../widgets/homeAssistantTodo";
import { useEntities, useHomeAssistantService, type UseEntitiesResult } from "./useHomeAssistant";
import { CACHE_POLICIES, haTodoKey } from "../services/cachePolicies";
import { WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import { useHaResource } from "./useHaResource";

const TODO_POLL_INTERVAL_MS = 30 * 1000;

export type UseHomeAssistantTodoResult = {
  items: HomeAssistantTodoItem[];
  isLoading: boolean;
  /** Fetch error (drives `WidgetDataStatus`). */
  error: string | null;
  /** Control (service call) error. */
  controlError: string | null;
  /** HTTP status of the last fetch; `501` means Home Assistant is unconfigured. */
  status: number | null;
  lastUpdated: number | null;
  isStale: boolean;
  pending: boolean;
  refresh: () => void;
  addItem: (summary: string) => Promise<void>;
  setCompleted: (uid: string, completed: boolean) => Promise<void>;
  removeItem: (uid: string) => Promise<void>;
};

export function useHomeAssistantTodo(entityId: string): UseHomeAssistantTodoResult {
  const cacheKey = entityId ? haTodoKey(entityId) : null;
  const { data, setData, isLoading, isStale, error, setError, lastUpdated, beginLoad, commit } =
    useHaResource<HomeAssistantTodoItem[]>(
      cacheKey,
      CACHE_POLICIES.haTodo,
      WIDGET_CACHE_LARGE_MAX_BYTES,
    );
  const [controlError, setControlError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [pending, setPending] = useState(false);
  const callService = useHomeAssistantService("Failed to update list");
  const items = data ?? [];

  const fetchData = useCallback(async () => {
    if (!entityId || !cacheKey) {
      commit({ type: "clear" });
      setStatus(null);
      setConsecutiveFailures(0);
      return;
    }

    beginLoad();
    try {
      const next = await fetchTodoItems(entityId);
      commit({ type: "success", data: next, now: Date.now() });
      setError(null);
      setStatus(200);
      setConsecutiveFailures(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load list");
      commit({ type: "failure" });
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
      setConsecutiveFailures((value) => value + 1);
    }
  }, [beginLoad, cacheKey, commit, entityId, setError]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!entityId) return;
    const timeout = setTimeout(
      fetchData,
      getNextPollDelay(TODO_POLL_INTERVAL_MS, consecutiveFailures),
    );
    return () => clearTimeout(timeout);
  }, [consecutiveFailures, fetchData, entityId]);

  const run = useCallback(
    async (
      service: string,
      data: Record<string, unknown>,
      optimistic?: (current: HomeAssistantTodoItem[]) => HomeAssistantTodoItem[],
    ) => {
      if (!entityId) return;
      setPending(true);
      setControlError(null);
      if (optimistic) setData((current) => optimistic(current ?? []));
      try {
        await callService("todo", service, entityId, data);
      } catch (err) {
        setControlError(err instanceof Error ? err.message : "Failed to update list");
      } finally {
        await fetchData();
        setPending(false);
      }
    },
    [callService, entityId, fetchData, setData],
  );

  const addItem = useCallback((summary: string) => run("add_item", { item: summary }), [run]);

  const setCompleted = useCallback(
    (uid: string, completed: boolean) =>
      run("update_item", { item: uid, status: completed ? "completed" : "needs_action" }),
    [run],
  );

  const removeItem = useCallback(
    (uid: string) =>
      run("remove_item", { item: uid }, (current) => current.filter((entry) => entry.uid !== uid)),
    [run],
  );

  return {
    items,
    isLoading,
    error,
    controlError,
    status,
    lastUpdated,
    isStale,
    pending,
    refresh: fetchData,
    addItem,
    setCompleted,
    removeItem,
  };
}

export type UseTodoEntitiesResult = UseEntitiesResult;

export function useTodoEntities(): UseTodoEntitiesResult {
  return useEntities("todo", "Failed to load lists");
}
