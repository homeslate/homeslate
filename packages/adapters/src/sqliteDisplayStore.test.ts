import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { openSqlite } from "./sqlite";
import { SqliteDisplayStore } from "./sqliteDisplayStore";
import { createEmptyDisplayDocument } from "./emptyDocument";
import { DisplayNotFoundError, InvalidDisplayDocumentError } from "./types";

describe("SqliteDisplayStore", () => {
  let dir = "";
  afterEach(async () => {
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  async function store() {
    dir = await mkdtemp(join(tmpdir(), "homeslate-sqlite-"));
    return new SqliteDisplayStore({ database: openSqlite(join(dir, "ref.sqlite")) });
  }

  it("create, get, getByPublicId, list, put, remove round-trip", async () => {
    const displays = await store();
    const created = await displays.create(createEmptyDisplayDocument("Kitchen"));
    expect(created.publicId).toEqual(expect.any(String));
    expect(await displays.get(created.id)).toEqual(created);
    expect(await displays.getByPublicId(created.publicId)).toEqual(created);
    expect(await displays.list()).toEqual([{ id: created.id, name: "Kitchen" }]);

    const next = { ...created.document, name: "Patio" };
    await displays.put(created.id, next);
    expect((await displays.get(created.id))?.document.name).toBe("Patio");
    expect(await displays.list()).toEqual([{ id: created.id, name: "Patio" }]);

    await displays.remove(created.id);
    expect(await displays.get(created.id)).toBeNull();
    expect(await displays.list()).toEqual([]);
  });

  it("put rejects invalid documents and leaves the stored document unchanged", async () => {
    const displays = await store();
    const created = await displays.create(createEmptyDisplayDocument("Kitchen"));
    await expect(
      displays.put(created.id, { schemaVersion: 1, name: "x", views: "nope" } as never),
    ).rejects.toBeInstanceOf(InvalidDisplayDocumentError);
    expect((await displays.get(created.id))?.document.name).toBe("Kitchen");
  });

  it("put throws DisplayNotFoundError for an unknown id", async () => {
    const displays = await store();
    await expect(displays.put("missing", createEmptyDisplayDocument())).rejects.toBeInstanceOf(
      DisplayNotFoundError,
    );
  });

  it("setPasscode stores a hash without leaking it on get or put", async () => {
    const displays = await store();
    const created = await displays.create(createEmptyDisplayDocument("Kitchen"));
    expect(await displays.getPasscodeHash(created.id)).toBeNull();

    await displays.setPasscode(created.id, "scrypt$abc$def");
    expect(await displays.getPasscodeHash(created.id)).toBe("scrypt$abc$def");
    expect(await displays.get(created.id)).toEqual(created);

    await displays.put(created.id, { ...created.document, name: "Patio" });
    expect(await displays.getPasscodeHash(created.id)).toBe("scrypt$abc$def");

    await displays.setPasscode(created.id, null);
    expect(await displays.getPasscodeHash(created.id)).toBeNull();
  });

  it("setPasscode throws DisplayNotFoundError for an unknown id", async () => {
    const displays = await store();
    await expect(displays.setPasscode("missing", "hash")).rejects.toBeInstanceOf(
      DisplayNotFoundError,
    );
  });

  it("getPasscodeHash returns null for an unknown id", async () => {
    const displays = await store();
    expect(await displays.getPasscodeHash("missing")).toBeNull();
  });
});
