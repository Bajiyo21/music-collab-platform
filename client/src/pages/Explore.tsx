import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Heart, Loader2, MessageCircle, Music, Play, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { filterAndSortTrackRows, mergeTrackPage, type DiscoverySort } from "@shared/discovery";

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
  const likeMutation = trpc.tracks.like.useMutation({
    onSuccess: (_, input) => setLikedTrackIds((current) => current.includes(input.trackId) ? current.filter((id) => id !== input.trackId) : [...current, input.trackId]),
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
  const canLoadMore = isSearchMode ? (searchQueryResult.data?.length ?? 0) === SEARCH_PAGE_SIZE : visibleCount < filteredRows.length;
  const isLoading = tracksQuery.isLoading || (isSearchMode && searchQueryResult.isLoading && searchPage === 0);
  const loadMore = () => isSearchMode ? setSearchPage((page) => page + 1) : setVisibleCount((count) => count + 12);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="container flex min-h-16 items-center justify-between gap-3 px-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-400 hover:text-cyan-300"><ArrowLeft size={18} /><span className="hidden sm:inline">Back</span></button>
          <span className="text-xl font-bold tracking-wider"><span className="neon-cyan">TUNE</span><span className="text-white">×</span><span className="neon-magenta">COLLAB</span></span>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/collaborate")} className="hidden rounded border border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-cyan-300 md:block">Collaborate</button>
            <Button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")} className="border border-white/10 bg-black/40 text-xs text-white hover:border-cyan-400/50 hover:text-cyan-300">{isAuthenticated ? "Dashboard" : "Sign in"}</Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl px-4 pb-16 pt-24">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-300">Public signal index</p>
          <h1 className="!text-[clamp(1.6rem,6.5vw,3rem)] font-bold leading-[0.95] tracking-tight"><span className="neon-cyan">DISCOVER</span><span className="mx-2">×</span><span className="neon-magenta">EXPLORE</span></h1>
          <p className="mt-3 max-w-2xl text-gray-400">Browse tracks that musicians have made public, preview them, and connect around the sound.</p>
        </div>

        <div className="mb-8 space-y-4">
          <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search tracks, musicians, or tags" className="border-white/10 bg-black/40 text-white" />
          <div className="flex flex-wrap items-center gap-2">
            {genres.map((genre) => <button key={genre} onClick={() => setSelectedGenre(genre === "All" ? null : genre)} className={`rounded border px-3 py-2 text-sm ${selectedGenre === genre || (!selectedGenre && genre === "All") ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-300" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>{genre}</button>)}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-sm text-gray-500">Showing {visibleRows.length} of {filteredRows.length} public tracks</p>
            <label className="flex items-center gap-2 text-sm text-gray-400">
              Sort
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="rounded border border-white/10 bg-black/60 px-3 py-2 text-white">
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="popular">Most liked</option>
              </select>
            </label>
          </div>
        </div>

        {isLoading ? <div className="py-20 text-center text-cyan-300"><Loader2 className="mx-auto animate-spin" /></div> : visibleRows.length === 0 ? <div className="rounded border border-dashed border-white/15 px-6 py-16 text-center text-gray-500"><Music className="mx-auto mb-4 opacity-40" /><p>No public tracks match this search.</p></div> : <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleRows.map(({ track, creator, genre }) => <article key={track.id} className="overflow-hidden rounded-lg border border-white/10 bg-black/40 transition hover:border-cyan-400/40">
              <div className="relative flex aspect-[1.5] items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-400/15 to-fuchsia-500/15">
                {track.coverArtUrl ? <img src={track.coverArtUrl} alt={`${track.title} cover art`} className="h-full w-full object-cover" /> : <Music size={60} className="text-cyan-300/50" />}
                {track.fileUrl && <button onClick={() => setPlayingTrackId(playingTrackId === track.id ? null : track.id)} className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition hover:opacity-100 focus:opacity-100" aria-label={`${playingTrackId === track.id ? "Pause" : "Play"} ${track.title}`}><Play size={44} className="fill-cyan-300 text-cyan-300" /></button>}
              </div>
              <div className="p-5">
                <h2 className="truncate text-lg font-bold">{track.title}</h2>
                <button onClick={() => navigate(`/profile/${creator.id}`)} className="mt-1 text-sm text-gray-400 hover:text-cyan-300">{creator.name ?? "TuneCollab musician"}</button>
                <div className="mt-4 flex flex-wrap gap-2">{genre?.name && <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-300">{genre.name}</span>}<span className="rounded border border-white/10 px-2 py-1 text-xs text-gray-500">{Math.floor(Number(track.duration ?? 0) / 60)}:{String(Number(track.duration ?? 0) % 60).padStart(2, "0")}</span></div>
                {playingTrackId === track.id && track.fileUrl && <audio autoPlay controls src={track.fileUrl} onEnded={() => setPlayingTrackId(null)} className="mt-4 h-9 w-full" />}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-gray-500">
                  <div className="flex gap-4"><button onClick={() => { if (!isAuthenticated) return toast.error("Sign in to like tracks"); likeMutation.mutate({ trackId: track.id }); }} className={`flex items-center gap-1 hover:text-fuchsia-300 ${likedTrackIds.includes(track.id) ? "text-fuchsia-300" : ""}`}><Heart size={16} fill={likedTrackIds.includes(track.id) ? "currentColor" : "none"} />{Number(track.likes ?? 0) + (likedTrackIds.includes(track.id) ? 1 : 0)}</button><button onClick={() => navigate(`/track/${track.id}`)} className="flex items-center gap-1 hover:text-cyan-300"><MessageCircle size={16} />{Number(track.comments ?? 0)}</button></div>
                  <button onClick={() => shareTrack(track.title, track.id)} className="hover:text-cyan-300" aria-label={`Share ${track.title}`}><Share2 size={16} /></button>
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
