import { useEffect, useState } from "react";
import { X, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type EditableTrack = {
  id: number;
  title: string;
  description: string | null;
  visibility: "public" | "private" | "unlisted" | null;
  genreId: number | null;
  tags: unknown;
};

type TrackManageDialogProps = {
  track: EditableTrack;
  onClose: () => void;
};

export function TrackManageDialog({ track, onClose }: TrackManageDialogProps) {
  const utils = trpc.useUtils();
  const genresQuery = trpc.reference.genres.useQuery();
  const [title, setTitle] = useState(track.title);
  const [description, setDescription] = useState(track.description ?? "");
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">(track.visibility ?? "public");
  const [genreId, setGenreId] = useState(track.genreId ? String(track.genreId) : "");
  const [tags, setTags] = useState(Array.isArray(track.tags) ? track.tags.filter((tag): tag is string => typeof tag === "string").join(", ") : "");

  useEffect(() => {
    setTitle(track.title);
    setDescription(track.description ?? "");
    setVisibility(track.visibility ?? "public");
    setGenreId(track.genreId ? String(track.genreId) : "");
    setTags(Array.isArray(track.tags) ? track.tags.filter((tag): tag is string => typeof tag === "string").join(", ") : "");
  }, [track]);

  const updateMutation = trpc.tracks.update.useMutation({
    onSuccess: () => {
      utils.tracks.myTracks.invalidate();
      utils.users.myProfile.invalidate();
      toast.success("Track settings saved");
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteMutation = trpc.tracks.delete.useMutation({
    onSuccess: () => {
      utils.tracks.myTracks.invalidate();
      utils.users.myProfile.invalidate();
      toast.success("Track removed from your library");
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Track title is required");
      return;
    }
    updateMutation.mutate({
      trackId: track.id,
      title: title.trim(),
      description: description.trim() || null,
      visibility,
      genreId: genreId ? Number(genreId) : null,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete “${track.title}” from your library? This removes its metadata and collaboration references.`)) return;
    deleteMutation.mutate({ trackId: track.id });
  }

  const isBusy = updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="track-manage-title">
      <form onSubmit={handleSave} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-cyan-400/30 bg-[#090909] p-5 shadow-2xl shadow-cyan-400/10 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Track library</p>
            <h2 id="track-manage-title" className="mt-1 text-xl font-bold">Manage track</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close track manager" className="rounded p-2 text-gray-500 hover:bg-white/5 hover:text-white"><X size={18} /></button>
        </div>
        <label className="mb-4 block"><span className="mb-2 block text-sm font-semibold">Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} className="w-full rounded border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-cyan-400/60" /></label>
        <label className="mb-4 block"><span className="mb-2 block text-sm font-semibold">Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={10000} className="w-full rounded border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-cyan-400/60" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-sm font-semibold">Visibility</span><select value={visibility} onChange={(event) => setVisibility(event.target.value as "public" | "private" | "unlisted")} className="w-full rounded border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-cyan-400/60"><option value="public">Public</option><option value="unlisted">Unlisted link</option><option value="private">Private</option></select></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Genre</span><select value={genreId} onChange={(event) => setGenreId(event.target.value)} className="w-full rounded border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-cyan-400/60"><option value="">No genre</option>{(genresQuery.data ?? []).map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}</select></label>
        </div>
        <label className="mt-4 block"><span className="mb-2 block text-sm font-semibold">Tags</span><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="ambient, synthwave, stem" className="w-full rounded border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-cyan-400/60" /><span className="mt-1 block text-xs text-gray-500">Separate tags with commas.</span></label>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={handleDelete} disabled={isBusy} className="flex items-center justify-center gap-2 rounded border border-red-400/30 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10 disabled:opacity-50"><Trash2 size={16} /> Delete track</button><div className="flex gap-3"><button type="button" onClick={onClose} disabled={isBusy} className="rounded border border-white/10 px-4 py-2 text-sm text-gray-300">Cancel</button><button type="submit" disabled={isBusy} className="flex items-center justify-center gap-2 rounded bg-cyan-400 px-4 py-2 text-sm font-bold text-black hover:bg-cyan-300 disabled:opacity-50">{isBusy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save changes</button></div></div>
      </form>
    </div>
  );
}
