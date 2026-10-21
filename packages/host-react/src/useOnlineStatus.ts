import { useEffect, useState } from "react";

export function readOnlineFlag(onLine: boolean | undefined): boolean {
  return onLine !== false;
}

export function subscribeOnlineStatus(
  target: {
    addEventListener(type: "online" | "offline", listener: () => void): void;
    removeEventListener(type: "online" | "offline", listener: () => void): void;
  },
  onChange: (online: boolean) => void,
): () => void {
  const online = () => onChange(true);
  const offline = () => onChange(false);
  target.addEventListener("online", online);
  target.addEventListener("offline", offline);
  return () => {
    target.removeEventListener("online", online);
    target.removeEventListener("offline", offline);
  };
}

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    readOnlineFlag(typeof navigator === "undefined" ? undefined : navigator.onLine),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    return subscribeOnlineStatus(window, setOnline);
  }, []);

  return online;
}
