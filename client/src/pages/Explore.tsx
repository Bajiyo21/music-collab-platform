import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Heart, Loader2, MessageCircle, Music, Play, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { filterAndSortTrackRows, mergeTrackPage, type DiscoverySort } from "@shared/discovery";
import { getRecommendedArtists } from "@shared/recommendations";

type SortMode = DiscoverySort;
const SEARCH_PAGE_SIZE = 20;

export default function Explore() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchPage, setSearchPage] = useState(0);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  const [likedTrackIds, setLikedTrackIds] = useState<number[]>([]);
  const isSearchMode = searchQuery.trim().length > 0;
  const tracksQuery = trpc.tracks.trending.useQuery({ limit: 50 }, { enabled: !isSearchMode });
  const searchQueryResult = trpc.tracks.search.useQuery({ query: searchQuery.trim(), limit: SEARCH_PAGE_SIZE, offset: searchPage * SEARCH_PAGE_SIZE }, { enabled: isSearchMode, staleTime: 30_000 });
  const [searchResults, setSearchResults] = useState<NonNullable<typeof tracksQuery.data>>([]);
  const favoritesQuery = trpc.tracks.favorites.useQuery(undefined, { enabled: isAuthenticated });
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<number[]>([]);
  useEffect(() => {
    if (favoritesQuery.data) {
      setFavoriteTrackIds(favoritesQuery.data.map((f: { track: { id: number } }) => f.track.id));
    }
  }, [favoritesQuery.data]);
  const favoriteMutation = trpc.tracks.toggleFavorite.useMutation({
    onSuccess: (data, input) => {
      setFavoriteTrackIds((current) => data.favorited ? [...current, input.trackId] : current.filter((id) => id !== input.trackId));
      toast.success(data.favorited ? "Added to favorites" : "Removed from favorites");
    },
    onError: (error) => toast.error(error.message),
  });
  useEffect(() => {
    setSearchPage(0);
    setSearchResults([]);
    setVisibleCount(12);
  }, [searchQuery]);

  useEffect(() => {
    if (!isSearchMode || !searchQueryResult.data) return;
    setSearchResults((current) => {
      if (searchPage === 0) return searchQueryResult.data;
      return mergeTrackPage(current ?? [], searchQueryResult.data);
    });
  }, [isSearchMode, searchPage, searchQueryResult.data]);

  const rows = isSearchMode ? (searchResults ?? []) : (tracksQuery.data ?? []);
  const genres = useMemo(() => ["All", ...Array.from(new Set(rows.map((row) => row.genre?.name).filter((name): name is string => Boolean(name))))], [rows]);

  const filteredRows = useMemo(() => filterAndSortTrackRows(rows, searchQuery, selectedGenre, sortMode), [rows, searchQuery, selectedGenre, sortMode]);

  useEffect(() => setVisibleCount(12), [searchQuery, selectedGenre, sortMode]);

  async function shareTrack(title: string, id: number) {
    const url = `${window.location.origin}/track/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${title} link copied`);
    } catch {
      toast.info(url);
    }
  }

  const visibleRows = isSearchMode ? filteredRows : filteredRows.slice(0, visibleCount);
  const recommendedArtists = useMemo(() => getRecommendedArtists(tracksQuery.data ?? []), [tracksQuery.data]);
  const canLoadMore = isSearchMode ? (searchQueryResult.data?.length ?? 0) === SEARCH_PAGE_SIZE : visibleCount < filteredRows.length;
  const isLoading = tracksQuery.isLoading || (isSearchMode && searchQueryResult.isLoading && searchPage === 0);
  const loadMore = () => isSearchMode ? setSearchPage((page) => page + 1) : setVisibleCount((count) => count + 12);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card">
        <div className="container flex min-h-16 items-center justify-between gap-3 px-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-primary"><ArrowLeft size={18} /><span className="hidden sm:inline">Back</span></button>
          <span className="text-xl font-bold tracking-wider"><span className="neon-cyan">TUNE</span><span>×</span><span className="neon-magenta">COLLAB</span></span>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/collaborate")} className="hidden rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-primary md:block">Collaborate</button>
            <ThemeToggle />
            <Button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")} className="border border-border bg-card text-xs text-foreground hover:border-primary/50 hover:text-primary">{isAuthenticated ? "Dashboard" : "Sign in"}</Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl px-4 pb-16 pt-24">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-primary">Public signal index</p>
          <h1 className="!text-[clamp(1.6rem,6.5vw,3rem)] font-bold leading-[0.95] tracking-tight"><span className="neon-cyan">DISCOVER</span><span className="mx-2">×</span><span className="neon-magenta">EXPLORE</span></h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Browse tracks that musicians have made public, preview them, and connect around the sound.</p>
        </div>

        <div className="mb-8 space-y-4">
          <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search tracks, musicians, or tags" className="border-input bg-card text-foreground" />
          <div className="flex flex-wrap items-center gap-2">
            {genres.map((genre) => <button key={genre} onClick={() => setSelectedGenre(genre === "All" ? null : genre)} className={`rounded-md border px-3 py-2 text-sm ${selectedGenre === genre || (!selectedGenre && genre === "All") ? "border-primary/50 bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground hover:bg-secondary"}`}>{genre}</button>)}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">Showing {visibleRows.length} of {filteredRows.length} public tracks</p>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Sort
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="rounded-md border border-input bg-card px-3 py-2 text-foreground">
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="popular">Most liked</option>
              </select>
            </label>
          </div>
        </div>

        {recommendedArtists.length > 0 && <section className="mb-10 rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs uppercase tracking-[0.22em] text-primary">Creator signal</p><h2 className="mt-1 text-2xl font-bold">Recommended artists</h2></div><p className="text-xs text-muted-foreground">Ranked from public track activity</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{recommendedArtists.map((artist) => <button key={artist.id} onClick={() => navigate(`/profile/${artist.id}`)} className="group rounded-lg border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:bg-secondary"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent font-bold text-accent-foreground">{artist.name.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate font-semibold group-hover:text-primary">{artist.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{artist.trackCount} public {artist.trackCount === 1 ? "track" : "tracks"}</p></div></div><div className="mt-4 flex flex-wrap gap-1">{artist.genres.slice(0, 2).map((genre) => <span key={genre} className="rounded border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground">{genre}</span>)}</div></button>)}</div>
        </section>}

        {isLoading ? <div className="py-20 text-center text-cyan-300"><Loader2 className="mx-auto animate-spin" /></div> : visibleRows.length === 0 ? <div className="rounded border border-dashed border-white/15 px-6 py-16 text-center text-gray-500"><Music className="mx-auto mb-4 opacity-40" /><p>No public tracks match this search.</p></div> : <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleRows.map(({ track, creator, genre }) => <article key={track.id} className="overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40 hover:shadow-sm">
              <div className="relative flex aspect-[1.5] items-center justify-center overflow-hidden border-b border-border bg-secondary">
                {track.coverArtUrl ? <img src={track.coverArtUrl} alt={`${track.title} cover art`} className="h-full w-full object-cover" /> : <Music size={52} className="text-primary/45" />}
                {track.fileUrl && <button onClick={() => setPlayingTrackId(playingTrackId === track.id ? null : track.id)} className="absolute inset-0 flex items-center justify-center bg-foreground/15 opacity-0 transition hover:opacity-100 focus:opacity-100" aria-label={`${playingTrackId === track.id ? "Pause" : "Play"} ${track.title}`}><Play size={40} className="fill-primary-foreground text-primary-foreground" /></button>}
              </div>
              <div className="p-5">
                <h2 className="truncate text-lg font-bold">{track.title}</h2>
                <button onClick={() => navigate(`/profile/${creator.id}`)} className="mt-1 text-sm text-muted-foreground hover:text-primary">{creator.name ?? "TuneCollab musician"}</button>
                <div className="mt-4 flex flex-wrap gap-2">{genre?.name && <span className="rounded border border-primary/25 bg-accent px-2 py-1 text-xs text-accent-foreground">{genre.name}</span>}<span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">{Math.floor(Number(track.duration ?? 0) / 60)}:{String(Number(track.duration ?? 0) % 60).padStart(2, "0")}</span></div>
                {playingTrackId === track.id && track.fileUrl && <audio autoPlay controls src={track.fileUrl} onEnded={() => setPlayingTrackId(null)} className="mt-4 h-9 w-full" />}
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                  <div className="flex gap-4"><button onClick={() => { if (!isAuthenticated) return toast.error("Sign in to favorite tracks"); favoriteMutation.mutate({ trackId: track.id }); }} className={`flex items-center gap-1 hover:text-primary ${favoriteTrackIds.includes(track.id) ? "text-primary" : ""}`} aria-label={`Favorite ${track.title}`}><Heart size={16} fill={favoriteTrackIds.includes(track.id) ? "currentColor" : "none"} /><span>Favorite</span></button><button onClick={() => navigate(`/track/${track.id}`)} className="flex items-center gap-1 hover:text-primary"><MessageCircle size={16} />{Number(track.comments ?? 0)}</button></div>
                  <button onClick={() => shareTrack(track.title, track.id)} className="hover:text-primary" aria-label={`Share ${track.title}`}><Share2 size={16} /></button>
                </div>
              </div>
            </article>)}
          </div>
          {canLoadMore && <div className="mt-8 flex justify-center"><Button onClick={loadMore} disabled={isSearchMode && searchQueryResult.isFetching} className="border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20">{isSearchMode && searchQueryResult.isFetching ? "Loading…" : isSearchMode ? "Load more search results" : "Load more tracks"}</Button></div>}
        </>}
      </main>
    </div>
  );
}
