import { useEffect, useRef } from "react";

/**
 * Schedule `poll` after `getDelayMs()`, then schedule it again when that call
 * finishes. A successful poll does not have to change a failure counter for
 * the next one to be queued.
 */
export function startRefreshingPoll(input: {
  getDelayMs: () => number;
  poll: () => void | Promise<unknown>;
}): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    timer = setTimeout(() => {
      void Promise.resolve()
        .then(() => input.poll())
        .finally(() => {
          if (!stopped) schedule();
        });
    }, input.getDelayMs());
  };

  schedule();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}

/** Keep polling on `delayMs` while `enabled` is true, including after a success. */
export function useRefreshingPoll(
  enabled: boolean,
  delayMs: number,
  poll: () => void | Promise<unknown>,
): void {
  const pollRef = useRef(poll);
  const delayRef = useRef(delayMs);
  pollRef.current = poll;
  delayRef.current = delayMs;

  useEffect(() => {
    if (!enabled) return;
    return startRefreshingPoll({
      getDelayMs: () => delayRef.current,
      poll: () => pollRef.current(),
    });
  }, [delayMs, enabled]);
}
