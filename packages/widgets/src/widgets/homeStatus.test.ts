import { describe, expect, it } from "vite-plus/test";
import { summarizeHomeStatus, type HomeStatusEntity } from "./homeStatus";

const light = (entityId: string, isOn: boolean): HomeStatusEntity =>
  ({ entityId, name: entityId, domain: "light", isOn }) as HomeStatusEntity;

const cover = (entityId: string, state: string): HomeStatusEntity =>
  ({ entityId, name: entityId, state }) as HomeStatusEntity;

const binarySensor = (entityId: string, deviceClass: string, isOn: boolean): HomeStatusEntity =>
  ({
    entityId,
    name: entityId,
    state: isOn ? "on" : "off",
    unit: null,
    deviceClass,
    icon: null,
    numericValue: null,
    isOn,
  }) as HomeStatusEntity;

const sensor = (entityId: string, name: string, value: number, unit: string): HomeStatusEntity =>
  ({
    entityId,
    name,
    state: String(value),
    unit,
    deviceClass: null,
    icon: null,
    numericValue: value,
    isOn: false,
  }) as HomeStatusEntity;

const alarm = (state: string): HomeStatusEntity =>
  ({
    kind: "alarm",
    entityId: "alarm_control_panel.home",
    name: "Home Alarm",
    state,
    supportedFeatures: 39,
    available: true,
  }) as HomeStatusEntity;

const person = (entityId: string, isHome: boolean): HomeStatusEntity =>
  ({
    entityId,
    name: entityId,
    state: isHome ? "home" : "not_home",
    isHome,
    zoneName: null,
    entityPicture: null,
  }) as HomeStatusEntity;

describe("summarizeHomeStatus", () => {
  it("builds the ordered roll-up from mixed entities", () => {
    expect(
      summarizeHomeStatus([
        light("light.kitchen", true),
        light("light.hall", false),
        cover("cover.garage", "open"),
        cover("cover.blind", "closed"),
        binarySensor("binary_sensor.front_door", "door", true),
        binarySensor("binary_sensor.window", "window", false),
        alarm("armed_away"),
        person("person.dan", true),
        person("person.alex", false),
        sensor("sensor.outdoor", "Outdoor", 21.5, "°C"),
        sensor("sensor.humidity", "Humidity", 40, "%"),
      ]),
    ).toEqual([
      { id: "lights", label: "Lights", value: "1 on", tone: "neutral" },
      { id: "covers", label: "Covers", value: "1 open", tone: "warning" },
      { id: "openings", label: "Doors & windows", value: "1 open", tone: "warning" },
      {
        id: "alarm-alarm_control_panel.home",
        label: "Home Alarm",
        value: "Armed away",
        tone: "success",
      },
      { id: "presence", label: "People", value: "1 home", tone: "success" },
      {
        id: "temperature-sensor.outdoor",
        label: "Outdoor",
        value: "21.5°C",
        tone: "neutral",
      },
    ]);
  });

  it("reads quiet states as all off / all closed", () => {
    expect(
      summarizeHomeStatus([
        light("light.kitchen", false),
        cover("cover.garage", "closed"),
        binarySensor("binary_sensor.front_door", "door", false),
      ]),
    ).toEqual([
      { id: "lights", label: "Lights", value: "All off", tone: "neutral" },
      { id: "covers", label: "Covers", value: "All closed", tone: "neutral" },
      { id: "openings", label: "Doors & windows", value: "All closed", tone: "neutral" },
    ]);
  });

  it("flags nobody home", () => {
    expect(
      summarizeHomeStatus([person("person.dan", false), person("person.alex", false)]),
    ).toEqual([{ id: "presence", label: "People", value: "Nobody home", tone: "warning" }]);
  });

  it("ignores entities it does not roll up", () => {
    expect(
      summarizeHomeStatus([
        {
          entityId: "switch.kettle",
          name: "Kettle",
          domain: "switch",
          isOn: true,
        } as HomeStatusEntity,
      ]),
    ).toEqual([]);
  });

  it("returns an empty list for no entities", () => {
    expect(summarizeHomeStatus([])).toEqual([]);
  });
});
