import { useCallback, useMemo, useState } from "react";
import { CACHE_POLICIES, sportsKey } from "../services/cachePolicies";
import { fetchScoreboard, type SportGame, type SportsTeam } from "../services/sports";
import { WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import { useCachedResource } from "./useCachedResource";

interface UseScoresOptions {
  leagueId: string;
  /** If non-empty, only games involving one of these team IDs are returned */
  favoriteTeamIds?: string[];
  refreshInterval?: number;
}

/** Format date as YYYYMMDD (local date) */
function getTodayYYYYMMDD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/** Previous day in YYYYMMDD */
function getPreviousDay(yyyymmdd: string): string {
  const y = parseInt(yyyymmdd.slice(0, 4), 10);
  const m = parseInt(yyyymmdd.slice(4, 6), 10) - 1;
  const d = parseInt(yyyymmdd.slice(6, 8), 10);
  const prev = new Date(y, m, d);
  prev.setDate(prev.getDate() - 1);
  const py = prev.getFullYear();
  const pm = String(prev.getMonth() + 1).padStart(2, "0");
  const pd = String(prev.getDate()).padStart(2, "0");
  return `${py}${pm}${pd}`;
}

interface UseScoresResult {
  games: SportGame[];
  allTeams: SportsTeam[];
  leagueLogo?: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  isStale: boolean;
  lastUpdated: number | null;
  refresh: () => void;
  loadMore: () => Promise<void>;
}

function filterAndSortGames(fetchedGames: SportGame[], favoriteTeamIds: string[]): SportGame[] {
  const isRacing = fetchedGames.some((g) => g.raceSessions?.length);
  const filtered =
    favoriteTeamIds.length > 0 && !isRacing
      ? fetchedGames.filter((g) => g.competitors.some((c) => favoriteTeamIds.includes(c.team.id)))
      : fetchedGames;
  return [...filtered].sort((a, b) => {
    const order = { in: 0, pre: 1, post: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return new Date(b.date).getTime() - new Date(a.date).getTime(); // newest first
  });
}

export function useScores({
  leagueId,
  favoriteTeamIds = [],
  refreshInterval = CACHE_POLICIES.sports.freshMs,
}: UseScoresOptions): UseScoresResult {
  const cacheKey = leagueId ? sportsKey(leagueId) : null;
  const resource = useCachedResource<{
    games: SportGame[];
    teams: SportsTeam[];
    leagueLogo?: string;
    date?: string;
  }>({
    key: cacheKey,
    freshMs: CACHE_POLICIES.sports.freshMs,
    maxStaleMs: CACHE_POLICIES.sports.maxStaleMs,
    pollMs: refreshInterval,
    maxBytes: WIDGET_CACHE_LARGE_MAX_BYTES,
    fetcher: async () => {
      const result = await fetchScoreboard(leagueId);
      return {
        games: result.games,
        teams: result.teams,
        leagueLogo: result.leagueLogo,
        date: result.date,
      };
    },
  });
  const [olderGames, setOlderGames] = useState<SportGame[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [oldestFetchedDate, setOldestFetchedDate] = useState<string | null>(
    resource.data?.date ?? null,
  );
  const [seenSavedAt, setSeenSavedAt] = useState(resource.lastUpdated);
  if (seenSavedAt !== resource.lastUpdated) {
    setSeenSavedAt(resource.lastUpdated);
    setOlderGames([]);
    setOldestFetchedDate(resource.data?.date ?? null);
  }

  const games = useMemo(() => {
    const byId = new Map<string, SportGame>();
    for (const game of resource.data?.games ?? []) byId.set(game.id, game);
    for (const game of olderGames) {
      if (!byId.has(game.id)) byId.set(game.id, game);
    }
    return filterAndSortGames([...byId.values()], favoriteTeamIds);
  }, [favoriteTeamIds, olderGames, resource.data?.games]);

  const loadMore = useCallback(async () => {
    if (!leagueId || isLoadingMore || resource.isLoading) return;
    const baseDate = oldestFetchedDate ?? resource.data?.date ?? getTodayYYYYMMDD();
    const previousDay = getPreviousDay(baseDate);

    setIsLoadingMore(true);
    try {
      const result = await fetchScoreboard(leagueId, { dates: previousDay });
      setOldestFetchedDate(previousDay);
      const sortedNew = filterAndSortGames(result.games, favoriteTeamIds);
      setOlderGames((previous) => {
        const byId = new Map(previous.map((game) => [game.id, game]));
        for (const game of sortedNew) {
          if (!byId.has(game.id)) byId.set(game.id, game);
        }
        return [...byId.values()];
      });
    } catch {
      // Silent fail for load-more; user can retry by scrolling again
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    favoriteTeamIds,
    isLoadingMore,
    leagueId,
    oldestFetchedDate,
    resource.data?.date,
    resource.isLoading,
  ]);

  return {
    games,
    allTeams: resource.data?.teams ?? [],
    leagueLogo: resource.data?.leagueLogo,
    isLoading: resource.isLoading,
    isLoadingMore,
    error: resource.error,
    isStale: resource.isStale,
    lastUpdated: resource.lastUpdated,
    refresh: resource.refresh,
    loadMore,
  };
}
