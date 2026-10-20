/** Unlock and disarm stay disabled once cached state is older than this. */
export const SECURITY_CONTROL_MAX_AGE_MS = 2 * 60 * 1000;

export function securityHighRiskLocked(lastUpdated: number | null, now = Date.now()): boolean {
  if (lastUpdated == null) return false;
  return now - lastUpdated > SECURITY_CONTROL_MAX_AGE_MS;
}
