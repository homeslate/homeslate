import type { HomeAssistantStatus, HomeAssistantTransport } from "@homeslate/server";
import type { HomeAssistantEntitySummary, ThermostatState } from "@homeslate/widgets/server";
import type { RelayCore } from "./core";

/** A relay-backed transport, with a `status()` the status route can surface. */
export interface RelayHomeAssistantTransport extends HomeAssistantTransport {
  status(): Promise<Partial<HomeAssistantStatus>>;
}

/**
 * Adapt the relay core to the `HomeAssistantTransport` interface the
 * `/api/homeassistant/*` routes depend on. The routes never learn that a relay
 * or a LAN agent is involved.
 */
export function createRelayHomeAssistantTransport(
  core: RelayCore,
  accountId: string,
): RelayHomeAssistantTransport {
  return {
    async listClimateEntities() {
      const result = await core.request(accountId, "climate.entities.list", {});
      return Array.isArray(result) ? (result as HomeAssistantEntitySummary[]) : [];
    },

    async getClimateState(entityId) {
      const result = await core.request(accountId, "climate.state.get", { entityId });
      return (result ?? null) as ThermostatState | null;
    },

    async callClimateService(service, entityId, data) {
      await core.request(accountId, "climate.service.call", { entityId, service, data });
    },

    async status() {
      return { connected: core.connected(accountId) };
    },
  };
}
