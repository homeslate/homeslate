import {
  HomeAssistantTransportError,
  type HomeAssistantServiceOptions,
  type HomeAssistantStatus,
  type HomeAssistantTransport,
} from "@homeslate/server";
import {
  validateAgentRequestParams,
  type AgentMethod,
  type HomeAssistantEntitySummary,
  type HomeAssistantState,
} from "@homeslate/widgets/server";
import type { RelayCore } from "./core";

/** A relay-backed transport, with a `status()` the status route can surface. */
export interface RelayHomeAssistantTransport extends HomeAssistantTransport {
  status(): Promise<Partial<HomeAssistantStatus>>;
}

/**
 * Adapt the relay core to the `HomeAssistantTransport` interface the
 * `/api/homeassistant/*` routes depend on. The routes never learn that a relay
 * or a LAN agent is involved. Params are re-validated here so an out-of-scope
 * call is rejected before it reaches the agent socket (defense in depth).
 */
export function createRelayHomeAssistantTransport(
  core: RelayCore,
  accountId: string,
): RelayHomeAssistantTransport {
  function guardedRequest(method: AgentMethod, params: Record<string, unknown>): Promise<unknown> {
    const check = validateAgentRequestParams(method, params);
    if (!check.ok) {
      return Promise.reject(new HomeAssistantTransportError(400, check.error));
    }
    return core.request(accountId, method, params);
  }

  return {
    async listEntities(domain) {
      const result = await guardedRequest("entities.list", { domain });
      return Array.isArray(result) ? (result as HomeAssistantEntitySummary[]) : [];
    },

    async getEntity(entityId) {
      const result = await guardedRequest("entity.get", { entityId });
      return (result ?? null) as HomeAssistantState | null;
    },

    async callService(domain, service, entityId, data, options?: HomeAssistantServiceOptions) {
      const returnResponse = options?.returnResponse === true;
      const result = await guardedRequest("service.call", {
        domain,
        service,
        entityId,
        data,
        returnResponse,
      });
      return returnResponse ? result : undefined;
    },

    async status() {
      return { connected: core.connected(accountId) };
    },
  };
}
