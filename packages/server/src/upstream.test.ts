import { createServer, request as httpRequest } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vite-plus/test";
import {
  UpstreamError,
  pinnedLookup,
  readPublicResource,
  resolvePublicAddresses,
} from "./upstream";

describe("resolvePublicAddresses", () => {
  it("refuses a name that resolves to a private or link-local address", async () => {
    await expect(
      resolvePublicAddresses("homeassistant.lan", async () => ["192.168.1.20"]),
    ).rejects.toBeInstanceOf(UpstreamError);
    await expect(
      resolvePublicAddresses("metadata.internal.test", async () => ["169.254.169.254"]),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("returns public answers and literal public addresses", async () => {
    await expect(resolvePublicAddresses("finnhub.io", async () => ["1.1.1.1"])).resolves.toEqual([
      "1.1.1.1",
    ]);
    await expect(resolvePublicAddresses("1.1.1.1", async () => ["10.0.0.1"])).resolves.toEqual([
      "1.1.1.1",
    ]);
  });
});

describe("readPublicResource", () => {
  it("connects only to a vetted address", async () => {
    const seen: string[] = [];
    const result = await readPublicResource("https://finnhub.io/api/v1/quote?token=secret", {
      lookupHost: async () => ["1.1.1.1"],
      requestImpl: async (target, address) => {
        seen.push(`${address} ${target.hostname} ${target.search}`);
        return {
          status: 200,
          headers: { "content-type": "application/json" },
          body: new TextEncoder().encode("{}"),
        };
      },
    });

    expect(seen).toEqual(["1.1.1.1 finnhub.io ?token=secret"]);
    expect(new TextDecoder().decode(result.body)).toBe("{}");
  });

  it("dials the pinned address when the hostname would resolve elsewhere", async () => {
    const server = createServer((_request, response) => {
      response.end("pinned");
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const { port } = server.address() as AddressInfo;
    try {
      const body = await new Promise<string>((resolve, reject) => {
        const outbound = httpRequest(
          {
            hostname: "finnhub.io",
            port,
            path: "/",
            lookup: pinnedLookup("127.0.0.1"),
          },
          (response) => {
            const chunks: Buffer[] = [];
            response.on("data", (chunk: Buffer) => chunks.push(chunk));
            response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
          },
        );
        outbound.on("error", reject);
        outbound.end();
      });
      expect(body).toBe("pinned");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it("does not connect when resolution is private", async () => {
    let called = false;
    await expect(
      readPublicResource("https://feeds.example.test/rss", {
        lookupHost: async () => ["10.0.0.5"],
        requestImpl: async () => {
          called = true;
          throw new Error("should not connect");
        },
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(called).toBe(false);
  });
});
