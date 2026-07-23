import { eq, and, desc, like, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  userProfiles,
  tracks,
  collaborations,
  playlists,
  notifications,
  genres,
  instruments,
  trackLikes,
  trackComments,
  playlistTracks,
  collaborationContributors,
  collaborationLayers,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER OPERATIONS
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // Create user profile if it doesn't exist
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, (await getUserByOpenId(user.openId))?.id || 0))
      .limit(1);

    if (existingProfile.length === 0) {
      const newUser = await getUserByOpenId(user.openId);
      if (newUser) {
        await db.insert(userProfiles).values({
          userId: newUser.id,
          experienceLevel: "beginner",
        });
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// TRACK OPERATIONS
// ============================================

export async function getTrendingTracks(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tracks)
    .where(eq(tracks.visibility, "public"))
    .orderBy(desc(tracks.plays), desc(tracks.likes), desc(tracks.createdAt))
    .limit(limit);
}

export async function searchTracks(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tracks)
    .where(
      and(
        eq(tracks.visibility, "public"),
        like(tracks.title, `%${query}%`)
      )
    )
    .orderBy(desc(tracks.createdAt))
    .limit(limit);
}

export async function getUserTracks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tracks)
    .where(eq(tracks.creatorId, userId))
    .orderBy(desc(tracks.createdAt));
}

export async function getTrackById(trackId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(tracks)
    .where(eq(tracks.id, trackId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getTrackComments(trackId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(trackComments)
    .where(eq(trackComments.trackId, trackId))
    .orderBy(desc(trackComments.createdAt));
}

// ============================================
// COLLABORATION OPERATIONS
// ============================================

export async function getUserCollaborations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.creatorId, userId))
    .orderBy(desc(collaborations.createdAt));
}

export async function getCollaborationById(collabId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.id, collabId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCollaborationLayers(collabId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(collaborationLayers)
    .where(eq(collaborationLayers.collaborationId, collabId))
    .orderBy(sql`\`order\``);
}

// ============================================
// PLAYLIST OPERATIONS
// ============================================

export async function getUserPlaylists(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(playlists)
    .where(eq(playlists.creatorId, userId))
    .orderBy(desc(playlists.createdAt));
}

export async function getPlaylistById(playlistId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, playlistId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getPlaylistTracks(playlistId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(playlistTracks)
    .where(eq(playlistTracks.playlistId, playlistId))
    .orderBy(sql`\`order\``);
}

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

export async function getUserNotifications(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(and(eq(notifications.recipientId, userId), eq(notifications.isRead, false)));

  return result[0]?.count || 0;
}

// ============================================
// REFERENCE DATA
// ============================================

export async function getAllGenres() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(genres).orderBy(genres.name);
}

export async function getAllInstruments() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(instruments).orderBy(instruments.name);
}
