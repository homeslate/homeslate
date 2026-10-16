import { fileURLToPath } from "node:url";
import process from "node:process";
import { startHomeslateServer } from "@homeslate/server";

// HOMESLATE_DATA_DIR controls where the sqlite file and Google refresh
// tokens are persisted. In production (the reference Docker image) this
// is a mounted volume at /data. In dev (`pnpm dev:reference`) it falls
// back to the repo's apps/reference/data dir, which is gitignored.
const dataDir =
  process.env.HOMESLATE_DATA_DIR?.trim() || fileURLToPath(new URL("../../data", import.meta.url));

// HOMESLATE_PUBLIC_BASE_URL is the externally reachable origin of this app
// (e.g. "http://homeslate.lan" behind a reverse proxy). It is used to build
// the Google OAuth redirect URI and must match the Authorized redirect URI
// registered for the OAuth client. Falls back to the dev default of
// "http://127.0.0.1:5174" so `pnpm dev:reference` keeps working unchanged.
const publicBaseUrl = process.env.HOMESLATE_PUBLIC_BASE_URL?.trim() || "http://127.0.0.1:5174";

await startHomeslateServer({
  dataDir,
  publicBaseUrl,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  openRouteServiceApiKey: process.env.OPENROUTESERVICE_API_KEY,
  seedEmptyDisplay: true,
  onListen: ({ port }) => {
    console.log(`Reference API listening on http://127.0.0.1:${port}`);
    console.log(`Open the UI at ${publicBaseUrl}`);
  },
});
