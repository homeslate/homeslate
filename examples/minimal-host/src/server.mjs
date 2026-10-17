// The API entry. Plain JavaScript on purpose: `@homeslate/server` ships
// compiled ESM, so `node src/server.mjs` runs this with no transpiler.
import { fileURLToPath } from "node:url";
import process from "node:process";
import { startHomeslateServer } from "@homeslate/server";

// Where the sqlite file and Google refresh tokens live. Point this at a
// mounted volume in a container so upgrades never touch your data.
const dataDir =
  process.env.HOMESLATE_DATA_DIR?.trim() ?? fileURLToPath(new URL("../data", import.meta.url));

// The externally reachable origin. Used to build the Google OAuth redirect
// URI, so it must match the GCP redirect URI exactly (no trailing slash).
const publicBaseUrl = process.env.HOMESLATE_PUBLIC_BASE_URL?.trim() ?? "http://127.0.0.1:5174";

// Loopback by default, which is right when your reverse proxy is on the same
// host. In a container it must be 0.0.0.0: Docker forwards a published port to
// the container's bridge address, not its loopback, so a 127.0.0.1 bind leaves
// the port dead even though the container looks healthy.
const hostname = process.env.HOMESLATE_HOSTNAME?.trim() ?? "127.0.0.1";

await startHomeslateServer({
  dataDir,
  publicBaseUrl,
  hostname,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  openRouteServiceApiKey: process.env.OPENROUTESERVICE_API_KEY,
  homeAssistant: {
    baseUrl: process.env.HOMEASSISTANT_BASE_URL,
    token: process.env.HOMEASSISTANT_TOKEN,
  },
  seedEmptyDisplay: true,
  onListen: ({ port }) => {
    console.log(`homeslate API on http://127.0.0.1:${port}`);
    console.log(`Open the UI at ${publicBaseUrl}`);
  },
});
