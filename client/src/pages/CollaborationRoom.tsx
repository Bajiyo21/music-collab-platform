import { useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Loader2, MessageSquare, Music, Plus, Send, Trash2, Users, Volume2, X } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

type LayerView = { id: number; trackId: number; addedById: number; title: string; artist: string; fileUrl: string; duration: number; volume: number; pan: number; startTime: number };

export default function CollaborationRoom() {
  const { collabId: collabIdParam } = useParams<{ collabId: string }>();
  const collabId = Number(collabIdParam);
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [showAddLayer, setShowAddLayer] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [layerComment, setLayerComment] = useState("");
  const [exporting, setExporting] = useState(false);

  const projectQuery = trpc.collaborations.byId.useQuery({ id: collabId }, { enabled: Number.isInteger(collabId) });
  const layersQuery = trpc.collaborations.layers.useQuery({ collabId }, { enabled: Number.isInteger(collabId) });
  const contributorsQuery = trpc.collaborations.contributors.useQuery({ collabId }, { enabled: Number.isInteger(collabId) && isAuthenticated });
  const commentsQuery = trpc.collaborations.comments.useQuery({ collabId }, { enabled: Number.isInteger(collabId) && isAuthenticated, refetchInterval: 5000 });
  const mineQuery = trpc.tracks.myTracks.useQuery(undefined, { enabled: isAuthenticated });
  const invalidateRoom = () => { void utils.collaborations.layers.invalidate({ collabId }); void utils.collaborations.contributors.invalidate({ collabId }); void utils.collaborations.comments.invalidate({ collabId }); };
  const joinMutation = trpc.collaborations.join.useMutation({ onSuccess: () => { invalidateRoom(); toast.success("You joined the collaboration"); }, onError: (error) => toast.error(error.message) });
  const addLayerMutation = trpc.collaborations.addLayer.useMutation({ onSuccess: () => { invalidateRoom(); setShowAddLayer(false); toast.success("Layer added"); }, onError: (error) => toast.error(error.message) });
  const updateLayerMutation = trpc.collaborations.updateLayer.useMutation({ onSuccess: invalidateRoom, onError: (error) => toast.error(error.message) });
  const removeLayerMutation = trpc.collaborations.removeLayer.useMutation({ onSuccess: () => { invalidateRoom(); setSelectedLayerId(null); toast.success("Layer removed"); }, onError: (error) => toast.error(error.message) });
  const addCommentMutation = trpc.collaborations.addComment.useMutation({ onSuccess: () => { invalidateRoom(); setChatInput(""); setLayerComment(""); }, onError: (error) => toast.error(error.message) });
  const removeContributorMutation = trpc.collaborations.removeContributor.useMutation({ onSuccess: () => { invalidateRoom(); toast.success("Contributor removed"); }, onError: (error) => toast.error(error.message) });
  const deleteProjectMutation = trpc.collaborations.delete.useMutation({ onSuccess: () => { toast.success("Collaboration deleted"); navigate("/collaborate"); }, onError: (error) => toast.error(error.message) });

  const layers = useMemo<LayerView[]>(() => (layersQuery.data ?? []).map((row) => ({ id: row.layer.id, trackId: row.track.id, addedById: row.layer.addedById, title: row.track.title, artist: row.creator.name ?? "TuneCollab musician", fileUrl: row.track.fileUrl, duration: Number(row.track.duration ?? 0), volume: Number(row.layer.volume ?? 1), pan: Number(row.layer.pan ?? 0), startTime: Number(row.layer.startTime ?? 0) })), [layersQuery.data]);
  const project = projectQuery.data;
  const isOwner = Boolean(user && project?.creatorId === user.id);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId) ?? layers[0];
  const existingTrackIds = new Set(layers.map((layer) => layer.trackId));
  const comments = commentsQuery.data ?? [];
  const chatComments = comments.filter((row) => row.comment.layerId == null);
  const layerComments = selectedLayer ? comments.filter((row) => row.comment.layerId === selectedLayer.id) : [];
  const canRemoveLayer = (layer: LayerView) => Boolean(user && (isOwner || layer.addedById === user.id));

  if (projectQuery.isLoading || layersQuery.isLoading) return <Loading />;
  if (!project) return <Empty navigate={navigate} />;

  const submitComment = (layerId?: number) => {
    if (!isAuthenticated) return toast.error("Please sign in to comment");
    const text = (layerId ? layerComment : chatInput).trim();
    if (text) addCommentMutation.mutate({ collabId, layerId, text });
  };
  const exportMix = async () => {
    if (!layers.length) return toast.error("Add at least one layer before exporting");
    setExporting(true);
    try {
      const url = URL.createObjectURL(await mixLayersToWav(layers));
      const link = document.createElement("a"); link.href = url; link.download = `${project.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "tunecollab-mix"}.wav`; link.click(); URL.revokeObjectURL(url);
      toast.success("WAV mix downloaded");
    } catch (error) { toast.error(error instanceof Error ? error.message : "The browser could not render this mix"); }
    finally { setExporting(false); }
  };
  const availableTracks = (mineQuery.data ?? []).filter((track) => !existingTrackIds.has(track.id));

  return <div className="min-h-screen bg-background text-foreground">
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md"><div className="container flex min-h-16 items-center justify-between gap-2 px-3 sm:px-4"><button onClick={() => navigate("/collaborate")} className="flex items-center gap-2 text-muted-foreground hover:text-cyan-500"><ArrowLeft size={18} /><span className="hidden sm:inline">Collaborations</span></button><span className="text-lg font-bold tracking-wider"><span className="neon-cyan">TUNE</span><span>×</span><span className="neon-magenta">COLLAB</span></span><div className="flex items-center gap-2"><ThemeToggle /><button onClick={() => setShowChat((open) => !open)} className="rounded border border-cyan-400/30 px-3 py-2 text-sm text-cyan-500 hover:bg-cyan-400/10" aria-expanded={showChat}><MessageSquare size={16} /><span className="ml-2 hidden sm:inline">Chat</span></button><button onClick={exportMix} disabled={exporting} className="rounded bg-cyan-400 px-3 py-2 text-sm font-bold text-black disabled:opacity-60"><Download size={16} /><span className="ml-2 hidden sm:inline">{exporting ? "Mixing…" : "Export WAV"}</span></button></div></div></header>
    <main className="container max-w-7xl px-3 pb-16 pt-24 sm:px-4">
      <section className="mb-6 studio-surface p-5 sm:p-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-500">Collaboration room</p><h1 className="break-words text-2xl sm:text-4xl">{project.title}</h1><p className="mt-2 max-w-3xl text-muted-foreground">{project.description || "A shared multi-track project."}</p></div><span className="w-fit rounded border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase text-cyan-600">{project.status ?? "draft"}</span></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"><span>Created {new Date(project.createdAt).toLocaleDateString()}</span><span><Users size={15} className="mr-1 inline" />{contributorsQuery.data?.length ?? 0} contributors</span><span>{layers.length} layers</span></div>{!isAuthenticated ? <button onClick={() => navigate("/")} className="mt-5 rounded border border-fuchsia-400/40 px-4 py-2 text-sm text-fuchsia-500">Sign in to contribute</button> : <button onClick={() => joinMutation.mutate({ collabId })} disabled={joinMutation.isPending} className="mt-5 rounded border border-cyan-400/40 px-4 py-2 text-sm text-cyan-600">{joinMutation.isPending ? "Joining…" : "Join / refresh membership"}</button>}{isOwner && <button onClick={() => window.confirm("Delete this collaboration and its room records? This cannot be undone.") && deleteProjectMutation.mutate({ collabId })} disabled={deleteProjectMutation.isPending} className="ml-3 mt-5 rounded border border-red-400/40 px-4 py-2 text-sm text-red-500">Delete project</button>}</section>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"><section className="space-y-6"><div className="studio-surface p-4 sm:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl"><Music size={20} /> Layers</h2><p className="mt-1 text-sm text-muted-foreground">Adjust shared mix controls; every change persists to the room.</p></div><button onClick={() => isAuthenticated ? setShowAddLayer(true) : toast.error("Please sign in to add a layer")} className="flex items-center gap-2 rounded border border-cyan-400/40 px-3 py-2 text-sm text-cyan-600"><Plus size={16} /> Add layer</button></div>{layers.length === 0 ? <div className="rounded border border-dashed border-border px-5 py-12 text-center text-muted-foreground">No layers yet. Add one of your uploaded tracks.</div> : <div className="space-y-3">{layers.map((layer) => <button key={layer.id} type="button" onClick={() => setSelectedLayerId(layer.id)} className={`flex w-full flex-col gap-3 rounded border p-4 text-left sm:flex-row sm:items-center ${selectedLayer?.id === layer.id ? "border-cyan-400/50 bg-cyan-400/10" : "border-border bg-card"}`}><div className="min-w-0 flex-1"><h3 className="truncate text-base font-semibold">{layer.title}</h3><p className="text-sm text-muted-foreground">{layer.artist}</p></div><div className="flex items-center gap-2"><audio controls preload="none" src={layer.fileUrl} onClick={(event) => event.stopPropagation()} className="h-8 max-w-[190px]" />{canRemoveLayer(layer) && <span onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => removeLayerMutation.mutate({ layerId: layer.id })} className="rounded border border-red-400/30 p-2 text-red-500" aria-label={`Remove ${layer.title}`}><Trash2 size={16} /></button></span>}</div></button>)}</div>}</div>{selectedLayer && <div className="studio-surface p-4 sm:p-6"><h2 className="mb-5 text-lg">Layer controls: {selectedLayer.title}</h2><div className="space-y-5"><label className="block"><span className="mb-2 flex justify-between text-sm"><span><Volume2 size={16} className="mr-2 inline" />Volume</span><span className="text-cyan-500">{Math.round(selectedLayer.volume * 100)}%</span></span><input type="range" min="0" max="1" step="0.01" value={selectedLayer.volume} disabled={!isAuthenticated} onChange={(event) => updateLayerMutation.mutate({ layerId: selectedLayer.id, volume: Number(event.target.value) })} className="w-full accent-cyan-400" /></label><label className="block"><span className="mb-2 flex justify-between text-sm"><span>Pan</span><span className="text-fuchsia-500">{selectedLayer.pan < 0 ? "L" : selectedLayer.pan > 0 ? "R" : "C"} {Math.abs(selectedLayer.pan).toFixed(2)}</span></span><input type="range" min="-1" max="1" step="0.01" value={selectedLayer.pan} disabled={!isAuthenticated} onChange={(event) => updateLayerMutation.mutate({ layerId: selectedLayer.id, pan: Number(event.target.value) })} className="w-full accent-fuchsia-400" /></label></div></div>}</section>
      <aside className="space-y-6"><div className="studio-surface p-4 sm:p-6"><h2 className="mb-4 flex items-center gap-2 text-lg"><Users size={18} /> Contributors</h2>{contributorsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading contributors…</p> : contributorsQuery.data?.length ? <div className="space-y-3">{contributorsQuery.data.map((row) => <div key={row.contributor.id} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{row.user.name ?? "Musician"}</p><p className="text-xs uppercase text-muted-foreground">{row.contributor.role}</p></div>{isOwner && row.contributor.userId !== user?.id && <button onClick={() => window.confirm(`Remove ${row.user.name ?? "this contributor"} from the room?`) && removeContributorMutation.mutate({ collabId, contributorId: row.contributor.userId })} className="rounded border border-red-400/30 p-2 text-red-500" aria-label={`Remove ${row.user.name ?? "contributor"}`}><X size={14} /></button>}</div>)}</div> : <p className="text-sm text-muted-foreground">No contributors yet.</p>}</div><div className="studio-surface p-4 sm:p-6"><h2 className="mb-4 flex items-center gap-2 text-lg"><MessageSquare size={18} /> Layer feedback</h2>{!isAuthenticated ? <p className="text-sm text-muted-foreground">Sign in to view and add feedback.</p> : <><div className="max-h-56 space-y-3 overflow-y-auto">{layerComments.length ? layerComments.map((row) => <div key={row.comment.id} className="rounded bg-muted p-3 text-sm"><p className="font-semibold text-cyan-600">{row.user.name ?? "Musician"}</p><p className="mt-1">{row.comment.text}</p></div>) : <p className="text-sm text-muted-foreground">No comments on this layer yet.</p>}</div>{selectedLayer && <div className="mt-4 flex gap-2"><input value={layerComment} onChange={(event) => setLayerComment(event.target.value)} placeholder="Leave layer feedback" className="min-w-0 flex-1 rounded border border-input bg-background px-3 py-2 text-sm" /><button onClick={() => submitComment(selectedLayer.id)} className="rounded bg-cyan-400 p-2 text-black" aria-label="Send layer feedback"><Send size={16} /></button></div>}</>}</div></aside></div>
    </main>
    {showAddLayer && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-lg studio-surface p-5"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl">Add your track</h2><button onClick={() => setShowAddLayer(false)} aria-label="Close add layer dialog"><X size={18} /></button></div>{availableTracks.map((track) => <div key={track.id} className="mb-2 flex items-center justify-between gap-3 rounded border border-border p-3"><span className="truncate text-sm">{track.title}</span><button onClick={() => addLayerMutation.mutate({ collabId, trackId: track.id })} disabled={addLayerMutation.isPending} className="rounded border border-cyan-400/40 px-3 py-2 text-sm text-cyan-600">Add</button></div>)}{availableTracks.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Upload a track first, or all of your tracks are already in this room.</p>}</div></div>}
    {showChat && <div className="fixed inset-x-2 bottom-2 z-50 flex h-[min(28rem,75vh)] flex-col rounded-lg border border-cyan-400/30 bg-card shadow-xl sm:inset-x-auto sm:right-4 sm:w-96"><div className="flex items-center justify-between border-b border-border p-4"><h2 className="font-bold">Room chat</h2><button onClick={() => setShowChat(false)} aria-label="Close chat"><X size={18} /></button></div><div className="flex-1 space-y-3 overflow-y-auto p-4">{!isAuthenticated ? <p className="text-sm text-muted-foreground">Sign in to view chat.</p> : chatComments.length ? chatComments.map((row) => <div key={row.comment.id} className="text-sm"><p className="font-semibold text-cyan-600">{row.user.name ?? "Musician"}</p><p>{row.comment.text}</p><p className="mt-1 text-[10px] text-muted-foreground">{new Date(row.comment.createdAt).toLocaleTimeString()}</p></div>) : <p className="text-sm text-muted-foreground">No room messages yet.</p>}</div>{isAuthenticated && <div className="flex gap-2 border-t border-border p-3"><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submitComment(); }} placeholder="Message collaborators" className="min-w-0 flex-1 rounded border border-input bg-background px-3 py-2 text-sm" /><button onClick={() => submitComment()} className="rounded bg-cyan-400 p-2 text-black" aria-label="Send chat message"><Send size={16} /></button></div>}</div>}
  </div>;
}

function Loading() { return <div className="flex min-h-screen items-center justify-center bg-background text-cyan-500"><Loader2 className="animate-spin" /></div>; }
function Empty({ navigate }: { navigate: (path: string) => void }) { return <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center"><div><p className="mb-5 text-muted-foreground">Collaboration not found.</p><button onClick={() => navigate("/collaborate")} className="rounded bg-cyan-400 px-4 py-2 font-bold text-black">Back to collaborations</button></div></div>; }

async function mixLayersToWav(layers: LayerView[]) {
  const audioContext = new AudioContext();
  const decoded = await Promise.all(layers.map(async (layer) => { const response = await fetch(layer.fileUrl); if (!response.ok) throw new Error(`Could not read ${layer.title}`); return { layer, buffer: await audioContext.decodeAudioData(await response.arrayBuffer()) }; }));
  const sampleRate = Math.max(...decoded.map(({ buffer }) => buffer.sampleRate), 44100);
  const length = Math.ceil(Math.max(...decoded.map(({ layer, buffer }) => layer.startTime + buffer.duration)) * sampleRate);
  const offline = new OfflineAudioContext(2, Math.max(length, sampleRate), sampleRate);
  decoded.forEach(({ layer, buffer }) => { const source = offline.createBufferSource(); source.buffer = buffer; const gain = offline.createGain(); gain.gain.value = layer.volume; const pan = offline.createStereoPanner(); pan.pan.value = layer.pan; source.connect(gain).connect(pan).connect(offline.destination); source.start(Math.max(0, layer.startTime)); });
  const rendered = await offline.startRendering(); await audioContext.close(); return encodeWav(rendered);
}

function encodeWav(buffer: AudioBuffer) {
  const channels = 2; const frameCount = buffer.length; const output = new ArrayBuffer(44 + frameCount * channels * 2); const view = new DataView(output); const writeString = (offset: number, value: string) => Array.from(value).forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  writeString(0, "RIFF"); view.setUint32(4, 36 + frameCount * channels * 2, true); writeString(8, "WAVE"); writeString(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true); view.setUint32(24, buffer.sampleRate, true); view.setUint32(28, buffer.sampleRate * channels * 2, true); view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); writeString(36, "data"); view.setUint32(40, frameCount * channels * 2, true);
  const channelData = Array.from({ length: channels }, (_, index) => buffer.getChannelData(Math.min(index, buffer.numberOfChannels - 1))); let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) for (let channel = 0; channel < channels; channel += 1) { const sample = Math.max(-1, Math.min(1, channelData[channel][frame])); view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true); offset += 2; }
  return new Blob([output], { type: "audio/wav" });
}
