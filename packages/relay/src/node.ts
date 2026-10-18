import type { IncomingMessage, Server } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer } from "ws";
import type { HomeAssistantRelay } from "./relay";

export type AttachNodeWebSocketOptions = {
  /** Path the relay's upgrade handler answers. Defaults to `/agent`. */
  path?: string;
};

export type NodeWebSocketBinding = {
  /** Detach the upgrade handler and terminate any connected agents. */
  close(): Promise<void>;
};

/**
 * Bind a relay to a Node HTTP server: upgrades `GET <path>` connections and
 * hands each socket to `relay.accept()`. This is the reference runtime binding;
 * a serverless / Durable Object host would wire `accept()` to its own socket
 * type instead.
 */
export function attachNodeWebSocket(
  relay: HomeAssistantRelay,
  server: Server,
  options: AttachNodeWebSocketOptions = {},
): NodeWebSocketBinding {
  const path = options.path ?? "/agent";
  const wss = new WebSocketServer({ noServer: true });

  const onUpgrade = (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    const { pathname } = new URL(request.url ?? "/", "http://localhost");
    if (pathname !== path) return;
    wss.handleUpgrade(request, socket, head, (ws) => {
      const session = relay.accept({
        send: (data) => ws.send(data),
        close: (code, reason) => ws.close(code, reason),
      });
      ws.on("message", (data) => {
        void session.handleMessage(data.toString());
      });
      ws.on("close", () => session.close());
      ws.on("error", () => session.close());
    });
  };

  server.on("upgrade", onUpgrade);

  return {
    async close() {
      server.off("upgrade", onUpgrade);
      for (const client of wss.clients) client.terminate();
      await new Promise<void>((resolve) => wss.close(() => resolve()));
    },
  };
}
