import { styles } from "../typeStyles";

export const container = styles.class("googlecalendarwidget-container", {
  height: "100%",
  padding: "0.875rem",
  background:
    "linear-gradient(\n    135deg,\n    color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 8%, transparent) 0%,\n    color-mix(in srgb, var(--var-ui-color-tone-success-foreground) 8%, transparent) 100%\n  )",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("googlecalendarwidget-transparent", {
  background: "transparent",
});

export const content = styles.class("googlecalendarwidget-content", {
  display: "flex",
  gap: "1rem",
  flex: "1",
  minHeight: "0",
  "@media (max-width: 600px)": {
    flexDirection: "column",
  },
});

export const calendarSection = styles.class("googlecalendarwidget-calendarSection", {
  flex: "0 0 auto",
  "@media (max-width: 600px)": {
    flex: "0 0 auto",
  },
});

export const calendarHeader = styles.class("googlecalendarwidget-calendarHeader", {
  color: "var(--var-ui-color-tone-accent-foreground)",
  fontSize: "0.82rem",
});

export const dayCell = styles.class("googlecalendarwidget-dayCell", {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  gap: "1px",
});

export const eventDots = styles.class("googlecalendarwidget-eventDots", {
  display: "flex",
  gap: "2px",
  position: "absolute",
  bottom: "1px",
  left: "50%",
  transform: "translateX(-50%)",
});

export const eventDotColored = styles.class("googlecalendarwidget-eventDotColored", {
  width: "4px",
  height: "4px",
  borderRadius: "50%",
});

export const eventsSection = styles.class("googlecalendarwidget-eventsSection", {
  flex: "1",
  minWidth: "0",
  display: "flex",
  flexDirection: "column",
  minHeight: "0",
});

export const eventsHeader = styles.class("googlecalendarwidget-eventsHeader", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.5rem",
  flexShrink: "0",
});

export const eventsTitle = styles.class("googlecalendarwidget-eventsTitle", {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.68rem",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "var(--var-ui-color-text-secondary)",
});

export const addBtn = styles.class("googlecalendarwidget-addBtn", {
  color:
    "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 70%, transparent) !important",
  "&:hover": {
    color: "var(--var-ui-color-tone-accent-foreground) !important",
    background:
      "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 12%, transparent) !important",
  },
});

export const refreshBtn = styles.class("googlecalendarwidget-refreshBtn", {
  color: "var(--var-ui-color-text-secondary) !important",
  "&:hover": {
    color: "var(--var-ui-color-text-primary) !important",
    background: "var(--var-ui-color-background-surface) !important",
  },
});

export const eventsList = styles.class("googlecalendarwidget-eventsList", {
  flex: "1",
  minHeight: "0",
});

export const dayGroup = styles.class("googlecalendarwidget-dayGroup", {
  marginBottom: "0.625rem",
  "&:last-child": {
    marginBottom: "0",
  },
});

export const dayHeader = styles.class("googlecalendarwidget-dayHeader", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "0.3rem",
});

export const dayHeaderLabel = styles.class("googlecalendarwidget-dayHeaderLabel", {
  fontSize: "0.65rem",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--var-ui-color-text-secondary)",
  whiteSpace: "nowrap",
  flexShrink: "0",
});

export const dayHeaderToday = styles.class("googlecalendarwidget-dayHeaderToday", {
  color: "var(--var-ui-color-tone-accent-foreground)",
});

export const dayHeaderLine = styles.class("googlecalendarwidget-dayHeaderLine", {
  flex: "1",
  height: "1px",
  background: "var(--var-ui-color-border-default)",
});

export const eventCard = styles.class("googlecalendarwidget-eventCard", {
  display: "flex",
  alignItems: "stretch",
  background: "var(--var-ui-color-background-surface)",
  border: "1px solid var(--var-ui-color-border-default)",
  borderRadius: "7px",
  overflow: "hidden",
  marginBottom: "0.3rem",
  cursor: "pointer",
  transition: "background 0.15s ease,\n    transform 0.15s ease,\n    border-color 0.15s ease",
  "&:last-child": {
    marginBottom: "0",
  },
  "&:hover": {
    background:
      "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 8%, var(--var-ui-color-background-surface))",
    transform: "translateX(2px)",
    borderColor:
      "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 35%, var(--var-ui-color-border-default))",
  },
});

export const eventCardNow = styles.class("googlecalendarwidget-eventCardNow", {
  borderColor: "var(--var-ui-color-tone-success-border) !important",
  background: "var(--var-ui-color-tone-success-subtleBackground) !important",
  "&:hover": {
    background:
      "color-mix(\n    in srgb,\n    var(--var-ui-color-tone-success-foreground) 16%,\n    var(--var-ui-color-tone-success-subtleBackground)\n  ) !important",
  },
});

export const eventIndicator = styles.class("googlecalendarwidget-eventIndicator", {
  width: "3px",
  flexShrink: "0",
  borderRadius: "0",
});

export const eventBody = styles.class("googlecalendarwidget-eventBody", {
  flex: "1",
  minWidth: "0",
  padding: "0.45rem 0.6rem",
});

export const eventTitleRow = styles.class("googlecalendarwidget-eventTitleRow", {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.4rem",
  marginBottom: "0.15rem",
});

export const eventTitle = styles.class("googlecalendarwidget-eventTitle", {
  fontSize: "0.8rem",
  fontWeight: "600",
  color: "var(--var-ui-color-text-primary)",
  lineHeight: "1.3",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: "1",
  minWidth: "0",
});

export const nowBadge = styles.class("googlecalendarwidget-nowBadge", {
  fontSize: "0.58rem",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--var-ui-color-tone-success-foreground)",
  background: "var(--var-ui-color-tone-success-subtleBackground)",
  border: "1px solid var(--var-ui-color-tone-success-border)",
  borderRadius: "3px",
  padding: "1px 5px",
  lineHeight: "1.5",
  flexShrink: "0",
});

export const soonBadge = styles.class("googlecalendarwidget-soonBadge", {
  fontSize: "0.65rem",
  fontWeight: "500",
  color: "var(--var-ui-color-text-secondary)",
  whiteSpace: "nowrap",
  flexShrink: "0",
  lineHeight: "1.3",
  marginTop: "1px",
});

export const eventMeta = styles.class("googlecalendarwidget-eventMeta", {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  flexWrap: "wrap",
});

export const timeRange = styles.class("googlecalendarwidget-timeRange", {
  fontSize: "0.7rem",
  color: "var(--var-ui-color-text-secondary)",
});

export const calendarBadge = styles.class("googlecalendarwidget-calendarBadge", {
  fontSize: "0.62rem",
  fontWeight: "500",
  padding: "0 5px",
  borderRadius: "3px",
  border: "1px solid",
  lineHeight: "1.7",
  opacity: "0.75",
  maxWidth: "90px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const eventLocation = styles.class("googlecalendarwidget-eventLocation", {
  display: "flex",
  alignItems: "center",
  gap: "3px",
  fontSize: "0.67rem",
  color: "var(--var-ui-color-text-secondary)",
  marginTop: "0.15rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const signIn = styles.class("googlecalendarwidget-signIn", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

export const googleIcon = styles.class("googlecalendarwidget-googleIcon", {
  color: "var(--var-ui-color-tone-accent-foreground)",
  marginBottom: "1rem",
});

export const googleButton = styles.class("googlecalendarwidget-googleButton", {
  background:
    "linear-gradient(\n    135deg,\n    var(--var-ui-color-tone-accent-foreground) 0%,\n    var(--var-ui-color-tone-success-foreground) 100%\n  )",
  "&:hover": {
    background:
      "linear-gradient(\n    135deg,\n    var(--var-ui-color-tone-accent-foreground) 0%,\n    var(--var-ui-color-tone-success-foreground) 100%\n  )",
  },
});

export const empty = styles.class("googlecalendarwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "0.5rem",
});

export const emptyIcon = styles.class("googlecalendarwidget-emptyIcon", {
  color: "var(--var-ui-color-tone-accent-foreground)",
  opacity: "0.45",
});

export const loading = styles.class("googlecalendarwidget-loading", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export const loadingEvents = styles.class("googlecalendarwidget-loadingEvents", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  gap: "0.5rem",
});

export const authSection = styles.class("googlecalendarwidget-authSection", {
  background: "var(--var-ui-color-background-surface)",
  border: "1px solid var(--var-ui-color-border-default)",
});

export const modalDetail = styles.class("googlecalendarwidget-modalDetail", {
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  paddingBottom: "0.5rem",
});

export const modalDetailRow = styles.class("googlecalendarwidget-modalDetailRow", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
});

export const modalDetailIcon = styles.class("googlecalendarwidget-modalDetailIcon", {
  color: "var(--var-ui-color-text-secondary)",
  flexShrink: "0",
  marginTop: "2px",
});

export const calendarHint = styles.class("googlecalendarwidget-calendarHint", {
  fontSize: "0.6rem",
  opacity: "0.4",
  userSelect: "none",
});

export const deleteConfirmRow = styles.class("googlecalendarwidget-deleteConfirmRow", {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const timeGrid = styles.class("googlecalendarwidget-timeGrid", {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem",
});
