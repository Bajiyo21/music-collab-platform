import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Globe, Instagram, Loader2, Music, Pencil, Save, Twitter, Users } from "lucide-react";

export default function Profile() {
  const { isAuthenticated, user: authUser } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ userId: string }>();
  const userId = Number(params.userId);
  const isValidUserId = Number.isInteger(userId) && userId > 0;
  const [activeTab, setActiveTab] = useState<"tracks" | "collaborations" | "followers">("tracks");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: "", website: "", twitter: "", instagram: "", soundcloud: "", location: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const profileQuery = trpc.users.profile.useQuery({ userId }, { enabled: isValidUserId });
  const tracksQuery = trpc.tracks.userTracks.useQuery({ userId }, { enabled: isValidUserId });
  const followingQuery = trpc.users.following.useQuery({ userId }, { enabled: isAuthenticated && isValidUserId && authUser?.id !== userId });
  const utils = trpc.useUtils();
  const followMutation = trpc.users.follow.useMutation({ onSuccess: () => { utils.users.following.invalidate({ userId }); utils.users.profile.invalidate({ userId }); toast.success("Following musician"); } });
  const unfollowMutation = trpc.users.unfollow.useMutation({ onSuccess: () => { utils.users.following.invalidate({ userId }); utils.users.profile.invalidate({ userId }); toast.success("Unfollowed musician"); } });
  const updateMutation = trpc.users.updateProfile.useMutation({ onSuccess: () => { utils.users.profile.invalidate({ userId }); utils.users.myProfile.invalidate(); setEditing(false); setAvatarFile(null); setAvatarPreview(null); toast.success("Profile updated"); } });

  const record = profileQuery.data;
  const profile = record?.profile;
  const displayName = record?.user?.name ?? "TuneCollab musician";
  const isOwner = authUser?.id === userId;
  const needsOnboarding = Boolean(isOwner && profile && !profile.avatar && !profile.bio && !profile.website && !profile.twitter && !profile.instagram && !profile.soundcloud && !profile.location);
  const tracks = tracksQuery.data ?? [];

  useEffect(() => {
    if (profile) setForm({ bio: profile.bio ?? "", website: profile.website ?? "", twitter: profile.twitter ?? "", instagram: profile.instagram ?? "", soundcloud: profile.soundcloud ?? "", location: profile.location ?? "" });
  }, [profile]);

  useEffect(() => {
    if (needsOnboarding) setEditing(true);
  }, [needsOnboarding]);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const stats = useMemo(() => ({
    followers: profile?.followerCount ?? 0,
    following: profile?.followingCount ?? 0,
    tracks: profile?.trackCount ?? tracks.length,
    collaborations: profile?.collaborationCount ?? 0,
  }), [profile, tracks.length]);

  if (!isAuthenticated && !isValidUserId) {
    return <Gate navigate={navigate} />;
  }

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      let avatar = profile?.avatar ?? null;
      if (avatarFile) {
        setAvatarUploading(true);
        const body = new FormData();
        body.append("avatar", avatarFile);
        const response = await fetch("/api/upload-avatar", { method: "POST", body, credentials: "include" });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error ?? "Profile image upload failed");
        avatar = payload.avatar?.url ?? avatar;
      }
      await updateMutation.mutateAsync({
        avatar,
        bio: form.bio || null,
        website: form.website || null,
        twitter: form.twitter || null,
        instagram: form.instagram || null,
        soundcloud: form.soundcloud || null,
        location: form.location || null,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile update failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-300 transition hover:text-cyan-400" aria-label="Back to dashboard">
            <ArrowLeft size={18} /><span className="hidden sm:inline text-sm">Back</span>
          </button>
          <span className="text-lg font-bold tracking-wider"><span className="neon-cyan">TUNE</span><span className="text-white">×</span><span className="neon-magenta">COLLAB</span></span>
          <Button onClick={() => navigate("/collaborate")} variant="outline" className="border-white/15 bg-black/40 text-xs">Collaborate</Button>
        </div>
      </header>

      <main className="container max-w-6xl px-4 pb-16 pt-24">
        {profileQuery.isLoading ? <LoadingState /> : profileQuery.isError || !record ? <EmptyState text="This profile is not available." /> : (
          <>
            <section className="rounded-lg border border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent p-6 sm:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-400/50 bg-gradient-to-br from-cyan-500/30 to-magenta-500/30">
                  {profile!.avatar ? <img src={profile!.avatar} alt={`${displayName} avatar`} className="h-full w-full object-cover" /> : <Music className="h-14 w-14 text-cyan-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-400">Musician profile</p>
                      <h1 className="break-words text-3xl font-bold sm:text-4xl">{displayName}</h1>
                    </div>
                    {isOwner ? <Button onClick={() => setEditing((value) => !value)} variant="outline" className="border-cyan-400/40 bg-black/30 text-cyan-300"><Pencil size={16} /> {editing ? "Close editor" : "Edit profile"}</Button> : isAuthenticated ? <Button onClick={() => followingQuery.data?.following ? unfollowMutation.mutate({ userId }) : followMutation.mutate({ userId })} disabled={followMutation.isPending || unfollowMutation.isPending} className={followingQuery.data?.following ? "border border-white/15 bg-black/40" : "bg-cyan-400 text-black hover:bg-cyan-300"}>{followMutation.isPending || unfollowMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : followingQuery.data?.following ? "Following" : "Follow"}</Button> : null}
                  </div>
                  <p className="mt-3 max-w-2xl whitespace-pre-wrap text-gray-400">{profile!.bio || "This musician has not added a bio yet."}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    {profile!.experienceLevel && <span className="rounded border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-cyan-300">{profile!.experienceLevel.toUpperCase()}</span>}
                    {profile!.location && <span>{profile!.location}</span>}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {profile!.website && <a className="text-gray-400 transition hover:text-cyan-300" href={profile!.website} target="_blank" rel="noreferrer" aria-label="Website"><Globe size={18} /></a>}
                    {profile!.twitter && <a className="text-gray-400 transition hover:text-cyan-300" href={profile!.twitter.startsWith("http") ? profile!.twitter : `https://twitter.com/${profile!.twitter.replace("@", "")}`} target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={18} /></a>}
                    {profile!.instagram && <a className="text-gray-400 transition hover:text-cyan-300" href={profile!.instagram.startsWith("http") ? profile!.instagram : `https://instagram.com/${profile!.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>}
                    {profile!.soundcloud && <a className="text-gray-400 transition hover:text-cyan-300" href={profile!.soundcloud.startsWith("http") ? profile!.soundcloud : `https://soundcloud.com/${profile!.soundcloud}`} target="_blank" rel="noreferrer" aria-label="SoundCloud"><Music size={18} /></a>}
                  </div>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
                <Stat value={stats.followers} label="Followers" />
                <Stat value={stats.following} label="Following" accent="magenta" />
                <Stat value={stats.tracks} label="Tracks" />
                <Stat value={stats.collaborations} label="Collaborations" accent="magenta" />
              </div>
            </section>

            {needsOnboarding && !editing && <section className="mt-6 flex flex-col gap-4 rounded-lg border border-fuchsia-400/30 bg-fuchsia-400/10 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300">First-run setup</p><h2 className="mt-1 text-lg font-bold">Complete your musician profile</h2><p className="mt-1 text-sm text-gray-400">Add an avatar, short bio, and links so collaborators know what you bring to the session.</p></div><Button onClick={() => setEditing(true)} className="shrink-0 bg-fuchsia-400 text-black hover:bg-fuchsia-300"><Pencil size={16} /> Start setup</Button></section>}

            {editing && isOwner && <form onSubmit={saveProfile} className="mt-6 grid gap-4 rounded-lg border border-cyan-400/30 bg-black/30 p-6 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Avatar image</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0] ?? null; setAvatarFile(file); setAvatarPreview(file ? URL.createObjectURL(file) : null); }} className="block w-full rounded border border-white/10 bg-white/5 p-3 text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:font-semibold file:text-black" /><p className="mt-2 text-xs text-gray-500">JPG, PNG, or WebP up to 5MB.</p>{avatarPreview && <img src={avatarPreview} alt="Selected avatar preview" className="mt-3 h-20 w-20 rounded-full border border-cyan-400/40 object-cover" />}</label>
              <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Bio</span><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={5000} rows={4} className="w-full rounded border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-cyan-400/60" /></label>
              <Field label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} />
              <Field label="Website URL" value={form.website} onChange={(value) => setForm({ ...form, website: value })} placeholder="https://" />
              <Field label="Twitter" value={form.twitter} onChange={(value) => setForm({ ...form, twitter: value })} />
              <Field label="Instagram" value={form.instagram} onChange={(value) => setForm({ ...form, instagram: value })} />
              <Field label="SoundCloud" value={form.soundcloud} onChange={(value) => setForm({ ...form, soundcloud: value })} />
              <div className="flex items-end sm:col-span-2"><Button type="submit" disabled={updateMutation.isPending || avatarUploading} className="bg-cyan-400 text-black hover:bg-cyan-300"><Save size={16} /> {avatarUploading ? "Uploading image..." : updateMutation.isPending ? "Saving..." : "Save profile"}</Button></div>
            </form>}

            <div className="mt-10 border-b border-white/10"><div className="flex gap-5 overflow-x-auto">{(["tracks", "collaborations", "followers"] as const).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-2 pb-3 text-sm font-semibold transition ${activeTab === tab ? "border-cyan-400 text-cyan-300" : "border-transparent text-gray-500 hover:text-white"}`}>{tab[0].toUpperCase() + tab.slice(1)}</button>)}</div></div>
            {activeTab === "tracks" && <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{tracks.length ? tracks.map((track) => <article key={track.id} className="rounded border border-white/10 bg-black/30 p-4 transition hover:border-cyan-400/40"><div className="mb-4 flex aspect-square items-center justify-center rounded bg-gradient-to-br from-cyan-500/15 to-magenta-500/15"><Music className="h-12 w-12 text-cyan-400/50" /></div><h2 className="font-bold">{track.title}</h2><p className="mt-1 text-xs text-gray-500">{track.genreId ? `Genre #${track.genreId}` : "Uncategorized"}</p><div className="mt-4 flex justify-between text-xs text-gray-400"><span>{track.plays ?? 0} plays</span><span>{track.likes ?? 0} likes</span></div></article>) : <EmptyState text="No tracks uploaded yet." />}</section>}
            {activeTab === "collaborations" && <EmptyState text="No public collaborations to display yet." icon={<Users className="mx-auto mb-3 h-12 w-12 text-gray-600" />} />}
            {activeTab === "followers" && <Followers userId={userId} />}
          </>
        )}
      </main>
    </div>
  );
}

function Followers({ userId }: { userId: number }) {
  const followersQuery = trpc.users.followers.useQuery({ userId });
  if (followersQuery.isLoading) return <LoadingState />;
  if (!followersQuery.data?.length) return <EmptyState text="No followers to display yet." icon={<Users className="mx-auto mb-3 h-12 w-12 text-gray-600" />} />;
  return <section className="mt-6 grid gap-3 sm:grid-cols-2">{followersQuery.data.map((follower) => <div key={follower.id} className="flex items-center gap-3 rounded border border-white/10 bg-black/30 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300"><Music size={18} /></div><span className="font-semibold">{follower.name ?? "TuneCollab musician"}</span></div>)}</section>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label><span className="mb-2 block text-sm font-semibold">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-cyan-400/60" /></label>;
}

function Stat({ value, label, accent = "cyan" }: { value: number; label: string; accent?: "cyan" | "magenta" }) {
  return <div className="text-center"><div className={`text-2xl font-bold ${accent === "cyan" ? "text-cyan-300" : "text-fuchsia-300"}`}>{value}</div><div className="text-xs text-gray-500">{label}</div></div>;
}

function LoadingState() { return <div className="flex min-h-64 items-center justify-center text-cyan-300"><Loader2 className="animate-spin" /></div>; }
function EmptyState({ text, icon }: { text: string; icon?: React.ReactNode }) { return <div className="rounded border border-white/10 bg-black/20 px-6 py-12 text-center text-gray-400">{icon}{text}</div>; }
function Gate({ navigate }: { navigate: (path: string) => void }) { return <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center"><div><h1 className="mb-3 text-2xl font-bold">Profile unavailable</h1><p className="mb-6 text-gray-400">Sign in to view this musician profile.</p><Button onClick={() => navigate("/")} className="bg-cyan-400 text-black">Go home</Button></div></div>; }
