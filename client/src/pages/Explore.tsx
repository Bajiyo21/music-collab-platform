import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Music, Heart, MessageCircle, Share2, Play } from "lucide-react";

/**
 * Explore & Discovery Page
 * Browse trending tracks, search, and discover artists
 */

interface Track {
  id: number;
  title: string;
  creatorId: number;
  creatorName?: string;
  genre?: string;
  mood?: string;
  plays: number;
  likes: number;
  comments: number;
  coverArtUrl?: string;
  duration?: number;
}

const MOCK_TRACKS: Track[] = [
  {
    id: 1,
    title: "Neon Dreams",
    creatorId: 1,
    creatorName: "SynthWave Master",
    genre: "Synthwave",
    mood: "Energetic",
    plays: 2450,
    likes: 342,
    comments: 28,
    duration: 245,
  },
  {
    id: 2,
    title: "Digital Horizons",
    creatorId: 2,
    creatorName: "Cyber Composer",
    genre: "Electronic",
    mood: "Atmospheric",
    plays: 1890,
    likes: 267,
    comments: 15,
    duration: 312,
  },
  {
    id: 3,
    title: "System Overload",
    creatorId: 3,
    creatorName: "Glitch Artist",
    genre: "Glitch Hop",
    mood: "Intense",
    plays: 3120,
    likes: 512,
    comments: 42,
    duration: 198,
  },
  {
    id: 4,
    title: "Retro Pulse",
    creatorId: 4,
    creatorName: "Vintage Vibes",
    genre: "Synthpop",
    mood: "Nostalgic",
    plays: 1650,
    likes: 289,
    comments: 22,
    duration: 267,
  },
  {
    id: 5,
    title: "Cyber Nexus",
    creatorId: 5,
    creatorName: "Digital Prophet",
    genre: "Cyberpunk",
    mood: "Dark",
    plays: 2780,
    likes: 456,
    comments: 35,
    duration: 289,
  },
];

export default function Explore() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>(MOCK_TRACKS);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  const genres = ["All", "Synthwave", "Electronic", "Glitch Hop", "Synthpop", "Cyberpunk"];

  useEffect(() => {
    let filtered = MOCK_TRACKS;

    if (selectedGenre && selectedGenre !== "All") {
      filtered = filtered.filter((t) => t.genre === selectedGenre);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.creatorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTracks(filtered);
  }, [searchQuery, selectedGenre]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold neon-cyan">♪</div>
            <span className="text-xl font-bold tracking-wider">TuneCollab</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm hover:text-cyan-400 transition">
              Home
            </a>
            <a href="/explore" className="text-sm text-cyan-400">
              Explore
            </a>
            {isAuthenticated && (
              <>
                <a href="/dashboard" className="text-sm hover:text-cyan-400 transition">
                  Dashboard
                </a>
                <a href="/upload" className="text-sm hover:text-cyan-400 transition">
                  Upload
                </a>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 font-semibold transition-all duration-200 hover:bg-black/60 hover:border-white/20 text-xs"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 font-semibold transition-all duration-200 hover:bg-black/60 hover:border-white/20 text-xs"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="neon-cyan">DISCOVER</span>
              <span className="mx-2">×</span>
              <span className="neon-magenta">EXPLORE</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Immerse yourself in a universe of collaborative music. Discover trending tracks,
              explore genres, and find your next musical inspiration.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tracks or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded px-4 py-3 text-white placeholder-muted-foreground focus:border-cyan-400 focus:outline-none transition"
              />
              <span className="absolute right-4 top-3.5 text-muted-foreground">🔍</span>
            </div>

            {/* Genre Filter */}
            <div className="flex flex-wrap gap-3">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre === "All" ? null : genre)}
                  className={`px-4 py-2 rounded transition-all duration-200 border ${
                    (selectedGenre === genre || (genre === "All" && !selectedGenre))
                      ? "bg-cyan-400/20 border-cyan-400 text-cyan-400"
                      : "bg-black/40 border-white/20 text-white hover:border-white/40"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8 text-sm text-muted-foreground">
            <span className="error-code bracket-left bracket-right">
              RESULTS: {filteredTracks.length} TRACKS FOUND
            </span>
          </div>

          {/* Tracks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map((track, index) => (
              <div
                key={track.id}
                className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6 hover:border-cyan-400/50 transition-all duration-300 group scroll-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Cover Art Placeholder */}
                <div className="relative mb-4 aspect-square bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 rounded overflow-hidden group-hover:shadow-lg group-hover:shadow-cyan-400/30 transition-all">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="w-16 h-16 text-cyan-400/50" />
                  </div>

                  {/* Play Button Overlay */}
                  <button
                    onClick={() => setPlayingTrackId(playingTrackId === track.id ? null : track.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Play className="w-12 h-12 text-cyan-400 fill-cyan-400" />
                  </button>
                </div>

                {/* Track Info */}
                <h3 className="text-lg font-bold mb-2 line-clamp-1">{track.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{track.creatorName}</p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {track.genre && (
                    <span className="text-xs px-2 py-1 bg-cyan-400/10 border border-cyan-400/30 rounded text-cyan-400">
                      {track.genre}
                    </span>
                  )}
                  {track.mood && (
                    <span className="text-xs px-2 py-1 bg-magenta-500/10 border border-magenta-500/30 rounded text-pink-400">
                      {track.mood}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-4 border-b border-white/10">
                  <span>▶ {track.plays.toLocaleString()} plays</span>
                  <span>⏱ {Math.floor(track.duration! / 60)}:{String(track.duration! % 60).padStart(2, "0")}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-pink-400 transition">
                      <Heart className="w-4 h-4" />
                      {track.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-cyan-400 transition">
                      <MessageCircle className="w-4 h-4" />
                      {track.comments}
                    </button>
                  </div>
                  <button className="hover:text-cyan-400 transition">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTracks.length === 0 && (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No tracks found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find more tracks
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
