import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Music, Users, Heart, Plus, TrendingUp, LogOut } from "lucide-react";
import { useState } from "react";

const MOCK_STATS = {
  totalTracks: 12,
  totalCollaborations: 5,
  totalPlaylists: 8,
  totalFollowers: 342,
};

const MOCK_RECENT_TRACKS = [
  { id: 1, title: "Neon Dreams", genre: "Synthwave", plays: 245, likes: 34 },
  { id: 2, title: "Digital Horizons", genre: "Electronic", plays: 189, likes: 26 },
  { id: 3, title: "Cyber Nexus", genre: "Cyberpunk", plays: 278, likes: 45 },
];

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to access dashboard</h1>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16 px-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="text-2xl font-bold neon-cyan">♪</div>
            <span className="text-xl font-bold tracking-wider">TuneCollab</span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate("/")} className="text-sm hover:text-cyan-400 transition">
              Home
            </button>
            <button onClick={() => navigate("/explore")} className="text-sm hover:text-cyan-400 transition">
              Explore
            </button>
            <button className="text-sm text-cyan-400 font-semibold">Dashboard</button>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name || "User"}</span>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-black/40 border border-white/10 rounded hover:bg-black/60 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 rounded-lg p-8 border border-white/10">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground mb-6">Ready to create something amazing?</p>
            <div className="flex gap-4 flex-wrap">
              <button onClick={() => {}} className="flex items-center gap-2 px-6 py-3 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/30 rounded font-semibold transition-all cursor-pointer">
                <Plus className="w-5 h-5" />
                Upload Track
              </button>
              <button onClick={() => {}} className="flex items-center gap-2 px-6 py-3 bg-magenta-400/20 border border-magenta-400/50 text-magenta-400 hover:bg-magenta-400/30 rounded font-semibold transition-all cursor-pointer">
                <Users className="w-5 h-5" />
                New Collaboration
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6 hover:border-cyan-400/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm">Total Tracks</span>
                <Music className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold">{MOCK_STATS.totalTracks}</div>
              <p className="text-xs text-muted-foreground mt-2">+2 this month</p>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6 hover:border-magenta-400/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm">Collaborations</span>
                <Users className="w-5 h-5 text-magenta-400" />
              </div>
              <div className="text-3xl font-bold">{MOCK_STATS.totalCollaborations}</div>
              <p className="text-xs text-muted-foreground mt-2">+1 active</p>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6 hover:border-cyan-400/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm">Playlists</span>
                <Music className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold">{MOCK_STATS.totalPlaylists}</div>
              <p className="text-xs text-muted-foreground mt-2">+1 shared</p>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6 hover:border-magenta-400/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm">Followers</span>
                <Heart className="w-5 h-5 text-magenta-400" />
              </div>
              <div className="text-3xl font-bold">{MOCK_STATS.totalFollowers}</div>
              <p className="text-xs text-muted-foreground mt-2">+12 this week</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 border-b border-white/10">
            <div className="flex gap-8">
              {["overview", "tracks", "collaborations", "playlists"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-2 font-semibold transition-all border-b-2 ${
                    activeTab === tab
                      ? "border-cyan-400 text-cyan-400"
                      : "border-transparent text-muted-foreground hover:text-white"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Tracks */}
              <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 rounded p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Recent Tracks
                  </h2>
                </div>

                <div className="space-y-4">
                  {MOCK_RECENT_TRACKS.map((track) => (
                    <div key={track.id} className="flex items-center justify-between p-4 bg-black/20 rounded hover:bg-black/40 transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 flex items-center justify-center flex-shrink-0">
                          <Music className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{track.title}</h3>
                          <p className="text-xs text-muted-foreground">{track.genre}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>▶ {track.plays}</span>
                        <span>❤ {track.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6 h-fit">
                <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => {}} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/30 rounded font-semibold transition-all cursor-pointer">
                    <Plus className="w-4 h-4" />
                    New Track
                  </button>
                  <button onClick={() => {}} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-magenta-400/20 border border-magenta-400/50 text-magenta-400 hover:bg-magenta-400/30 rounded font-semibold transition-all cursor-pointer">
                    <Users className="w-4 h-4" />
                    New Collab
                  </button>
                  <button onClick={() => {}} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black/40 border border-white/10 hover:bg-black/60 rounded font-semibold transition-all cursor-pointer">
                    <Music className="w-4 h-4" />
                    New Playlist
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tracks" && (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6">
              <h2 className="text-xl font-bold mb-6">Your Tracks ({MOCK_STATS.totalTracks})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_RECENT_TRACKS.map((track) => (
                  <div key={track.id} className="bg-black/20 rounded p-4 hover:border-cyan-400/50 border border-white/10 transition-all">
                    <div className="aspect-square bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 rounded mb-4 flex items-center justify-center">
                      <Music className="w-12 h-12 text-cyan-400/50" />
                    </div>
                    <h3 className="font-bold mb-2">{track.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{track.genre}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>▶ {track.plays}</span>
                      <span>❤ {track.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "collaborations" && (
            <div className="text-center py-12 bg-black/40 backdrop-blur-md border border-white/10 rounded p-6">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Active Collaborations</h3>
              <p className="text-muted-foreground mb-6">You have {MOCK_STATS.totalCollaborations} active collaborations</p>
              <button onClick={() => {}} className="flex items-center gap-2 px-6 py-3 bg-magenta-400/20 border border-magenta-400/50 text-magenta-400 hover:bg-magenta-400/30 rounded font-semibold transition-all mx-auto cursor-pointer">
                <Plus className="w-4 h-4" />
                Start New Collaboration
              </button>
            </div>
          )}

          {activeTab === "playlists" && (
            <div className="text-center py-12 bg-black/40 backdrop-blur-md border border-white/10 rounded p-6">
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Your Playlists</h3>
              <p className="text-muted-foreground mb-6">You have {MOCK_STATS.totalPlaylists} playlists</p>
              <button onClick={() => {}} className="flex items-center gap-2 px-6 py-3 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/30 rounded font-semibold transition-all mx-auto cursor-pointer">
                <Plus className="w-4 h-4" />
                Create Playlist
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
