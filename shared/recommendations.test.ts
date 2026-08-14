import { describe, expect, it } from "vitest";
import { getRecommendedArtists } from "./recommendations";

describe("getRecommendedArtists", () => {
  it("groups public track rows by artist and ranks their engagement signal", () => {
    const artists = getRecommendedArtists([
      { track: { plays: 10, likes: 2 }, creator: { id: 1, name: "Nova" }, genre: { name: "Synthwave" } },
      { track: { plays: 3, likes: 1 }, creator: { id: 1, name: "Nova" }, genre: { name: "Electronic" } },
      { track: { plays: 12, likes: 0 }, creator: { id: 2, name: "Pulse" }, genre: { name: "House" } },
    ]);

    expect(artists).toEqual([
      { id: 1, name: "Nova", trackCount: 2, signalScore: 22, genres: ["Synthwave", "Electronic"] },
      { id: 2, name: "Pulse", trackCount: 1, signalScore: 12, genres: ["House"] },
    ]);
  });
});
