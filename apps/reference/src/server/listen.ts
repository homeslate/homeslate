import { timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import { Server as HttpServer } from "node:http";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { startHomeslateServer } from "@homeslate/server";

// Node does not load `.env` on its own. Docker Compose injects the same
// values as real environment variables, which take precedence over the file.
const envFile = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
import { createHomeAssistantRelay, type AgentBinding } from "@homeslate/relay";
import { attachNodeWebSocket } from "@homeslate/relay/node";

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

// HOMESLATE_HOSTNAME controls the interface the API binds. The default is
// 0.0.0.0 rather than loopback because the reference Docker image publishes
// the port: Docker forwards to the container's bridge address, not its
// loopback, so a 127.0.0.1 bind is unreachable from the host. The host side
// publishes 127.0.0.1:8787, which keeps the API off the LAN except through
// Caddy. Set HOMESLATE_HOSTNAME=127.0.0.1 to bind loopback only.
const hostname = process.env.HOMESLATE_HOSTNAME?.trim() || "0.0.0.0";

// Optional relay mode: run this API off the home network and let a LAN
// agent (@homeslate/agent) reach Home Assistant for it. Set
// HOMESLATE_RELAY_TOKEN to the shared secret the agent presents and
// HOMESLATE_ACCOUNT_ID to name the pairing (defaults to "self-hosted").
// When HOMESLATE_RELAY_TOKEN is unset, the API talks to Home Assistant
// directly with the credentials below.
const relayToken = process.env.HOMESLATE_RELAY_TOKEN?.trim() || "";
const relayAccountId = process.env.HOMESLATE_ACCOUNT_ID?.trim() || "self-hosted";

function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const relay = relayToken
  ? createHomeAssistantRelay({
      authenticate: (hello): AgentBinding | null =>
        tokenMatches(hello.token, relayToken) && hello.accountId === relayAccountId
          ? { accountId: relayAccountId, agentId: hello.agentId }
          : null,
    })
  : null;

const server = await startHomeslateServer({
  dataDir,
  publicBaseUrl,
  hostname,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  openRouteServiceApiKey: process.env.OPENROUTESERVICE_API_KEY,
  homeAssistant: relay
    ? { transport: relay.transport(relayAccountId) }
    : {
        baseUrl: process.env.HOMEASSISTANT_BASE_URL,
        token: process.env.HOMEASSISTANT_TOKEN,
      },
  seedEmptyDisplay: true,
  onListen: ({ port }) => {
    console.log(`Reference API listening on http://127.0.0.1:${port}`);
    console.log(`Open the UI at ${publicBaseUrl}`);
  },
});

// Upgrade `GET /agent` on the same server so a LAN agent can dial out to
// this API. Only mounted in relay mode; the direct setup exposes nothing.
if (relay && server instanceof HttpServer) attachNodeWebSocket(relay, server);
