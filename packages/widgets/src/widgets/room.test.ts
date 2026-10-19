import { describe, expect, it } from "vite-plus/test";
import { summarizeRoom } from "./room";

const light = (entityId: string, isOn: boolean) => ({
  entityId,
  name: entityId,
  domain: "light",
  isOn,
  brightnessPct: isOn ? 80 : 0,
  percentage: null,
  supportedFeatures: 0,
  control: "brightness",
  available: true,
});

const cover = (entityId: string, state: string, position: number) => ({
  entityId,
  name: entityId,
  state,
  position,
  deviceClass: "blind",
  supportedFeatures: 15,
  isGarage: false,
  available: true,
});

describe("summarizeRoom", () => {
  it("counts on lights/switches and open covers in configured order", () => {
    const summary = summarizeRoom(
      ["light.kitchen", "switch.kettle", "cover.blind", "light.hall"],
      [
        light("light.kitchen", true),
        { ...light("switch.kettle", false), domain: "switch", control: "toggle" },
        cover("cover.blind", "open", 40),
        light("light.hall", false),
      ],
    );

    expect(summary).toMatchObject({ on: 1, open: 1, total: 4, allOff: false });
    expect(summary.rows.map((row) => row.entityId)).toEqual([
      "light.kitchen",
      "switch.kettle",
      "cover.blind",
      "light.hall",
    ]);
  });

  it("reports all off when nothing is on or open", () => {
    expect(
      summarizeRoom(
        ["light.kitchen", "cover.blind"],
        [light("light.kitchen", false), cover("cover.blind", "closed", 0)],
      ),
    ).toMatchObject({ on: 0, open: 0, total: 2, allOff: true });
  });

  it("skips missing and empty groups", () => {
    expect(summarizeRoom(["light.missing"], [])).toEqual({
      on: 0,
      open: 0,
      total: 0,
      allOff: true,
      rows: [],
    });
  });
});
