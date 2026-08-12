import { describe, expect, it } from "vitest";
import { filterAndSortTrackRows, mergeTrackPage } from "./discovery";

const row = (id: number, title: string, creator: string, genre: string, createdAt: string, plays: number, likes: number, tags: string[]) => ({
  track: { id, title, createdAt, plays, likes, comments: 0, tags },
  creator: { name: creator },
  genre: { name: genre },
});

describe("discovery helpers", () => {
  it("merges pages without duplicating a track already loaded", () => {
    const firstPage = [row(1, "Signal", "Ari", "Synthwave", "2026-01-01", 10, 2, ["night"])];
    const secondPage = [row(1, "Signal", "Ari", "Synthwave", "2026-01-01", 10, 2, ["night"]), row(2, "Static", "Mina", "Ambient", "2026-01-02", 5, 4, ["drone"])];
    expect(mergeTrackPage(firstPage, secondPage).map((item) => item.track.id)).toEqual([1, 2]);
  });

  it("searches creator names and tags while preserving genre filters", () => {
    const rows = [row(1, "Blue Hour", "Ari", "Synthwave", "2026-01-01", 10, 2, ["night"]), row(2, "Cloud Room", "Mina", "Ambient", "2026-01-02", 5, 4, ["drone"])];
    expect(filterAndSortTrackRows(rows, "Mina", null, "trending").map((item) => item.track.id)).toEqual([2]);
    expect(filterAndSortTrackRows(rows, "night", "Synthwave", "trending").map((item) => item.track.id)).toEqual([1]);
  });

  it("sorts the same filtered result using the selected mode", () => {
    const rows = [row(1, "Older", "Ari", "Synthwave", "2026-01-01", 100, 1, []), row(2, "Newer", "Mina", "Synthwave", "2026-02-01", 10, 8, [])];
    expect(filterAndSortTrackRows(rows, "", null, "newest").map((item) => item.track.id)).toEqual([2, 1]);
    expect(filterAndSortTrackRows(rows, "", null, "popular").map((item) => item.track.id)).toEqual([2, 1]);
  });
});
