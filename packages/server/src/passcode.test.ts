import { describe, expect, it } from "vite-plus/test";
import { hashPasscode, isValidPin, verifyPasscode } from "./passcode";

describe("passcode", () => {
  it("accepts only four-digit pins", () => {
    expect(isValidPin("0000")).toBe(true);
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("123")).toBe(false);
    expect(isValidPin("12345")).toBe(false);
    expect(isValidPin("12a4")).toBe(false);
    expect(isValidPin("")).toBe(false);
  });

  it("salted-hashes a pin and verifies only the matching one", () => {
    const first = hashPasscode("1234");
    const second = hashPasscode("1234");
    expect(first).not.toBe(second);
    expect(first.startsWith("scrypt$")).toBe(true);
    expect(verifyPasscode("1234", first)).toBe(true);
    expect(verifyPasscode("4321", first)).toBe(false);
  });

  it("rejects missing or malformed stored hashes", () => {
    expect(verifyPasscode("1234", null)).toBe(false);
    expect(verifyPasscode("1234", undefined)).toBe(false);
    expect(verifyPasscode("1234", "")).toBe(false);
    expect(verifyPasscode("1234", "plain-sha256")).toBe(false);
  });
});
