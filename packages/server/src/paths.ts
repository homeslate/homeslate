import { join } from "node:path";

/** Sqlite database that holds displays and the display → Google account binding. */
export function homeslateDatabasePath(dataDir: string): string {
  return join(dataDir, "displays.sqlite");
}

/** Directory of owner-only Google refresh-token files. */
export function homeslateTokensPath(dataDir: string): string {
  return join(dataDir, "tokens");
}
