import { styles } from "../typeStyles";

export const container = styles.class("commutewidget-container", {
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

export const transparent = styles.class("commutewidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("commutewidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const error = styles.class("commutewidget-error", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("commutewidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const header = styles.class("commutewidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const title = styles.class("commutewidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
  color: "var(--var-ui-color-text-primary)",
  fontWeight: "600",
});

export const settingsNotice = styles.class("commutewidget-settingsNotice", {
  background: "var(--var-ui-color-background-subtle)",
  color: "var(--var-ui-color-text-secondary)",
});

export const list = styles.class("commutewidget-list", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
});

export const route = styles.class("commutewidget-route", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
  background: "var(--var-ui-color-background-subtle)",
});

export const label = styles.class("commutewidget-label", {
  flex: "1",
  minWidth: "0",
  overflowWrap: "anywhere",
  color: "var(--var-ui-color-text-primary)",
});

export const measurements = styles.class("commutewidget-measurements", {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--var-ui-space-2)",
  whiteSpace: "nowrap",
});

export const duration = styles.class("commutewidget-duration", {
  color: "var(--var-ui-color-text-primary)",
  fontSize: "1.35rem",
  fontWeight: "700",
  lineHeight: "1",
});
