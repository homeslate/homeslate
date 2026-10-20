const BLOCKED_HOST =
  /^(localhost|.*\.localhost|.*\.local|.*\.internal|metadata\.google\.internal)$/i;

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map((part) => Number(part));
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return a === 255 && b === 255 && parts[2] === 255 && parts[3] === 255;
}

function isPrivateIp(host: string): boolean {
  const bare = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (bare.includes(":")) {
    if (bare === "::" || bare === "::1") return true;
    if (bare.startsWith("fe80:") || bare.startsWith("fc") || bare.startsWith("fd")) return true;
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(bare);
    return mapped ? isPrivateIpv4(mapped[1]) : false;
  }
  return /^\d+\.\d+\.\d+\.\d+$/.test(bare) && isPrivateIpv4(bare);
}

/** True for http(s) URLs that are safe for the server to fetch on behalf of a widget. */
export function isPublicHttpUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.username || url.password) return false;
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!host || BLOCKED_HOST.test(host)) return false;
  return !isPrivateIp(host);
}
