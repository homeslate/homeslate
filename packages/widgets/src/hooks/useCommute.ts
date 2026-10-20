import { CACHE_POLICIES, commuteKey } from "../services/cachePolicies";
import { readWidgetCache, WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import { useCachedResource } from "./useCachedResource";
import {
  COMMUTE_MISSING_KEY_COPY,
  CommuteHttpError,
  commuteApiUrl,
  type CommuteEstimate,
  type CommuteUnits,
} from "../widgets/commute";

interface CachedCommuteEntry {
  id: string;
  result: CommuteResult;
}

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
  isStale: boolean;
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
  const cacheKey = routes.length === 0 ? null : commuteKey(routes, units);
  const resource = useCachedResource<CachedCommuteEntry[]>({
    key: cacheKey,
    freshMs: CACHE_POLICIES.commute.freshMs,
    maxStaleMs: CACHE_POLICIES.commute.maxStaleMs,
    pollMs: CACHE_POLICIES.commute.freshMs,
    maxBytes: WIDGET_CACHE_LARGE_MAX_BYTES,
    fetcher: async () => {
      const existing = cacheKey
        ? readWidgetCache<CachedCommuteEntry[]>(cacheKey, CACHE_POLICIES.commute)
        : null;
      const previous = new Map(existing?.data.map((entry) => [entry.id, entry.result]) ?? []);
      const settled = await Promise.all(
        routes.map(async (route) => {
          try {
            return { id: route.id, result: { estimate: await fetchEstimate(route, units) } };
          } catch (error) {
            const failed = toResult(error);
            const previousEstimate = previous.get(route.id)?.estimate;
            return {
              id: route.id,
              result: previousEstimate ? { ...failed, estimate: previousEstimate } : failed,
            };
          }
        }),
      );
      if (!settled.some((entry) => entry.result.estimate)) {
        throw new Error(settled[0]?.result.error ?? "Failed to fetch commute");
      }
      return settled;
    },
  });

  return {
    results: new Map(resource.data?.map((entry) => [entry.id, entry.result]) ?? []),
    isLoading: resource.isLoading,
    isStale: resource.isStale,
    lastUpdated: resource.lastUpdated,
    refresh: resource.refresh,
  };
}
