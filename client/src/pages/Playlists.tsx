import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Edit2, Globe, Lock, Plus, Share2, Trash2 } from "lucide-react";

export default function Playlists() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const utils = trpc.useUtils();
  const playlistsQuery = trpc.playlists.list.useQuery(undefined, { enabled: isAuthenticated });
  const createMutation = trpc.playlists.create.useMutation({ onSuccess: () => { utils.playlists.list.invalidate(); closeEditor(); toast.success("Playlist created"); } });
  const updateMutation = trpc.playlists.update.useMutation({ onSuccess: () => { utils.playlists.list.invalidate(); closeEditor(); toast.success("Playlist updated"); } });
  const deleteMutation = trpc.playlists.delete.useMutation({ onSuccess: () => { utils.playlists.list.invalidate(); toast.success("Playlist deleted"); } });

  if (!isAuthenticated) return <Gate navigate={navigate} />;
  const playlists = playlistsQuery.data ?? [];

  function closeEditor() { setShowCreate(false); setEditingId(null); setTitle(""); setDescription(""); setVisibility("private"); }
  function openCreate() { setShowCreate(true); setEditingId(null); setTitle(""); setDescription(""); setVisibility("private"); }
  function openEdit(playlist: typeof playlists[number]) { setShowCreate(false); setEditingId(playlist.id); setTitle(playlist.title); setDescription(playlist.description ?? ""); setVisibility(playlist.visibility ?? "private"); }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return toast.error("Enter a playlist title");
    if (editingId) updateMutation.mutate({ playlistId: editingId, title: title.trim(), description: description.trim() || null, visibility });
    else createMutation.mutate({ title: title.trim(), description: description.trim() || undefined, visibility });
  }
  async function share(playlistId: number, playlistTitle: string) {
    const url = `${window.location.origin}/playlist/${playlistId}`;
    try { await navigator.clipboard.writeText(url); toast.success(`${playlistTitle} link copied`); } catch { toast.error("Copy failed; use the playlist URL from your browser"); }
  }

  return <div className="min-h-screen bg-background text-foreground">
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md"><div className="container flex h-16 items-center justify-between px-4"><button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-400 hover:text-cyan-300"><ArrowLeft size={18} /><span className="hidden sm:inline">Back</span></button><span className="text-lg font-bold tracking-widest"><span className="neon-cyan">TUNE</span><span className="text-white">×</span><span className="neon-magenta">COLLAB</span></span><button onClick={openCreate} className="flex items-center gap-2 rounded bg-cyan-400 px-4 py-2 text-sm font-bold text-black hover:bg-cyan-300"><Plus size={16} /> New playlist</button></div></header>
    <main className="container max-w-6xl px-4 pb-16 pt-24"><div className="mb-10"><p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-300">Personal library</p><h1 className="!text-[clamp(1.6rem,6.5vw,3rem)] font-bold leading-[0.95] tracking-tight"><span className="neon-cyan">MY</span><span className="mx-2 text-white">×</span><span className="neon-magenta">PLAYLISTS</span></h1><p className="mt-3 text-gray-400">Keep your favorite collaborative discoveries organized.</p></div>
      {playlistsQuery.isLoading ? <div className="py-20 text-center text-cyan-300">Loading playlists...</div> : playlists.length === 0 ? <div className="rounded border border-dashed border-white/15 bg-black/20 px-6 py-16 text-center text-gray-400"><p className="mb-4 text-lg">No playlists yet.</p><button onClick={openCreate} className="rounded border border-cyan-400/50 px-4 py-2 text-cyan-300 hover:bg-cyan-400/10">Create your first playlist</button></div> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{playlists.map((playlist) => <article key={playlist.id} className="rounded-lg border border-white/10 bg-black/30 p-5 transition hover:border-cyan-400/40"><div className="mb-5 flex aspect-[4/3] items-center justify-center rounded bg-gradient-to-br from-cyan-500/15 to-fuchsia-500/15"><span className="text-5xl text-cyan-300/50">♫</span></div><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-white">{playlist.title}</h2><p className="mt-1 line-clamp-2 text-sm text-gray-400">{playlist.description || "No description"}</p></div><span className={`shrink-0 rounded px-2 py-1 text-[10px] uppercase ${playlist.visibility === "public" ? "bg-cyan-400/10 text-cyan-300" : "bg-fuchsia-400/10 text-fuchsia-300"}`}>{playlist.visibility === "public" ? <Globe size={12} /> : <Lock size={12} />}</span></div><div className="mt-4 flex items-center justify-between text-xs text-gray-500"><span>{playlist.trackCount ?? 0} tracks</span><span>{playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString() : ""}</span></div><div className="mt-5 flex gap-2 border-t border-white/10 pt-4"><button onClick={() => navigate(`/playlist/${playlist.id}`)} className="flex-1 rounded border border-cyan-400/40 px-3 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/10">Open</button><button onClick={() => share(playlist.id, playlist.title)} className="rounded border border-white/10 p-2 text-gray-400 hover:text-cyan-300" aria-label={`Share ${playlist.title}`}><Share2 size={16} /></button><button onClick={() => openEdit(playlist)} className="rounded border border-white/10 p-2 text-gray-400 hover:text-cyan-300" aria-label={`Edit ${playlist.title}`}><Edit2 size={16} /></button><button onClick={() => { if (window.confirm(`Delete ${playlist.title}?`)) deleteMutation.mutate({ playlistId: playlist.id }); }} className="rounded border border-red-400/20 p-2 text-red-300 hover:bg-red-400/10" aria-label={`Delete ${playlist.title}`}><Trash2 size={16} /></button></div></article>)}</div>}
    </main>
    {(showCreate || editingId !== null) && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"><form onSubmit={submit} className="w-full max-w-md rounded-lg border border-white/15 bg-[#090909] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{editingId ? "Edit playlist" : "Create playlist"}</h2><button type="button" onClick={closeEditor} className="text-gray-500 hover:text-white">×</button></div><label className="mb-4 block"><span className="mb-2 block text-sm font-semibold">Title</span><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} className="w-full rounded border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-cyan-400/60" /></label><label className="mb-4 block"><span className="mb-2 block text-sm font-semibold">Description</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} rows={4} className="w-full rounded border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-cyan-400/60" /></label><label className="mb-6 block"><span className="mb-2 block text-sm font-semibold">Visibility</span><select value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "private")} className="w-full rounded border border-white/10 bg-white/5 p-3 text-white outline-none"><option value="private">Private</option><option value="public">Public</option></select></label><div className="flex gap-3"><button type="button" onClick={closeEditor} className="flex-1 rounded border border-white/10 px-4 py-2 text-gray-300 hover:bg-white/5">Cancel</button><button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 rounded bg-cyan-400 px-4 py-2 font-bold text-black hover:bg-cyan-300">{createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Save changes" : "Create"}</button></div></form></div>}
  </div>;
}

function Gate({ navigate }: { navigate: (path: string) => void }) { return <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center"><div><h1 className="mb-3 text-2xl font-bold">Sign in to manage playlists</h1><p className="mb-5 text-gray-400">Your collections are stored with your account.</p><button onClick={() => navigate("/")} className="rounded bg-cyan-400 px-5 py-2 font-bold text-black">Go home</button></div></div>; }
