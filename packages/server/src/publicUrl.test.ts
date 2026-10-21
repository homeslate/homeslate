import { describe, expect, it } from "vite-plus/test";
import { isPublicHttpUrl } from "./publicUrl";

describe("isPublicHttpUrl", () => {
  it("allows public http(s) URLs and rejects local or private targets", () => {
    expect(isPublicHttpUrl("https://feeds.bbci.co.uk/news/rss.xml")).toBe(true);
    expect(isPublicHttpUrl("http://example.com/calendar.ics")).toBe(true);
    expect(isPublicHttpUrl("http://127.0.0.1/secret")).toBe(false);
    expect(isPublicHttpUrl("http://10.0.0.5/admin")).toBe(false);
    expect(isPublicHttpUrl("http://192.168.1.20:8123/api")).toBe(false);
    expect(isPublicHttpUrl("http://localhost/feed")).toBe(false);
    expect(isPublicHttpUrl("http://printer.local/status")).toBe(false);
    expect(isPublicHttpUrl("http://user:pass@example.com/feed")).toBe(false);
    expect(isPublicHttpUrl("file:///etc/passwd")).toBe(false);
    expect(isPublicHttpUrl("http://[::1]/feed")).toBe(false);
    expect(isPublicHttpUrl("http://2130706433/")).toBe(false);
    expect(isPublicHttpUrl("http://0177.0.0.1/")).toBe(false);
    expect(isPublicHttpUrl("http://127.1/")).toBe(false);
    expect(isPublicHttpUrl("http://224.0.0.1/")).toBe(false);
    expect(isPublicHttpUrl("http://[ff02::1]/")).toBe(false);
    expect(isPublicHttpUrl("http://[::ffff:7f00:1]/")).toBe(false);
    expect(isPublicHttpUrl("http://1.1.1.1/")).toBe(true);
  });
});
