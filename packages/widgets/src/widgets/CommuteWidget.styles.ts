import { styles } from "../typeStyles";

export const container = styles.class("commutewidget-container", {
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
  gap: "var(--token-spacing-2)",
  textAlign: "center",
});

export const error = styles.class("commutewidget-error", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--token-spacing-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("commutewidget-emptyIcon", {
  color: "var(--token-text-secondary)",
});

export const header = styles.class("commutewidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--token-spacing-2)",
});

export const title = styles.class("commutewidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "var(--token-spacing-2)",
  color: "var(--token-text-primary)",
  fontWeight: "600",
});

export const settingsNotice = styles.class("commutewidget-settingsNotice", {
  background: "var(--token-surface-subtle)",
  color: "var(--token-text-secondary)",
});

export const list = styles.class("commutewidget-list", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  gap: "var(--token-spacing-2)",
});

export const route = styles.class("commutewidget-route", {
  display: "flex",
  alignItems: "center",
  gap: "var(--token-spacing-2)",
  background: "var(--token-surface-subtle)",
});

export const label = styles.class("commutewidget-label", {
  flex: "1",
  minWidth: "0",
  overflowWrap: "anywhere",
  color: "var(--token-text-primary)",
});

export const measurements = styles.class("commutewidget-measurements", {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--token-spacing-2)",
  whiteSpace: "nowrap",
});

export const duration = styles.class("commutewidget-duration", {
  color: "var(--token-text-primary)",
  fontSize: "1.35rem",
  fontWeight: "700",
  lineHeight: "1",
});
