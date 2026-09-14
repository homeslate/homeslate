import { Box, Group, Select, Stack, Switch, Text, Textarea, TextInput } from "@mantine/core";
import type { TextAlign, WidgetConfig, WidgetProps } from "../types";
import { isAnnouncementVisible } from "./announcement";
import * as classes from "./listWidget.styles";

export interface AnnouncementConfig extends WidgetConfig {
  body: string;
  textAlign: TextAlign;
  size: "md" | "lg" | "xl";
  showFrom?: string;
  showUntil?: string;
  transparentBackground: boolean;
}

export function AnnouncementWidget({ widget, isEditing }: WidgetProps<AnnouncementConfig>) {
  const {
    body = "",
    textAlign = "left",
    size = "lg",
    showFrom,
    showUntil,
    transparentBackground,
  } = widget.config;
  const visible = isAnnouncementVisible(new Date(), showFrom, showUntil);
  const sizeClass =
    size === "xl" ? classes.sizeXl : size === "md" ? classes.sizeMd : classes.sizeLg;

  if (!isEditing && (!body.trim() || !visible)) {
    return (
      <Box className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`} />
    );
  }

  return (
    <Box
      className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}
      style={{ textAlign }}
    >
      {!body.trim() ? (
        <div className={classes.empty}>
          <Text size="sm" c="dimmed">
            Write the announcement.
          </Text>
        </div>
      ) : (
        <>
          {!visible && (
            <Text size="xs" c="dimmed">
              Hidden on kiosk {showFrom && new Date() < new Date(showFrom) ? "until" : "after"} the
              scheduled window.
            </Text>
          )}
          <div className={`${classes.announcement} ${sizeClass}`}>{body}</div>
        </>
      )}
    </Box>
  );
}

export function AnnouncementWidgetSettings({
  widget,
  onConfigChange,
}: WidgetProps<AnnouncementConfig>) {
  const {
    body = "",
    textAlign = "left",
    size = "lg",
    showFrom = "",
    showUntil = "",
    transparentBackground,
  } = widget.config;

  return (
    <Stack gap="md">
      <Textarea
        label="Announcement"
        minRows={3}
        value={body}
        onChange={(event) => onConfigChange({ body: event.currentTarget.value })}
      />
      <Select
        label="Size"
        data={[
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
          { value: "xl", label: "Extra large" },
        ]}
        value={size}
        onChange={(value) => {
          if (value === "md" || value === "lg" || value === "xl") {
            onConfigChange({ size: value });
          }
        }}
      />
      <Select
        label="Align"
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
      <TextInput
        label="Show from"
        type="datetime-local"
        value={showFrom}
        onChange={(event) => onConfigChange({ showFrom: event.currentTarget.value || undefined })}
      />
      <TextInput
        label="Show until"
        type="datetime-local"
        value={showUntil}
        onChange={(event) => onConfigChange({ showUntil: event.currentTarget.value || undefined })}
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
