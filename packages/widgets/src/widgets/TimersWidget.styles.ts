import { styles } from "../typeStyles";

export const container = styles.class("timerswidget-container", {
  height: "100%",
  background: "var(--var-ui-widget-background, var(--var-ui-color-background-surface))",
  border:
    "var(--var-ui-widget-borderWidth, 1px) solid\n    var(--var-ui-widget-borderColor, var(--var-ui-color-border-default))",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  padding: "var(--var-ui-widget-padding, var(--var-ui-space-3))",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("timerswidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("timerswidget-empty", {
  flex: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

export const list = styles.class("timerswidget-list", {
  minHeight: "min-content",
});

export const runtimeCard = styles.class("timerswidget-runtimeCard", {
  background: "var(--var-ui-color-background-elevated, var(--var-ui-color-background-surface))",
});

export const runtimeDetails = styles.class("timerswidget-runtimeDetails", {
  minWidth: "0",
});

export const countdown = styles.class("timerswidget-countdown", {
  fontSize: "var(--mantine-font-size-xl)",
  fontVariantNumeric: "tabular-nums",
  fontWeight: "700",
  lineHeight: "1.1",
});

export const labelInput = styles.class("timerswidget-labelInput", {
  flex: "1",
  minWidth: "0",
});

export const touchAction = styles.class("timerswidget-touchAction", {
  minWidth: "44px",
  minHeight: "44px",
});

export const touchButton = styles.class("timerswidget-touchButton", {
  minHeight: "44px",
});
