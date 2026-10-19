import { beforeEach, describe, expect, it } from "vite-plus/test";
import {
  buildServicePayload,
  entityDomain,
  getDomainSpec,
  isAllowedService,
  isKnownDomain,
  isValidEntityId,
  knownDomains,
  mapEntity,
  registerDomainSpec,
} from "./domains";

describe("entityDomain", () => {
  it("reads the domain slug before the first dot", () => {
    expect(entityDomain("light.kitchen")).toBe("light");
    expect(entityDomain("climate.living_room")).toBe("climate");
    expect(entityDomain("binary_sensor.front_door")).toBe("binary_sensor");
  });

  it("rejects ids without a domain or object", () => {
    expect(entityDomain("nope")).toBeNull();
    expect(entityDomain("climate.")).toBeNull();
    expect(entityDomain(".kitchen")).toBeNull();
    expect(entityDomain("Climate.LivingRoom")).toBeNull();
  });
});

describe("the climate + todo registry", () => {
  it("knows only the seeded domains", () => {
    expect(isKnownDomain("climate")).toBe(true);
    expect(isKnownDomain("todo")).toBe(true);
    expect(isKnownDomain("light")).toBe(false);
    expect(isKnownDomain("weird")).toBe(false);
    expect(knownDomains()).toEqual(expect.arrayContaining(["climate", "todo"]));
  });

  it("validates entity ids per domain", () => {
    expect(isValidEntityId("climate", "climate.living_room")).toBe(true);
    expect(isValidEntityId("climate", "light.kitchen")).toBe(false);
    expect(isValidEntityId("climate", "climate.LivingRoom")).toBe(false);
    expect(isValidEntityId("climate", "climate../x")).toBe(false);
    expect(isValidEntityId("todo", "todo.shopping_list")).toBe(true);
    expect(isValidEntityId("todo", "climate.living_room")).toBe(false);
    expect(isValidEntityId("light", "light.kitchen")).toBe(false);
  });

  it("allowlists services per domain", () => {
    expect(isAllowedService("climate", "set_temperature")).toBe(true);
    expect(isAllowedService("climate", "reload")).toBe(false);
    expect(isAllowedService("todo", "add_item")).toBe(true);
    expect(isAllowedService("todo", "remove_item")).toBe(true);
    expect(isAllowedService("todo", "reload")).toBe(false);
    expect(isAllowedService("light", "turn_on")).toBe(false);
  });

  it("delegates payload building to the domain and drops unknown keys", () => {
    expect(
      buildServicePayload("climate", "set_temperature", "climate.den", {
        temperature: 21,
        junk: true,
      }),
    ).toEqual({ entity_id: "climate.den", temperature: 21 });
    expect(buildServicePayload("climate", "reload", "climate.den", {})).toBeNull();
    expect(
      buildServicePayload("climate", "set_temperature", "light.x", { temperature: 21 }),
    ).toBeNull();
    expect(
      buildServicePayload("todo", "add_item", "todo.shopping", { item: "Milk", junk: 1 }),
    ).toEqual({ entity_id: "todo.shopping", item: "Milk" });
    expect(buildServicePayload("todo", "get_items", "todo.shopping", {})).toEqual({
      entity_id: "todo.shopping",
    });
  });

  it("maps climate through its mapper and everything else generically", () => {
    expect(
      mapEntity("climate", {
        entity_id: "climate.den",
        state: "heat",
        attributes: { temperature_unit: "C" },
      }),
    ).toMatchObject({ entityId: "climate.den", hvacMode: "heat", unit: "°C" });

    expect(mapEntity("todo", { entity_id: "todo.shopping", state: "1", attributes: {} })).toEqual({
      entityId: "todo.shopping",
      name: "todo.shopping",
      state: "1",
      unit: null,
      deviceClass: null,
      supportedFeatures: null,
      attributes: {},
    });
  });

  it("exposes the spec for a known domain", () => {
    expect(getDomainSpec("climate")?.entityId.test("climate.den")).toBe(true);
    expect(getDomainSpec("nope")).toBeNull();
  });
});

describe("registerDomainSpec", () => {
  registerDomainSpec({
    domain: "test_widget",
    entityId: /^test_widget\.[a-z0-9_]+$/,
    services: { set_value: ["value"], clear: [] },
  });

  it("adds a generic domain with a scalar allowlist", () => {
    expect(isKnownDomain("test_widget")).toBe(true);
    expect(isAllowedService("test_widget", "set_value")).toBe(true);
    expect(
      buildServicePayload("test_widget", "set_value", "test_widget.a", {
        value: 5,
        junk: "x",
      }),
    ).toEqual({ entity_id: "test_widget.a", value: 5 });
    expect(buildServicePayload("test_widget", "set_value", "test_widget.a", { value: "" })).toEqual(
      { entity_id: "test_widget.a" },
    );
    expect(buildServicePayload("test_widget", "nope", "test_widget.a", {})).toBeNull();
    expect(buildServicePayload("test_widget", "clear", "other.a", {})).toBeNull();
  });
});

describe("registry state is per-file", () => {
  beforeEach(() => {
    // Registering a synthetic domain must not disturb the seeded ones.
    expect(isKnownDomain("climate")).toBe(true);
  });

  it("keeps the seeded domains available", () => {
    expect(isKnownDomain("climate")).toBe(true);
    expect(isKnownDomain("todo")).toBe(true);
  });
});
