import { styles } from "../typeStyles";

export const container = styles.class("weatheralertswidget-container", {
  height: "100%",
  background: "var(--var-ui-widget-background, var(--var-ui-color-background-surface))",
  border:
    "var(--var-ui-widget-borderWidth, 1px) solid\n    var(--var-ui-widget-borderColor, var(--var-ui-color-border-default))",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  padding: "var(--var-ui-widget-padding, var(--var-ui-space-3))",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
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
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const loading = styles.class("weatheralertswidget-loading", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const error = styles.class("weatheralertswidget-error", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("weatheralertswidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const header = styles.class("weatheralertswidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const title = styles.class("weatheralertswidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
  color: "var(--var-ui-color-text-primary)",
  fontWeight: "600",
});

export const quiet = styles.class("weatheralertswidget-quiet", {
  color: "var(--var-ui-color-text-secondary)",
});

export const list = styles.class("weatheralertswidget-list", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
});

export const alert = styles.class("weatheralertswidget-alert", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-1)",
  background: "var(--var-ui-color-background-subtle)",
});

export const event = styles.class("weatheralertswidget-event", {
  fontWeight: "600",
});

export const headline = styles.class("weatheralertswidget-headline", {
  color: "var(--var-ui-color-text-secondary)",
});

export const until = styles.class("weatheralertswidget-until", {
  color: "var(--var-ui-color-text-secondary)",
});

export const severityDanger = styles.class("weatheralertswidget-severityDanger", {
  color: "var(--var-ui-color-tone-danger-foreground)",
});

export const severityWarning = styles.class("weatheralertswidget-severityWarning", {
  color: "var(--var-ui-color-tone-warning-foreground)",
});

export const severityInfo = styles.class("weatheralertswidget-severityInfo", {
  color: "var(--var-ui-color-tone-info-foreground)",
});

export const severityUnknown = styles.class("weatheralertswidget-severityUnknown", {
  color: "var(--var-ui-color-text-secondary)",
});

export const searchResults = styles.class("weatheralertswidget-searchResults", {
  background: "var(--var-ui-color-background-popover, var(--var-ui-color-background-surface))",
  border: "1px solid var(--var-ui-color-border-default)",
  maxHeight: "200px",
  overflowY: "auto",
});

export const searchResult = styles.class("weatheralertswidget-searchResult", {
  color: "var(--var-ui-color-text-secondary)",
  fontWeight: "normal",
  "&:hover": {
    color: "var(--var-ui-color-text-primary)",
    background: "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 12%, transparent)",
  },
});

export const currentLocation = styles.class("weatheralertswidget-currentLocation", {
  background: "var(--var-ui-color-tone-warning-subtleBackground)",
  border: "1px solid var(--var-ui-color-tone-warning-border)",
});
