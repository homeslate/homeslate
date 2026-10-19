import { describeEntityTile, type EntityTileDescriptor } from "./homeAssistantTile";

export interface RoomSummary {
  /** Non-cover entities that are on. */
  on: number;
  /** Covers that are open. */
  open: number;
  total: number;
  allOff: boolean;
  rows: EntityTileDescriptor[];
}

export const ROOM_EMPTY_COPY = "Pick lights, switches, or covers in settings.";
export const ROOM_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/**
 * Summarize a manual room group. Rows are ordered by the configured entity
 * order; missing entities are skipped.
 */
export function summarizeRoom(
  entityIds: string[],
  entities: Array<Record<string, unknown>>,
): RoomSummary {
  const byId = new Map(
    entities
      .filter((entity) => typeof entity.entityId === "string")
      .map((entity) => [entity.entityId as string, entity]),
  );
  const rows = entityIds.flatMap((entityId) => {
    const entity = byId.get(entityId);
    return entity ? [describeEntityTile(entityId, entity)] : [];
  });
  const on = rows.filter((row) => row.control !== "position" && row.isOn === true).length;
  const open = rows.filter((row) => row.control === "position" && row.isOn === true).length;
  return { on, open, total: rows.length, allOff: on === 0 && open === 0, rows };
}
