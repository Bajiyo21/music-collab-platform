export const TRACK_METADATA_GENRES = [
  "Electronic",
  "Synthwave",
  "Glitch Hop",
  "Cyberpunk",
  "Ambient",
  "Experimental",
  "House",
  "Techno",
  "Drum & Bass",
] as const;

export type TrackMetadataGenre = (typeof TRACK_METADATA_GENRES)[number];

export type TrackMetadataSuggestion = {
  description: string;
  genre: TrackMetadataGenre;
  tags: string[];
};

const FALLBACK_DESCRIPTION = "A new TuneCollab release ready for listeners and collaborators.";

function cleanText(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string") return fallback;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, maxLength) : fallback;
}

export function normalizeTrackMetadataSuggestion(
  value: unknown,
  fallbackGenre: TrackMetadataGenre = "Electronic",
): TrackMetadataSuggestion {
  const candidate = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const suggestedGenre = typeof candidate.genre === "string" ? candidate.genre : "";
  const genre = TRACK_METADATA_GENRES.includes(suggestedGenre as TrackMetadataGenre)
    ? suggestedGenre as TrackMetadataGenre
    : fallbackGenre;
  const rawTags = Array.isArray(candidate.tags) ? candidate.tags : [];
  const tags = Array.from(new Set(rawTags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0 && tag.length <= 32)))
    .slice(0, 6);

  return {
    description: cleanText(candidate.description, FALLBACK_DESCRIPTION, 320),
    genre,
    tags,
  };
}
