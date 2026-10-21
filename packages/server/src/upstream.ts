import http from "node:http";
import https from "node:https";
import { promises as dns } from "node:dns";
import type { LookupAddress } from "node:dns";
import { isDisallowedAddress, isPublicHttpUrl } from "./publicUrl";

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

export type HostLookup = (hostname: string) => Promise<readonly string[]>;

type UpstreamResponse = {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: Uint8Array<ArrayBuffer>;
};

export type PublicRequest = (
  target: URL,
  address: string,
  headers: HeadersInit | undefined,
  signal: AbortSignal,
) => Promise<UpstreamResponse>;

function bareHost(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, "");
}

export function isIpLiteral(hostname: string): boolean {
  const bare = bareHost(hostname);
  if (bare.includes(":")) return true;
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(bare);
}

async function defaultLookup(hostname: string): Promise<readonly string[]> {
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  return records.map((record: LookupAddress) => record.address);
}

/** Resolve a host and refuse any private, link-local, or multicast answer. */
export async function resolvePublicAddresses(
  hostname: string,
  lookupHost: HostLookup = defaultLookup,
): Promise<readonly string[]> {
  const bare = bareHost(hostname);
  if (isIpLiteral(bare)) {
    if (isDisallowedAddress(bare)) throw new UpstreamError(400, "URL is not allowed");
    return [bare];
  }
  let addresses: readonly string[];
  try {
    addresses = await lookupHost(bare);
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    throw new UpstreamError(502, "Provider host could not be resolved");
  }
  if (addresses.length === 0 || addresses.some((address) => isDisallowedAddress(address))) {
    throw new UpstreamError(400, "URL is not allowed");
  }
  return addresses;
}

function headerRecord(headers: HeadersInit | undefined, host: string): http.OutgoingHttpHeaders {
  const record: http.OutgoingHttpHeaders = { host };
  if (!headers) return record;
  new Headers(headers).forEach((value, key) => {
    if (key.toLowerCase() === "host") return;
    record[key] = value;
  });
  return record;
}

function headerValue(headers: http.IncomingHttpHeaders, name: string): string | null {
  const value = headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function readBody(res: http.IncomingMessage): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    res.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BYTES) {
        res.destroy();
        reject(new UpstreamError(502, "Provider response is too large"));
        return;
      }
      chunks.push(chunk);
    });
    res.on("end", () => {
      const source = Buffer.concat(chunks);
      const copy = new ArrayBuffer(source.byteLength);
      new Uint8Array(copy).set(source);
      resolve(new Uint8Array(copy));
    });
    res.on("error", reject);
  });
}

type LookupCallback = (
  error: NodeJS.ErrnoException | null,
  address: string | LookupAddress[],
  family?: number,
) => void;

/** Force the connection onto one already-vetted address. */
export function pinnedLookup(address: string) {
  const family = address.includes(":") ? 6 : 4;
  return (_hostname: string, options: unknown, callback: LookupCallback) => {
    const done = typeof options === "function" ? (options as LookupCallback) : callback;
    if (options && typeof options === "object" && "all" in options && options.all) {
      done(null, [{ address, family }]);
      return;
    }
    done(null, address, family);
  };
}

function requestPinned(
  target: URL,
  address: string,
  headers: HeadersInit | undefined,
  signal: AbortSignal,
): Promise<UpstreamResponse> {
  const transport = target.protocol === "https:" ? https : http;
  const port = target.port ? Number(target.port) : target.protocol === "https:" ? 443 : 80;

  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new UpstreamError(502, "Provider request failed"));
      return;
    }
    const req = transport.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        servername: target.hostname,
        port,
        method: "GET",
        path: `${target.pathname}${target.search}`,
        headers: headerRecord(headers, target.host),
        lookup: pinnedLookup(address),
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          res.resume();
          resolve({ status, headers: res.headers, body: new Uint8Array() });
          return;
        }
        void readBody(res).then((body) => resolve({ status, headers: res.headers, body }), reject);
      },
    );
    const abort = () => {
      req.destroy();
    };
    signal.addEventListener("abort", abort, { once: true });
    req.on("error", (error) => {
      signal.removeEventListener("abort", abort);
      reject(error);
    });
    req.end();
  });
}

export async function readPublicResource(
  startUrl: string,
  options?: {
    headers?: HeadersInit;
    lookupHost?: HostLookup;
    requestImpl?: PublicRequest;
  },
): Promise<{ body: Uint8Array<ArrayBuffer>; contentType: string | null }> {
  const lookupHost = options?.lookupHost ?? defaultLookup;
  const requestImpl = options?.requestImpl ?? requestPinned;
  let current = startUrl;
  const signal = AbortSignal.timeout(TIMEOUT_MS);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!isPublicHttpUrl(current)) throw new UpstreamError(400, "URL is not allowed");
    const target = new URL(current);
    const addresses = await resolvePublicAddresses(target.hostname, lookupHost);
    let response: UpstreamResponse;
    try {
      response = await requestImpl(target, addresses[0], options?.headers, signal);
    } catch (error) {
      if (error instanceof UpstreamError) throw error;
      throw new UpstreamError(502, "Provider request failed");
    }
    if (response.status >= 300 && response.status < 400) {
      const location = headerValue(response.headers, "location");
      if (!location || hop === MAX_REDIRECTS) {
        throw new UpstreamError(502, "Provider redirect failed");
      }
      const next = new URL(location, current);
      if (next.host !== target.host) {
        throw new UpstreamError(502, "Provider redirect left the host");
      }
      current = next.toString();
      continue;
    }
    if (response.status < 200 || response.status >= 300) {
      throw new UpstreamError(502, "Provider request failed");
    }
    if (response.body.byteLength > MAX_BYTES) {
      throw new UpstreamError(502, "Provider response is too large");
    }
    return {
      body: response.body,
      contentType: headerValue(response.headers, "content-type"),
    };
  }
  throw new UpstreamError(502, "Provider request failed");
}
