import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload as UploadIcon, Music } from "lucide-react";
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Please sign in to upload tracks</p>
          <Button onClick={() => navigate("/")} className="bg-cyan-400/20 border border-cyan-400/50">
            Go Home
          </Button>
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

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 200);

      // Create FormData
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("genre", genre);
      formData.append("file", file);

      // Upload to server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      toast.success("Track uploaded successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setGenre("Electronic");
      setFile(null);
      setProgress(0);

      // Redirect to dashboard
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold neon-cyan">♪</div>
            <span className="text-xl font-bold tracking-wider">TuneCollab</span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/30 rounded font-semibold transition-all cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="neon-cyan">UPLOAD</span>
              <span className="text-white mx-2">×</span>
              <span className="neon-magenta">TRACK</span>
            </h1>
            <p className="text-gray-400">Share your music with the world</p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-cyan-400/50 rounded-lg p-8 text-center hover:border-cyan-400 transition cursor-pointer bg-cyan-400/5">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                <UploadIcon className="mx-auto mb-4 text-cyan-400" size={48} />
                <p className="text-lg font-semibold mb-2">
                  {file ? file.name : "Click to upload audio file"}
                </p>
                <p className="text-sm text-gray-400">
                  MP3, WAV, FLAC • Max 100MB
                </p>
              </label>
            </div>

            {/* Track Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">Track Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter track title"
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition"
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
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition resize-none"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-semibold mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50 transition"
              >
                <option value="Electronic">Electronic</option>
                <option value="Synthwave">Synthwave</option>
                <option value="Glitch Hop">Glitch Hop</option>
                <option value="Cyberpunk">Cyberpunk</option>
                <option value="Ambient">Ambient</option>
                <option value="Experimental">Experimental</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Upload Progress */}
            {uploading && progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-magenta-400 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={uploading || !file || !title.trim()}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-magenta-400 text-black font-bold rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploading ? `Uploading... ${Math.round(progress)}%` : "Upload Track"}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-12 p-6 border border-cyan-400/30 rounded-lg bg-cyan-400/5">
            <div className="flex gap-3">
              <Music className="text-cyan-400 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold mb-2">Copyright Protection</h3>
                <p className="text-sm text-gray-400">
                  Your track is automatically protected with SHA-256 hashing and watermarking.
                  Only you can modify or redistribute this track. Unauthorized reuse is prevented.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
