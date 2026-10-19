import { randomUUID } from "node:crypto";
import {
  HomeAssistantError,
  createHomeAssistantClient,
  type HomeAssistantTransport,
} from "@homeslate/server";
import {
  AGENT_PROTOCOL_VERSION,
  decodeAgentMessage,
  encodeAgentMessage,
  validateAgentRequestParams,
  type AgentMessage,
  type AgentMethod,
  type AgentResponseMessage,
} from "@homeslate/widgets/server";
import { nextReconnectDelay } from "./backoff";

export type AgentConnectionState = "connecting" | "connected" | "disconnected";

export type HomeslateAgentOptions = {
  /** Relay WebSocket URL, e.g. `wss://relay.example.com/agent`. */
  relayUrl: string;
  /** Relay token, bound to `accountId` on the relay side. */
  token: string;
  /** Account the agent belongs to (from the pairing flow). */
  accountId: string;
  /** Home Assistant LAN endpoint, e.g. `http://homeassistant.local:8123`. */
  baseUrl: string;
  /** Long-lived Home Assistant token. Never leaves this process. */
  haToken: string;
  /** Stable id for this agent instance. Defaults to a random uuid. */
  agentId?: string;
  /** Reported in the `hello` frame. Defaults to `""`. */
  agentVersion?: string;
  /** Override the Home Assistant transport (tests). */
  haClient?: HomeAssistantTransport;
  /** Override the WebSocket factory (tests). */
  webSocketImpl?: (url: string) => WebSocket;
};

export type HomeslateAgent = {
  start(): void;
  stop(): Promise<void>;
  onStateChange(listener: (state: AgentConnectionState) => void): () => void;
};

/**
 * Create a LAN agent that dials out to a homeslate relay and serves the
 * allowlisted Home Assistant climate methods over that socket. Nothing listens
 * on the LAN; the Home Assistant token stays in this process.
 */
export function createHomeslateAgent(options: HomeslateAgentOptions): HomeslateAgent {
  const haClient =
    options.haClient ??
    createHomeAssistantClient({ baseUrl: options.baseUrl, token: options.haToken });
  const agentId = options.agentId ?? randomUUID();
  const openSocket = options.webSocketImpl ?? ((url: string) => new WebSocket(url));

  const listeners = new Set<(state: AgentConnectionState) => void>();
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let attempt = 0;
  let stopped = true;
  let state: AgentConnectionState = "disconnected";

  function setState(next: AgentConnectionState): void {
    if (state === next) return;
    state = next;
    for (const listener of listeners) listener(next);
  }

  function send(message: AgentMessage): void {
    socket?.send(encodeAgentMessage(message));
  }

  async function handleRequest(
    id: string,
    method: AgentMethod,
    params: Record<string, unknown>,
  ): Promise<void> {
    const check = validateAgentRequestParams(method, params);
    if (!check.ok) {
      send({ type: "response", id, ok: false, status: 400, error: check.error });
      return;
    }

    try {
      let response: AgentResponseMessage;
      switch (method) {
        case "climate.entities.list":
          response = {
            type: "response",
            id,
            ok: true,
            result: await haClient.listClimateEntities(),
          };
          break;
        case "climate.state.get":
          response = {
            type: "response",
            id,
            ok: true,
            result: await haClient.getClimateState(params.entityId as string),
          };
          break;
        case "climate.service.call": {
          const data =
            params.data && typeof params.data === "object"
              ? (params.data as Record<string, unknown>)
              : {};
          await haClient.callClimateService(
            params.service as string,
            params.entityId as string,
            data,
          );
          response = { type: "response", id, ok: true, result: { ok: true } };
          break;
        }
      }
      send(response);
    } catch (error) {
      const status = error instanceof HomeAssistantError ? error.status : 502;
      send({
        type: "response",
        id,
        ok: false,
        status,
        error: error instanceof Error ? error.message : "Agent request failed",
      });
    }
  }

  function handleMessage(raw: unknown): void {
    const message = decodeAgentMessage(raw);
    if (!message) return;
    switch (message.type) {
      case "welcome":
        attempt = 0;
        setState("connected");
        return;
      case "request":
        void handleRequest(message.id, message.method, message.params);
        return;
      case "ping":
        send({ type: "pong" });
        return;
      default:
        return;
    }
  }

  function scheduleReconnect(): void {
    if (stopped || reconnectTimer) return;
    const delay = nextReconnectDelay(attempt);
    attempt += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  }

  function connect(): void {
    if (stopped) return;
    setState("connecting");
    let ws: WebSocket;
    try {
      ws = openSocket(options.relayUrl);
    } catch {
      // Bad URL / factory failure: treat it like a dropped socket so we back
      // off instead of throwing out of a reconnect timer.
      setState("disconnected");
      scheduleReconnect();
      return;
    }
    socket = ws;

    ws.onopen = () => {
      send({
        type: "hello",
        protocol: AGENT_PROTOCOL_VERSION,
        accountId: options.accountId,
        agentId,
        token: options.token,
        agent: { version: options.agentVersion ?? "", haBaseUrl: options.baseUrl },
      });
    };
    ws.onmessage = (event) => handleMessage(event.data);
    ws.onclose = () => {
      if (socket === ws) socket = null;
      setState("disconnected");
      scheduleReconnect();
    };
  }

  return {
    start() {
      stopped = false;
      connect();
    },
    async stop() {
      stopped = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      const ws = socket;
      socket = null;
      ws?.close();
      setState("disconnected");
    },
    onStateChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Create an agent and start it. */
export function startHomeslateAgent(options: HomeslateAgentOptions): HomeslateAgent {
  const agent = createHomeslateAgent(options);
  agent.start();
  return agent;
}
