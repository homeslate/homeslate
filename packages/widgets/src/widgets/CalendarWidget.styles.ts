import { styles } from "../typeStyles";

export const container = styles.class("calendarwidget-container", {
  height: "100%",
  padding: "var(--var-ui-widget-padding, var(--var-ui-space-4))",
  background:
    "linear-gradient(\n    135deg,\n    color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 8%, transparent) 0%,\n    color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 8%, transparent) 100%\n  )",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("calendarwidget-transparent", {
  background: "transparent",
});

export const content = styles.class("calendarwidget-content", {
  display: "flex",
  gap: "1rem",
  height: "100%",
  minHeight: "0",
  "@media (max-width: 600px)": {
    flexDirection: "column",
  },
});

export const calendarSection = styles.class("calendarwidget-calendarSection", {
  flex: "0 0 auto",
  "@media (max-width: 600px)": {
    flex: "0 0 auto",
  },
});

export const eventsSection = styles.class("calendarwidget-eventsSection", {
  flex: "1",
  minWidth: "0",
  display: "flex",
  flexDirection: "column",
  minHeight: "0",
});

export const eventsHeader = styles.class("calendarwidget-eventsHeader", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.75rem",
  flexShrink: "0",
});

export const eventsTitle = styles.class("calendarwidget-eventsTitle", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: "600",
  color: "var(--var-ui-color-tone-accent-foreground)",
});

export const eventsList = styles.class("calendarwidget-eventsList", {
  flex: "1",
  overflowY: "auto",
  minHeight: "0",
});

export const calendarHeader = styles.class("calendarwidget-calendarHeader", {
  color: "var(--var-ui-color-tone-accent-foreground)",
});

export const day = styles.class("calendarwidget-day", {
  "&[data-selected]": {
    background:
      "linear-gradient(\n    135deg,\n    var(--var-ui-color-tone-accent-foreground) 0%,\n    var(--var-ui-color-tone-accent-foreground) 100%\n  )",
  },
});

export const dayCell = styles.class("calendarwidget-dayCell", {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
});

export const eventDot = styles.class("calendarwidget-eventDot", {
  position: "absolute",
  bottom: "2px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "4px",
  height: "4px",
  borderRadius: "50%",
  background: "var(--var-ui-color-tone-accent-foreground)",
});

export const eventCard = styles.class("calendarwidget-eventCard", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  background: "var(--var-ui-color-background-surface)",
  border: "1px solid var(--var-ui-color-border-default)",
  transition: "transform 0.2s ease,\n    box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateX(4px)",
    boxShadow: "var(--var-ui-shadow-md, 0 4px 12px var(--var-ui-color-ring-default))",
  },
});

export const eventIndicator = styles.class("calendarwidget-eventIndicator", {
  width: "4px",
  height: "100%",
  minHeight: "40px",
  borderRadius: "2px",
  flexShrink: "0",
});

export const eventContent = styles.class("calendarwidget-eventContent", {
  flex: "1",
  minWidth: "0",
});

export const empty = styles.class("calendarwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "0.5rem",
});

export const emptyIcon = styles.class("calendarwidget-emptyIcon", {
  color: "var(--var-ui-color-tone-accent-foreground)",
  opacity: "0.5",
});

export const loading = styles.class("calendarwidget-loading", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  gap: "0.5rem",
});

export const error = styles.class("calendarwidget-error", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

export const helpBox = styles.class("calendarwidget-helpBox", {
  background: "var(--var-ui-color-background-surface)",
  border: "1px solid var(--var-ui-color-border-default)",
  "& ol": {
    lineHeight: "1.8",
  },
});
