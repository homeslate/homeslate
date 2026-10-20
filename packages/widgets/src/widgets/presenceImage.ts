import { homeAssistantImageProxyUrl } from "./homeAssistantMediaPlayer";

export type PresenceAvatarPresentation = { kind: "image"; src: string } | { kind: "initials" };

/**
 * Avatar to render for a person or device. Pictures go through the host image
 * proxy; a missing picture or a failed load falls back to initials.
 */
export function presenceAvatarPresentation(
  entityPicture: string | null | undefined,
  failed: boolean,
): PresenceAvatarPresentation {
  const src = entityPicture ? homeAssistantImageProxyUrl(entityPicture) : null;
  if (!src || failed) return { kind: "initials" };
  return { kind: "image", src };
}
