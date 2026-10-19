import { styles } from "../typeStyles";

export const container = styles.class("deviceswidget-container", {
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

export const transparent = styles.class("deviceswidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("deviceswidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("deviceswidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("deviceswidget-emptyTitle", {
  fontWeight: 600,
});

export const header = styles.class("deviceswidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const grid = styles.class("deviceswidget-grid", {
  display: "grid",
  gap: "var(--var-ui-space-2)",
  flex: "1",
  alignContent: "start",
});

export const card = styles.class("deviceswidget-card", {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  padding: "var(--var-ui-space-2)",
  borderRadius: "var(--var-ui-radius-sm)",
  border: "1px solid var(--var-ui-color-border-default)",
  background: "var(--var-ui-color-background-muted)",
  transition: "border-color 120ms ease, opacity 120ms ease",
});

export const cardOn = styles.class("deviceswidget-cardOn", {
  borderColor: "var(--var-ui-color-accent)",
});

export const cardPending = styles.class("deviceswidget-cardPending", {
  opacity: 0.65,
});

export const cardUnavailable = styles.class("deviceswidget-cardUnavailable", {
  opacity: 0.5,
});

export const toggleButton = styles.class("deviceswidget-toggleButton", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
  width: "100%",
  padding: 0,
  border: "none",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
});

export const deviceDetails = styles.class("deviceswidget-deviceDetails", {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: "1",
});

export const deviceName = styles.class("deviceswidget-deviceName", {
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const deviceState = styles.class("deviceswidget-deviceState", {
  fontSize: "0.8em",
  color: "var(--var-ui-color-text-secondary)",
});

export const pill = styles.class("deviceswidget-pill", {
  width: "34px",
  height: "20px",
  borderRadius: "999px",
  background: "var(--var-ui-color-border-default)",
  display: "flex",
  alignItems: "center",
  padding: "2px",
  flexShrink: 0,
  transition: "background 120ms ease",
});

export const pillOn = styles.class("deviceswidget-pillOn", {
  background: "var(--var-ui-color-accent)",
});

export const pillKnob = styles.class("deviceswidget-pillKnob", {
  width: "16px",
  height: "16px",
  borderRadius: "999px",
  background: "var(--var-ui-color-background-surface)",
  transition: "transform 120ms ease",
});

export const pillKnobOn = styles.class("deviceswidget-pillKnobOn", {
  transform: "translateX(14px)",
});

export const brightnessRow = styles.class("deviceswidget-brightnessRow", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
});

export const range = styles.class("deviceswidget-range", {
  flex: "1",
  accentColor: "var(--var-ui-color-accent)",
});

export const fanChip = styles.class("deviceswidget-fanChip", {
  fontSize: "10px",
  padding: "1px 6px",
  borderRadius: "999px",
  background: "var(--var-ui-color-background-subtle)",
  color: "var(--var-ui-color-text-secondary)",
});

export const errorBox = styles.class("deviceswidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
