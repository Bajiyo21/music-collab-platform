import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  datetime,
  json,
  longtext,
  index,
} from "drizzle-orm/mysql-core";

/**
 * TuneCollab Database Schema
 * Complete data model for collaborative music platform
 */

// ============================================
// USERS & PROFILES
// ============================================

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    openIdIdx: index("openId_idx").on(table.openId),
  })
);

export const userProfiles = mysqlTable(
  "user_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    avatar: varchar("avatar", { length: 512 }),
    bio: text("bio"),
    website: varchar("website", { length: 512 }),
    twitter: varchar("twitter", { length: 255 }),
    instagram: varchar("instagram", { length: 255 }),
    soundcloud: varchar("soundcloud", { length: 255 }),
    experienceLevel: mysqlEnum("experienceLevel", ["beginner", "intermediate", "advanced", "professional"]).default("beginner"),
    location: varchar("location", { length: 255 }),
    followerCount: int("followerCount").default(0),
    followingCount: int("followingCount").default(0),
    trackCount: int("trackCount").default(0),
    collaborationCount: int("collaborationCount").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
  })
);

export const userFollows = mysqlTable(
  "user_follows",
  {
    id: int("id").autoincrement().primaryKey(),
    followerId: int("followerId").notNull(),
    followingId: int("followingId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    followerIdx: index("follower_idx").on(table.followerId),
    followingIdx: index("following_idx").on(table.followingId),
  })
);

export const userInstruments = mysqlTable(
  "user_instruments",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    instrumentId: int("instrumentId").notNull(),
    proficiency: mysqlEnum("proficiency", ["beginner", "intermediate", "advanced"]).default("intermediate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
  })
);

export const userGenres = mysqlTable(
  "user_genres",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    genreId: int("genreId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
  })
);

// ============================================
// INSTRUMENTS & GENRES
// ============================================

export const instruments = mysqlTable("instruments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const genres = mysqlTable("genres", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// TRACKS / TUNES
// ============================================

export const tracks = mysqlTable(
  "tracks",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorId: int("creatorId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: longtext("description"),
    fileKey: varchar("fileKey", { length: 512 }).notNull(),
    fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
    coverArtKey: varchar("coverArtKey", { length: 512 }),
    coverArtUrl: varchar("coverArtUrl", { length: 1024 }),
    duration: int("duration"), // in seconds
    genreId: int("genreId"),
    instrumentId: int("instrumentId"),
    bpm: int("bpm"),
    key: varchar("key", { length: 10 }),
    scale: varchar("scale", { length: 50 }),
    mood: varchar("mood", { length: 100 }),
    tags: json("tags").$type<string[]>().default([]),
    license: mysqlEnum("license", ["cc0", "cc-by", "cc-by-sa", "cc-by-nd", "cc-by-nc", "cc-by-nc-sa", "cc-by-nc-nd", "all-rights-reserved"]).default("all-rights-reserved"),
    visibility: mysqlEnum("visibility", ["public", "private", "unlisted"]).default("public"),
    plays: int("plays").default(0),
    downloads: int("downloads").default(0),
    likes: int("likes").default(0),
    comments: int("comments").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    creatorIdx: index("creator_idx").on(table.creatorId),
    genreIdx: index("genre_idx").on(table.genreId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export const trackLikes = mysqlTable(
  "track_likes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    trackId: int("trackId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userTrackIdx: index("user_track_idx").on(table.userId, table.trackId),
  })
);

export const trackComments = mysqlTable(
  "track_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    trackId: int("trackId").notNull(),
    userId: int("userId").notNull(),
    text: longtext("text").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    trackIdx: index("track_idx").on(table.trackId),
    userIdx: index("user_idx").on(table.userId),
  })
);

export const trackDownloads = mysqlTable(
  "track_downloads",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    trackId: int("trackId").notNull(),
    ipAddress: varchar("ipAddress", { length: 45 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    trackIdx: index("track_idx").on(table.trackId),
  })
);

// ============================================
// COLLABORATIONS
// ============================================

export const collaborations = mysqlTable(
  "collaborations",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorId: int("creatorId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: longtext("description"),
    visibility: mysqlEnum("visibility", ["public", "private", "invited"]).default("private"),
    status: mysqlEnum("status", ["draft", "in_progress", "completed", "published"]).default("draft"),
    likes: int("likes").default(0),
    comments: int("comments").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    creatorIdx: index("creator_idx").on(table.creatorId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export const collaborationContributors = mysqlTable(
  "collaboration_contributors",
  {
    id: int("id").autoincrement().primaryKey(),
    collaborationId: int("collaborationId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["owner", "contributor", "viewer"]).default("contributor"),
    joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  },
  (table) => ({
    collabIdx: index("collab_idx").on(table.collaborationId),
    userIdx: index("user_idx").on(table.userId),
  })
);

export const collaborationLayers = mysqlTable(
  "collaboration_layers",
  {
    id: int("id").autoincrement().primaryKey(),
    collaborationId: int("collaborationId").notNull(),
    trackId: int("trackId").notNull(),
    addedById: int("addedById").notNull(),
    volume: decimal("volume", { precision: 3, scale: 2 }).default("1.00"),
    pan: decimal("pan", { precision: 3, scale: 2 }).default("0.00"),
    startTime: int("startTime").default(0),
    endTime: int("endTime"),
    fadeIn: int("fadeIn").default(0),
    fadeOut: int("fadeOut").default(0),
    order: int("order").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    collabIdx: index("collab_idx").on(table.collaborationId),
    trackIdx: index("track_idx").on(table.trackId),
  })
);

export const collaborationInvitations = mysqlTable(
  "collaboration_invitations",
  {
    id: int("id").autoincrement().primaryKey(),
    collaborationId: int("collaborationId").notNull(),
    invitedUserId: int("invitedUserId").notNull(),
    invitedByUserId: int("invitedByUserId").notNull(),
    status: mysqlEnum("status", ["pending", "accepted", "declined", "expired"]).default("pending"),
    message: text("message"),
    expiresAt: timestamp("expiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    respondedAt: timestamp("respondedAt"),
  },
  (table) => ({
    collabIdx: index("collab_idx").on(table.collaborationId),
    userIdx: index("user_idx").on(table.invitedUserId),
  })
);

export const collaborationComments = mysqlTable(
  "collaboration_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    collaborationId: int("collaborationId").notNull(),
    layerId: int("layerId"),
    userId: int("userId").notNull(),
    text: longtext("text").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    collabIdx: index("collab_idx").on(table.collaborationId),
    userIdx: index("user_idx").on(table.userId),
  })
);

// ============================================
// PLAYLISTS
// ============================================

export const playlists = mysqlTable(
  "playlists",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorId: int("creatorId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: longtext("description"),
    coverArtUrl: varchar("coverArtUrl", { length: 1024 }),
    visibility: mysqlEnum("visibility", ["public", "private"]).default("private"),
    trackCount: int("trackCount").default(0),
    likes: int("likes").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    creatorIdx: index("creator_idx").on(table.creatorId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export const playlistTracks = mysqlTable(
  "playlist_tracks",
  {
    id: int("id").autoincrement().primaryKey(),
    playlistId: int("playlistId").notNull(),
    trackId: int("trackId").notNull(),
    order: int("order").default(0),
    addedAt: timestamp("addedAt").defaultNow().notNull(),
  },
  (table) => ({
    playlistIdx: index("playlist_idx").on(table.playlistId),
    trackIdx: index("track_idx").on(table.trackId),
  })
);

export const playlistLikes = mysqlTable(
  "playlist_likes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    playlistId: int("playlistId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userPlaylistIdx: index("user_playlist_idx").on(table.userId, table.playlistId),
  })
);

// ============================================
// NOTIFICATIONS
// ============================================

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    recipientId: int("recipientId").notNull(),
    type: mysqlEnum("type", [
      "collab_invite",
      "collab_accepted",
      "track_comment",
      "track_like",
      "playlist_like",
      "new_follower",
      "collab_new_layer",
      "collab_comment",
    ]).notNull(),
    relatedUserId: int("relatedUserId"),
    relatedTrackId: int("relatedTrackId"),
    relatedCollabId: int("relatedCollabId"),
    relatedPlaylistId: int("relatedPlaylistId"),
    title: varchar("title", { length: 255 }).notNull(),
    message: longtext("message"),
    isRead: boolean("isRead").default(false),
    actionUrl: varchar("actionUrl", { length: 512 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    readAt: timestamp("readAt"),
  },
  (table) => ({
    recipientIdx: index("recipient_idx").on(table.recipientId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

// ============================================
// TYPE EXPORTS
// ============================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

export type Collaboration = typeof collaborations.$inferSelect;
export type InsertCollaboration = typeof collaborations.$inferInsert;

export type CollaborationLayer = typeof collaborationLayers.$inferSelect;
export type InsertCollaborationLayer = typeof collaborationLayers.$inferInsert;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type Instrument = typeof instruments.$inferSelect;
export type Genre = typeof genres.$inferSelect;
