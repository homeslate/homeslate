export const AGENT_PACKAGE_NAME = "@homeslate/agent";

export {
  createHomeslateAgent,
  startHomeslateAgent,
  type AgentConnectionState,
  type HomeslateAgent,
  type HomeslateAgentOptions,
} from "./agent";
export { nextReconnectDelay } from "./backoff";
