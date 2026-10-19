import { describe, expect, it } from "vite-plus/test";
import {
  TODO_EMPTY_COPY,
  TODO_MISSING_CONFIG_COPY,
  homeAssistantTodoItemsUrl,
} from "./homeAssistantTodo";

describe("todo copy", () => {
  it("matches the spec strings", () => {
    expect(TODO_EMPTY_COPY).toBe("Pick a Home Assistant list in settings.");
    expect(TODO_MISSING_CONFIG_COPY).toBe(
      "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.",
    );
  });
});

describe("homeAssistantTodoItemsUrl", () => {
  it("builds a same-origin items url", () => {
    expect(homeAssistantTodoItemsUrl("todo.shopping_list")).toBe(
      "/api/homeassistant/todo/todo.shopping_list/items",
    );
  });

  it("encodes the entity id", () => {
    expect(homeAssistantTodoItemsUrl("todo.a b")).toBe("/api/homeassistant/todo/todo.a%20b/items");
  });
});
