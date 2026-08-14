import { describe, expect, it } from "vitest";
import { normalizeTrackMetadataSuggestion } from "./metadata-suggestions";

describe("normalizeTrackMetadataSuggestion", () => {
  it("keeps valid genre suggestions and produces clean, unique tags", () => {
    expect(normalizeTrackMetadataSuggestion({
      description: "  A luminous late-night synth track.  ",
      genre: "Synthwave",
      tags: ["Neon", "neon", "night drive", "", "analog"],
    })).toEqual({
      description: "A luminous late-night synth track.",
      genre: "Synthwave",
      tags: ["neon", "night drive", "analog"],
    });
  });

  it("falls back safely when a model response is malformed", () => {
    expect(normalizeTrackMetadataSuggestion({ genre: "Unrecognized" }, "Techno")).toEqual({
      description: "A new TuneCollab release ready for listeners and collaborators.",
      genre: "Techno",
      tags: [],
    });
  });
});
