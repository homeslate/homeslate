import { styles } from "../typeStyles";

export const container = styles.class("energywidget-container", {
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

export const transparent = styles.class("energywidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("energywidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("energywidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("energywidget-emptyTitle", {
  fontWeight: 600,
});

export const header = styles.class("energywidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const title = styles.class("energywidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 600,
});

export const values = styles.class("energywidget-values", {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
  gap: "var(--var-ui-space-2)",
  flex: "1",
  alignContent: "center",
});

export const valueCard = styles.class("energywidget-valueCard", {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "var(--var-ui-space-2)",
  borderRadius: "var(--var-ui-radius-sm)",
  border: "1px solid var(--var-ui-color-border-default)",
  background: "var(--var-ui-color-background-muted, transparent)",
});

export const valueLabel = styles.class("energywidget-valueLabel", {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "0.75em",
  color: "var(--var-ui-color-text-secondary)",
});

export const value = styles.class("energywidget-value", {
  fontSize: "1.4em",
  fontWeight: 600,
  lineHeight: 1.1,
});

export const errorBox = styles.class("energywidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
