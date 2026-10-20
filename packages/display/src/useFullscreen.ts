import { useEffect, useMemo, useState } from "react";

export interface FullscreenElementLike {
  requestFullscreen?: () => Promise<void>;
}

export interface FullscreenHost {
  fullscreenElement: Element | null;
  documentElement: FullscreenElementLike | null;
  exitFullscreen?: () => Promise<void>;
  addEventListener(type: "fullscreenchange", listener: () => void): void;
  removeEventListener(type: "fullscreenchange", listener: () => void): void;
}

export function bindFullscreen(host: FullscreenHost | null): {
  supported: boolean;
  isFullscreen: () => boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  subscribe: (onChange: () => void) => () => void;
} {
  const element = host?.documentElement ?? null;
  const supported = Boolean(
    element &&
    typeof element.requestFullscreen === "function" &&
    host &&
    typeof host.exitFullscreen === "function",
  );

  return {
    supported,
    isFullscreen: () => Boolean(host?.fullscreenElement),
    async enter() {
      if (!supported || !element?.requestFullscreen) return;
      await element.requestFullscreen();
    },
    async exit() {
      if (!supported || !host?.exitFullscreen || !host.fullscreenElement) return;
      await host.exitFullscreen();
    },
    subscribe(onChange) {
      if (!host) return () => {};
      host.addEventListener("fullscreenchange", onChange);
      return () => host.removeEventListener("fullscreenchange", onChange);
    },
  };
}

export function useFullscreen(): {
  supported: boolean;
  isFullscreen: boolean;
  toggle: () => Promise<void>;
} {
  const api = useMemo(
    () =>
      bindFullscreen(
        typeof document === "undefined" ? null : (document as unknown as FullscreenHost),
      ),
    [],
  );
  const [isFullscreen, setIsFullscreen] = useState(() => api.isFullscreen());

  useEffect(() => api.subscribe(() => setIsFullscreen(api.isFullscreen())), [api]);

  return {
    supported: api.supported,
    isFullscreen,
    toggle: () => (isFullscreen ? api.exit() : api.enter()),
  };
}
