import { styles } from "../typeStyles";

export const container = styles.class("sceneswidget-container", {
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

export const transparent = styles.class("sceneswidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("sceneswidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("sceneswidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("sceneswidget-emptyTitle", {
  fontWeight: 600,
});

export const grid = styles.class("sceneswidget-grid", {
  display: "grid",
  gap: "var(--var-ui-space-2)",
  flex: "1",
  alignContent: "start",
});

export const card = styles.class("sceneswidget-card", {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "4px",
  minHeight: "56px",
  padding: "var(--var-ui-space-2)",
  borderRadius: "var(--var-ui-radius-sm)",
  border: "1px solid var(--var-ui-color-border-default)",
  background: "var(--var-ui-color-background-muted, transparent)",
  color: "inherit",
  cursor: "pointer",
  textAlign: "left",
  font: "inherit",
  transition: "transform 120ms ease, opacity 120ms ease",
});

export const cardPressed = styles.class("sceneswidget-cardPressed", {
  transform: "scale(0.97)",
  opacity: 0.7,
});

export const cardIcon = styles.class("sceneswidget-cardIcon", {
  color: "var(--var-ui-color-accent)",
});

export const cardLabel = styles.class("sceneswidget-cardLabel", {
  fontWeight: 600,
  lineHeight: 1.2,
});

export const cardDomain = styles.class("sceneswidget-cardDomain", {
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--var-ui-color-text-secondary)",
});

export const errorBox = styles.class("sceneswidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
