import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Sparkles, Bot, ArrowLeft, Send, Music, Wand2, RefreshCw, Loader2, ListMusic } from "lucide-react";
import { toast } from "sonner";
import { startLogin } from "@/const";

export default function AiStudio() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [lyrics, setLyrics] = useState("");
  const [prompt, setPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Greetings, musician. I am TuneAI. Share your lyrics or a concept, and I will help you craft chords, arrange stems, and fine-tune your production." }
  ]);

  // New states for lyrics generator & track upload customizer
  const [lyricGenre, setLyricGenre] = useState("Synthwave");
  const [lyricMood, setLyricMood] = useState("Nostalgic & Energetic");
  const [lyricTheme, setLyricTheme] = useState("");
  const [generatedLyrics, setGeneratedLyrics] = useState("");

  const [uploadTrackName, setUploadTrackName] = useState("");
  const [uploadGenre, setUploadGenre] = useState("Electronic");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [customizedTrackResult, setCustomizedTrackResult] = useState<any>(null);

  const lyricMutation = trpc.aiStudio.generateLyrics.useMutation({
    onSuccess: (data) => {
      setGeneratedLyrics(data.lyrics);
      toast.success("AI generated song lyrics successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const customizeMutation = trpc.aiStudio.customizeTrack.useMutation({
    onSuccess: (data) => {
      setCustomizedTrackResult(data);
      toast.success("AI customized new track concept successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const analyzeMutation = trpc.aiStudio.analyze.useMutation({
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast.success("AI production analysis complete");
    },
    onError: (err) => toast.error(err.message),
  });

  const chatMutation = trpc.aiStudio.chat.useMutation({
    onSuccess: (data) => {
      const text = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAnalyze = () => {
    if (!isAuthenticated) return toast.error("Please sign in to use AI Studio");
    if (!lyrics.trim() && !prompt.trim()) return toast.error("Please enter lyrics or a prompt to analyze");
    analyzeMutation.mutate({ lyrics, prompt });
  };

  const handleSendChat = () => {
    if (!isAuthenticated) return toast.error("Please sign in to chat with TuneAI");
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    const nextMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(nextMessages);
    setChatInput("");
    chatMutation.mutate({ messages: nextMessages });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-400 hover:text-cyan-300">
              <ArrowLeft size={18} /> <span className="hidden sm:inline">Dashboard</span>
            </button>
            <span className="font-bold tracking-wider">
              <span className="neon-cyan">TUNE</span><span className="text-white">×</span><span className="neon-magenta">COLLAB</span> <span className="text-xs uppercase text-cyan-400/80">AI Studio</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <button onClick={() => startLogin()} className="rounded bg-cyan-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-cyan-300">
                Sign In
              </button>
            ) : (
              <button onClick={() => navigate("/explore")} className="rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 hover:text-cyan-300">
                Explore Tracks
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-6xl px-4 py-8 sm:py-12">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-widest text-cyan-300">
            <Sparkles size={14} /> Neural Audio Synthesis & Production
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
            AI Music Studio & Producer Assistant
          </h1>
          <p className="mt-2 text-gray-400">
            Feed your lyrics, concepts, or stems into TuneAI to generate genre recommendations, chord progressions, lyric variations, and mixing advice.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Analysis & Prompt Generator */}
          <div className="space-y-6 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-cyan-300">
                <Wand2 size={20} /> Track & Lyrics Analyzer
              </h2>
              <span className="text-xs text-gray-500">Powered by LLM</span>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Lyrics or Concept</label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Paste your lyrics or describe the vibe of your track here..."
                rows={5}
                className="w-full rounded border border-white/10 bg-black/60 p-3 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Custom Production Prompt</label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make it a dark synthwave anthem with pulsating bass"
                className="w-full rounded border border-white/10 bg-black/60 p-3 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-3 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {analyzeMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate AI Production Plan
            </button>

            {analysisResult && (
              <div className="mt-6 space-y-4 rounded-lg border border-cyan-400/30 bg-cyan-950/20 p-5 text-sm">
                <div className="flex items-center justify-between border-b border-cyan-400/20 pb-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-cyan-300">Genre:</span> <span className="font-semibold text-white">{analysisResult.genre}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-cyan-300">Tempo:</span> <span className="font-semibold text-white">{analysisResult.tempoRecommendation}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-cyan-300">Vibe & Mood</h4>
                  <p className="mt-1 text-gray-300">{analysisResult.mood}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-cyan-300">Recommended Chord Progression</h4>
                  <p className="mt-1 font-mono text-fuchsia-300">{analysisResult.chordProgression}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-cyan-300">Suggested Instrumentation</h4>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {analysisResult.instrumentation?.map((inst: string, idx: number) => (
                      <span key={idx} className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-200">{inst}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-cyan-300">Production Tips</h4>
                  <ul className="mt-1 list-disc list-inside space-y-1 text-gray-300">
                    {analysisResult.productionTips?.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: TuneAI Chat Assistant */}
          <div className="flex flex-col rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md h-[600px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-fuchsia-400">
                <Bot size={20} /> TuneAI Assistant
              </h2>
              <span className="text-xs text-gray-500">Real-time chat</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30" : "bg-white/10 text-gray-200 border border-white/10"}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3 text-sm text-gray-400">
                    <Loader2 className="animate-spin" size={16} /> TuneAI is composing...
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendChat(); }}
                placeholder={isAuthenticated ? "Ask TuneAI anything about your track..." : "Sign in to chat with TuneAI"}
                disabled={!isAuthenticated || chatMutation.isPending}
                className="flex-1 rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-fuchsia-400 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSendChat}
                disabled={!isAuthenticated || chatMutation.isPending}
                className="rounded bg-fuchsia-500 px-4 py-2 font-bold text-black transition hover:bg-fuchsia-400 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* AI Genre & Mood Lyric Generator */}
        <div className="mt-12 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
              <Wand2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Genre & Mood Lyric Generator</h3>
              <p className="text-sm text-gray-400">Generate professional lyrics tailored to any genre and mood using TuneAI</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Genre</label>
              <input
                type="text"
                value={lyricGenre}
                onChange={(e) => setLyricGenre(e.target.value)}
                placeholder="e.g. Synthwave, Cyberpunk, Lo-Fi"
                className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Mood</label>
              <input
                type="text"
                value={lyricMood}
                onChange={(e) => setLyricMood(e.target.value)}
                placeholder="e.g. Melancholic & Electric"
                className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Theme (Optional)</label>
              <input
                type="text"
                value={lyricTheme}
                onChange={(e) => setLyricTheme(e.target.value)}
                placeholder="e.g. Neon rain, digital ghosts"
                className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => lyricMutation.mutate({ genre: lyricGenre, mood: lyricMood, theme: lyricTheme })}
            disabled={lyricMutation.isPending}
            className="rounded bg-fuchsia-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-fuchsia-400 flex items-center gap-2 disabled:opacity-50"
          >
            {lyricMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Generate Genre-Aware Lyrics
          </button>

          {generatedLyrics && (
            <div className="mt-6 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-4">
              <h4 className="text-sm font-bold text-fuchsia-300 mb-2">Generated Song Lyrics</h4>
              <div className="whitespace-pre-wrap text-sm text-gray-200 font-mono bg-black/40 p-4 rounded border border-white/10 max-h-96 overflow-y-auto">
                {generatedLyrics}
              </div>
            </div>
          )}
        </div>

        {/* AI Studio Track Upload & Customization Section */}
        <div className="mt-12 rounded-xl border border-cyan-400/30 bg-black/40 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
              <Music size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Upload Track & Customize with AI</h3>
              <p className="text-sm text-gray-400">Upload your track audio, specify your creative notes, and let TuneAI transform it into a brand-new customized track concept</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Track Title / Name</label>
                <input
                  type="text"
                  value={uploadTrackName}
                  onChange={(e) => setUploadTrackName(e.target.value)}
                  placeholder="e.g. Midnight Cyber Anthem"
                  className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Target Genre</label>
                <input
                  type="text"
                  value={uploadGenre}
                  onChange={(e) => setUploadGenre(e.target.value)}
                  placeholder="e.g. Synthwave / Dark Techno"
                  className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Audio File Upload</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center bg-white/5 hover:border-cyan-400/50 transition cursor-pointer">
                  <Music className="mx-auto h-8 w-8 text-cyan-400 mb-2" />
                  <p className="text-sm text-gray-300 font-medium">Click to select audio or drop track stem</p>
                  <p className="text-xs text-gray-500 mt-1">Supports MP3, WAV, FLAC (Max 50MB)</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setUploadFile(file);
                        setUploadTrackName(file.name.replace(/\.[^/.]+$/, ""));
                        toast.success(`Audio file selected: ${file.name}`);
                      }
                    }}
                    className="mt-3 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-cyan-400 file:text-black hover:file:bg-cyan-300"
                  />
                  {uploadFile && <p className="mt-2 text-xs text-cyan-300 font-mono">Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(1)} MB)</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Customization Notes for AI</label>
                <textarea
                  rows={6}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Describe how TuneAI should customize this track (e.g. add arpeggiated bass, make the chorus wider, add vocal chops...)"
                  className="w-full rounded border border-white/10 bg-black/60 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                ></textarea>
              </div>
              <button
                onClick={async () => {
                  if (!isAuthenticated) return toast.error("Please sign in to customize tracks");
                  if (!uploadTrackName.trim()) return toast.error("Please enter a track name or upload an audio file");
                  try {
                    setUploadingFile(true);
                    let audioUrl = "";
                    if (uploadFile) {
                      const formData = new FormData();
                      formData.append("audio", uploadFile);
                      formData.append("title", uploadTrackName);
                      formData.append("genre", uploadGenre);
                      formData.append("description", uploadNotes);
                      const res = await fetch("/api/upload-track", { method: "POST", body: formData });
                      if (res.ok) {
                        const data = await res.json();
                        audioUrl = data.track?.audioUrl || "";
                        toast.success("Track uploaded and hashed successfully!");
                      } else {
                        toast.error("Upload warning: proceeding with AI conceptual analysis");
                      }
                    }
                    customizeMutation.mutate({ trackName: uploadTrackName, genre: uploadGenre, notes: uploadNotes, audioUrl });
                  } catch (err: any) {
                    toast.error(err.message || "Upload failed");
                  } finally {
                    setUploadingFile(false);
                  }
                }}
                disabled={uploadingFile || customizeMutation.isPending}
                className="w-full rounded bg-cyan-400 py-3 text-sm font-bold text-black transition hover:bg-cyan-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploadingFile || customizeMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                {uploadingFile ? "Uploading audio & hashing..." : "Customize & Create New Track Concept"}
              </button>
            </div>
          </div>

          {customizedTrackResult && (
            <div className="mt-6 rounded-lg border border-cyan-400/40 bg-cyan-400/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-cyan-300">✨ New Customized Track Concept</h4>
                <span className="text-xs bg-cyan-400/20 text-cyan-300 px-3 py-1 rounded-full font-mono">
                  {customizedTrackResult.bpm} • {customizedTrackResult.key}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="bg-black/60 p-4 rounded border border-white/10">
                    <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">New Track Title</span>
                    <p className="font-bold text-white text-base">{customizedTrackResult.newTrackTitle}</p>
                    <span className="text-xs text-cyan-400 block mt-2">Genre: {customizedTrackResult.genre}</span>
                  </div>
                  <div className="bg-black/60 p-4 rounded border border-white/10">
                    <span className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">Arrangement Blueprint</span>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {customizedTrackResult.arrangements?.map((step: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span> {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-black/60 p-4 rounded border border-white/10">
                    <span className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">New Instrument Stems Added</span>
                    <div className="flex flex-wrap gap-2">
                      {customizedTrackResult.newInstrumentStems?.map((stem: string, i: number) => (
                        <span key={i} className="rounded bg-white/10 px-2.5 py-1 text-xs text-cyan-200 border border-white/10">
                          {stem}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-black/60 p-4 rounded border border-white/10">
                    <span className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">Mixing & Production Recommendations</span>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {customizedTrackResult.mixingRecommendations?.map((rec: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400"></span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {customizedTrackResult.conceptStory && (
                <div className="mt-4 bg-black/60 p-4 rounded border border-white/10 text-sm text-gray-300 leading-relaxed font-mono">
                  <span className="text-xs text-cyan-400 block mb-1 uppercase tracking-wider font-sans">Producer Summary</span>
                  {customizedTrackResult.conceptStory}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
