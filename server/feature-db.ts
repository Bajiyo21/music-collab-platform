import { and, desc, eq, sql } from "drizzle-orm";
import {
  collaborationComments,
  collaborationContributors,
  collaborationInvitations,
  collaborationLayers,
  collaborations,
  notifications,
  playlistTracks,
  playlists,
  trackComments,
  trackLikes,
  tracks,
  userFollows,
  userProfiles,
  users,
} from "../drizzle/schema";
import {
  getCollaborationById,
  getDb,
  getTrackById,
  getTrackComments,
  getUserByOpenId,
  getUserProfile,
  getPlaylistById,
  getPlaylistTracks,
} from "./db";
import { buildCollaborationNotificationRows } from "./notification-utils";

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0];
}

export async function updateUserProfile(userId: number, input: {
  bio?: string | null;
  avatar?: string | null;
  website?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  soundcloud?: string | null;
  location?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(userProfiles).set(input).where(eq(userProfiles.userId, userId));
  return getUserProfile(userId);
}

export async function isFollowingUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select({ id: userFollows.id }).from(userFollows).where(and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, followingId))).limit(1);
  return rows.length > 0;
}

export async function followUser(followerId: number, followingId: number) {
  if (followerId === followingId) throw new Error("You cannot follow yourself");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (!(await isFollowingUser(followerId, followingId))) {
    await db.insert(userFollows).values({ followerId, followingId });
    await db.update(userProfiles).set({ followingCount: sql`COALESCE(${userProfiles.followingCount}, 0) + 1` }).where(eq(userProfiles.userId, followerId));
    await db.update(userProfiles).set({ followerCount: sql`COALESCE(${userProfiles.followerCount}, 0) + 1` }).where(eq(userProfiles.userId, followingId));
    const actor = await getUserById(followerId);
    await db.insert(notifications).values({
      recipientId: followingId,
      type: "new_follower",
      relatedUserId: followerId,
      title: "New follower",
      message: `${actor?.name ?? "A musician"} started following you`,
      actionUrl: `/profile/${followerId}`,
    });
  }
  return { following: true };
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (await isFollowingUser(followerId, followingId)) {
    await db.delete(userFollows).where(and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, followingId)));
    await db.update(userProfiles).set({ followingCount: sql`GREATEST(COALESCE(${userProfiles.followingCount}, 0) - 1, 0)` }).where(eq(userProfiles.userId, followerId));
    await db.update(userProfiles).set({ followerCount: sql`GREATEST(COALESCE(${userProfiles.followerCount}, 0) - 1, 0)` }).where(eq(userProfiles.userId, followingId));
  }
  return { following: false };
}

export async function getUserFollowers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, profile: userProfiles })
    .from(userFollows)
    .innerJoin(users, eq(users.id, userFollows.followerId))
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(userFollows.followingId, userId))
    .orderBy(desc(userFollows.createdAt));
}

export async function updateTrackRecord(trackId: number, creatorId: number, input: {
  title?: string;
  description?: string | null;
  visibility?: "public" | "private" | "unlisted";
  license?: "cc0" | "cc-by" | "cc-by-sa" | "cc-by-nd" | "cc-by-nc" | "cc-by-nc-sa" | "cc-by-nc-nd" | "all-rights-reserved";
  genreId?: number | null;
  tags?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const owned = await db.select({ id: tracks.id }).from(tracks).where(and(eq(tracks.id, trackId), eq(tracks.creatorId, creatorId))).limit(1);
  if (!owned[0]) throw new Error("Track not found or not owned by you");
  await db.update(tracks).set(input).where(eq(tracks.id, trackId));
  return getTrackById(trackId);
}

export async function deleteTrackRecord(trackId: number, creatorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const owned = await db.select({ id: tracks.id }).from(tracks).where(and(eq(tracks.id, trackId), eq(tracks.creatorId, creatorId))).limit(1);
  if (!owned[0]) throw new Error("Track not found or not owned by you");

  await db.delete(trackLikes).where(eq(trackLikes.trackId, trackId));
  await db.delete(trackComments).where(eq(trackComments.trackId, trackId));
  await db.delete(playlistTracks).where(eq(playlistTracks.trackId, trackId));
  await db.delete(collaborationLayers).where(eq(collaborationLayers.trackId, trackId));
  await db.delete(tracks).where(eq(tracks.id, trackId));
  return { deleted: true };
}

export async function createPlaylistRecord(input: { creatorId: number; title: string; description?: string; visibility: "public" | "private" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(playlists).values({ creatorId: input.creatorId, title: input.title, description: input.description ?? null, visibility: input.visibility, trackCount: 0 });
  const insertId = Number((result as any).insertId ?? (result as any)[0]?.insertId);
  if (!Number.isFinite(insertId) || insertId <= 0) throw new Error("Playlist was created but its id could not be read");
  return getPlaylistById(insertId);
}

export async function updatePlaylistRecord(playlistId: number, creatorId: number, input: { title?: string; description?: string | null; visibility?: "public" | "private" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(playlists).set(input).where(and(eq(playlists.id, playlistId), eq(playlists.creatorId, creatorId)));
  return getPlaylistById(playlistId);
}

export async function deletePlaylistRecord(playlistId: number, creatorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select({ id: playlists.id }).from(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.creatorId, creatorId))).limit(1);
  if (!existing[0]) throw new Error("Playlist not found or not owned by you");
  await db.delete(playlistTracks).where(eq(playlistTracks.playlistId, playlistId));
  await db.delete(playlists).where(eq(playlists.id, playlistId));
  return { deleted: true };
}

export async function addTrackToPlaylistRecord(playlistId: number, trackId: number, creatorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const playlist = await db.select().from(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.creatorId, creatorId))).limit(1);
  if (!playlist[0]) throw new Error("Playlist not found or not owned by you");
  const existing = await db.select().from(playlistTracks).where(and(eq(playlistTracks.playlistId, playlistId), eq(playlistTracks.trackId, trackId))).limit(1);
  if (existing.length === 0) {
    const count = await db.select({ count: sql<number>`COUNT(*)` }).from(playlistTracks).where(eq(playlistTracks.playlistId, playlistId));
    await db.insert(playlistTracks).values({ playlistId, trackId, order: Number(count[0]?.count ?? 0) });
    await db.update(playlists).set({ trackCount: sql`COALESCE(${playlists.trackCount}, 0) + 1` }).where(eq(playlists.id, playlistId));
  }
  return getPlaylistTracks(playlistId);
}

export async function removeTrackFromPlaylistRecord(playlistId: number, trackId: number, creatorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const playlist = await db.select().from(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.creatorId, creatorId))).limit(1);
  if (!playlist[0]) throw new Error("Playlist not found or not owned by you");
  await db.delete(playlistTracks).where(and(eq(playlistTracks.playlistId, playlistId), eq(playlistTracks.trackId, trackId)));
  await db.update(playlists).set({ trackCount: sql`GREATEST(COALESCE(${playlists.trackCount}, 0) - 1, 0)` }).where(eq(playlists.id, playlistId));
  return getPlaylistTracks(playlistId);
}

export async function markNotificationRead(notificationId: number, recipientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(and(eq(notifications.id, notificationId), eq(notifications.recipientId, recipientId)));
  return { success: true };
}

export async function markAllNotificationsRead(recipientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(and(eq(notifications.recipientId, recipientId), eq(notifications.isRead, false)));
  return { success: true };
}

export async function toggleTrackLike(trackId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const track = await getTrackById(trackId);
  if (!track) throw new Error("Track not found");
  const existing = await db.select().from(trackLikes).where(and(eq(trackLikes.trackId, trackId), eq(trackLikes.userId, userId))).limit(1);
  if (existing.length > 0) {
    await db.delete(trackLikes).where(and(eq(trackLikes.trackId, trackId), eq(trackLikes.userId, userId)));
    await db.update(tracks).set({ likes: sql`GREATEST(COALESCE(${tracks.likes}, 0) - 1, 0)` }).where(eq(tracks.id, trackId));
    return { liked: false };
  }
  await db.insert(trackLikes).values({ trackId, userId });
  await db.update(tracks).set({ likes: sql`COALESCE(${tracks.likes}, 0) + 1` }).where(eq(tracks.id, trackId));
  if (track.creatorId !== userId) {
    const actor = await getUserById(userId);
    await db.insert(notifications).values({ recipientId: track.creatorId, type: "track_like", relatedUserId: userId, relatedTrackId: trackId, title: "Track liked", message: `${actor?.name ?? "A musician"} liked ${track.title}`, actionUrl: `/track/${trackId}` });
  }
  return { liked: true };
}

export async function addTrackComment(trackId: number, userId: number, text: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const track = await getTrackById(trackId);
  if (!track) throw new Error("Track not found");
  const result = await db.insert(trackComments).values({ trackId, userId, text });
  await db.update(tracks).set({ comments: sql`COALESCE(${tracks.comments}, 0) + 1` }).where(eq(tracks.id, trackId));
  if (track.creatorId !== userId) await db.insert(notifications).values({ recipientId: track.creatorId, type: "track_comment", relatedUserId: userId, relatedTrackId: trackId, title: "New track comment", message: text.slice(0, 140), actionUrl: `/track/${trackId}` });
  const insertId = Number((result as any).insertId ?? (result as any)[0]?.insertId);
  return insertId > 0 ? db.select().from(trackComments).where(eq(trackComments.id, insertId)).limit(1) : getTrackComments(trackId);
}

export async function getCollaborationContributors(collaborationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ contributor: collaborationContributors, user: users, profile: userProfiles })
    .from(collaborationContributors)
    .innerJoin(users, eq(users.id, collaborationContributors.userId))
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(collaborationContributors.collaborationId, collaborationId));
}

export async function createCollaborationInvitation(input: { collaborationId: number; invitedUserId: number; invitedByUserId: number; message?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const collaboration = await db.select().from(collaborations).where(and(eq(collaborations.id, input.collaborationId), eq(collaborations.creatorId, input.invitedByUserId))).limit(1);
  if (!collaboration[0]) throw new Error("Only the collaboration owner can invite musicians");
  const existing = await db.select().from(collaborationInvitations).where(and(eq(collaborationInvitations.collaborationId, input.collaborationId), eq(collaborationInvitations.invitedUserId, input.invitedUserId), eq(collaborationInvitations.status, "pending"))).limit(1);
  if (existing[0]) return existing[0];
  const result = await db.insert(collaborationInvitations).values({ collaborationId: input.collaborationId, invitedUserId: input.invitedUserId, invitedByUserId: input.invitedByUserId, message: input.message ?? null, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) });
  await db.insert(notifications).values(buildCollaborationNotificationRows({ actorId: input.invitedByUserId, memberIds: [input.invitedUserId], type: "collab_invite", relatedCollabId: input.collaborationId, title: "Collaboration invitation", message: input.message ?? `You were invited to join ${collaboration[0].title}`, actionUrl: `/collaboration/${input.collaborationId}` }));
  const insertId = Number((result as any).insertId ?? (result as any)[0]?.insertId);
  const invitation = await db.select().from(collaborationInvitations).where(eq(collaborationInvitations.id, insertId)).limit(1);
  return invitation[0];
}

export async function respondToCollaborationInvitation(invitationId: number, userId: number, response: "accepted" | "declined") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const invitation = await db.select().from(collaborationInvitations).where(and(eq(collaborationInvitations.id, invitationId), eq(collaborationInvitations.invitedUserId, userId), eq(collaborationInvitations.status, "pending"))).limit(1);
  if (!invitation[0]) throw new Error("Invitation not found or already answered");
  await db.update(collaborationInvitations).set({ status: response, respondedAt: new Date() }).where(eq(collaborationInvitations.id, invitationId));
  if (response === "accepted") {
    const member = await db.select().from(collaborationContributors).where(and(eq(collaborationContributors.collaborationId, invitation[0].collaborationId), eq(collaborationContributors.userId, userId))).limit(1);
    if (!member[0]) await db.insert(collaborationContributors).values({ collaborationId: invitation[0].collaborationId, userId, role: "contributor" });
    await db.update(collaborations).set({ status: "in_progress" }).where(eq(collaborations.id, invitation[0].collaborationId));
  }
  return { success: true, response };
}

export async function getUserInvitations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ invitation: collaborationInvitations, collaboration: collaborations })
    .from(collaborationInvitations)
    .innerJoin(collaborations, eq(collaborations.id, collaborationInvitations.collaborationId))
    .where(and(eq(collaborationInvitations.invitedUserId, userId), eq(collaborationInvitations.status, "pending")))
    .orderBy(desc(collaborationInvitations.createdAt));
}

export async function addCollaborationLayerRecord(collaborationId: number, trackId: number, addedById: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const member = await db.select().from(collaborationContributors).where(and(eq(collaborationContributors.collaborationId, collaborationId), eq(collaborationContributors.userId, addedById))).limit(1);
  if (!member[0]) throw new Error("Join the collaboration before adding a layer");
  const track = await getTrackById(trackId);
  if (!track || track.creatorId !== addedById) throw new Error("You can only add tracks that you own");
  const existing = await db.select().from(collaborationLayers).where(and(eq(collaborationLayers.collaborationId, collaborationId), eq(collaborationLayers.trackId, trackId))).limit(1);
  if (existing[0]) return existing[0];
  const result = await db.insert(collaborationLayers).values({ collaborationId, trackId, addedById, order: 0 });
  const insertId = Number((result as any).insertId ?? (result as any)[0]?.insertId);
  const row = await db.select().from(collaborationLayers).where(eq(collaborationLayers.id, insertId)).limit(1);
  const collaboration = await db.select({ creatorId: collaborations.creatorId, title: collaborations.title }).from(collaborations).where(eq(collaborations.id, collaborationId)).limit(1);
  const members = await db.select({ userId: collaborationContributors.userId }).from(collaborationContributors).where(eq(collaborationContributors.collaborationId, collaborationId));
  const actor = await getUserById(addedById);
  const notificationRows = buildCollaborationNotificationRows({ actorId: addedById, creatorId: collaboration[0]?.creatorId, memberIds: members.map((member) => member.userId), type: "collab_new_layer", relatedCollabId: collaborationId, relatedTrackId: trackId, title: "New collaboration layer", message: `${actor?.name ?? "A musician"} added ${track.title} to ${collaboration[0]?.title ?? "your project"}`, actionUrl: `/collaboration/${collaborationId}` });
  if (notificationRows.length) await db.insert(notifications).values(notificationRows);
  return row[0];
}

export async function addCollaborationCommentRecord(collaborationId: number, layerId: number | undefined, userId: number, text: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const member = await db.select().from(collaborationContributors).where(and(eq(collaborationContributors.collaborationId, collaborationId), eq(collaborationContributors.userId, userId))).limit(1);
  if (!member[0]) throw new Error("Join the collaboration before commenting");
  const result = await db.insert(collaborationComments).values({ collaborationId, layerId: layerId ?? null, userId, text });
  await db.update(collaborations).set({ comments: sql`COALESCE(${collaborations.comments}, 0) + 1` }).where(eq(collaborations.id, collaborationId));
  const insertId = Number((result as any).insertId ?? (result as any)[0]?.insertId);
  const rows = await db.select().from(collaborationComments).where(eq(collaborationComments.id, insertId)).limit(1);
  const collaboration = await db.select({ creatorId: collaborations.creatorId, title: collaborations.title }).from(collaborations).where(eq(collaborations.id, collaborationId)).limit(1);
  const members = await db.select({ userId: collaborationContributors.userId }).from(collaborationContributors).where(eq(collaborationContributors.collaborationId, collaborationId));
  const actor = await getUserById(userId);
  const notificationRows = buildCollaborationNotificationRows({ actorId: userId, creatorId: collaboration[0]?.creatorId, memberIds: members.map((member) => member.userId), type: "collab_comment", relatedCollabId: collaborationId, title: "New collaboration comment", message: `${actor?.name ?? "A musician"}: ${text.slice(0, 140)}`, actionUrl: `/collaboration/${collaborationId}` });
  if (notificationRows.length) await db.insert(notifications).values(notificationRows);
  return rows[0];
}

export async function getCollaborationComments(collaborationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ comment: collaborationComments, user: users })
    .from(collaborationComments)
    .innerJoin(users, eq(users.id, collaborationComments.userId))
    .where(eq(collaborationComments.collaborationId, collaborationId))
    .orderBy(desc(collaborationComments.createdAt));
}


export async function getPublicCollaborations() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ collaboration: collaborations, creator: users, contributorCount: sql<number>`COUNT(${collaborationContributors.id})`.as("contributorCount") })
    .from(collaborations)
    .innerJoin(users, eq(users.id, collaborations.creatorId))
    .leftJoin(collaborationContributors, eq(collaborationContributors.collaborationId, collaborations.id))
    .where(eq(collaborations.visibility, "public"))
    .groupBy(collaborations.id, users.id)
    .orderBy(desc(collaborations.createdAt));
}

export async function joinCollaborationRecord(collaborationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const collaboration = await db.select().from(collaborations).where(eq(collaborations.id, collaborationId)).limit(1);
  if (!collaboration[0]) throw new Error("Collaboration not found");
  if (collaboration[0].visibility !== "public" && collaboration[0].creatorId !== userId) throw new Error("This collaboration requires an invitation");
  const existing = await db.select().from(collaborationContributors).where(and(eq(collaborationContributors.collaborationId, collaborationId), eq(collaborationContributors.userId, userId))).limit(1);
  if (!existing[0]) await db.insert(collaborationContributors).values({ collaborationId, userId, role: "contributor" });
  await db.update(collaborations).set({ status: "in_progress" }).where(eq(collaborations.id, collaborationId));
  return getCollaborationById(collaborationId);
}


export async function updateCollaborationLayerRecord(layerId: number, userId: number, input: { volume?: number; pan?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const layer = await db.select().from(collaborationLayers).where(eq(collaborationLayers.id, layerId)).limit(1);
  if (!layer[0]) throw new Error("Layer not found");
  const member = await db.select().from(collaborationContributors).where(and(eq(collaborationContributors.collaborationId, layer[0].collaborationId), eq(collaborationContributors.userId, userId))).limit(1);
  if (!member[0]) throw new Error("Join the collaboration before editing a layer");
  await db.update(collaborationLayers).set({ volume: input.volume === undefined ? undefined : String(input.volume), pan: input.pan === undefined ? undefined : String(input.pan) }).where(eq(collaborationLayers.id, layerId));
  const rows = await db.select().from(collaborationLayers).where(eq(collaborationLayers.id, layerId)).limit(1);
  return rows[0];
}

export async function removeCollaborationLayerRecord(layerId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const layer = await db.select().from(collaborationLayers).where(eq(collaborationLayers.id, layerId)).limit(1);
  if (!layer[0]) throw new Error("Layer not found");
  const member = await db.select().from(collaborationContributors).where(and(eq(collaborationContributors.collaborationId, layer[0].collaborationId), eq(collaborationContributors.userId, userId))).limit(1);
  if (!member[0]) throw new Error("Join the collaboration before removing a layer");
  await db.delete(collaborationLayers).where(eq(collaborationLayers.id, layerId));
  return { deleted: true };
}
