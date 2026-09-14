import { describe, it, expect } from "vite-plus/test";
import { hexToRgb } from "./utils";

describe("hexToRgb", () => {
  it("parses 6-digit hex", () => {
    expect(hexToRgb("#6366f1")).toEqual({ r: 99, g: 102, b: 241 });
  });

  it("returns null for invalid input", () => {
    expect(hexToRgb("not-a-color")).toBeNull();
  });
});
