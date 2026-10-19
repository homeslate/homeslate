import { describe, expect, it } from "vite-plus/test";
import { knownDomains } from "../server/domains";
import { HOME_ASSISTANT_DOMAINS } from "./homeAssistantDomains";

describe("HOME_ASSISTANT_DOMAINS", () => {
  it("matches the server registry", () => {
    expect([...HOME_ASSISTANT_DOMAINS].sort()).toEqual(knownDomains().sort());
  });
});
