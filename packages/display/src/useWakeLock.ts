import { useEffect } from "react";

export interface WakeLockSentinelLike {
  release(): Promise<void>;
}

export interface WakeLockController {
  request(type: "screen"): Promise<WakeLockSentinelLike>;
}

/** Omitted `wakeLockEnabled` stays on. */
export function wakeLockEnabled(settings: { wakeLockEnabled?: boolean } | undefined): boolean {
  return settings?.wakeLockEnabled !== false;
}

/**
 * Request a screen wake lock while enabled and visible, reacquire when the
 * page becomes visible again, and release on cleanup. Unsupported browsers
 * no-op.
 */
export function bindScreenWakeLock(options: {
  enabled: boolean;
  getVisible: () => boolean;
  wakeLock: WakeLockController | null | undefined;
  subscribeVisibility: (onChange: () => void) => () => void;
}): () => void {
  if (!options.enabled || !options.wakeLock) return () => {};

  let sentinel: WakeLockSentinelLike | null = null;
  let disposed = false;

  const acquire = () => {
    if (disposed || !options.getVisible() || !options.wakeLock) return;
    void options.wakeLock.request("screen").then(
      (next) => {
        if (disposed) {
          void next.release();
          return;
        }
        sentinel = next;
      },
      () => {
        // Denied or unsupported. The kiosk still renders.
      },
    );
  };

  acquire();
  const stop = options.subscribeVisibility(() => {
    if (options.getVisible()) acquire();
    else void sentinel?.release();
  });

  return () => {
    disposed = true;
    stop();
    void sentinel?.release();
  };
}

export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    const nav = typeof navigator === "undefined" ? undefined : navigator;
    const wakeLock = (nav as (Navigator & { wakeLock?: WakeLockController }) | undefined)?.wakeLock;
    return bindScreenWakeLock({
      enabled,
      wakeLock,
      getVisible: () =>
        typeof document === "undefined" ? true : document.visibilityState === "visible",
      subscribeVisibility: (onChange) => {
        if (typeof document === "undefined") return () => {};
        document.addEventListener("visibilitychange", onChange);
        return () => document.removeEventListener("visibilitychange", onChange);
      },
    });
  }, [enabled]);
}
