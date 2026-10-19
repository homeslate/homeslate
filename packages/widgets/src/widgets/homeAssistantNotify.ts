export type NotifyMode = "notify" | "tts";

export const NOTIFY_EMPTY_COPY = "Pick a notification or TTS target in settings.";
export const NOTIFY_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";
export const NOTIFY_NO_MESSAGE_COPY = "Enter a message first.";
export const NOTIFY_TTS_NO_MEDIA_PLAYER_COPY = "Pick a media player for spoken announcements.";
export const NOTIFY_TARGET_MISSING_COPY = "The selected target is unavailable.";

/** Payload for `notify.send_message`; `title` is omitted when blank. */
export function buildNotifyPayload(message: string, title: string): Record<string, unknown> | null {
  const trimmed = message.trim();
  if (!trimmed) return null;
  const payload: Record<string, unknown> = { message: trimmed };
  const trimmedTitle = title.trim();
  if (trimmedTitle) payload.title = trimmedTitle;
  return payload;
}

/** Payload for `tts.speak`; requires both a message and a media player target. */
export function buildTtsPayload(
  message: string,
  mediaPlayerEntityId: string,
): Record<string, unknown> | null {
  const trimmed = message.trim();
  if (!trimmed || !mediaPlayerEntityId) return null;
  return { message: trimmed, media_player_entity_id: mediaPlayerEntityId };
}

export function notifyTargetId(
  mode: NotifyMode,
  notifyEntityId: string,
  ttsEntityId: string,
): string {
  return mode === "notify" ? notifyEntityId : ttsEntityId;
}

export function notifyService(mode: NotifyMode): string {
  return mode === "notify" ? "send_message" : "speak";
}
