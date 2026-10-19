import { describe, expect, it } from "vite-plus/test";
import { nextReconnectDelay } from "./backoff";

describe("nextReconnectDelay", () => {
  it("grows exponentially and caps at 60s", () => {
    expect(nextReconnectDelay(0, 0.5)).toBe(1_000);
    expect(nextReconnectDelay(1, 0.5)).toBe(2_000);
    expect(nextReconnectDelay(5, 0.5)).toBe(32_000);
    expect(nextReconnectDelay(20, 0.5)).toBe(60_000);
    expect(nextReconnectDelay(0, 0.5)).toBeLessThan(nextReconnectDelay(5, 0.5));
  });

  it("stays in bounds for any jitter", () => {
    for (const attempt of [0, 1, 2, 5, 20]) {
      for (const rand of [0, 0.5, 1]) {
        const delay = nextReconnectDelay(attempt, rand);
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(60_000);
      }
    }
  });

  it("defaults to randomness", () => {
    const delay = nextReconnectDelay(0);
    expect(delay).toBeGreaterThan(0);
    expect(delay).toBeLessThanOrEqual(60_000);
  });
});
