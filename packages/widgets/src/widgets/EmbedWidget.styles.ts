import { styles } from "../typeStyles";

export const container = styles.class("embedwidget-container", {
  height: "100%",
  background: "var(--var-ui-widget-background, var(--var-ui-color-background-surface))",
  border:
    "var(--var-ui-widget-borderWidth, 1px) solid\n    var(--var-ui-widget-borderColor, var(--var-ui-color-border-default))",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

export const padded = styles.class("embedwidget-padded", {
  padding: "var(--var-ui-widget-padding, var(--var-ui-space-3))",
});

export const transparent = styles.class("embedwidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("embedwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("embedwidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const frame = styles.class("embedwidget-frame", {
  flex: "1",
  width: "100%",
  height: "100%",
  border: "0",
});

export const noPointer = styles.class("embedwidget-noPointer", {
  pointerEvents: "none",
});
