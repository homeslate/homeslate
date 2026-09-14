import { describe, expect, it } from "vite-plus/test";
import { embedIframeKey, embedSandbox, isLoopbackHostname, parseEmbedUrl } from "./embedUrl";

describe("isLoopbackHostname", () => {
  it("treats both Node and WHATWG IPv6 loopback hostnames as loopback", () => {
    expect(isLoopbackHostname("::1")).toBe(true);
    expect(isLoopbackHostname("[::1]")).toBe(true);
    expect(isLoopbackHostname("localhost")).toBe(true);
    expect(isLoopbackHostname("127.0.0.1")).toBe(true);
    expect(isLoopbackHostname("192.168.1.10")).toBe(false);
  });
});

describe("embedIframeKey", () => {
  it("changes when allowInteraction or href changes so the iframe remounts", () => {
    const base = embedIframeKey(0, false, "https://ha.example/");
    expect(embedIframeKey(0, true, "https://ha.example/")).not.toBe(base);
    expect(embedIframeKey(0, false, "https://other.example/")).not.toBe(base);
    expect(embedIframeKey(1, false, "https://ha.example/")).not.toBe(base);
  });
});

describe("parseEmbedUrl", () => {
  it("allows https and loopback http only", () => {
    expect(parseEmbedUrl("https://ha.example/lovelace")).toEqual({
      ok: true,
      href: "https://ha.example/lovelace",
    });
    expect(parseEmbedUrl("http://localhost:8123/").ok).toBe(true);
    expect(parseEmbedUrl("http://127.0.0.1:8123/").ok).toBe(true);
    expect(parseEmbedUrl("http://[::1]/").ok).toBe(true);
  });

  it("rejects javascript, data, file, protocol-relative, and LAN http", () => {
    expect(parseEmbedUrl("javascript:alert(1)").ok).toBe(false);
    expect(parseEmbedUrl("data:text/html,hi").ok).toBe(false);
    expect(parseEmbedUrl("file:///etc/passwd").ok).toBe(false);
    expect(parseEmbedUrl("//evil.example").ok).toBe(false);
    expect(parseEmbedUrl("http://192.168.1.10/").ok).toBe(false);
    expect(parseEmbedUrl("ftp://example.com").ok).toBe(false);
  });
});

describe("embedSandbox", () => {
  it("is empty when interaction is off and includes HA-required tokens when on", () => {
    expect(embedSandbox(false)).toBe("");
    expect(embedSandbox(true).split(" ").sort()).toEqual(
      [
        "allow-forms",
        "allow-popups",
        "allow-popups-to-escape-sandbox",
        "allow-same-origin",
        "allow-scripts",
      ].sort(),
    );
  });
});
