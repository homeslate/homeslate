import { useEffect, useState } from "react";
import { Box, Group, Select, Stack, Switch, Text, TextInput } from "@mantine/core";
import type { TextAlign, WidgetConfig, WidgetProps } from "../types";
import { countdownRemaining, formatCountdownParts } from "./countdown";
import * as classes from "./listWidget.styles";

export interface CountdownConfig extends WidgetConfig {
  target: string;
  allDay: boolean;
  label: string;
  showSeconds: boolean;
  transparentBackground: boolean;
  textAlign: TextAlign;
}

export function CountdownWidget({ widget }: WidgetProps<CountdownConfig>) {
  const {
    target = "",
    allDay = true,
    label = "",
    showSeconds = false,
    transparentBackground,
    textAlign = "center",
  } = widget.config;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), showSeconds ? 1000 : 60_000);
    return () => window.clearInterval(interval);
  }, [showSeconds]);

  const remaining = countdownRemaining(now, target, allDay);
  const title =
    label.trim() || (remaining.kind === "past" ? remaining.dateLabel : target) || "Countdown";

  return (
    <Box
      className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}
      style={{ textAlign }}
    >
      {remaining.kind === "invalid" ? (
        <div className={classes.empty}>
          <Text size="sm" c="dimmed">
            Pick a date in settings.
          </Text>
        </div>
      ) : (
        <>
          <Text size="sm" c="dimmed">
            {title}
          </Text>
          {remaining.kind === "past" ? (
            <Text className={classes.countdownValue} style={{ fontSize: "1.4rem" }}>
              It happened
            </Text>
          ) : (
            <Text className={classes.countdownValue} style={{ fontSize: "1.8rem" }}>
              {formatCountdownParts(remaining.parts, showSeconds)}
            </Text>
          )}
          {remaining.kind === "past" && (
            <Text size="sm" c="dimmed">
              {remaining.dateLabel}
            </Text>
          )}
        </>
      )}
    </Box>
  );
}

export function CountdownWidgetSettings({ widget, onConfigChange }: WidgetProps<CountdownConfig>) {
  const {
    target = "",
    allDay = true,
    label = "",
    showSeconds = false,
    transparentBackground,
    textAlign = "center",
  } = widget.config;

  return (
    <Stack gap="md">
      <TextInput
        label="Label"
        value={label}
        onChange={(event) => onConfigChange({ label: event.currentTarget.value })}
      />
      <TextInput
        label={allDay ? "Date" : "Date and time"}
        type={allDay ? "date" : "datetime-local"}
        value={target}
        onChange={(event) => onConfigChange({ target: event.currentTarget.value })}
      />
      <Group justify="space-between">
        <Text size="sm">All-day</Text>
        <Switch
          checked={allDay}
          onChange={(event) => onConfigChange({ allDay: event.currentTarget.checked })}
        />
      </Group>
      <Group justify="space-between">
        <Text size="sm">Show seconds</Text>
        <Switch
          checked={showSeconds}
          onChange={(event) => onConfigChange({ showSeconds: event.currentTarget.checked })}
        />
      </Group>
      <Select
        label="Text align"
        data={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ]}
        value={textAlign}
        onChange={(value) => {
          if (value === "left" || value === "center" || value === "right") {
            onConfigChange({ textAlign: value });
          }
        }}
      />
      <Group justify="space-between">
        <Text size="sm">Transparent background</Text>
        <Switch
          checked={transparentBackground}
          onChange={(event) =>
            onConfigChange({ transparentBackground: event.currentTarget.checked })
          }
        />
      </Group>
    </Stack>
  );
}
