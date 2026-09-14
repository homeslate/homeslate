import { useState } from "react";
import {
  Text,
  Stack,
  TextField,
  Switch,
  NumberInput,
  HStack,
  Surface,
  Spinner,
  Button,
  Link,
  Collapsible,
  Calendar,
} from "@var-ui/react";
import { IconCalendarEvent, IconRefresh } from "@tabler/icons-react";
import type { WidgetProps, WidgetConfig } from "../types";
import { useCalendar } from "../hooks/useCalendar";
import { WidgetDataStatus } from "../chrome/WidgetDataStatus";
import type { CalendarEvent } from "../services/calendar";
import * as classes from "./CalendarWidget.styles";
import dayjs from "dayjs";

export interface CalendarConfig extends WidgetConfig {
  icalUrl: string;
  showWeekNumbers: boolean;
  maxEvents: number;
  daysAhead: number;
  showCalendar: boolean;
  transparentBackground: boolean;
}

const eventColors = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
];

function getEventColor(index: number): string {
  return eventColors[index % eventColors.length];
}

function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) {
    return "All day";
  }
  return dayjs(event.start).format("h:mm A");
}

function formatEventDate(event: CalendarEvent): string {
  const today = dayjs().startOf("day");
  const eventDay = dayjs(event.start).startOf("day");
  const diff = eventDay.diff(today, "day");

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return dayjs(event.start).format("dddd");
  return dayjs(event.start).format("ddd, MMM D");
}

export function CalendarWidget({ widget }: WidgetProps<CalendarConfig>) {
  const { icalUrl, maxEvents, daysAhead, showCalendar, transparentBackground } = widget.config;

  const { events, isLoading, error, refresh, lastUpdated } = useCalendar({
    icalUrl,
    daysAhead,
  });

  const upcomingEvents = events.slice(0, maxEvents);

  if (!icalUrl) {
    return (
      <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
        <div className={classes.empty}>
          <IconCalendarEvent size={48} className={classes.emptyIcon} />
          <Text size="lg" weight="medium">
            No Calendar Connected
          </Text>
          <Text size="sm" tone="secondary" style={{ textAlign: "center" }}>
            Add your calendar's iCal URL in settings
          </Text>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
        <div className={classes.error}>
          <Text size="sm" style={{ color: "var(--var-ui-color-danger)" }}>
            {error}
          </Text>
          <Button appearance="subtle" size="sm" onPress={refresh}>
            <IconRefresh size={14} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
      <div className={classes.content}>
        {showCalendar && (
          <div className={`${classes.calendarSection} ${classes.calendarHeader} ${classes.day}`}>
            <Calendar aria-label="Month calendar" />
          </div>
        )}
        <div className={classes.eventsSection}>
          <div className={classes.eventsHeader}>
            <Text className={classes.eventsTitle}>
              <IconCalendarEvent size={16} />
              Upcoming Events
            </Text>
            {isLoading && <Spinner size="sm" />}
          </div>
          <WidgetDataStatus
            widgetId={widget.id}
            lastUpdated={lastUpdated}
            error={error}
            isLoading={isLoading}
          />

          {isLoading && events.length === 0 ? (
            <div className={classes.loading}>
              <Spinner size="sm" />
              <Text size="xs" tone="secondary">
                Loading events...
              </Text>
            </div>
          ) : (
            <Stack gap="xs" className={classes.eventsList}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <Surface key={event.id} className={classes.eventCard} padding="sm">
                    <div
                      className={classes.eventIndicator}
                      style={{ backgroundColor: getEventColor(index) }}
                    />
                    <div className={classes.eventContent}>
                      <Text size="sm" weight="medium" lineClamp={1}>
                        {event.title}
                      </Text>
                      <HStack gap="xs">
                        <Text size="xs" tone="secondary">
                          {formatEventDate(event)}
                        </Text>
                        <Text size="xs" tone="secondary">
                          •
                        </Text>
                        <Text size="xs" tone="secondary">
                          {formatEventTime(event)}
                        </Text>
                      </HStack>
                      {event.location && (
                        <Text size="xs" tone="secondary" lineClamp={1}>
                          📍 {event.location}
                        </Text>
                      )}
                    </div>
                  </Surface>
                ))
              ) : (
                <Text size="sm" tone="secondary" style={{ textAlign: "center" }}>
                  No upcoming events
                </Text>
              )}
            </Stack>
          )}
        </div>
      </div>
    </div>
  );
}

export function CalendarWidgetSettings({ widget, onConfigChange }: WidgetProps<CalendarConfig>) {
  const { icalUrl, showWeekNumbers, maxEvents, daysAhead, showCalendar } = widget.config;
  const [showHelp, setShowHelp] = useState(false);

  return (
    <Stack gap="md">
      <div>
        <TextField
          label="Calendar URL (iCal/ICS)"
          placeholder="https://calendar.google.com/calendar/ical/..."
          description="Paste your calendar's iCal feed URL"
          value={icalUrl}
          onChange={(value) => onConfigChange({ icalUrl: value })}
        />

        <Collapsible
          title="How to get your calendar URL"
          isExpanded={showHelp}
          onExpandedChange={setShowHelp}
        >
          <Surface padding="sm" className={classes.helpBox}>
            <Text size="sm" weight="semibold">
              Google Calendar:
            </Text>
            <ol style={{ paddingLeft: "1rem", margin: 0 }}>
              <li>
                Open{" "}
                <Link href="https://calendar.google.com" target="_blank">
                  Google Calendar
                </Link>
              </li>
              <li>Click the ⋮ menu next to your calendar</li>
              <li>Select "Settings and sharing"</li>
              <li>Scroll to "Secret address in iCal format"</li>
              <li>Copy the URL</li>
            </ol>

            <Text size="sm" weight="semibold">
              Outlook/Office 365:
            </Text>
            <ol style={{ paddingLeft: "1rem", margin: 0 }}>
              <li>Go to Calendar settings</li>
              <li>Find "Shared calendars"</li>
              <li>Publish your calendar</li>
              <li>Copy the ICS link</li>
            </ol>

            <Text size="sm" weight="semibold">
              Apple iCloud:
            </Text>
            <ol style={{ paddingLeft: "1rem", margin: 0 }}>
              <li>Open Calendar app</li>
              <li>Right-click calendar → Share Calendar</li>
              <li>Check "Public Calendar"</li>
              <li>Copy the URL</li>
            </ol>
          </Surface>
        </Collapsible>
      </div>

      <HStack justify="between">
        <Text size="sm">Show Calendar</Text>
        <Switch
          aria-label="Show Calendar"
          isSelected={showCalendar}
          onChange={(value) => onConfigChange({ showCalendar: value })}
        />
      </HStack>

      <HStack justify="between">
        <Text size="sm">Show Week Numbers</Text>
        <Switch
          aria-label="Show Week Numbers"
          isSelected={showWeekNumbers}
          onChange={(value) => onConfigChange({ showWeekNumbers: value })}
        />
      </HStack>

      <NumberInput
        label="Maximum Events to Show"
        minValue={1}
        maxValue={20}
        value={maxEvents}
        onChange={(value) => onConfigChange({ maxEvents: Number(value) || 5 })}
      />

      <NumberInput
        label="Days Ahead"
        description="How many days ahead to fetch events"
        minValue={1}
        maxValue={90}
        value={daysAhead}
        onChange={(value) => onConfigChange({ daysAhead: Number(value) || 30 })}
      />
    </Stack>
  );
}
