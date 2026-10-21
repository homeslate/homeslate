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
  return a >= 224;
}

function isPrivateIp(host: string): boolean {
  const bare = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (bare.includes(":")) {
    if (bare === "::" || bare === "::1") return true;
    if (
      bare.startsWith("fe80:") ||
      bare.startsWith("fc") ||
      bare.startsWith("fd") ||
      bare.startsWith("ff") ||
      bare.startsWith("fec")
    ) {
      return true;
    }
    const mapped = /^(?:::|(?:0+:){5})ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(bare);
    if (mapped) return isPrivateIpv4(mapped[1]);
    const hexMapped = /^(?:::|(?:0+:){5})ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(bare);
    if (hexMapped) {
      const high = Number.parseInt(hexMapped[1], 16);
      const low = Number.parseInt(hexMapped[2], 16);
      return isPrivateIpv4(`${(high >> 8) & 255}.${high & 255}.${(low >> 8) & 255}.${low & 255}`);
    }
    return false;
  }
  return /^\d+\.\d+\.\d+\.\d+$/.test(bare) && isPrivateIpv4(bare);
}

/** Decimal, octal, hex, and short IP spellings that parsers may still dial. */
function isObfuscatedHost(host: string): boolean {
  const bare = host.replace(/^\[|\]$/g, "");
  if (/^\d+$/.test(bare) || /^0x[0-9a-f]+$/i.test(bare)) return true;
  const parts = bare.split(".");
  if (parts.length < 2 || parts.length > 4) return false;
  if (!parts.every((part) => /^(?:0x[0-9a-f]+|\d+)$/i.test(part))) return false;
  if (parts.length !== 4) return true;
  return parts.some((part) => /^0\d/.test(part) || part.toLowerCase().startsWith("0x"));
}

/** True for resolved addresses the server must not connect to. */
export function isDisallowedAddress(address: string): boolean {
  return isPrivateIp(address);
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
  if (!host || BLOCKED_HOST.test(host) || isObfuscatedHost(host)) return false;
  return !isPrivateIp(host);
}
