import { serve, type ServerType } from "@hono/node-server";
import { createHomeslateServer } from "./createHomeslateServer";
import type { HomeslateListenInfo, HomeslateServerOptions } from "./types";

export type StartHomeslateServerOptions = HomeslateServerOptions & {
  /** Port to bind. Defaults to `8787`. */
  port?: number;
  /** Interface to bind. Defaults to `127.0.0.1` (loopback only). */
  hostname?: string;
  /**
   * Create an empty display when none exist, so the editor has something to
   * open on first run. Defaults to `false`.
   */
  seedEmptyDisplay?: boolean;
  /** Called once the server is listening. */
  onListen?: (info: HomeslateListenInfo) => void;
};

/**
 * Start the homeslate API on Node. Resolves once the server is listening.
 *
 * ```ts
 * await startHomeslateServer({
 *   dataDir: "./data",
 *   publicBaseUrl: "http://homeslate.lan",
 *   google: { clientId, clientSecret },
 * });
 * ```
 */
export async function startHomeslateServer(
  options: StartHomeslateServerOptions,
): Promise<ServerType> {
  const app = createHomeslateServer(options);
  if (options.seedEmptyDisplay) await seedEmptyDisplay(app);

  const hostname = options.hostname ?? "127.0.0.1";
  const port = options.port ?? 8787;

  return new Promise<ServerType>((resolve) => {
    const server = serve({ fetch: app.fetch, hostname, port }, (info) => {
      options.onListen?.({ hostname, port: info.port });
      resolve(server);
    });
  });
}

async function seedEmptyDisplay(app: ReturnType<typeof createHomeslateServer>): Promise<void> {
  const listed = (await (await app.request("/api/displays")).json()) as unknown;
  if (Array.isArray(listed) && listed.length === 0) {
    await app.request("/api/displays", { method: "POST" });
  }
}
