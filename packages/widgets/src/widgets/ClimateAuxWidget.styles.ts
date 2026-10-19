import { styles } from "../typeStyles";

export const container = styles.class("climateauxwidget-container", {
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

export const transparent = styles.class("climateauxwidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("climateauxwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("climateauxwidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("climateauxwidget-emptyTitle", {
  fontWeight: 600,
});

export const header = styles.class("climateauxwidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const title = styles.class("climateauxwidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 600,
  minWidth: 0,
});

export const reading = styles.class("climateauxwidget-reading", {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--var-ui-space-2)",
});

export const value = styles.class("climateauxwidget-value", {
  fontSize: "2em",
  fontWeight: 600,
  lineHeight: 1.1,
});

export const unit = styles.class("climateauxwidget-unit", {
  fontSize: "0.8em",
  color: "var(--var-ui-color-text-secondary)",
});

export const targetRow = styles.class("climateauxwidget-targetRow", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const targetLabel = styles.class("climateauxwidget-targetLabel", {
  fontSize: "0.85em",
  color: "var(--var-ui-color-text-secondary)",
});

export const targetControls = styles.class("climateauxwidget-targetControls", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-1)",
});

export const targetValue = styles.class("climateauxwidget-targetValue", {
  fontSize: "1.1em",
  fontWeight: 600,
  minWidth: "3.5em",
  textAlign: "center",
});

export const modes = styles.class("climateauxwidget-modes", {
  display: "flex",
  gap: "var(--var-ui-space-2)",
});

export const notice = styles.class("climateauxwidget-notice", {
  padding: "var(--var-ui-space-2)",
  borderRadius: "var(--var-ui-radius-sm)",
  border: "1px solid var(--var-ui-color-border-default)",
});

export const errorBox = styles.class("climateauxwidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const fieldGrow = styles.class("climateauxwidget-fieldGrow", {
  flex: "1",
  minWidth: 0,
});
