import { describe, expect, it } from "vite-plus/test";
import { clearCheckedGroceryItems, visibleGroceryItems } from "./grocery";

const items = [
  { id: "1", text: "Milk", checked: false, aisle: "Dairy" },
  { id: "2", text: "Apples", checked: true, aisle: "Produce" },
  { id: "3", text: "Eggs", checked: false, aisle: "Dairy" },
  { id: "4", text: "Soap", checked: true },
];

describe("visibleGroceryItems", () => {
  it("sorts checked items to the bottom when not grouping", () => {
    expect(
      visibleGroceryItems(items, { hideChecked: false, groupByAisle: false }).map((i) => i.id),
    ).toEqual(["1", "3", "2", "4"]);
  });

  it("hides checked items when asked", () => {
    expect(
      visibleGroceryItems(items, { hideChecked: true, groupByAisle: false }).map((i) => i.id),
    ).toEqual(["1", "3"]);
  });

  it("keeps aisle groups and puts ungrouped items last", () => {
    expect(
      visibleGroceryItems(items, { hideChecked: false, groupByAisle: true }).map((i) => i.id),
    ).toEqual(["1", "3", "2", "4"]);
  });
});

describe("clearCheckedGroceryItems", () => {
  it("removes checked items instead of unchecking them", () => {
    expect(clearCheckedGroceryItems(items).map((i) => i.id)).toEqual(["1", "3"]);
  });
});
