/** `max-age` for the fresh window, then stale-while-revalidate until `staleSeconds`. */
export function freshCacheControl(freshSeconds: number, staleSeconds: number): string {
  const staleWhileRevalidate = Math.max(0, staleSeconds - freshSeconds);
  return `public, max-age=${freshSeconds}, stale-while-revalidate=${staleWhileRevalidate}`;
}
