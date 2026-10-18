import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Viewer passcode format: exactly four digits. */
const PIN_PATTERN = /^\d{4}$/;
const SCRYPT_PREFIX = "scrypt";
const SCRYPT_SALT_BYTES = 16;
const SCRYPT_KEY_BYTES = 32;

export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

/**
 * Hashes a 4-digit viewer passcode with a per-passcode salt.
 *
 * A 4-digit PIN is guessable no matter how it is stored; the salt only keeps
 * identical PINs from sharing a hash. The passcode is a kiosk convenience lock,
 * not a security boundary.
 */
export function hashPasscode(pin: string): string {
  const salt = randomBytes(SCRYPT_SALT_BYTES).toString("hex");
  const hash = scryptSync(pin, salt, SCRYPT_KEY_BYTES).toString("hex");
  return `${SCRYPT_PREFIX}$${salt}$${hash}`;
}

/** Timing-safe check of a presented PIN against a stored hash. */
export function verifyPasscode(pin: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [prefix, salt, hash] = stored.split("$");
  if (prefix !== SCRYPT_PREFIX || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  if (expected.length === 0) return false;
  const actual = scryptSync(pin, salt, expected.length);
  return timingSafeEqual(expected, actual);
}
