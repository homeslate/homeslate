import { describe, expect, it } from "vite-plus/test";
import { presenceLabel, type HomeAssistantPresence } from "./homeAssistantPresence";

const presence = (overrides: Partial<HomeAssistantPresence>): HomeAssistantPresence => ({
  entityId: "person.dan",
  name: "Dan",
  state: "home",
  isHome: true,
  zoneName: null,
  entityPicture: null,
  ...overrides,
});

describe("presenceLabel", () => {
  it("reads home and away", () => {
    expect(presenceLabel(presence({ isHome: true, state: "home" }))).toBe("Home");
    expect(presenceLabel(presence({ isHome: false, state: "not_home" }))).toBe("Away");
  });

  it("shows the zone name otherwise", () => {
    expect(presenceLabel(presence({ isHome: false, state: "Work", zoneName: "Work" }))).toBe(
      "Work",
    );
  });
});
