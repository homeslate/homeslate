import { describe, expect, it } from "vite-plus/test";
import {
  TODO_WRITE_SERVICES,
  buildTodoServicePayload,
  isAllowedTodoService,
  isValidTodoEntityId,
  mapTodoItems,
} from "./todoState";

describe("isValidTodoEntityId", () => {
  it("accepts slug todo ids and rejects everything else", () => {
    expect(isValidTodoEntityId("todo.shopping_list")).toBe(true);
    expect(isValidTodoEntityId("todo.tasks2")).toBe(true);
    expect(isValidTodoEntityId("todo.Shopping List")).toBe(false);
    expect(isValidTodoEntityId("climate.living_room")).toBe(false);
    expect(isValidTodoEntityId("todo../secrets")).toBe(false);
    expect(isValidTodoEntityId("todo.")).toBe(false);
    expect(isValidTodoEntityId("")).toBe(false);
  });
});

describe("isAllowedTodoService", () => {
  it("allows only the todo write allowlist", () => {
    expect(TODO_WRITE_SERVICES).toContain("add_item");
    expect(isAllowedTodoService("add_item")).toBe(true);
    expect(isAllowedTodoService("update_item")).toBe(true);
    expect(isAllowedTodoService("remove_item")).toBe(true);
    expect(isAllowedTodoService("get_items")).toBe(false);
    expect(isAllowedTodoService("reload")).toBe(false);
    expect(isAllowedTodoService("")).toBe(false);
  });
});

describe("buildTodoServicePayload", () => {
  it("builds add/remove payloads and drops unknown keys", () => {
    expect(
      buildTodoServicePayload("add_item", "todo.shopping", { item: "Milk", bogus: true }),
    ).toEqual({ entity_id: "todo.shopping", item: "Milk" });
    expect(buildTodoServicePayload("remove_item", "todo.shopping", { item: "abc" })).toEqual({
      entity_id: "todo.shopping",
      item: "abc",
    });
  });

  it("requires an entity id and a non-empty item", () => {
    expect(buildTodoServicePayload("add_item", "light.kitchen", { item: "Milk" })).toBeNull();
    expect(buildTodoServicePayload("add_item", "todo.shopping", { item: "" })).toBeNull();
    expect(buildTodoServicePayload("add_item", "todo.shopping", {})).toBeNull();
    expect(buildTodoServicePayload("reload", "todo.shopping", { item: "Milk" })).toBeNull();
  });

  it("keeps a valid status and summary for update_item", () => {
    expect(
      buildTodoServicePayload("update_item", "todo.shopping", {
        item: "abc",
        status: "completed",
      }),
    ).toEqual({ entity_id: "todo.shopping", item: "abc", status: "completed" });
    expect(
      buildTodoServicePayload("update_item", "todo.shopping", { item: "abc", summary: "Bread" }),
    ).toEqual({ entity_id: "todo.shopping", item: "abc", summary: "Bread" });
  });

  it("rejects update_item without a status or summary, or with a bad status", () => {
    expect(buildTodoServicePayload("update_item", "todo.shopping", { item: "abc" })).toBeNull();
    expect(
      buildTodoServicePayload("update_item", "todo.shopping", { item: "abc", status: "nope" }),
    ).toBeNull();
  });
});

describe("mapTodoItems", () => {
  it("maps the REST response keyed by entity id", () => {
    expect(
      mapTodoItems(
        {
          "todo.shopping": {
            items: [
              { uid: "1", summary: "Milk", status: "needs_action" },
              { uid: "2", summary: "Bread", status: "completed" },
            ],
          },
        },
        "todo.shopping",
      ),
    ).toEqual([
      { uid: "1", summary: "Milk", status: "needs_action" },
      { uid: "2", summary: "Bread", status: "completed" },
    ]);
  });

  it("unwraps a websocket-style service_response", () => {
    expect(
      mapTodoItems(
        { service_response: { "todo.shopping": { items: [{ uid: "1", summary: "Milk" }] } } },
        "todo.shopping",
      ),
    ).toEqual([{ uid: "1", summary: "Milk", status: "needs_action" }]);
  });

  it("falls back to a bare items array and the summary as uid", () => {
    expect(mapTodoItems({ items: [{ summary: "Eggs" }] }, "todo.shopping")).toEqual([
      { uid: "Eggs", summary: "Eggs", status: "needs_action" },
    ]);
  });

  it("skips malformed entries and returns an empty list for junk", () => {
    expect(
      mapTodoItems(
        { "todo.shopping": { items: [null, "nope", { uid: "1" }, { summary: "Milk" }] } },
        "todo.shopping",
      ),
    ).toEqual([{ uid: "Milk", summary: "Milk", status: "needs_action" }]);
    expect(mapTodoItems(null, "todo.shopping")).toEqual([]);
    expect(mapTodoItems({}, "todo.shopping")).toEqual([]);
  });
});
