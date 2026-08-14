import { useState } from "react";
import { useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ShareActions } from "@/components/ShareActions";
import { ArrowLeft, Heart, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function TrackDetail() {
  const { trackId: trackIdParam } = useParams<{ trackId: string }>();
  const trackId = Number(trackIdParam);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const trackQuery = trpc.tracks.byId.useQuery({ id: trackId }, { enabled: Number.isInteger(trackId) });
  const queueQuery = trpc.tracks.trending.useQuery({ limit: 20 });
  const commentsQuery = trpc.tracks.comments.useQuery({ trackId }, { enabled: Number.isInteger(trackId) });
  const likeMutation = trpc.tracks.like.useMutation({ onSuccess: () => setLiked((value) => !value), onError: (error) => toast.error(error.message) });
  const commentMutation = trpc.tracks.addComment.useMutation({ onSuccess: () => { setComment(""); commentsQuery.refetch(); toast.success("Comment added"); }, onError: (error) => toast.error(error.message) });
  const track = trackQuery.data;
  const queue = useMemo(() => track ? [
    { id: String(track.id), trackTitle: track.title, artistName: "TuneCollab musician", audioUrl: track.fileUrl, duration: Number(track.duration ?? 0) || 240 },
    ...(queueQuery.data ?? []).filter((row) => row.track.id !== track.id && Boolean(row.track.fileUrl)).map((row) => ({ id: String(row.track.id), trackTitle: row.track.title, artistName: row.creator.name ?? "TuneCollab musician", audioUrl: row.track.fileUrl, duration: Number(row.track.duration ?? 0) || 240 })),
  ] : [], [queueQuery.data, track]);

  if (trackQuery.isLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-cyan-300"><Loader2 className="animate-spin" /></div>;
  if (!track) return <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center"><div><p className="mb-5 text-gray-400">This public track is unavailable.</p><button onClick={() => navigate("/explore")} className="rounded bg-cyan-400 px-4 py-2 font-bold text-black">Back to Explore</button></div></div>;

  function submitComment() {
    if (!isAuthenticated) return toast.error("Sign in to comment");
    if (!comment.trim()) return;
    commentMutation.mutate({ trackId, text: comment.trim() });
  }

  return <div className="min-h-screen bg-background text-foreground"><header className="border-b border-white/10 bg-black/70 backdrop-blur-md"><div className="container flex min-h-16 items-center justify-between gap-3 px-4"><button onClick={() => navigate("/explore")} className="flex items-center gap-2 text-gray-400 hover:text-cyan-300"><ArrowLeft size={18} /> <span className="hidden sm:inline">Explore</span></button><span className="font-bold tracking-wider"><span className="neon-cyan">TUNE</span><span className="text-white">×</span><span className="neon-magenta">COLLAB</span></span><button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")} className="rounded border border-white/10 px-3 py-2 text-sm text-gray-300 hover:text-cyan-300">{isAuthenticated ? "Dashboard" : "Sign in"}</button></div></header><main className="container max-w-5xl px-4 py-8 sm:py-12"><div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]"><section><p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-300">Public track signal</p><h1 className="break-words text-3xl font-bold sm:text-5xl">{track.title}</h1><button onClick={() => navigate(`/profile/${track.creatorId}`)} className="mt-3 text-gray-400 hover:text-cyan-300">View musician profile</button><div className="mt-8"><AudioPlayer trackTitle={track.title} artistName="TuneCollab musician" audioUrl={track.fileUrl} duration={Number(track.duration ?? 0) || 240} queue={queue} onTrackChange={(nextTrack) => navigate(`/track/${nextTrack.id}`)} /></div><p className="mt-3 text-xs text-muted-foreground">Use previous/next for the public-track queue, or enable shuffle and repeat in the player.</p><div className="mt-5 flex flex-wrap items-center gap-3"><button onClick={() => { if (!isAuthenticated) return toast.error("Sign in to like tracks"); likeMutation.mutate({ trackId }); }} className={`flex items-center gap-2 rounded border px-4 py-2 text-sm ${liked ? "border-fuchsia-400/60 text-fuchsia-300" : "border-white/10 text-gray-400"}`}><Heart size={17} fill={liked ? "currentColor" : "none"} /> {liked ? "Liked" : "Like"}</button><ShareActions title={track.title} /></div></section><aside className="rounded-lg border border-white/10 bg-white/5 p-5 sm:p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><MessageCircle size={19} /> Comments</h2><p className="mt-2 text-sm text-gray-500">Feedback stays attached to this track for collaborators and listeners.</p><div className="mt-6 max-h-[28rem] space-y-4 overflow-y-auto">{commentsQuery.isLoading ? <p className="text-sm text-gray-500">Loading comments...</p> : commentsQuery.data?.length ? commentsQuery.data.map((row) => <div key={row.comment.id} className="border-b border-white/10 pb-4"><p className="text-sm font-semibold text-cyan-300">{row.user.name ?? "TuneCollab musician"}</p><p className="mt-1 text-sm text-gray-300">{row.comment.text}</p><p className="mt-1 text-[11px] text-gray-600">{new Date(row.comment.createdAt).toLocaleString()}</p></div>) : <p className="text-sm text-gray-600">No comments yet.</p>}</div><div className="mt-6 flex gap-2"><input value={comment} onChange={(event) => setComment(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submitComment(); }} placeholder={isAuthenticated ? "Leave feedback" : "Sign in to comment"} className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" disabled={!isAuthenticated || commentMutation.isPending} /><button onClick={submitComment} disabled={!isAuthenticated || commentMutation.isPending} className="rounded bg-cyan-400 px-3 py-2 text-sm font-bold text-black disabled:opacity-50">Send</button></div></aside></div></main></div>;
}
