import { styles } from "../typeStyles";

export const wrapper = styles.class("widgetwrapper-wrapper", {
  height: "100%",
  position: "relative",
  background: "var(--var-ui-widget-background, var(--var-ui-color-background-surface))",
  backdropFilter: "blur(10px)",
  border:
    "var(--var-ui-widget-borderWidth, 1px) solid\n    var(--var-ui-widget-borderColor, var(--var-ui-color-border-default))",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  overflow: "hidden",
  transition: "box-shadow 0.2s ease,\n    border-color 0.2s ease",
  "&:hover": {
    boxShadow: "0 0 20px var(--var-ui-color-ring-default)",
  },
});

export const transparent = styles.class("widgetwrapper-transparent", {
  background: "transparent",
  backdropFilter: "none",
  borderColor: "transparent",
  "&:hover": {
    borderColor: "var(--var-ui-color-border-default)",
  },
});

export const editing = styles.class("widgetwrapper-editing", {
  border:
    "2px dashed color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 50%, transparent)",
  "&:hover": {
    borderColor: "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 80%, transparent)",
    boxShadow:
      "0 0 20px color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 20%, transparent)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "24px",
    height: "24px",
    background:
      "linear-gradient(\n    135deg,\n    transparent 50%,\n    color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 30%, transparent) 50%\n  )",
    zIndex: "5",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 0.2s ease",
  },
  "&:hover::before": {
    opacity: "1",
  },
});

export const toolbar = styles.class("widgetwrapper-toolbar", {
  position: "absolute",
  top: "0",
  left: "0",
  right: "0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "nowrap",
  gap: "0.5rem",
  padding: "0.25rem 0.5rem",
  background: "light-dark(rgba(255, 255, 255, 0.85), rgba(0, 0, 0, 0.65))",
  backdropFilter: "blur(8px)",
  zIndex: "10",
  opacity: "0",
  transition: "opacity 0.2s ease",
  containerType: "inline-size",
  containerName: "toolbar",
  [`.${editing}:hover &`]: {
    opacity: "1",
  },
});

export const toolbarLeft = styles.class("widgetwrapper-toolbarLeft", {
  flexShrink: "1",
  minWidth: "0",
  overflow: "hidden",
});

export const toolbarRight = styles.class("widgetwrapper-toolbarRight", {
  flexShrink: "0",
});

export const dragHandle = styles.class("widgetwrapper-dragHandle", {
  cursor: "grab",
  padding: "0.25rem",
  color: "var(--var-ui-color-text-secondary)",
  display: "flex",
  alignItems: "center",
  "&:hover": {
    color: "var(--var-ui-color-text-primary)",
  },
  "&:active": {
    cursor: "grabbing",
  },
});

export const toolbarButton = styles.class("widgetwrapper-toolbarButton", {
  color: "var(--var-ui-color-text-secondary)",
  background: "light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.08))",
  "&:hover": {
    color: "var(--var-ui-color-text-primary)",
    background: "light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.15))",
  },
});

export const content = styles.class("widgetwrapper-content", {
  height: "100%",
  minWidth: "0",
  minHeight: "0",
});

export const widgetName = styles.class("widgetwrapper-widgetName", {
  fontWeight: "500",
  opacity: "0.8",
  color: "var(--var-ui-color-text-primary)",
  whiteSpace: "nowrap",
  "@container toolbar (max-width: 180px)": {
    display: "none",
  },
});

export const sizeIndicator = styles.class("widgetwrapper-sizeIndicator", {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "2px 6px",
  background: "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 20%, transparent)",
  borderRadius: "4px",
  color: "var(--var-ui-color-text-primary)",
  fontSize: "10px",
  cursor: "default",
});

export const healthIndicator = styles.class("widgetwrapper-healthIndicator", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "18px",
  height: "18px",
  borderRadius: "999px",
  border: "1px solid transparent",
  background: "light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.08))",
});

export const healthIdle = styles.class("widgetwrapper-healthIdle", {
  color: "var(--var-ui-color-text-secondary)",
});

export const healthLoading = styles.class("widgetwrapper-healthLoading", {
  color: "var(--var-ui-color-tone-info-foreground)",
  borderColor: "rgba(59, 130, 246, 0.35)",
});

export const healthOk = styles.class("widgetwrapper-healthOk", {
  color: "var(--var-ui-color-success)",
  borderColor: "rgba(34, 197, 94, 0.35)",
});

export const healthStale = styles.class("widgetwrapper-healthStale", {
  color: "var(--var-ui-color-tone-warning-foreground)",
  borderColor: "rgba(234, 179, 8, 0.35)",
});

export const healthError = styles.class("widgetwrapper-healthError", {
  color: "var(--var-ui-color-danger)",
  borderColor: "rgba(239, 68, 68, 0.35)",
});

export const resizeHint = styles.class("widgetwrapper-resizeHint", {
  position: "absolute",
  bottom: "8px",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "4px 10px",
  background: "light-dark(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7))",
  borderRadius: "4px",
  fontSize: "10px",
  color: "light-dark(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))",
  pointerEvents: "none",
  opacity: "0",
  transition: "opacity 0.2s ease",
  zIndex: "10",
  whiteSpace: "nowrap",
  [`.${editing}:hover &`]: {
    opacity: "1",
  },
});
