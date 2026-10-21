const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export interface CachePolicy {
  freshMs: number;
  maxStaleMs: number;
}

/** Fresh window and max age for each remote-data type. */
export const CACHE_POLICIES = {
  haEntity: { freshMs: 15_000, maxStaleMs: DAY },
  haTodo: { freshMs: 30_000, maxStaleMs: DAY },
  haHistory: { freshMs: 5 * MINUTE, maxStaleMs: DAY },
  haWeather: { freshMs: 10 * MINUTE, maxStaleMs: DAY },
  haCalendar: { freshMs: 5 * MINUTE, maxStaleMs: DAY },
  weather: { freshMs: 10 * MINUTE, maxStaleMs: 6 * HOUR },
  weatherAlerts: { freshMs: 5 * MINUTE, maxStaleMs: 6 * HOUR },
  ical: { freshMs: 5 * MINUTE, maxStaleMs: DAY },
  googleCalendar: { freshMs: 5 * MINUTE, maxStaleMs: DAY },
  news: { freshMs: 5 * MINUTE, maxStaleMs: DAY },
  sports: { freshMs: 2 * MINUTE, maxStaleMs: 6 * HOUR },
  sportsTeams: { freshMs: HOUR, maxStaleMs: 7 * DAY },
  stocks: { freshMs: MINUTE, maxStaleMs: 6 * HOUR },
  commute: { freshMs: 5 * MINUTE, maxStaleMs: HOUR },
} as const satisfies Record<string, CachePolicy>;

export function haEntityKey(entityId: string): string {
  return `ha:entity:${entityId}`;
}

export function haEntityListKey(entityIds: string[]): string {
  return `ha:entities:${[...entityIds].filter(Boolean).sort().join(",")}`;
}

export function haTodoKey(entityId: string): string {
  return `ha:todo:${entityId}`;
}

export function haHistoryKey(entityId: string, hours: number): string {
  return `ha:history:${entityId}:${hours}`;
}

export function haWeatherKey(entityId: string): string {
  return `ha:weather:${entityId}`;
}

export function haCalendarKey(entityId: string, daysAhead: number): string {
  return `ha:calendar:${entityId}:${daysAhead}`;
}

export function weatherKey(latitude: number, longitude: number, units: string): string {
  return `weather:${latitude.toFixed(2)},${longitude.toFixed(2)},${units}`;
}

export function weatherAlertsKey(latitude: number, longitude: number): string {
  return `weather-alerts:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
}

export function icalKey(icalUrl: string, daysAhead: number): string {
  return `ical:${icalUrl}:${daysAhead}`;
}

export function newsKey(feedUrls: string[]): string {
  return `news:${[...feedUrls].sort().join("|")}`;
}

export function sportsKey(leagueId: string, dates?: string): string {
  return dates ? `sports:${leagueId}:${dates}` : `sports:${leagueId}`;
}

export function sportsTeamsKey(leagueId: string): string {
  return `sports-teams:${leagueId}`;
}

/** Symbols only. The provider API key stays out of the key and the value. */
export function stocksKey(symbols: string[]): string {
  return `stocks:${symbols
    .map((symbol) => symbol.toUpperCase())
    .sort()
    .join(",")}`;
}

export function commuteKey(
  routes: Array<{ origin: string; destination: string }>,
  units: string,
): string {
  const legs = routes.map((route) => `${route.origin}>${route.destination}`).sort();
  return `commute:${legs.join("|")}:${units}`;
}

export function googleCalendarKey(
  calendarIds: string[],
  daysAhead: number,
  daysBack: number,
): string {
  return `google-calendar:${[...calendarIds].sort().join(",")}:${daysAhead}:${daysBack}`;
}
