const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export const EMBED_EMPTY_COPY = "Paste a page URL in settings.";
export const EMBED_INVALID_COPY = "This URL cannot be embedded";

export function isLoopbackHostname(hostname: string): boolean {
  return LOOPBACK.has(hostname);
}

export function embedIframeKey(
  frameKey: number,
  allowInteraction: boolean,
  href: string,
): string {
  return `${frameKey}:${allowInteraction}:${href}`;
}

export function parseEmbedUrl(raw: string): { ok: true; href: string } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false };
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false };
  }
  if (url.protocol === "https:") return { ok: true, href: url.href };
  if (url.protocol === "http:" && isLoopbackHostname(url.hostname)) return { ok: true, href: url.href };
  return { ok: false };
}

export function embedSandbox(allowInteraction: boolean): string {
  return allowInteraction
    ? "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    : "";
}
