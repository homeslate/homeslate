import { styles } from "./typeStyles";

export const overlay = styles.class("holidayeffects-overlay", {
  position: "absolute",
  inset: "0",
  pointerEvents: "none",
  zIndex: "15",
});

export const banner = styles.class("holidayeffects-banner", {
  position: "absolute",
  top: "16px",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "8px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(34, 197, 94, 0.5)",
  background: "linear-gradient(135deg, rgba(5, 46, 22, 0.8), rgba(21, 128, 61, 0.8))",
  color: "#dcfce7",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)",
  boxShadow: "0 8px 18px rgba(0, 0, 0, 0.28)",
});

export const sparkles = styles.class("holidayeffects-sparkles", {
  position: "absolute",
  inset: "0",
});

export const sparkle = styles.class("holidayeffects-sparkle", {
  position: "absolute",
  color: "rgba(134, 239, 172, 0.9)",
  textShadow: "0 0 8px rgba(74, 222, 128, 0.55)",
  fontSize: "16px",
  opacity: "0",
  animation: "drift 10s linear infinite",
  "&:nth-child(1)": {
    left: "4%",
    animationDelay: "-1s",
    animationDuration: "9s",
  },
  "&:nth-child(2)": {
    left: "11%",
    animationDelay: "-4s",
    animationDuration: "10s",
  },
  "&:nth-child(3)": {
    left: "18%",
    animationDelay: "-2s",
    animationDuration: "11s",
  },
  "&:nth-child(4)": {
    left: "25%",
    animationDelay: "-8s",
    animationDuration: "9.5s",
  },
  "&:nth-child(5)": {
    left: "33%",
    animationDelay: "-5s",
    animationDuration: "12s",
  },
  "&:nth-child(6)": {
    left: "41%",
    animationDelay: "-7s",
    animationDuration: "10.5s",
  },
  "&:nth-child(7)": {
    left: "49%",
    animationDelay: "-3s",
    animationDuration: "9.2s",
  },
  "&:nth-child(8)": {
    left: "56%",
    animationDelay: "-6s",
    animationDuration: "11.4s",
  },
  "&:nth-child(9)": {
    left: "64%",
    animationDelay: "-2.5s",
    animationDuration: "10.2s",
  },
  "&:nth-child(10)": {
    left: "72%",
    animationDelay: "-7.8s",
    animationDuration: "12.3s",
  },
  "&:nth-child(11)": {
    left: "79%",
    animationDelay: "-1.8s",
    animationDuration: "9.8s",
  },
  "&:nth-child(12)": {
    left: "86%",
    animationDelay: "-5.5s",
    animationDuration: "11.8s",
  },
  "&:nth-child(13)": {
    left: "92%",
    animationDelay: "-3.8s",
    animationDuration: "10.8s",
  },
  "&:nth-child(14)": {
    left: "96%",
    animationDelay: "-6.8s",
    animationDuration: "9.3s",
  },
  "&:nth-child(15)": {
    left: "14%",
    animationDelay: "-9.2s",
    animationDuration: "12.8s",
  },
  "&:nth-child(16)": {
    left: "58%",
    animationDelay: "-4.9s",
    animationDuration: "13.2s",
  },
  "&:nth-child(17)": {
    left: "76%",
    animationDelay: "-2.7s",
    animationDuration: "12.6s",
  },
  "&:nth-child(18)": {
    left: "88%",
    animationDelay: "-8.4s",
    animationDuration: "11.6s",
  },
});

export const newYearsDay = styles.class("holidayeffects-newYearsDay", {
  [`& .${banner}`]: {
    borderColor: "rgba(250, 204, 21, 0.55)",
    background: "linear-gradient(135deg, rgba(24, 24, 42, 0.86), rgba(88, 28, 135, 0.82))",
    color: "#fef9c3",
  },
  [`& .${sparkle}`]: {
    color: "rgba(250, 204, 21, 0.92)",
    textShadow: "0 0 9px rgba(250, 204, 21, 0.62)",
  },
});

export const newYearsEve = styles.class("holidayeffects-newYearsEve", {
  [`& .${banner}`]: {
    borderColor: "rgba(250, 204, 21, 0.55)",
    background: "linear-gradient(135deg, rgba(24, 24, 42, 0.86), rgba(88, 28, 135, 0.82))",
    color: "#fef9c3",
  },
  [`& .${sparkle}`]: {
    color: "rgba(250, 204, 21, 0.92)",
    textShadow: "0 0 9px rgba(250, 204, 21, 0.62)",
  },
});

export const valentines = styles.class("holidayeffects-valentines", {
  [`& .${banner}`]: {
    borderColor: "rgba(244, 114, 182, 0.6)",
    background: "linear-gradient(135deg, rgba(136, 19, 55, 0.84), rgba(190, 24, 93, 0.8))",
    color: "#ffe4e6",
  },
  [`& .${sparkle}`]: {
    color: "rgba(251, 113, 133, 0.93)",
    textShadow: "0 0 9px rgba(244, 114, 182, 0.6)",
  },
});

export const stPatricks = styles.class("holidayeffects-stPatricks", {
  [`& .${banner}`]: {
    borderColor: "rgba(34, 197, 94, 0.5)",
    background: "linear-gradient(135deg, rgba(5, 46, 22, 0.8), rgba(21, 128, 61, 0.8))",
    color: "#dcfce7",
  },
  [`& .${sparkle}`]: {
    color: "rgba(134, 239, 172, 0.9)",
    textShadow: "0 0 8px rgba(74, 222, 128, 0.55)",
  },
});

export const independence = styles.class("holidayeffects-independence", {
  [`& .${banner}`]: {
    borderColor: "rgba(147, 197, 253, 0.62)",
    background: "linear-gradient(135deg, rgba(30, 58, 138, 0.86), rgba(153, 27, 27, 0.8))",
    color: "#eff6ff",
  },
  [`& .${sparkle}`]: {
    color: "rgba(191, 219, 254, 0.9)",
    textShadow: "0 0 8px rgba(96, 165, 250, 0.62)",
  },
});

export const halloween = styles.class("holidayeffects-halloween", {
  [`& .${banner}`]: {
    borderColor: "rgba(251, 146, 60, 0.65)",
    background: "linear-gradient(135deg, rgba(38, 18, 2, 0.84), rgba(124, 45, 18, 0.8))",
    color: "#ffedd5",
  },
  [`& .${sparkle}`]: {
    color: "rgba(251, 146, 60, 0.92)",
    textShadow: "0 0 8px rgba(249, 115, 22, 0.65)",
  },
});

export const thanksgiving = styles.class("holidayeffects-thanksgiving", {
  [`& .${banner}`]: {
    borderColor: "rgba(234, 179, 8, 0.6)",
    background: "linear-gradient(135deg, rgba(69, 26, 3, 0.84), rgba(146, 64, 14, 0.8))",
    color: "#fef3c7",
  },
  [`& .${sparkle}`]: {
    color: "rgba(252, 211, 77, 0.9)",
    textShadow: "0 0 8px rgba(245, 158, 11, 0.6)",
  },
});

export const christmas = styles.class("holidayeffects-christmas", {
  [`& .${banner}`]: {
    borderColor: "rgba(248, 113, 113, 0.6)",
    background: "linear-gradient(135deg, rgba(69, 10, 10, 0.84), rgba(21, 128, 61, 0.78))",
    color: "#fef2f2",
  },
  [`& .${sparkle}`]: {
    color: "rgba(187, 247, 208, 0.92)",
    textShadow: "0 0 9px rgba(74, 222, 128, 0.64)",
  },
});
