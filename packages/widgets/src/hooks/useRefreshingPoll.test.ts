import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { getNextPollDelay } from "./polling";
import { startRefreshingPoll } from "./useRefreshingPoll";

afterEach(() => {
  vi.useRealTimers();
});

describe("startRefreshingPoll", () => {
  it("schedules another poll after a successful refresh", async () => {
    vi.useFakeTimers();
    let calls = 0;
    const stop = startRefreshingPoll({
      getDelayMs: () => 1_000,
      poll: () => {
        calls += 1;
      },
    });

    await vi.advanceTimersByTimeAsync(1_000);
    expect(calls).toBe(1);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(calls).toBe(2);

    stop();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(calls).toBe(2);
  });

  it("uses the latest delay after a failure", async () => {
    vi.useFakeTimers();
    let failures = 0;
    startRefreshingPoll({
      getDelayMs: () => getNextPollDelay(60_000, failures),
      poll: () => {
        failures += 1;
      },
    });

    await vi.advanceTimersByTimeAsync(60_000);
    expect(failures).toBe(1);
    await vi.advanceTimersByTimeAsync(4_999);
    expect(failures).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(failures).toBe(2);
  });
});
