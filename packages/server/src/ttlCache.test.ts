import { expect, it } from "vite-plus/test";
import { createTtlCache } from "./ttlCache";

it("returns a hit before expiry and misses after", () => {
  const cache = createTtlCache<string>();
  cache.set("k", "v", 1000, 0);
  expect(cache.get("k", 999)).toBe("v");
  expect(cache.get("k", 1000)).toBeUndefined();
});
