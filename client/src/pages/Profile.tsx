import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Music, Users, Heart, Share2, Twitter, Instagram, Globe } from "lucide-react";
import { useState } from "react";

/**
 * User Profile Page
 * Display user info, tracks, collaborations, followers
 */

interface UserProfile {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
  experienceLevel: "beginner" | "intermediate" | "advanced" | "professional";
  location?: string;
  followerCount: number;
  followingCount: number;
  trackCount: number;
  collaborationCount: number;
  website?: string;
  twitter?: string;
  instagram?: string;
  soundcloud?: string;
}

interface Track {
  id: number;
  title: string;
  genre?: string;
  plays: number;
  likes: number;
  duration?: number;
}

const MOCK_PROFILE: UserProfile = {
  id: 1,
  name: "SynthWave Master",
  bio: "Creating immersive electronic soundscapes | Collaborator | Producer",
  experienceLevel: "advanced",
  location: "San Francisco, CA",
  followerCount: 2450,
  followingCount: 312,
  trackCount: 47,
  collaborationCount: 12,
  website: "https://synthwavemaster.com",
  twitter: "@synthwavemaster",
  instagram: "@synthwavemaster",
  soundcloud: "synthwavemaster",
};

const MOCK_TRACKS: Track[] = [
  {
    id: 1,
    title: "Neon Dreams",
    genre: "Synthwave",
    plays: 2450,
    likes: 342,
    duration: 245,
  },
  {
    id: 2,
    title: "Digital Horizons",
    genre: "Electronic",
    plays: 1890,
    likes: 267,
    duration: 312,
  },
  {
    id: 3,
    title: "Cyber Nexus",
    genre: "Cyberpunk",
    plays: 2780,
    likes: 456,
    duration: 289,
  },
];

export default function Profile() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"tracks" | "collaborations" | "followers">("tracks");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to view profiles</h1>
          <Button
            onClick={() => navigate("/login")}
            className="bg-cyan-400 text-black px-8 py-3 font-bold rounded hover:bg-cyan-300 transition"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const profile = MOCK_PROFILE;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold neon-cyan">♪</div>
            <span className="text-xl font-bold tracking-wider">TuneCollab</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm hover:text-cyan-400 transition">
              Home
            </a>
            <a href="/explore" className="text-sm hover:text-cyan-400 transition">
              Explore
            </a>
            <a href="/dashboard" className="text-sm hover:text-cyan-400 transition">
              Dashboard
            </a>
          </nav>

          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 font-semibold transition-all duration-200 hover:bg-black/60 hover:border-white/20 text-xs"
          >
            Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container">
          {/* Profile Header */}
          <div className="mb-12 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-lg p-8 border border-white/10">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/30 to-magenta-500/30 border-2 border-cyan-400/50 flex items-center justify-center flex-shrink-0">
                <Music className="w-16 h-16 text-cyan-400" />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                <p className="text-muted-foreground mb-4 max-w-2xl">{profile.bio}</p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1 bg-cyan-400/20 border border-cyan-400/50 rounded text-cyan-400">
                      {profile.experienceLevel.toUpperCase()}
                    </span>
                  </div>
                  {profile.location && (
                    <span className="text-sm text-muted-foreground">📍 {profile.location}</span>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mb-6">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded hover:bg-white/10 transition text-muted-foreground hover:text-cyan-400"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={`https://twitter.com/${profile.twitter.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded hover:bg-white/10 transition text-muted-foreground hover:text-cyan-400"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded hover:bg-white/10 transition text-muted-foreground hover:text-cyan-400"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-6 py-2 font-semibold rounded transition-all ${
                      isFollowing
                        ? "bg-black/40 border border-white/10 text-white hover:bg-black/60"
                        : "bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/30"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button className="px-6 py-2 font-semibold rounded bg-black/40 border border-white/10 hover:bg-black/60 transition-all">
                    Message
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{profile.followerCount}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-magenta-400">{profile.followingCount}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{profile.trackCount}</div>
                <div className="text-xs text-muted-foreground">Tracks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-magenta-400">{profile.collaborationCount}</div>
                <div className="text-xs text-muted-foreground">Collaborations</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 border-b border-white/10">
            <div className="flex gap-8">
              {(["tracks", "collaborations", "followers"] as const).map((tab) => (
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

          {/* Content */}
          {activeTab === "tracks" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_TRACKS.map((track) => (
                <div
                  key={track.id}
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-4 hover:border-cyan-400/50 transition-all group"
                >
                  <div className="aspect-square bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 rounded mb-4 flex items-center justify-center">
                    <Music className="w-12 h-12 text-cyan-400/50" />
                  </div>
                  <h3 className="font-bold mb-2">{track.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{track.genre}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>▶ {track.plays}</span>
                    <span>❤ {track.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "collaborations" && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Collaborations</h3>
              <p className="text-muted-foreground">No active collaborations yet</p>
            </div>
          )}

          {activeTab === "followers" && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Followers</h3>
              <p className="text-muted-foreground">View followers here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
