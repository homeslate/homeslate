import type { HomeAssistantCalendarEvent } from "../widgets/homeAssistantCalendar";

/** Entity-id shape for the `calendar` domain; also seeded into the registry. */
export const CALENDAR_ENTITY_ID = /^calendar\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Unwrap the service response, which HA nests under `service_response` on some paths. */
function serviceResponse(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const value = raw as Record<string, unknown>;
  const nested = value.service_response;
  if (nested && typeof nested === "object") return nested as Record<string, unknown>;
  return value;
}

function dateValue(value: unknown): { iso: string; allDay: boolean } | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const dateTime = stringOrNull(record.dateTime);
  if (dateTime) return { iso: dateTime, allDay: false };
  const date = stringOrNull(record.date);
  if (date) return { iso: date, allDay: true };
  return null;
}

/**
 * Map a raw `calendar.get_events` response into normalized events. Accepts the
 * REST shape (`{ "calendar.home": { events } }`), the websocket wrapper
 * (`{ service_response: {…} }`), or a bare `{ events }`.
 */
export function mapCalendarEvents(raw: unknown, entityId: string): HomeAssistantCalendarEvent[] {
  const response = serviceResponse(raw);
  const container = response[entityId];
  const events =
    container && typeof container === "object"
      ? (container as Record<string, unknown>).events
      : response.events;
  if (!Array.isArray(events)) return [];

  return events.flatMap((entry, index): HomeAssistantCalendarEvent[] => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    const start = dateValue(record.start);
    const end = dateValue(record.end);
    const title = stringOrNull(record.summary);
    if (!start || !end || !title) return [];
    return [
      {
        id: stringOrNull(record.uid) ?? `${start.iso}-${index}`,
        title,
        ...(stringOrNull(record.description)
          ? { description: stringOrNull(record.description) ?? undefined }
          : {}),
        ...(stringOrNull(record.location)
          ? { location: stringOrNull(record.location) ?? undefined }
          : {}),
        start: start.iso,
        end: end.iso,
        allDay: start.allDay,
      },
    ];
  });
}
