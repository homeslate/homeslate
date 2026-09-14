import { useCallback, useEffect, useRef, useState } from "react";
import {
  COMMUTE_MISSING_KEY_COPY,
  CommuteHttpError,
  commuteApiUrl,
  type CommuteEstimate,
  type CommuteUnits,
} from "../widgets/commute";
import { getNextPollDelay } from "./polling";

const COMMUTE_POLL_INTERVAL_MS = 5 * 60 * 1000;

export type CommuteRouteQuery = {
  id: string;
  origin: string;
  destination: string;
};

export type CommuteResult = {
  estimate?: CommuteEstimate;
  error?: string;
  status?: number;
};

export type UseCommuteResult = {
  results: Map<string, CommuteResult>;
  isLoading: boolean;
  lastUpdated: number | null;
  refresh: () => void;
};

async function fetchEstimate(
  route: CommuteRouteQuery,
  units: CommuteUnits,
): Promise<CommuteEstimate> {
  const response = await fetch(commuteApiUrl(route.origin, route.destination, units));
  if (response.status === 501) {
    throw new CommuteHttpError(501, COMMUTE_MISSING_KEY_COPY);
  }
  if (!response.ok) {
    let message = "Failed to fetch commute";
    try {
      const body = (await response.json()) as { error?: unknown };
      if (typeof body.error === "string") message = body.error;
    } catch {
      // Keep the stable fallback when the server did not return JSON.
    }
    throw new CommuteHttpError(response.status, message);
  }
  return (await response.json()) as CommuteEstimate;
}

function toResult(error: unknown): CommuteResult {
  return {
    error: error instanceof Error ? error.message : "Failed to fetch commute",
    status: error instanceof CommuteHttpError ? error.status : undefined,
  };
}

export function useCommute(routes: CommuteRouteQuery[], units: CommuteUnits): UseCommuteResult {
  const [results, setResults] = useState<Map<string, CommuteResult>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const routesRef = useRef(routes);
  routesRef.current = routes;
  const routeKey = routes
    .map((route) => `${route.id}\0${route.origin}\0${route.destination}`)
    .join("\n");

  const fetchData = useCallback(async () => {
    const currentRoutes = routesRef.current;
    if (currentRoutes.length === 0) {
      setResults(new Map());
      setLastUpdated(null);
      setConsecutiveFailures(0);
      return;
    }

    setIsLoading(true);
    const settled = await Promise.all(
      currentRoutes.map(async (route) => {
        try {
          return [route.id, { estimate: await fetchEstimate(route, units) }] as const;
        } catch (error) {
          return [route.id, toResult(error)] as const;
        }
      }),
    );

    const successful = settled.filter(([, result]) => result.estimate).length;
    setResults((previous) => {
      const next = new Map<string, CommuteResult>();
      for (const [id, result] of settled) {
        if (result.estimate) {
          next.set(id, result);
          continue;
        }
        const previousEstimate = previous.get(id)?.estimate;
        next.set(id, previousEstimate ? { ...result, estimate: previousEstimate } : result);
      }
      return next;
    });

    if (successful > 0) {
      setLastUpdated(Date.now());
      setConsecutiveFailures(0);
    } else {
      setConsecutiveFailures((value) => value + 1);
    }
    setIsLoading(false);
  }, [routeKey, units]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (routes.length === 0) return;
    const timeout = setTimeout(
      fetchData,
      getNextPollDelay(COMMUTE_POLL_INTERVAL_MS, consecutiveFailures),
    );
    return () => clearTimeout(timeout);
  }, [consecutiveFailures, fetchData, routes.length]);

  return { results, isLoading, lastUpdated, refresh: fetchData };
}
