import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { getPublicDocument, publicDocumentUrl, setDisplayPasscode } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("host api", () => {
  it("builds a public document URL and encodes the passcode", () => {
    expect(publicDocumentUrl("http://host", "abc", null)).toBe("http://host/api/public/abc");
    expect(publicDocumentUrl("http://host/", "abc", "12 34")).toBe(
      "http://host/api/public/abc?passcode=12%2034",
    );
  });

  it("reports a passcode gate instead of throwing", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ passcodeRequired: true }, 401));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublicDocument("", "abc")).resolves.toEqual({ status: "passcode-required" });
    expect(fetchMock).toHaveBeenCalledWith("/api/public/abc");
  });

  it("returns the document and forwards the passcode when allowed", async () => {
    const document = { schemaVersion: 1 } as never;
    const fetchMock = vi.fn(async () => jsonResponse({ document }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublicDocument("", "abc", "1234")).resolves.toEqual({
      status: "ok",
      document,
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/public/abc?passcode=1234");
  });

  it("patches the viewer passcode on the display record", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ id: "d1", passcodeEnabled: true }));
    vi.stubGlobal("fetch", fetchMock);

    await setDisplayPasscode("", "d1", "1234");
    expect(fetchMock).toHaveBeenCalledWith("/api/displays/d1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: "1234" }),
    });
  });
});
