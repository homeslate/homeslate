import { styles } from "../typeStyles";

export const container = styles.class("googlecalendardaywidget-container", {
  height: "100%",
  padding: "0.875rem",
  background:
    "linear-gradient(\n    135deg,\n    color-mix(in srgb, var(--token-color-brand-500) 8%, transparent) 0%,\n    color-mix(in srgb, var(--token-status-success-fg) 8%, transparent) 100%\n  )",
  borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("googlecalendardaywidget-transparent", {
  background: "transparent",
});

export const header = styles.class("googlecalendardaywidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.5rem",
  flexShrink: "0",
});

export const headerTitle = styles.class("googlecalendardaywidget-headerTitle", {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.68rem",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "var(--token-text-muted)",
});

export const addBtn = styles.class("googlecalendardaywidget-addBtn", {
  color: "color-mix(in srgb, var(--token-color-brand-500) 70%, transparent) !important",
  "&:hover": {
    color: "var(--token-color-brand-500) !important",
    background: "color-mix(in srgb, var(--token-color-brand-500) 12%, transparent) !important",
  },
});

export const refreshBtn = styles.class("googlecalendardaywidget-refreshBtn", {
  color: "var(--token-text-muted) !important",
  "&:hover": {
    color: "var(--token-text-primary) !important",
    background: "var(--token-surface-card) !important",
  },
});

export const eventsList = styles.class("googlecalendardaywidget-eventsList", {
  flex: "1",
  minHeight: "0",
});

export const dayGroup = styles.class("googlecalendardaywidget-dayGroup", {
  marginBottom: "0.625rem",
  "&:last-child": {
    marginBottom: "0",
  },
});

export const dayHeader = styles.class("googlecalendardaywidget-dayHeader", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "0.3rem",
});

export const dayHeaderLabel = styles.class("googlecalendardaywidget-dayHeaderLabel", {
  fontSize: "0.65rem",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--token-text-muted)",
  whiteSpace: "nowrap",
  flexShrink: "0",
});

export const dayHeaderToday = styles.class("googlecalendardaywidget-dayHeaderToday", {
  color: "var(--token-color-brand-500)",
});

export const dayHeaderLine = styles.class("googlecalendardaywidget-dayHeaderLine", {
  flex: "1",
  height: "1px",
  background: "var(--token-border-default)",
});

export const eventCard = styles.class("googlecalendardaywidget-eventCard", {
  display: "flex",
  alignItems: "stretch",
  background: "var(--token-surface-card)",
  border: "1px solid var(--token-border-default)",
  borderRadius: "7px",
  overflow: "hidden",
  marginBottom: "0.3rem",
  cursor: "pointer",
  transition: "background 0.15s ease,\n    transform 0.15s ease,\n    border-color 0.15s ease",
  "&:last-child": {
    marginBottom: "0",
  },
  "&:hover": {
    background: "color-mix(in srgb, var(--token-color-brand-500) 8%, var(--token-surface-card))",
    transform: "translateX(2px)",
    borderColor:
      "color-mix(in srgb, var(--token-color-brand-500) 35%, var(--token-border-default))",
  },
});

export const eventCardNow = styles.class("googlecalendardaywidget-eventCardNow", {
  borderColor: "var(--token-status-success-border) !important",
  background: "var(--token-status-success-bg) !important",
  "&:hover": {
    background:
      "color-mix(\n    in srgb,\n    var(--token-status-success-fg) 16%,\n    var(--token-status-success-bg)\n  ) !important",
  },
});

export const eventIndicator = styles.class("googlecalendardaywidget-eventIndicator", {
  width: "3px",
  flexShrink: "0",
  borderRadius: "0",
});

export const eventBody = styles.class("googlecalendardaywidget-eventBody", {
  flex: "1",
  minWidth: "0",
  padding: "0.45rem 0.6rem",
});

export const eventTitleRow = styles.class("googlecalendardaywidget-eventTitleRow", {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.4rem",
  marginBottom: "0.15rem",
});

export const eventTitle = styles.class("googlecalendardaywidget-eventTitle", {
  fontSize: "0.8rem",
  fontWeight: "600",
  color: "var(--token-text-primary)",
  lineHeight: "1.3",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: "1",
  minWidth: "0",
});

export const nowBadge = styles.class("googlecalendardaywidget-nowBadge", {
  fontSize: "0.58rem",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--token-status-success-fg)",
  background: "var(--token-status-success-bg)",
  border: "1px solid var(--token-status-success-border)",
  borderRadius: "3px",
  padding: "1px 5px",
  lineHeight: "1.5",
  flexShrink: "0",
});

export const soonBadge = styles.class("googlecalendardaywidget-soonBadge", {
  fontSize: "0.65rem",
  fontWeight: "500",
  color: "var(--token-text-muted)",
  whiteSpace: "nowrap",
  flexShrink: "0",
  lineHeight: "1.3",
  marginTop: "1px",
});

export const eventMeta = styles.class("googlecalendardaywidget-eventMeta", {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  flexWrap: "wrap",
});

export const timeRange = styles.class("googlecalendardaywidget-timeRange", {
  fontSize: "0.7rem",
  color: "var(--token-text-muted)",
});

export const calendarBadge = styles.class("googlecalendardaywidget-calendarBadge", {
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

export const eventLocation = styles.class("googlecalendardaywidget-eventLocation", {
  display: "flex",
  alignItems: "center",
  gap: "3px",
  fontSize: "0.67rem",
  color: "var(--token-text-muted)",
  marginTop: "0.15rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const empty = styles.class("googlecalendardaywidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "0.5rem",
});

export const googleIcon = styles.class("googlecalendardaywidget-googleIcon", {
  color: "var(--token-color-brand-500)",
  marginBottom: "1rem",
});

export const emptyIcon = styles.class("googlecalendardaywidget-emptyIcon", {
  color: "var(--token-color-brand-500)",
  opacity: "0.45",
});

export const loadingEvents = styles.class("googlecalendardaywidget-loadingEvents", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  gap: "0.5rem",
});

export const authSection = styles.class("googlecalendardaywidget-authSection", {
  background: "var(--token-surface-card)",
  border: "1px solid var(--token-border-default)",
});

export const modalDetail = styles.class("googlecalendardaywidget-modalDetail", {
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  paddingBottom: "0.5rem",
});

export const modalDetailRow = styles.class("googlecalendardaywidget-modalDetailRow", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
});

export const modalDetailIcon = styles.class("googlecalendardaywidget-modalDetailIcon", {
  color: "var(--token-text-muted)",
  flexShrink: "0",
  marginTop: "2px",
});

export const deleteConfirmRow = styles.class("googlecalendardaywidget-deleteConfirmRow", {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const timeGrid = styles.class("googlecalendardaywidget-timeGrid", {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem",
});
