import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export function openSqlite(filename: string): DatabaseSync {
  mkdirSync(dirname(filename), { recursive: true });
  const database = new DatabaseSync(filename);
  database.exec(`
CREATE TABLE IF NOT EXISTS displays (
  id TEXT PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  passcode_hash TEXT
);
CREATE TABLE IF NOT EXISTS google_bindings (
  display_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL
);
`);
  migrateDisplaysPasscodeColumn(database);
  return database;
}

/**
 * `CREATE TABLE IF NOT EXISTS` leaves pre-existing databases untouched, so add
 * the passcode column when opening a database created before it existed.
 */
function migrateDisplaysPasscodeColumn(database: DatabaseSync): void {
  const columns = database.prepare("PRAGMA table_info(displays)").all() as Array<{ name: string }>;
  if (columns.some((column) => column.name === "passcode_hash")) return;
  database.exec("ALTER TABLE displays ADD COLUMN passcode_hash TEXT");
}
