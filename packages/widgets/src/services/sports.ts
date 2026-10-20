// ESPN Sports Scoreboard API Service
// Uses ESPN's publicly accessible (unofficial) API — no key required.
// Endpoint pattern:
//   https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard

import { CACHE_POLICIES, sportsKey, sportsTeamsKey } from "./cachePolicies";
import { LEAGUES } from "./leagues";
import {
  clearWidgetCacheWhere,
  readWidgetCache,
  WIDGET_CACHE_LARGE_MAX_BYTES,
  writeWidgetCache,
} from "./widgetCache";

export { LEAGUES };
export type { League } from "./leagues";

export interface SportsTeam {
  id: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  logo?: string;
  color?: string;
}

export interface SportsCompetitor {
  team: SportsTeam;
  score: string;
  homeAway: "home" | "away";
  winner?: boolean;
  records?: { summary: string }[];
}

export type GameStatus = "pre" | "in" | "post";

export interface RaceSession {
  type: string; // e.g. "FP1", "Qual", "Race", "Sprint"
  date: string; // ISO string
  statusDetail: string;
  status: GameStatus;
}

export interface SportGame {
  id: string;
  date: string; // ISO string
  name: string;
  shortName: string;
  status: GameStatus;
  statusDetail: string; // e.g. "Final", "7:30 PM ET", "3rd 4:22"
  period?: number; // current period / quarter
  clock?: string; // remaining clock
  competitors: [SportsCompetitor, SportsCompetitor]; // [away, home] typically
  /** Present for F1/racing: sessions (FP1, Qual, Race, etc.) for this race weekend */
  raceSessions?: RaceSession[];
}

// ---------------------------------------------------------------------------
// API fetch
// ---------------------------------------------------------------------------

interface EspnLogo {
  href?: string;
  rel?: string[];
}

interface EspnCompetitor {
  team?: {
    id?: string;
    abbreviation?: string;
    displayName?: string;
    shortDisplayName?: string;
    name?: string;
    logo?: string;
    color?: string;
  };
  score?: string;
  homeAway?: string;
  winner?: boolean;
  records?: { summary: string }[];
}

interface EspnCompetition {
  date?: string;
  type?: { abbreviation?: string; name?: string };
  status?: {
    period?: number;
    displayClock?: string;
    type?: { state?: string; shortDetail?: string; detail?: string };
  };
  competitors?: EspnCompetitor[];
}

interface EspnEvent {
  id: string;
  date: string;
  name?: string;
  shortName?: string;
  status?: { type?: { state?: string; shortDetail?: string; detail?: string } };
  competitions?: EspnCompetition[];
  circuit?: { fullName?: string; address?: { city?: string } };
}

function buildScoreboardUrl(leagueId: string, _sport: string, dates?: string): string {
  const params = new URLSearchParams({ league: leagueId });
  if (dates) params.set("dates", dates);
  return `/api/sports/scoreboard?${params}`;
}

function parseCompetitor(c: EspnCompetitor): SportsCompetitor {
  return {
    team: {
      id: c.team?.id ?? "",
      abbreviation: c.team?.abbreviation ?? "",
      displayName: c.team?.displayName ?? c.team?.name ?? "",
      shortDisplayName: c.team?.shortDisplayName ?? c.team?.abbreviation ?? "",
      logo: c.team?.logo,
      color: c.team?.color ? `#${c.team.color}` : undefined,
    },
    score: c.score ?? "0",
    homeAway: c.homeAway === "home" ? "home" : "away",
    winner: c.winner,
    records: c.records,
  };
}

function parseGame(event: EspnEvent): SportGame {
  const competition = event.competitions?.[0];
  const statusType = competition?.status?.type;

  let status: GameStatus = "pre";
  if (statusType?.state === "in") status = "in";
  else if (statusType?.state === "post") status = "post";

  const competitors: [SportsCompetitor, SportsCompetitor] = [
    parseCompetitor(competition?.competitors?.[0] ?? {}),
    parseCompetitor(competition?.competitors?.[1] ?? {}),
  ];

  return {
    id: event.id,
    date: event.date,
    name: event.name ?? "",
    shortName: event.shortName ?? "",
    status,
    statusDetail: statusType?.shortDetail ?? statusType?.detail ?? "",
    period: competition?.status?.period,
    clock: competition?.status?.displayClock,
    competitors,
  };
}

// F1/racing: each "event" is a race weekend with multiple sessions (FP1, Qual, Race, etc.)

function parseF1Event(event: EspnEvent): SportGame {
  const competitions = event.competitions ?? [];
  const raceSession = competitions.find((c) => c.type?.abbreviation === "Race");
  const statusType =
    raceSession?.status?.type ?? event.status?.type ?? competitions[0]?.status?.type;

  let status: GameStatus = "pre";
  if (statusType?.state === "in") status = "in";
  else if (statusType?.state === "post") status = "post";

  const raceSessions: RaceSession[] = competitions.map((c) => {
    const st = c.status?.type;
    let s: GameStatus = "pre";
    if (st?.state === "in") s = "in";
    else if (st?.state === "post") s = "post";
    return {
      type: c.type?.abbreviation ?? c.type?.name ?? "Session",
      date: c.date ?? event.date,
      statusDetail: st?.shortDetail ?? st?.detail ?? "",
      status: s,
    };
  });

  const circuitName = event.circuit?.fullName ?? event.circuit?.address?.city ?? "";
  const placeholderTeam: SportsTeam = {
    id: event.id,
    abbreviation: "GP",
    displayName: event.shortName ?? event.name ?? "Grand Prix",
    shortDisplayName: event.shortName ?? event.name ?? "GP",
  };
  const nextSession =
    raceSessions.find((s) => s.status === "pre") ?? raceSessions[raceSessions.length - 1];
  const nextDetail = nextSession
    ? `${nextSession.type}: ${nextSession.statusDetail}`
    : (statusType?.shortDetail ?? "");

  const competitors: [SportsCompetitor, SportsCompetitor] = [
    {
      team: {
        ...placeholderTeam,
        displayName: circuitName || placeholderTeam.displayName,
        shortDisplayName: circuitName || placeholderTeam.shortDisplayName,
      },
      score: "",
      homeAway: "away",
    },
    {
      team: { ...placeholderTeam, displayName: nextDetail, shortDisplayName: nextDetail },
      score: "",
      homeAway: "home",
    },
  ];

  return {
    id: event.id,
    date: event.date,
    name: event.name ?? "",
    shortName: event.shortName ?? "",
    status,
    statusDetail: statusType?.shortDetail ?? statusType?.detail ?? "",
    competitors,
    raceSessions,
  };
}

export interface FetchScoreboardOptions {
  /** Date in YYYYMMDD format; if omitted, API returns today's games */
  dates?: string;
}

export interface FetchScoreboardResult {
  games: SportGame[];
  teams: SportsTeam[];
  leagueLogo?: string;
  /** Scoreboard date in YYYYMMDD (from API response when available) */
  date?: string;
}

export async function fetchScoreboard(
  leagueId: string,
  options?: FetchScoreboardOptions,
): Promise<FetchScoreboardResult> {
  const league = LEAGUES.find((l) => l.id === leagueId);
  if (!league) throw new Error(`Unknown league: ${leagueId}`);

  const { dates } = options ?? {};
  const url = buildScoreboardUrl(leagueId, league.sport, dates);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`ESPN fetch failed: ${response.statusText}`);

  const data = await response.json();

  const isRacing = league.sport === "racing";
  const games: SportGame[] = ((data.events ?? []) as EspnEvent[]).map((event) =>
    isRacing ? parseF1Event(event) : parseGame(event),
  );

  // Extract league logo from response (prefer dark variant for display on dark backgrounds)

  const logos = (data.leagues?.[0]?.logos ?? []) as EspnLogo[];
  const darkLogo = logos.find((l) => l.rel?.includes("dark"))?.href;
  const defaultLogo = logos.find((l) => l.rel?.includes("default"))?.href ?? logos[0]?.href;
  const leagueLogo: string | undefined = darkLogo ?? defaultLogo;

  // Scoreboard date from API (e.g. "2026-03-12" -> "20260312")
  const rawDay = data.day?.date;
  const dateStr = rawDay && typeof rawDay === "string" ? rawDay.replace(/-/g, "") : dates;

  // Collect unique teams from this scoreboard response (racing events use placeholder competitors, so skip)
  const teamMap = new Map<string, SportsTeam>();
  if (!isRacing) {
    for (const game of games) {
      for (const competitor of game.competitors) {
        if (!teamMap.has(competitor.team.id)) {
          teamMap.set(competitor.team.id, competitor.team);
        }
      }
    }
  }
  const teams = Array.from(teamMap.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );

  return {
    games,
    teams,
    leagueLogo,
    date: dateStr,
  };
}

// ---------------------------------------------------------------------------
// Fetch all teams for a league (for settings UI)
// ---------------------------------------------------------------------------

export async function fetchLeagueTeams(leagueId: string): Promise<SportsTeam[]> {
  const key = sportsTeamsKey(leagueId);
  const cached = readWidgetCache<SportsTeam[]>(key, CACHE_POLICIES.sportsTeams);
  if (cached?.isFresh) return cached.data;

  const league = LEAGUES.find((entry) => entry.id === leagueId);
  if (!league) return cached?.data ?? [];

  const url = `/api/sports/teams?league=${encodeURIComponent(leagueId)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return cached?.data ?? [];
    const data = await response.json();

    const teams: SportsTeam[] = (data.sports?.[0]?.leagues?.[0]?.teams ?? [])
      .map(
        (entry: {
          team?: {
            id?: string;
            abbreviation?: string;
            displayName?: string;
            shortDisplayName?: string;
            logos?: { href?: string }[];
            color?: string;
          };
        }) => ({
          id: entry.team?.id ?? "",
          abbreviation: entry.team?.abbreviation ?? "",
          displayName: entry.team?.displayName ?? "",
          shortDisplayName: entry.team?.shortDisplayName ?? entry.team?.abbreviation ?? "",
          logo: entry.team?.logos?.[0]?.href,
          color: entry.team?.color ? `#${entry.team.color}` : undefined,
        }),
      )
      .filter((team: SportsTeam) => team.id);

    teams.sort((left, right) => left.displayName.localeCompare(right.displayName));
    if (teams.length > 0) {
      writeWidgetCache(key, teams, { maxBytes: WIDGET_CACHE_LARGE_MAX_BYTES });
    }
    return teams.length > 0 ? teams : (cached?.data ?? []);
  } catch {
    return cached?.data ?? [];
  }
}

export function invalidateCache(leagueId?: string): void {
  clearWidgetCacheWhere((key) => {
    if (!leagueId) return key.startsWith("sports:") || key.startsWith("sports-teams:");
    return (
      key === sportsKey(leagueId) ||
      key.startsWith(`sports:${leagueId}:`) ||
      key === sportsTeamsKey(leagueId)
    );
  });
}
