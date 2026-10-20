export interface League {
  /** Key used in the ESPN URL, for example `nhl`. */
  id: string;
  /** ESPN sport segment, for example `hockey`. */
  sport: string;
  name: string;
}

export const LEAGUES: League[] = [
  { id: "nhl", sport: "hockey", name: "NHL" },
  { id: "nfl", sport: "football", name: "NFL" },
  { id: "nba", sport: "basketball", name: "NBA" },
  { id: "wnba", sport: "basketball", name: "WNBA" },
  { id: "mlb", sport: "baseball", name: "MLB" },
  { id: "mls", sport: "soccer", name: "MLS" },
  { id: "f1", sport: "racing", name: "Formula 1" },
  { id: "mens-college-basketball", sport: "basketball", name: "NCAA Basketball (M)" },
  { id: "womens-college-basketball", sport: "basketball", name: "NCAA Basketball (W)" },
  { id: "college-football", sport: "football", name: "NCAA Football" },
];
