import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { createReferenceApp } from "./app";

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

const app = createReferenceApp({
  dataDir,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  openRouteServiceApiKey: process.env.OPENROUTESERVICE_API_KEY,
  publicBaseUrl,
});

const listed = await app.request("/api/displays");
const displays = (await listed.json()) as unknown[];
if (Array.isArray(displays) && displays.length === 0) {
  await app.request("/api/displays", { method: "POST" });
}

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`Reference API listening on http://127.0.0.1:${info.port}`);
  console.log(`Open the UI at ${publicBaseUrl}`);
});
