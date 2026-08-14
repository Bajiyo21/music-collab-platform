export type ArtistRecommendationSource = {
  track: { plays?: number | null; likes?: number | null };
  creator: { id: number; name?: string | null };
  genre?: { name?: string | null } | null;
};

export type ArtistRecommendation = {
  id: number;
  name: string;
  trackCount: number;
  signalScore: number;
  genres: string[];
};

export function getRecommendedArtists(rows: ArtistRecommendationSource[], limit = 4): ArtistRecommendation[] {
  const artists = new Map<number, ArtistRecommendation>();
  for (const row of rows) {
    const current = artists.get(row.creator.id) ?? {
      id: row.creator.id,
      name: row.creator.name?.trim() || "TuneCollab musician",
      trackCount: 0,
      signalScore: 0,
      genres: [],
    };
    current.trackCount += 1;
    current.signalScore += Number(row.track.plays ?? 0) + Number(row.track.likes ?? 0) * 3;
    const genre = row.genre?.name?.trim();
    if (genre && !current.genres.includes(genre)) current.genres.push(genre);
    artists.set(row.creator.id, current);
  }
  return Array.from(artists.values())
    .sort((left, right) => right.signalScore - left.signalScore || right.trackCount - left.trackCount || left.name.localeCompare(right.name))
    .slice(0, limit);
}
