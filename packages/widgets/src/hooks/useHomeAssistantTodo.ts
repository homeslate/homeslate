import { useCallback, useEffect, useState } from "react";
import { getNextPollDelay } from "./polling";
import { HomeAssistantHttpError, fetchTodoItems } from "../services/homeAssistant";
import type { HomeAssistantTodoItem } from "../widgets/homeAssistantTodo";
import { useEntities, useHomeAssistantService, type UseEntitiesResult } from "./useHomeAssistant";

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
  pending: boolean;
  refresh: () => void;
  addItem: (summary: string) => Promise<void>;
  setCompleted: (uid: string, completed: boolean) => Promise<void>;
  removeItem: (uid: string) => Promise<void>;
};

export function useHomeAssistantTodo(entityId: string): UseHomeAssistantTodoResult {
  const [items, setItems] = useState<HomeAssistantTodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controlError, setControlError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [pending, setPending] = useState(false);
  const callService = useHomeAssistantService("Failed to update list");

  const fetchData = useCallback(async () => {
    if (!entityId) {
      setItems([]);
      setError(null);
      setStatus(null);
      setLastUpdated(null);
      setConsecutiveFailures(0);
      return;
    }

    setIsLoading(true);
    try {
      const next = await fetchTodoItems(entityId);
      setItems(next);
      setError(null);
      setStatus(200);
      setLastUpdated(Date.now());
      setConsecutiveFailures(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load list");
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
      if (optimistic) setItems(optimistic);
      try {
        await callService("todo", service, entityId, data);
      } catch (err) {
        setControlError(err instanceof Error ? err.message : "Failed to update list");
      } finally {
        await fetchData();
        setPending(false);
      }
    },
    [callService, entityId, fetchData],
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
