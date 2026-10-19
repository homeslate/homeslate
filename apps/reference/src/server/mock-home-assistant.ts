import { serve } from "@hono/node-server";
import { createMockHomeAssistant } from "./mockHomeAssistant";

// Standalone mock Home Assistant for manual testing. Pair it with the reference
// app:
//
//   HOMEASSISTANT_BASE_URL=http://127.0.0.1:8125 \
//   HOMEASSISTANT_TOKEN=mock-token \
//   pnpm dev:reference
//
// Or just run `pnpm dev:mock`, which starts both processes with these values.
const port = Number(process.env.MOCK_HA_PORT ?? "8125");
const token = process.env.MOCK_HA_TOKEN?.trim() || "mock-token";
const mock = createMockHomeAssistant({ token });

const server = serve({ fetch: mock.app.fetch, hostname: "127.0.0.1", port }, (info) => {
  console.log(`Mock Home Assistant listening on http://127.0.0.1:${info.port}`);
  console.log(`Token: ${token}`);
  console.log("Fixture catalog: climate, media, camera, security, sensors, and more");
});

function shutdown(): void {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
