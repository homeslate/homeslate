/** `max-age` for the fresh window, then stale-while-revalidate until `staleSeconds`. */
export function freshCacheControl(
  freshSeconds: number,
  staleSeconds: number,
  visibility: "public" | "private" = "public",
): string {
  const staleWhileRevalidate = Math.max(0, staleSeconds - freshSeconds);
  return `${visibility}, max-age=${freshSeconds}, stale-while-revalidate=${staleWhileRevalidate}`;
}
