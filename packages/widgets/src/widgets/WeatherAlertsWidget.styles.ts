import { styles } from "../typeStyles";

export const container = styles.class("weatheralertswidget-container", {
  height: "100%",
  background: "var(--token-widget-background, var(--token-surface-card))",
  border:
    "var(--token-widget-border-width, 1px) solid\n    var(--token-widget-border-color, var(--token-border-default))",
  borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
  padding: "var(--token-widget-padding, var(--token-spacing-3))",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "var(--token-spacing-2)",
});

export const transparent = styles.class("weatheralertswidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("weatheralertswidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--token-spacing-2)",
  textAlign: "center",
});

export const loading = styles.class("weatheralertswidget-loading", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--token-spacing-2)",
  textAlign: "center",
});

export const error = styles.class("weatheralertswidget-error", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--token-spacing-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("weatheralertswidget-emptyIcon", {
  color: "var(--token-text-secondary)",
});

export const header = styles.class("weatheralertswidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--token-spacing-2)",
});

export const title = styles.class("weatheralertswidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "var(--token-spacing-2)",
  color: "var(--token-text-primary)",
  fontWeight: "600",
});

export const quiet = styles.class("weatheralertswidget-quiet", {
  color: "var(--token-text-muted)",
});

export const list = styles.class("weatheralertswidget-list", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  gap: "var(--token-spacing-2)",
});

export const alert = styles.class("weatheralertswidget-alert", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--token-spacing-1)",
  background: "var(--token-surface-subtle)",
});

export const event = styles.class("weatheralertswidget-event", {
  fontWeight: "600",
});

export const headline = styles.class("weatheralertswidget-headline", {
  color: "var(--token-text-secondary)",
});

export const until = styles.class("weatheralertswidget-until", {
  color: "var(--token-text-muted)",
});

export const severityDanger = styles.class("weatheralertswidget-severityDanger", {
  color: "var(--token-status-danger-fg)",
});

export const severityWarning = styles.class("weatheralertswidget-severityWarning", {
  color: "var(--token-status-warning-fg)",
});

export const severityInfo = styles.class("weatheralertswidget-severityInfo", {
  color: "var(--token-status-info-fg)",
});

export const severityUnknown = styles.class("weatheralertswidget-severityUnknown", {
  color: "var(--token-text-muted)",
});

export const searchResults = styles.class("weatheralertswidget-searchResults", {
  background: "var(--token-surface-overlay, var(--token-surface-card))",
  border: "1px solid var(--token-border-default)",
  maxHeight: "200px",
  overflowY: "auto",
});

export const searchResult = styles.class("weatheralertswidget-searchResult", {
  color: "var(--token-text-muted)",
  fontWeight: "normal",
  "&:hover": {
    color: "var(--token-text-primary)",
    background: "color-mix(in srgb, var(--token-color-brand-500) 12%, transparent)",
  },
});

export const currentLocation = styles.class("weatheralertswidget-currentLocation", {
  background: "var(--token-status-warning-bg)",
  border: "1px solid var(--token-status-warning-border)",
});
