import { styles } from "../typeStyles";

export const container = styles.class("historywidget-container", {
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

export const transparent = styles.class("historywidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("historywidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("historywidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("historywidget-emptyTitle", {
  fontWeight: 600,
});

export const header = styles.class("historywidget-header", {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const title = styles.class("historywidget-title", {
  fontWeight: 600,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const current = styles.class("historywidget-current", {
  fontSize: "1.3em",
  fontWeight: 600,
  whiteSpace: "nowrap",
});

export const chart = styles.class("historywidget-chart", {
  width: "100%",
  height: "80px",
  flex: "1",
  minHeight: "48px",
});

export const chartPath = styles.class("historywidget-chartPath", {
  fill: "none",
  stroke: "var(--var-ui-color-accent)",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
});

export const rangeRow = styles.class("historywidget-rangeRow", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
  fontSize: "0.7em",
  color: "var(--var-ui-color-text-secondary)",
});

export const errorBox = styles.class("historywidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
