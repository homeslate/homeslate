export function isAnnouncementVisible(now: Date, showFrom?: string, showUntil?: string): boolean {
  const time = now.getTime();
  if (showFrom) {
    const from = Date.parse(showFrom);
    if (!Number.isNaN(from) && time < from) return false;
  }
  if (showUntil) {
    const until = Date.parse(showUntil);
    if (!Number.isNaN(until) && time >= until) return false;
  }
  return true;
}
