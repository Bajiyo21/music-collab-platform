import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Upload as UploadIcon, Music, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { TrackMetadataSuggestion } from "@shared/metadata-suggestions";
import { toast } from "sonner";

export default function Upload() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Electronic");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [metadataSuggestion, setMetadataSuggestion] = useState<TrackMetadataSuggestion | null>(null);
  const metadataSuggestionMutation = trpc.aiStudio.suggestMetadata.useMutation({
    onSuccess: (suggestion) => {
      setMetadataSuggestion(suggestion);
      toast.success("TuneAI prepared metadata suggestions for review.");
    },
    onError: (error) => toast.error(error.message || "TuneAI could not prepare metadata right now."),
  });

  const requestMetadataSuggestion = () => {
    if (!title.trim()) {
      toast.error("Add a track title before asking TuneAI for metadata.");
      return;
    }
    metadataSuggestionMutation.mutate({ title: title.trim(), description: description.trim() || undefined, currentGenre: genre as TrackMetadataSuggestion["genre"] });
  };

  const applyMetadataSuggestion = () => {
    if (!metadataSuggestion) return;
    setDescription(metadataSuggestion.description);
    setGenre(metadataSuggestion.genre);
    setTags(metadataSuggestion.tags.join(", "));
    setMetadataSuggestion(null);
    toast.success("Metadata suggestions applied. You can still edit every field.");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Please sign in to upload tracks</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400/30 transition cursor-pointer"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error("File too large. Maximum 100MB.");
        return;
      }
      if (!selectedFile.type.startsWith("audio/")) {
        toast.error("Please select an audio file (MP3, WAV, FLAC, etc.)");
        return;
      }
      setFile(selectedFile);
      toast.success(`File selected: ${selectedFile.name}`);
    }
  };

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Cover art is too large. Maximum 5MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
      toast.error("Cover art must be JPG, PNG, or WebP.");
      return;
    }
    setCoverArt(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a track title");
      return;
    }

    if (!file) {
      toast.error("Please select an audio file");
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("genre", genre);
    formData.append("tags", tags);
    formData.append("visibility", visibility);
    if (coverArt) formData.append("coverArt", coverArt);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload-track");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      let response: { error?: string; success?: boolean } = {};
      try {
        response = JSON.parse(xhr.responseText) as typeof response;
      } catch {
        response = {};
      }

      if (xhr.status >= 200 && xhr.status < 300 && response.success) {
        setProgress(100);
        toast.success("Track uploaded successfully!");
        setUploadComplete(true);
        setTimeout(() => {
          setTitle("");
          setDescription("");
          setGenre("Electronic");
          setTags("");
          setVisibility("public");
          setFile(null);
          setCoverArt(null);
          setProgress(0);
          setUploading(false);
          setUploadComplete(false);
          navigate("/dashboard");
        }, 2000);
        return;
      }

      toast.error(response.error || "Upload failed. Please try again.");
      setUploading(false);
      setProgress(0);
    };
    xhr.onerror = () => {
      toast.error("Upload failed. Check your connection and try again.");
      setUploading(false);
      setProgress(0);
    };
    xhr.send(formData);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-2 px-4 py-3 sm:h-16 sm:flex-nowrap sm:py-0">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold neon-cyan">♪</div>
            <span className="text-xl font-bold tracking-wider">TuneCollab</span>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-2 text-gray-400 hover:text-cyan-400 transition flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline text-sm">Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-12 pt-24 sm:px-6">
        <div className="container max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-4xl font-bold leading-tight sm:text-5xl">
              <span className="neon-cyan">UPLOAD</span>
              <span className="text-white mx-2">YOUR</span>
              <span className="neon-magenta">TRACK</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
              Share your music with the world. Your track receives an exact-file fingerprint for duplicate and integrity checks.
            </p>
          </div>

          {/* Upload Form */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-8">
            {uploadComplete ? (
              <div className="text-center py-12">
                <CheckCircle size={64} className="mx-auto mb-4 text-green-400" />
                <h2 className="text-2xl font-bold mb-2">Upload Complete!</h2>
                <p className="text-gray-400 mb-6">Your track has been uploaded successfully and its exact-file fingerprint is recorded.</p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-2 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 transition cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Track Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Track Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Neon Dreams"
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your track..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition resize-none"
                  />
                </div>

                <div className="studio-surface border-cyan-400/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-cyan-400"><Sparkles size={16} /> TuneAI metadata assistant</p>
                      <p className="mt-1 text-xs text-muted-foreground">Get a suggested description, genre, and discovery tags from the details you provide. Suggestions do not change your upload until you apply them.</p>
                    </div>
                    <button type="button" onClick={requestMetadataSuggestion} disabled={metadataSuggestionMutation.isPending || uploading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50">
                      {metadataSuggestionMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                      {metadataSuggestionMutation.isPending ? "Generating…" : "Suggest metadata"}
                    </button>
                  </div>
                  {metadataSuggestion && <div className="mt-4 rounded border border-border bg-background/70 p-3 text-sm">
                    <p className="font-medium text-foreground">{metadataSuggestion.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2"><span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-400">{metadataSuggestion.genre}</span>{metadataSuggestion.tags.map((tag) => <span key={tag} className="rounded border border-border bg-card px-2 py-1 text-xs text-muted-foreground">{tag}</span>)}</div>
                    <button type="button" onClick={applyMetadataSuggestion} className="mt-3 rounded bg-cyan-400 px-3 py-2 text-xs font-bold text-black transition hover:bg-cyan-300">Apply suggestions</button>
                  </div>}
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Genre *</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition"
                  >
                    <option value="Electronic">Electronic</option>
                    <option value="Synthwave">Synthwave</option>
                    <option value="Glitch Hop">Glitch Hop</option>
                    <option value="Cyberpunk">Cyberpunk</option>
                    <option value="Ambient">Ambient</option>
                    <option value="Experimental">Experimental</option>
                    <option value="House">House</option>
                    <option value="Techno">Techno</option>
                    <option value="Drum & Bass">Drum & Bass</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">Tags</label>
                  <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} disabled={uploading} placeholder="night drive, breakbeat, analog" className="w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-400/50 focus:outline-none" />
                  <p className="mt-2 text-xs text-gray-500">Separate tags with commas. The selected genre is stored as a tag as well.</p>
                </div>

                {/* Visibility */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">Visibility</label>
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "private" | "unlisted")} disabled={uploading} className="w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyan-400/50 focus:outline-none">
                    <option value="public">Public — discoverable in Explore</option>
                    <option value="unlisted">Unlisted — accessible by direct link</option>
                    <option value="private">Private — visible only in your library</option>
                  </select>
                </div>

                {/* Cover Art */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">Cover Art (optional)</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverArtChange} disabled={uploading} className="block w-full rounded border border-white/10 bg-white/5 p-3 text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-fuchsia-400 file:px-3 file:py-2 file:font-semibold file:text-black" />
                  <p className="mt-2 text-xs text-gray-500">JPG, PNG, or WebP up to 5MB. {coverArt ? `Selected: ${coverArt.name}` : "A square image works best."}</p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Audio File *</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-input"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="file-input"
                      className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-cyan-400/30 bg-cyan-400/5 p-4 text-center transition hover:bg-cyan-400/10 cursor-pointer sm:flex-row sm:p-6"
                    >
                      <UploadIcon size={24} className="text-cyan-400" />
                      <div className="text-center">
                        <p className="safe-wrap max-w-full font-semibold">
                          {file ? file.name : "Click to select audio file"}
                        </p>
                        <p className="text-sm text-gray-400">MP3, WAV, FLAC, OGG (Max 100MB)</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Copyright Notice */}
                <div className="rounded border border-magenta-400/30 bg-magenta-400/10 p-3 sm:p-4">
                  <p className="text-sm text-gray-300">
                    ✓ SHA-256 fingerprinting checks exact duplicates and file integrity
                  </p>
                  <p className="text-sm text-gray-300">
                    ✓ Duplicate uploads will be detected automatically
                  </p>
                  <p className="text-sm text-gray-300">
                    ✓ Upload only music you own or are licensed to share
                  </p>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold rounded hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {uploading ? "Uploading..." : "Upload Track"}
                </button>
              </form>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 rounded-lg border border-white/10 bg-black/40 p-4 sm:p-6">
            <h3 className="font-bold mb-3 text-cyan-400">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>✓ Your track is scanned for duplicates</li>
              <li>✓ Metadata is extracted and stored securely</li>
              <li>✓ A fingerprint record is stored with the upload metadata</li>
              <li>✓ Your track appears in the Explore section</li>
              <li>✓ Other musicians can collaborate with you</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
