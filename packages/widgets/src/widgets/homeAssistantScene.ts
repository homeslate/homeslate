/** Domains a Scenes & Scripts widget can fire. */
export type SceneDomain = "scene" | "script" | "button" | "input_button";

export const SCENE_DOMAINS: readonly SceneDomain[] = ["scene", "script", "button", "input_button"];

/** One configured fire-and-forget item. */
export interface SceneItem {
  entityId: string;
  label?: string;
  icon?: string;
}

export const SCENES_EMPTY_COPY = "Pick scenes or scripts in settings.";
export const SCENES_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/** The allowlisted service that fires one entity, or `null` for another domain. */
export function sceneService(entityId: string): { domain: SceneDomain; service: string } | null {
  const dot = entityId.indexOf(".");
  if (dot <= 0) return null;
  const domain = entityId.slice(0, dot);
  switch (domain) {
    case "scene":
      return { domain, service: "turn_on" };
    case "script":
      return { domain, service: "turn_on" };
    case "button":
    case "input_button":
      return { domain, service: "press" };
    default:
      return null;
  }
}

/** The entity's display name: configured label, else its object id. */
export function sceneLabel(item: SceneItem): string {
  if (item.label && item.label.trim().length > 0) return item.label.trim();
  const dot = item.entityId.indexOf(".");
  const objectId = dot >= 0 ? item.entityId.slice(dot + 1) : item.entityId;
  return objectId.replace(/_/g, " ");
}
