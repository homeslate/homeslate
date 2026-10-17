import { styles } from "../typeStyles";

export const container = styles.class("thermostatwidget-container", {
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

export const transparent = styles.class("thermostatwidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("thermostatwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("thermostatwidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const error = styles.class("thermostatwidget-error", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const notice = styles.class("thermostatwidget-notice", {
  background: "var(--var-ui-color-background-subtle)",
  color: "var(--var-ui-color-text-secondary)",
});

export const header = styles.class("thermostatwidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const title = styles.class("thermostatwidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
  color: "var(--var-ui-color-text-primary)",
  fontWeight: "600",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const action = styles.class("thermostatwidget-action", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-1)",
  color: "var(--var-ui-color-text-secondary)",
  whiteSpace: "nowrap",
});

export const reading = styles.class("thermostatwidget-reading", {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--var-ui-space-2)",
});

export const currentTemp = styles.class("thermostatwidget-currentTemp", {
  color: "var(--var-ui-color-text-primary)",
  fontSize: "2.4rem",
  fontWeight: "700",
  lineHeight: "1",
});

export const humidity = styles.class("thermostatwidget-humidity", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-1)",
  color: "var(--var-ui-color-text-secondary)",
});

export const targetRows = styles.class("thermostatwidget-targetRows", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-1)",
});

export const targetRow = styles.class("thermostatwidget-targetRow", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
  background: "var(--var-ui-color-background-subtle)",
  borderRadius: "var(--var-ui-radius-md)",
  padding: "var(--var-ui-space-1) var(--var-ui-space-2)",
});

export const targetLabel = styles.class("thermostatwidget-targetLabel", {
  color: "var(--var-ui-color-text-secondary)",
});

export const targetControls = styles.class("thermostatwidget-targetControls", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-1)",
});

export const targetValue = styles.class("thermostatwidget-targetValue", {
  color: "var(--var-ui-color-text-primary)",
  fontWeight: "600",
  fontSize: "1.15rem",
  minWidth: "3.5rem",
  textAlign: "center",
});

export const modeRow = styles.class("thermostatwidget-modeRow", {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--var-ui-space-2)",
});

export const modes = styles.class("thermostatwidget-modes", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
});

export const hint = styles.class("thermostatwidget-hint", {
  color: "var(--var-ui-color-text-secondary)",
  textAlign: "center",
});

export const fieldGrow = styles.class("thermostatwidget-fieldGrow", {
  flex: "1",
  minWidth: "0",
});
