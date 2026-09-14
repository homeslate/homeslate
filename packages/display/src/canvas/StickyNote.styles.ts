import { styles } from "../typeStyles";

export const note = styles.class("stickynote-note", {
  position: "absolute",
  width: "160px",
  minHeight: "120px",
  padding: "28px 10px 10px",
  borderRadius: "3px",
  boxShadow: "2px 4px 14px rgba(0, 0, 0, 0.28)",
  cursor: "grab",
  zIndex: "50",
  willChange: "left, top",
  userSelect: "none",
  pointerEvents: "auto",
  "&:active": {
    cursor: "grabbing",
    zIndex: "60",
    boxShadow: "4px 8px 22px rgba(0, 0, 0, 0.4)",
  },
});

export const toolbar = styles.class("stickynote-toolbar", {
  position: "absolute",
  top: "4px",
  left: "6px",
  right: "6px",
  display: "flex",
  alignItems: "center",
  gap: "2px",
});

export const colorToggle = styles.class("stickynote-colorToggle", {
  background: "transparent",
  border: "none",
  padding: "2px",
  cursor: "pointer",
  borderRadius: "2px",
  display: "flex",
  alignItems: "center",
  opacity: "0.6",
  transition: "opacity 0.15s ease",
  "&:hover": {
    opacity: "1",
  },
});

export const colorDot = styles.class("stickynote-colorDot", {
  display: "block",
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  border: "1.5px solid rgba(0, 0, 0, 0.3)",
});

export const colorPicker = styles.class("stickynote-colorPicker", {
  display: "flex",
  gap: "3px",
  alignItems: "center",
});

export const colorInputWrap = styles.class("stickynote-colorInputWrap", {
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
});

export const colorInput = styles.class("stickynote-colorInput", {
  width: "14px",
  height: "14px",
  padding: "0",
  border: "1.5px solid rgba(0, 0, 0, 0.2)",
  borderRadius: "50%",
  cursor: "pointer",
  background: "transparent",
  "&::-webkit-color-swatch-wrapper": {
    padding: "0",
  },
  "&::-webkit-color-swatch": {
    border: "none",
    borderRadius: "50%",
  },
});

export const swatch = styles.class("stickynote-swatch", {
  width: "14px",
  height: "14px",
  borderRadius: "50%",
  border: "1.5px solid rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
  padding: "0",
  transition: "transform 0.1s ease,\n    border-color 0.1s ease",
  "&:hover": {
    transform: "scale(1.2)",
    borderColor: "rgba(0, 0, 0, 0.5)",
  },
});

export const swatchActive = styles.class("stickynote-swatchActive", {
  borderColor: "rgba(0, 0, 0, 0.6)",
  boxShadow: "0 0 0 1.5px rgba(0, 0, 0, 0.4)",
});

export const close = styles.class("stickynote-close", {
  marginLeft: "auto",
  background: "transparent",
  border: "none",
  fontSize: "18px",
  lineHeight: "1",
  cursor: "pointer",
  opacity: "0.35",
  color: "#333",
  padding: "2px 5px",
  borderRadius: "2px",
  transition: "opacity 0.15s ease,\n    background 0.15s ease",
  "&:hover": {
    opacity: "0.85",
    background: "rgba(0, 0, 0, 0.12)",
  },
});

export const textarea = styles.class("stickynote-textarea", {
  width: "100%",
  minHeight: "80px",
  border: "none",
  outline: "none",
  resize: "none",
  fontSize: "13px",
  fontFamily: "inherit",
  color: "#333",
  lineHeight: "1.55",
  padding: "0",
  cursor: "text",
  pointerEvents: "auto",
  "&::placeholder": {
    color: "rgba(0, 0, 0, 0.3)",
  },
});
