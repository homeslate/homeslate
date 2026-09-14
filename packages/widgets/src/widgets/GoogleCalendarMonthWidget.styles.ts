import { styles } from "../typeStyles";

export const container = styles.class("googlecalendarmonthwidget-container", {
  height: "100%",
  padding: "0.875rem",
  background:
    "linear-gradient(\n    135deg,\n    color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 8%, transparent) 0%,\n    color-mix(in srgb, var(--var-ui-color-tone-success-foreground) 8%, transparent) 100%\n  )",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("googlecalendarmonthwidget-transparent", {
  background: "transparent",
});

export const header = styles.class("googlecalendarmonthwidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.5rem",
  flexShrink: "0",
});

export const title = styles.class("googlecalendarmonthwidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.68rem",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "var(--var-ui-color-text-secondary)",
});

export const refreshBtn = styles.class("googlecalendarmonthwidget-refreshBtn", {
  color: "var(--var-ui-color-text-secondary) !important",
  "&:hover": {
    color: "var(--var-ui-color-text-primary) !important",
    background: "var(--var-ui-color-background-surface) !important",
  },
});

export const addBtn = styles.class("googlecalendarmonthwidget-addBtn", {
  color: "var(--var-ui-color-text-secondary) !important",
  "&:hover": {
    color: "var(--var-ui-color-tone-accent-foreground) !important",
    background: "var(--var-ui-color-background-surface) !important",
  },
});

export const timeGrid = styles.class("googlecalendarmonthwidget-timeGrid", {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.5rem",
});

export const calendarWrap = styles.class("googlecalendarmonthwidget-calendarWrap", {
  flexShrink: "0",
  display: "flex",
  justifyContent: "center",
});

export const calendarHeader = styles.class("googlecalendarmonthwidget-calendarHeader", {
  color: "var(--var-ui-color-tone-accent-foreground)",
  fontSize: "0.82rem",
});

export const dayCell = styles.class("googlecalendarmonthwidget-dayCell", {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  gap: "1px",
});

export const eventDots = styles.class("googlecalendarmonthwidget-eventDots", {
  display: "flex",
  gap: "2px",
  position: "absolute",
  bottom: "1px",
  left: "50%",
  transform: "translateX(-50%)",
});

export const eventDot = styles.class("googlecalendarmonthwidget-eventDot", {
  width: "4px",
  height: "4px",
  borderRadius: "50%",
});

export const dayPanel = styles.class("googlecalendarmonthwidget-dayPanel", {
  flex: "1",
  minHeight: "0",
  display: "flex",
  flexDirection: "column",
  marginTop: "0.5rem",
  borderTop: "1px solid var(--var-ui-color-border-default)",
  paddingTop: "0.5rem",
});

export const dayPanelHeader = styles.class("googlecalendarmonthwidget-dayPanelHeader", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "0.35rem",
  flexShrink: "0",
});

export const dayPanelTitle = styles.class("googlecalendarmonthwidget-dayPanelTitle", {
  fontSize: "0.7rem",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--var-ui-color-tone-accent-foreground)",
});

export const eventCount = styles.class("googlecalendarmonthwidget-eventCount", {
  fontSize: "0.6rem",
  fontWeight: "700",
  background: "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 20%, transparent)",
  color: "var(--var-ui-color-tone-accent-foreground)",
  borderRadius: "10px",
  padding: "0 6px",
  lineHeight: "1.6",
});

export const dayEventsList = styles.class("googlecalendarmonthwidget-dayEventsList", {
  flex: "1",
  minHeight: "0",
});

export const eventCard = styles.class("googlecalendarmonthwidget-eventCard", {
  display: "flex",
  alignItems: "stretch",
  background: "var(--var-ui-color-background-surface)",
  border: "1px solid var(--var-ui-color-border-default)",
  borderRadius: "6px",
  overflow: "hidden",
  marginBottom: "0.25rem",
  "&:last-child": {
    marginBottom: "0",
  },
});

export const eventIndicator = styles.class("googlecalendarmonthwidget-eventIndicator", {
  width: "3px",
  flexShrink: "0",
});

export const eventBody = styles.class("googlecalendarmonthwidget-eventBody", {
  flex: "1",
  minWidth: "0",
  padding: "0.35rem 0.5rem",
});

export const eventTitle = styles.class("googlecalendarmonthwidget-eventTitle", {
  fontSize: "0.78rem",
  fontWeight: "600",
  color: "var(--var-ui-color-text-primary)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const eventTime = styles.class("googlecalendarmonthwidget-eventTime", {
  fontSize: "0.67rem",
  color: "var(--var-ui-color-text-secondary)",
  marginTop: "1px",
});

export const eventLocation = styles.class("googlecalendarmonthwidget-eventLocation", {
  display: "flex",
  alignItems: "center",
  gap: "3px",
  fontSize: "0.65rem",
  color: "var(--var-ui-color-text-secondary)",
  marginTop: "1px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const empty = styles.class("googlecalendarmonthwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "0.5rem",
});

export const authSection = styles.class("googlecalendarmonthwidget-authSection", {
  background: "var(--var-ui-color-background-surface)",
  border: "1px solid var(--var-ui-color-border-default)",
});
