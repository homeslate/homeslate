export const RELAY_PACKAGE_NAME = "@homeslate/relay";

export { createAgentRegistry } from "./registry";
export type { AgentHandle, AgentRegistry } from "./registry";
export { createRelayCore } from "./core";
export type { RelayCore, RelayCoreOptions } from "./core";
export { authorizeHello, createRelaySession } from "./session";
export type {
  AgentBinding,
  HelloAuthenticator,
  RelaySession,
  RelaySessionOptions,
  RelaySessionState,
  RelaySocket,
} from "./session";
export { createRelayHomeAssistantTransport } from "./transport";
export type { RelayHomeAssistantTransport } from "./transport";
export { createHomeAssistantRelay } from "./relay";
export type { HomeAssistantRelay, HomeAssistantRelayOptions } from "./relay";
