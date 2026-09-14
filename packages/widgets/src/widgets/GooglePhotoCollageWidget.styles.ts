import { styles } from "../typeStyles";

export const container = styles.class("googlephotocollagewidget-container", {
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  backgroundColor: "var(--var-ui-color-background-surface)",
});

export const transparent = styles.class("googlephotocollagewidget-transparent", {
  background: "transparent",
});

export const grid = styles.class("googlephotocollagewidget-grid", {
  width: "100%",
  height: "100%",
  display: "grid",
  gap: "var(--var-ui-space-1, 4px)",
  padding: "var(--var-ui-space-1, 4px)",
  boxSizing: "border-box",
});

export const cell = styles.class("googlephotocollagewidget-cell", {
  position: "relative",
  overflow: "hidden",
  borderRadius: "var(--var-ui-radius-sm)",
  backgroundColor: "var(--var-ui-color-border-default)",
  minHeight: "0",
});

export const photo = styles.class("googlephotocollagewidget-photo", {
  width: "100%",
  height: "100%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  transition: "opacity 0.4s ease-in-out",
});

export const fading = styles.class("googlephotocollagewidget-fading", {
  opacity: "0",
});

export const photoSkeleton = styles.class("googlephotocollagewidget-photoSkeleton", {
  width: "100%",
  height: "100%",
  backgroundColor: "var(--var-ui-color-border-default)",
  opacity: "0.5",
});

export const stateContainer = styles.class("googlephotocollagewidget-stateContainer", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "20px",
  textAlign: "center",
});

export const emptyIcon = styles.class("googlephotocollagewidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
  marginBottom: "12px",
});

export const thumbWrapper = styles.class("googlephotocollagewidget-thumbWrapper", {
  position: "relative",
  borderRadius: "var(--var-ui-radius-sm)",
  overflow: "hidden",
  background: "var(--var-ui-color-background-surface)",
});

export const thumb = styles.class("googlephotocollagewidget-thumb", {
  display: "block",
  width: "100%",
});

export const thumbPlaceholder = styles.class("googlephotocollagewidget-thumbPlaceholder", {
  height: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--var-ui-color-border-default)",
  borderRadius: "var(--var-ui-radius-sm)",
});

export const thumbRemove = styles.class("googlephotocollagewidget-thumbRemove", {
  position: "absolute",
  top: "4px",
  right: "4px",
  opacity: "0",
  transition: "opacity 0.15s ease",
  zIndex: "2",
  [`.${thumbWrapper}:hover &`]: {
    opacity: "1",
  },
});
