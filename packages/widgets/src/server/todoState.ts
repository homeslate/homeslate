import type { HomeAssistantTodoItem, HomeAssistantTodoStatus } from "../widgets/homeAssistantTodo";

/**
 * Home Assistant `todo` services the host proxy is willing to forward. Reading
 * items goes through `get_items` internally via a dedicated route, so it is not
 * part of this write allowlist.
 */
export const TODO_WRITE_SERVICES = ["add_item", "update_item", "remove_item"] as const;

/**
 * Every `todo` service the proxy will forward, mapped to the data keys it
 * accepts. `get_items` is a read (used with `return_response` by the items
 * route); the rest are writes. The domain registry reads this map.
 */
export const TODO_SERVICE_KEYS: Record<string, readonly string[]> = {
  get_items: [],
  add_item: ["item"],
  update_item: ["item", "status", "summary"],
  remove_item: ["item"],
};

/** Entity-id shape for the `todo` domain; also seeded into the registry. */
export const TODO_ENTITY_ID = /^todo\.[a-z0-9_]+$/;

export function isValidTodoEntityId(id: string): boolean {
  return TODO_ENTITY_ID.test(id);
}

export function isAllowedTodoService(service: string): boolean {
  return (TODO_WRITE_SERVICES as readonly string[]).includes(service);
}

const TODO_STATUSES: readonly HomeAssistantTodoStatus[] = ["needs_action", "completed"];

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Build the exact payload Home Assistant expects for a todo service call,
 * dropping unknown keys and rejecting missing/invalid required fields.
 */
export function buildTodoServicePayload(
  service: string,
  entityId: string,
  data: Record<string, unknown>,
): Record<string, unknown> | null {
  if (!isValidTodoEntityId(entityId)) return null;
  if (service === "get_items") return { entity_id: entityId };
  if (!isAllowedTodoService(service)) return null;

  const item = stringOrNull(data.item);
  if (!item) return null;

  const payload: Record<string, unknown> = { entity_id: entityId, item };
  if (service === "update_item") {
    const status = data.status;
    const summary = stringOrNull(data.summary);
    if (typeof status === "string" && (TODO_STATUSES as readonly string[]).includes(status)) {
      payload.status = status;
    }
    if (summary) payload.summary = summary;
    if (payload.status === undefined && payload.summary === undefined) return null;
  }
  return payload;
}

/** Unwrap the service response, which HA nests under `service_response` on some paths. */
function serviceResponse(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const value = raw as Record<string, unknown>;
  const nested = value.service_response;
  if (nested && typeof nested === "object") return nested as Record<string, unknown>;
  return value;
}

/**
 * Map a raw `todo.get_items` response into normalized items. Accepts either the
 * REST shape (`{ "todo.x": { items } }`), the websocket wrapper
 * (`{ service_response: {...} }`), or a bare `{ items }`.
 */
export function mapTodoItems(raw: unknown, entityId: string): HomeAssistantTodoItem[] {
  const response = serviceResponse(raw);
  const container = response[entityId];
  const items =
    container && typeof container === "object"
      ? (container as Record<string, unknown>).items
      : response.items;
  if (!Array.isArray(items)) return [];

  return items.flatMap((entry): HomeAssistantTodoItem[] => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    const summary = stringOrNull(record.summary) ?? stringOrNull(record.name);
    if (!summary) return [];
    const uid = stringOrNull(record.uid) ?? summary;
    const status: HomeAssistantTodoStatus =
      record.status === "completed" ? "completed" : "needs_action";
    return [{ uid, summary, status }];
  });
}
