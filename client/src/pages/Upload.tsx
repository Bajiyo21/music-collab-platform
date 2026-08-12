import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Upload as UploadIcon, Music, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Upload() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Electronic");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

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
          setFile(null);
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
