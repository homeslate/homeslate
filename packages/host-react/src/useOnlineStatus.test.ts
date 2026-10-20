import { describe, expect, it } from "vite-plus/test";
import { readOnlineFlag, subscribeOnlineStatus } from "./useOnlineStatus";

describe("useOnlineStatus", () => {
  it("reads the navigator flag", () => {
    expect(readOnlineFlag(false)).toBe(false);
    expect(readOnlineFlag(true)).toBe(true);
    expect(readOnlineFlag(undefined)).toBe(true);
  });

  it("follows online and offline events", () => {
    const target = new EventTarget();
    const seen: boolean[] = [];
    const stop = subscribeOnlineStatus(target, (online) => seen.push(online));
    target.dispatchEvent(new Event("offline"));
    target.dispatchEvent(new Event("online"));
    stop();
    target.dispatchEvent(new Event("offline"));
    expect(seen).toEqual([false, true]);
  });
});
