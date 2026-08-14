import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bell, Heart, Loader2, LogOut, Music, Plus, TrendingUp, Users, Settings2, Sparkles } from "lucide-react";
import { TrackManageDialog } from "@/components/TrackManageDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

type DashboardTrack = {
  id: number;
  title: string;
  description: string | null;
  visibility: "public" | "private" | "unlisted" | null;
  genreId: number | null;
  tags: unknown;
};

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "tracks" | "collaborations" | "playlists" | "favorites">("overview");
  const profileQuery = trpc.users.myProfile.useQuery(undefined, { enabled: isAuthenticated });
  const tracksQuery = trpc.tracks.myTracks.useQuery(undefined, { enabled: isAuthenticated });
  const favoritesQuery = trpc.tracks.favorites.useQuery(undefined, { enabled: isAuthenticated });
  const [editingTrack, setEditingTrack] = useState<DashboardTrack | null>(null);
  const collabsQuery = trpc.collaborations.mine.useQuery(undefined, { enabled: isAuthenticated });
  const playlistsQuery = trpc.playlists.list.useQuery(undefined, { enabled: isAuthenticated });
  const unreadQuery = trpc.notifications.unreadCount.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div>
          <h1 className="mb-4 text-3xl font-bold">Sign in to access your dashboard</h1>
          <button onClick={() => navigate("/")} className="rounded bg-cyan-400 px-6 py-3 font-bold text-black">
            Go home
          </button>
        </div>
      </div>
    );
  }

  if (profileQuery.isLoading || tracksQuery.isLoading || collabsQuery.isLoading || playlistsQuery.isLoading || favoritesQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-cyan-300">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const tracks = tracksQuery.data ?? [];
  const collabs = collabsQuery.data ?? [];
  const playlists = playlistsQuery.data ?? [];
  const favorites = favoritesQuery.data ?? [];
  const followers = Number(profileQuery.data?.profile?.followerCount ?? 0);
  const displayName = profileQuery.data?.user?.name ?? user?.name ?? "Musician";
  const tabs = ["overview", "tracks", "collaborations", "playlists", "favorites"] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="container flex min-h-16 items-center justify-between gap-3 px-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-300 hover:text-cyan-300">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <span className="font-bold tracking-wider">
            <span className="neon-cyan">TUNE</span>
            <span className="text-white">×</span>
            <span className="neon-magenta">COLLAB</span>
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => user?.id && navigate(`/profile/${user.id}`)} className="rounded border border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-cyan-300">
              Profile
            </button>
            <button onClick={() => logout()} className="rounded border border-white/10 p-2 text-gray-400 hover:text-red-300" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl px-4 pb-16 pt-24">
        <section className="mb-8 rounded-lg border border-white/10 bg-gradient-to-r from-cyan-400/10 to-fuchsia-500/10 p-5 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-300">Creator console</p>
              <h1 className="break-words text-3xl font-bold sm:text-4xl">Welcome back, {displayName}</h1>
              <p className="mt-2 text-gray-400">Manage your tracks, projects, playlists, and community activity.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/upload")} className="flex items-center gap-2 rounded bg-cyan-400 px-4 py-3 font-bold text-black">
                <Plus size={18} /> Upload track
              </button>
              <button onClick={() => navigate("/collaborate")} className="flex items-center gap-2 rounded border border-fuchsia-400/40 px-4 py-3 text-fuchsia-300">
                <Users size={18} /> Collaborate
              </button>
              <button onClick={() => navigate("/ai-studio")} className="flex items-center gap-2 rounded border border-cyan-400/40 px-4 py-3 text-cyan-300">
                <Sparkles size={18} /> AI Studio
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Tracks" value={tracks.length} icon={<Music size={18} />} color="text-cyan-300" />
          <Stat label="Projects" value={collabs.length} icon={<Users size={18} />} color="text-fuchsia-300" />
          <Stat label="Playlists" value={playlists.length} icon={<Music size={18} />} color="text-cyan-300" />
          <Stat label="Followers" value={followers} icon={<Heart size={18} />} color="text-fuchsia-300" />
        </section>

        <div className="mb-8 flex flex-col gap-3 border-b border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-5 overflow-x-auto pb-px">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab ? "border-cyan-400 text-cyan-300" : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={() => navigate("/notifications")} className="relative self-end rounded p-2 text-gray-400 hover:text-cyan-300 sm:self-auto" aria-label="Notifications">
            <Bell size={18} />
            {Number(unreadQuery.data?.count ?? 0) > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-fuchsia-400 px-1.5 text-[10px] text-black">
                {unreadQuery.data?.count}
              </span>
            )}
          </button>
        </div>

        <div className="transition-all duration-300 ease-out">
          {activeTab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
              <section className="rounded-lg border border-white/10 bg-black/30 p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <TrendingUp size={19} className="text-cyan-300" /> Recent tracks
                  </h2>
                  <button onClick={() => setActiveTab("tracks")} className="text-sm text-cyan-300 hover:underline">
                    View all
                  </button>
                </div>
                {tracks.length ? (
                  <div className="space-y-3">
                    {tracks.slice(0, 5).map((track) => (
                      <div key={track.id} className="flex items-center gap-3 rounded border border-white/10 bg-white/5 p-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-gradient-to-br from-cyan-400/20 to-fuchsia-400/20">
                          <Music size={20} className="text-cyan-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold">{track.title}</h3>
                          <p className="text-xs text-gray-500">{Number(track.plays ?? 0).toLocaleString()} plays · {Number(track.likes ?? 0)} likes</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => track.visibility === "public" ? navigate(`/track/${track.id}`) : setEditingTrack(track)}
                            className="rounded border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-cyan-300"
                          >
                            {track.visibility === "public" ? "Open" : "Manage"}
                          </button>
                          <button
                            onClick={() => setEditingTrack(track)}
                            aria-label={`Manage ${track.title}`}
                            className="rounded border border-white/10 p-2 text-gray-400 hover:border-cyan-400/40 hover:text-cyan-300"
                          >
                            <Settings2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty text="You have not uploaded a track yet." action="Upload your first track" onClick={() => navigate("/upload")} />
                )}
              </section>

              <aside className="rounded-lg border border-white/10 bg-black/30 p-5 sm:p-6">
                <h2 className="mb-5 text-lg font-bold">Quick actions</h2>
                <div className="space-y-3">
                  <Action label="Upload new track" onClick={() => navigate("/upload")} icon={<Plus size={16} />} />
                  <Action label="Start collaboration" onClick={() => navigate("/collaborate")} icon={<Users size={16} />} />
                  <Action label="Manage playlists" onClick={() => navigate("/playlists")} icon={<Music size={16} />} />
                  <Action label="Edit profile" onClick={() => user?.id && navigate(`/profile/${user.id}`)} icon={<Heart size={16} />} />
                </div>
              </aside>
            </div>
          )}

          {activeTab === "tracks" && (
            <Collection title={`Your tracks (${tracks.length})`} empty="Upload a track to start building your catalog." action="Upload track" onAction={() => navigate("/upload")}>
              {tracks.map((track) => (
                <div key={track.id} className="rounded border border-white/10 bg-black/30 p-4">
                  <div className="mb-4 flex aspect-[1.7] items-center justify-center rounded bg-gradient-to-br from-cyan-400/15 to-fuchsia-400/15">
                    <Music className="text-cyan-300/60" size={44} />
                  </div>
                  <h3 className="truncate font-bold">{track.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{track.visibility} · {Number(track.plays ?? 0)} plays</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => track.visibility === "public" ? navigate(`/track/${track.id}`) : setEditingTrack(track)}
                      className="min-w-0 flex-1 rounded border border-cyan-400/30 py-2 text-sm text-cyan-300"
                    >
                      {track.visibility === "public" ? "Open track" : "Manage upload"}
                    </button>
                    <button onClick={() => setEditingTrack(track)} aria-label={`Manage ${track.title}`} className="rounded border border-cyan-400/30 p-2 text-cyan-300">
                      <Settings2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </Collection>
          )}

          {activeTab === "collaborations" && (
            <Collection title={`Your collaborations (${collabs.length})`} empty="Start a project and invite other musicians." action="New collaboration" onAction={() => navigate("/collaborate")}>
              {collabs.map((collab) => (
                <div key={collab.id} className="rounded border border-white/10 bg-black/30 p-4">
                  <div className="mb-4 flex aspect-[1.7] items-center justify-center rounded bg-gradient-to-br from-fuchsia-400/15 to-cyan-400/15">
                    <Users className="text-fuchsia-300/60" size={44} />
                  </div>
                  <h3 className="truncate font-bold">{collab.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{collab.status} · {new Date(collab.createdAt).toLocaleDateString()}</p>
                  <button onClick={() => navigate(`/collaboration/${collab.id}`)} className="mt-4 w-full rounded border border-fuchsia-400/30 py-2 text-sm text-fuchsia-300">
                    Open room
                  </button>
                </div>
              ))}
            </Collection>
          )}

          {activeTab === "playlists" && (
            <Collection title={`Your playlists (${playlists.length})`} empty="Create a playlist for your next listening session." action="Open playlists" onAction={() => navigate("/playlists")}>
              {playlists.map((playlist) => (
                <div key={playlist.id} className="rounded border border-white/10 bg-black/30 p-4">
                  <div className="mb-4 flex aspect-[1.7] items-center justify-center rounded bg-gradient-to-br from-cyan-400/15 to-fuchsia-400/15">
                    <Music className="text-cyan-300/60" size={44} />
                  </div>
                  <h3 className="truncate font-bold">{playlist.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{playlist.visibility} · {playlist.trackCount ?? 0} tracks</p>
                  <button onClick={() => navigate(`/playlist/${playlist.id}`)} className="mt-4 w-full rounded border border-cyan-400/30 py-2 text-sm text-cyan-300">
                    Open playlist
                  </button>
                </div>
              ))}
            </Collection>
          )}

          {activeTab === "favorites" && (
            <Collection title={`Favorite tracks (${favorites.length})`} empty="You haven't favorited any tracks yet. Explore tracks and tap the heart icon!" action="Explore tracks" onAction={() => navigate("/explore")}>
              {favorites.map((item) => (
                <div key={item.track.id} className="rounded border border-white/10 bg-black/30 p-4">
                  <div className="mb-4 flex aspect-[1.7] items-center justify-center rounded bg-gradient-to-br from-fuchsia-400/15 to-cyan-400/15">
                    <Heart className="text-fuchsia-300/60 fill-fuchsia-300/30" size={44} />
                  </div>
                  <h3 className="truncate font-bold">{item.track.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{Number(item.track.plays ?? 0)} plays · {Number(item.track.likes ?? 0)} likes</p>
                  <button onClick={() => navigate(`/track/${item.track.id}`)} className="mt-4 w-full rounded border border-cyan-400/30 py-2 text-sm text-cyan-300">
                    Listen now
                  </button>
                </div>
              ))}
            </Collection>
          )}
        </div>
      </main>

      {editingTrack && (
        <TrackManageDialog
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded border border-white/10 bg-black/30 p-4">
      <div className="mb-2 flex items-center justify-between text-gray-400">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Action({ label, onClick, icon }: { label: string; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between rounded border border-white/10 bg-white/5 p-3 text-sm text-gray-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-300">
      <span className="flex items-center gap-2">{icon} {label}</span>
      <span>→</span>
    </button>
  );
}

function Collection({ title, empty, action, onAction, children }: { title: string; empty: string; action: string; onAction: () => void; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {React.Children.count(children) > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      ) : (
        <Empty text={empty} action={action} onClick={onAction} />
      )}
    </section>
  );
}

function Empty({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 bg-black/20 p-8 text-center">
      <p className="text-gray-400">{text}</p>
      <button onClick={onClick} className="mt-4 rounded bg-cyan-400 px-4 py-2 font-bold text-black">
        {action}
      </button>
    </div>
  );
}
