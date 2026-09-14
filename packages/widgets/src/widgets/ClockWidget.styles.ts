import { styles } from "../typeStyles";

export const clock = styles.component("clock", {
  slots: ["root", "time", "date"],
  base: {
    root: {
      width: "100%",
      minHeight: 0,
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(135deg, rgba(var(--token-color-brand-500-rgb), 0.1) 0%, rgba(var(--token-color-brand-500-rgb), 0.05) 100%)",
      borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
    },
    time: {
      fontFamily: '"JetBrains Mono", "Space Mono", "SF Mono", monospace',
      fontWeight: 300,
      letterSpacing: "0.05em",
      lineHeight: 1,
      color: "var(--token-text-primary)",
      textShadow: "0 0 40px var(--token-glow)",
    },
    date: {
      fontWeight: 500,
      color: "var(--token-text-muted)",
      textTransform: "capitalize",
      marginTop: "0.4em",
    },
  },
  variants: {
    transparent: {
      true: { root: { background: "transparent" } },
      false: {},
    },
  },
  defaultVariants: { transparent: false },
});
