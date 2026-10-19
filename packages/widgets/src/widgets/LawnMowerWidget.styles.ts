import { styles } from "../typeStyles";

export const container = styles.class("lawnmowerwidget-container", {
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

export const transparent = styles.class("lawnmowerwidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("lawnmowerwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("lawnmowerwidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("lawnmowerwidget-emptyTitle", {
  fontWeight: 600,
});

export const header = styles.class("lawnmowerwidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const title = styles.class("lawnmowerwidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 600,
});

export const stateRow = styles.class("lawnmowerwidget-stateRow", {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--var-ui-space-2)",
});

export const stateLabel = styles.class("lawnmowerwidget-stateLabel", {
  fontSize: "1.5em",
  fontWeight: 600,
});

export const actions = styles.class("lawnmowerwidget-actions", {
  display: "flex",
  gap: "var(--var-ui-space-1)",
  flexWrap: "wrap",
});

export const errorBox = styles.class("lawnmowerwidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
