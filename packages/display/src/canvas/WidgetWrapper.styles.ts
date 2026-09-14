import { styles } from "../typeStyles";

export const wrapper = styles.class("widgetwrapper-wrapper", {
  height: "100%",
  position: "relative",
  background: "var(--token-widget-background, var(--token-surface-card))",
  backdropFilter: "blur(10px)",
  border:
    "var(--token-widget-border-width, 1px) solid\n    var(--token-widget-border-color, var(--token-border-default))",
  borderRadius: "var(--token-widget-radius, var(--mantine-radius-md))",
  overflow: "hidden",
  transition: "box-shadow 0.2s ease,\n    border-color 0.2s ease",
  "&:hover": {
    boxShadow: "0 0 20px var(--token-glow)",
  },
});

export const transparent = styles.class("widgetwrapper-transparent", {
  background: "transparent",
  backdropFilter: "none",
  borderColor: "transparent",
  "&:hover": {
    borderColor: "var(--token-border-default)",
  },
});

export const editing = styles.class("widgetwrapper-editing", {
  border: "2px dashed rgba(var(--token-color-brand-500-rgb), 0.5)",
  "&:hover": {
    borderColor: "rgba(var(--token-color-brand-500-rgb), 0.8)",
    boxShadow: "0 0 20px rgba(var(--token-color-brand-500-rgb), 0.2)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "24px",
    height: "24px",
    background:
      "linear-gradient(\n    135deg,\n    transparent 50%,\n    rgba(var(--token-color-brand-500-rgb), 0.3) 50%\n  )",
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
  color: "var(--token-text-muted, var(--mantine-color-dimmed))",
  display: "flex",
  alignItems: "center",
  "&:hover": {
    color: "var(--token-text-primary, var(--mantine-color-text))",
  },
  "&:active": {
    cursor: "grabbing",
  },
});

export const toolbarButton = styles.class("widgetwrapper-toolbarButton", {
  color: "var(--token-text-muted, var(--mantine-color-dimmed))",
  background: "light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.08))",
  "&:hover": {
    color: "var(--token-text-primary, var(--mantine-color-text))",
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
  color: "var(--token-text-primary, var(--mantine-color-text))",
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
  background: "rgba(var(--token-color-brand-500-rgb), 0.2)",
  borderRadius: "4px",
  color: "var(--token-text-primary, var(--mantine-color-text))",
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
  color: "var(--mantine-color-gray-5)",
});

export const healthLoading = styles.class("widgetwrapper-healthLoading", {
  color: "var(--mantine-color-blue-5)",
  borderColor: "rgba(59, 130, 246, 0.35)",
});

export const healthOk = styles.class("widgetwrapper-healthOk", {
  color: "var(--mantine-color-green-6)",
  borderColor: "rgba(34, 197, 94, 0.35)",
});

export const healthStale = styles.class("widgetwrapper-healthStale", {
  color: "var(--mantine-color-yellow-6)",
  borderColor: "rgba(234, 179, 8, 0.35)",
});

export const healthError = styles.class("widgetwrapper-healthError", {
  color: "var(--mantine-color-red-6)",
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
