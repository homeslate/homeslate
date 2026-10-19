/** Home Assistant `todo` item status. */
export type HomeAssistantTodoStatus = "needs_action" | "completed";

/** Normalized Home Assistant `todo` item, produced by `mapTodoItems` on the host. */
export interface HomeAssistantTodoItem {
  /** Stable id from Home Assistant, used for updates and removal. */
  uid: string;
  summary: string;
  status: HomeAssistantTodoStatus;
}

export const TODO_EMPTY_COPY = "Pick a Home Assistant list in settings.";
export const TODO_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

export function homeAssistantTodoItemsUrl(entityId: string): string {
  return `/api/homeassistant/todo/${encodeURIComponent(entityId)}/items`;
}
