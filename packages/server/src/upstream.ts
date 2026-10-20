import { isPublicHttpUrl } from "./publicUrl";

const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10_000;

export class UpstreamError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function readPublicResource(
  startUrl: string,
  options?: { fetchImpl?: typeof fetch; headers?: HeadersInit },
): Promise<{ body: Uint8Array; contentType: string | null }> {
  const fetchImpl = options?.fetchImpl ?? globalThis.fetch;
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!isPublicHttpUrl(current)) throw new UpstreamError(400, "URL is not allowed");
    const response = await fetchImpl(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: options?.headers,
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || hop === MAX_REDIRECTS)
        throw new UpstreamError(502, "Provider redirect failed");
      const next = new URL(location, current);
      if (next.host !== new URL(current).host) {
        throw new UpstreamError(502, "Provider redirect left the host");
      }
      current = next.toString();
      continue;
    }
    if (!response.ok) throw new UpstreamError(502, "Provider request failed");
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES)
      throw new UpstreamError(502, "Provider response is too large");
    return {
      body: new Uint8Array(buffer),
      contentType: response.headers.get("content-type"),
    };
  }
  throw new UpstreamError(502, "Provider request failed");
}
