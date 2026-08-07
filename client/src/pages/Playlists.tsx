import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Plus, ArrowLeft, Trash2, Edit2, Share2, Lock, Globe } from "lucide-react";
import { toast } from "sonner";

interface Playlist {
  id: number;
  name: string;
  description: string;
  trackCount: number;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
  coverUrl?: string;
}

const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 1,
    name: "Synthwave Vibes",
    description: "Collection of my favorite synthwave tracks",
    trackCount: 12,
    visibility: "public",
    createdAt: "2026-07-20",
    updatedAt: "2026-08-05",
  },
  {
    id: 2,
    name: "Late Night Coding",
    description: "Perfect for focused work sessions",
    trackCount: 8,
    visibility: "private",
    createdAt: "2026-07-15",
    updatedAt: "2026-08-02",
  },
  {
    id: 3,
    name: "Glitch Hop Essentials",
    description: "Essential glitch hop tracks",
    trackCount: 15,
    visibility: "public",
    createdAt: "2026-07-10",
    updatedAt: "2026-08-01",
  },
];

export default function Playlists() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>(MOCK_PLAYLISTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [newPlaylistVisibility, setNewPlaylistVisibility] = useState<"public" | "private">("private");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Please sign in to manage playlists</p>
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

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPlaylistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    const newPlaylist: Playlist = {
      id: Math.max(...playlists.map((p) => p.id), 0) + 1,
      name: newPlaylistName,
      description: newPlaylistDesc,
      trackCount: 0,
      visibility: newPlaylistVisibility,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setPlaylists([newPlaylist, ...playlists]);
    toast.success(`Playlist "${newPlaylistName}" created!`);
    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setNewPlaylistVisibility("private");
    setShowCreateModal(false);
  };

  const handleDeletePlaylist = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setPlaylists(playlists.filter((p) => p.id !== id));
      toast.success("Playlist deleted");
    }
  };

  const handleSharePlaylist = (name: string) => {
    toast.success(`Playlist "${name}" link copied to clipboard!`);
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
            className="px-3 py-2 text-gray-400 hover:text-cyan-400 transition flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline text-sm">Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-4">
                <span className="neon-cyan">MY</span>
                <span className="text-white mx-2">×</span>
                <span className="neon-magenta">PLAYLISTS</span>
              </h1>
              <p className="text-gray-400 text-lg">Create and manage your music collections</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold rounded hover:opacity-90 transition cursor-pointer whitespace-nowrap"
            >
              <Plus size={20} />
              New Playlist
            </button>
          </div>

          {/* Playlists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="border border-white/10 rounded-lg p-6 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition group"
                >
                  {/* Playlist Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">
                        {playlist.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                          playlist.visibility === "public"
                            ? "bg-cyan-400/20 text-cyan-400"
                            : "bg-magenta-400/20 text-magenta-400"
                        }`}
                      >
                        {playlist.visibility === "public" ? (
                          <>
                            <Globe size={12} />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock size={12} />
                            Private
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{playlist.description}</p>
                  </div>

                  {/* Playlist Info */}
                  <div className="mb-4 text-sm text-gray-400">
                    <p>{playlist.trackCount} tracks</p>
                    <p className="text-xs">Updated {playlist.updatedAt}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className="flex-1 px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400/30 transition font-semibold cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleSharePlaylist(playlist.name)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition cursor-pointer"
                      title="Share"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/playlist/${playlist.id}/edit`)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePlaylist(playlist.id, playlist.name)}
                      className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">No playlists yet. Create one to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-white/10 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              <span className="neon-cyan">CREATE</span>
              <span className="text-white mx-2">NEW</span>
              <span className="neon-magenta">PLAYLIST</span>
            </h2>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">Playlist Name *</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g., Late Night Vibes"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Describe your playlist..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition resize-none"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-semibold mb-2">Visibility</label>
                <select
                  value={newPlaylistVisibility}
                  onChange={(e) => setNewPlaylistVisibility(e.target.value as "public" | "private")}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400/50 transition"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black rounded hover:opacity-90 transition font-bold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
