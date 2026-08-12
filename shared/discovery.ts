export type DiscoverySort = "trending" | "newest" | "popular";

export type DiscoveryRow = {
  track: {
    id: number;
    title: string;
    createdAt: Date | string | number;
    plays: number | null;
    likes: number | null;
    comments: number | null;
    tags: unknown;
  };
  creator: { name: string | null };
  genre: { name: string } | null;
};

export function mergeTrackPage<T extends { track: { id: number } }>(current: T[], next: T[]): T[] {
  const existingIds = new Set(current.map((row) => row.track.id));
  return [...current, ...next.filter((row) => !existingIds.has(row.track.id))];
}

export function filterAndSortTrackRows<T extends DiscoveryRow>(rows: T[], query: string, selectedGenre: string | null, sortMode: DiscoverySort): T[] {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    const title = row.track.title.toLowerCase();
    const creator = (row.creator.name ?? "").toLowerCase();
    const tags = Array.isArray(row.track.tags) ? row.track.tags.join(" ").toLowerCase() : "";
    const matchesSearch = `${title} ${creator} ${tags}`.includes(normalizedQuery);
    const matchesGenre = !selectedGenre || selectedGenre === "All" || row.genre?.name === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return filtered.sort((a, b) => {
    if (sortMode === "newest") return new Date(b.track.createdAt).getTime() - new Date(a.track.createdAt).getTime();
    if (sortMode === "popular") return Number(b.track.likes ?? 0) - Number(a.track.likes ?? 0) || Number(b.track.plays ?? 0) - Number(a.track.plays ?? 0);
    const score = (row: DiscoveryRow) => Number(row.track.plays ?? 0) * 2 + Number(row.track.likes ?? 0) * 5 + Number(row.track.comments ?? 0) * 3;
    return score(b) - score(a);
  });
}
