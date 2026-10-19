/** One normalized event returned by a Home Assistant `calendar` entity. */
export interface HomeAssistantCalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  /** ISO datetime (or ISO date for all-day events). */
  start: string;
  end: string;
  allDay: boolean;
}

export const CALENDAR_EMPTY_COPY = "Pick a Home Assistant calendar in settings.";
export const CALENDAR_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";
