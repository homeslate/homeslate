import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { createMockHomeAssistant } from "./mockHomeAssistant";

// One-command local demo: start the mock Home Assistant, then the reference
// app with HOMEASSISTANT_BASE_URL / HOMEASSISTANT_TOKEN already pointed at it.
const cwd = fileURLToPath(new URL("../..", import.meta.url));
const port = Number(process.env.MOCK_HA_PORT ?? "8125");
const token = process.env.MOCK_HA_TOKEN?.trim() || "mock-token";
const mock = createMockHomeAssistant({ token });

const mockServer = serve({ fetch: mock.app.fetch, hostname: "127.0.0.1", port }, (info) => {
  console.log(`Mock Home Assistant listening on http://127.0.0.1:${info.port}`);
});

const child = spawn("pnpm", ["run", "dev"], {
  cwd,
  stdio: "inherit",
  env: {
    ...process.env,
    HOMEASSISTANT_BASE_URL: `http://127.0.0.1:${port}`,
    HOMEASSISTANT_TOKEN: token,
  },
});

let shuttingDown = false;

function shutdown(code = 0): void {
  if (shuttingDown) return;
  shuttingDown = true;
  if (!child.killed) child.kill("SIGTERM");
  mockServer.close(() => process.exit(code));
}

child.on("exit", (code, signal) => {
  if (shuttingDown) return;
  shutdown(code ?? (signal ? 1 : 0));
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
