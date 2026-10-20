import { describe, expect, it } from "vite-plus/test";
import { presenceAvatarPresentation } from "./presenceImage";

describe("presenceAvatarPresentation", () => {
  it("sends person and local pictures through the host image proxy", () => {
    expect(presenceAvatarPresentation("/api/image/person.dan?token=abc", false)).toEqual({
      kind: "image",
      src: "/api/homeassistant/image?path=%2Fapi%2Fimage%2Fperson.dan%3Ftoken%3Dabc",
    });
    expect(presenceAvatarPresentation("/local/avatars/dan.jpg", false)).toEqual({
      kind: "image",
      src: "/api/homeassistant/image?path=%2Flocal%2Favatars%2Fdan.jpg",
    });
  });

  it("falls back to initials when the picture is missing or failed to load", () => {
    expect(presenceAvatarPresentation(null, false)).toEqual({ kind: "initials" });
    expect(presenceAvatarPresentation("", false)).toEqual({ kind: "initials" });
    expect(presenceAvatarPresentation("/api/image/person.dan", true)).toEqual({ kind: "initials" });
  });
});
