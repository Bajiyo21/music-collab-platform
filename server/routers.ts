import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getTrendingTracks,
  searchTracks,
  getUserTracks,
  getTrackById,
  getTrackComments,
  getUserCollaborations,
  getCollaborationById,
  getCollaborationLayers,
  getUserPlaylists,
  getPlaylistById,
  getPlaylistTracks,
  getUserNotifications,
  getUnreadNotificationCount,
  getAllGenres,
  getAllInstruments,
  getUserProfile,
  findTrackByHash,
  createCollaborationRecord,
} from "./db";
import { z } from "zod";
import {
  addCollaborationCommentRecord,
  addCollaborationLayerRecord,
  addTrackComment,
  addTrackToPlaylistRecord,
  createCollaborationInvitation,
  createPlaylistRecord,
  followUser,
  getCollaborationComments,
  getCollaborationContributors,
  getUserById,
  getUserFollowers,
  getPublicCollaborations,
  joinCollaborationRecord,
  getUserInvitations,
  isFollowingUser,
  markAllNotificationsRead,
  markNotificationRead,
  removeTrackFromPlaylistRecord,
  respondToCollaborationInvitation,
  toggleTrackLike,
  unfollowUser,
  updatePlaylistRecord,
  updateUserProfile,
  deletePlaylistRecord,
  updateCollaborationLayerRecord,
  removeCollaborationLayerRecord,
  updateTrackRecord,
  deleteTrackRecord,
} from "./feature-db";

export const appRouter = router({
  system: systemRouter,

  // ============================================
  // AUTH
  // ============================================
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================
  // TRACKS
  // ============================================
  tracks: router({
    trending: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await getTrendingTracks(input.limit);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string().trim().min(1), limit: z.number().int().min(1).max(50).default(20), offset: z.number().int().min(0).default(0) }))
      .query(async ({ input }) => {
        return await searchTracks(input.query, input.limit, input.offset);
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const track = await getTrackById(input.id);
        return track?.visibility === "public" ? track : undefined;
      }),

    userTracks: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const tracks = await getUserTracks(input.userId);
        return tracks.filter((track) => track.visibility === "public");
      }),

    myTracks: protectedProcedure.query(async ({ ctx }) => {
      return await getUserTracks(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        trackId: z.number(),
        title: z.string().trim().min(1).max(255).optional(),
        description: z.string().max(10000).nullable().optional(),
        visibility: z.enum(["public", "private", "unlisted"]).optional(),
        license: z.enum(["cc0", "cc-by", "cc-by-sa", "cc-by-nd", "cc-by-nc", "cc-by-nc-sa", "cc-by-nc-nd", "all-rights-reserved"]).optional(),
        genreId: z.number().nullable().optional(),
        tags: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
      }))
      .mutation(async ({ input, ctx }) => updateTrackRecord(input.trackId, ctx.user.id, {
        title: input.title,
        description: input.description,
        visibility: input.visibility,
        license: input.license,
        genreId: input.genreId,
        tags: input.tags,
      })),

    delete: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .mutation(async ({ input, ctx }) => deleteTrackRecord(input.trackId, ctx.user.id)),

    comments: publicProcedure
      .input(z.object({ trackId: z.number() }))
      .query(async ({ input }) => {
        return await getTrackComments(input.trackId);
      }),

    like: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .mutation(async ({ input, ctx }) => toggleTrackLike(input.trackId, ctx.user.id)),

    addComment: protectedProcedure
      .input(z.object({ trackId: z.number(), text: z.string().trim().min(1).max(5000) }))
      .mutation(async ({ input, ctx }) => addTrackComment(input.trackId, ctx.user.id, input.text)),

    duplicateByHash: protectedProcedure
      .input(z.object({ fileHash: z.string().length(64) }))
      .query(async ({ input }) => {
        const existing = await findTrackByHash(input.fileHash);
        return existing
          ? { isDuplicate: true, trackId: existing.id, title: existing.title }
          : { isDuplicate: false };
      }),
  }),

  // ============================================
  // COLLABORATIONS
  // ============================================
  collaborations: router({
    list: publicProcedure.query(async () => getPublicCollaborations()),

    mine: protectedProcedure.query(async ({ ctx }) => getUserCollaborations(ctx.user.id)),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCollaborationById(input.id);
      }),

    layers: publicProcedure
      .input(z.object({ collabId: z.number() }))
      .query(async ({ input }) => {
        return await getCollaborationLayers(input.collabId);
      }),

    join: protectedProcedure
      .input(z.object({ collabId: z.number() }))
      .mutation(async ({ input, ctx }) => joinCollaborationRecord(input.collabId, ctx.user.id)),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().trim().min(1).max(255),
          description: z.string().trim().max(5000).optional(),
          visibility: z.enum(["public", "private", "invited"]).default("private"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const collaboration = await createCollaborationRecord({
          creatorId: ctx.user.id,
          title: input.title,
          description: input.description,
          visibility: input.visibility,
        });
        return { success: true, collaboration };
      }),

    invite: protectedProcedure
      .input(z.object({ collabId: z.number(), userId: z.number(), message: z.string().trim().max(1000).optional() }))
      .mutation(async ({ input, ctx }) => createCollaborationInvitation({ collaborationId: input.collabId, invitedUserId: input.userId, invitedByUserId: ctx.user.id, message: input.message })),

    contributors: protectedProcedure
      .input(z.object({ collabId: z.number() }))
      .query(async ({ input }) => getCollaborationContributors(input.collabId)),

    comments: protectedProcedure
      .input(z.object({ collabId: z.number() }))
      .query(async ({ input }) => getCollaborationComments(input.collabId)),

    addLayer: protectedProcedure
      .input(z.object({ collabId: z.number(), trackId: z.number() }))
      .mutation(async ({ input, ctx }) => addCollaborationLayerRecord(input.collabId, input.trackId, ctx.user.id)),

    updateLayer: protectedProcedure
      .input(z.object({ layerId: z.number(), volume: z.number().min(0).max(1).optional(), pan: z.number().min(-1).max(1).optional() }))
      .mutation(async ({ input, ctx }) => updateCollaborationLayerRecord(input.layerId, ctx.user.id, { volume: input.volume, pan: input.pan })),

    removeLayer: protectedProcedure
      .input(z.object({ layerId: z.number() }))
      .mutation(async ({ input, ctx }) => removeCollaborationLayerRecord(input.layerId, ctx.user.id)),

    addComment: protectedProcedure
      .input(z.object({ collabId: z.number(), layerId: z.number().optional(), text: z.string().trim().min(1).max(5000) }))
      .mutation(async ({ input, ctx }) => addCollaborationCommentRecord(input.collabId, input.layerId, ctx.user.id, input.text)),

    invitations: protectedProcedure.query(async ({ ctx }) => getUserInvitations(ctx.user.id)),

    respondToInvite: protectedProcedure
      .input(z.object({ invitationId: z.number(), response: z.enum(["accepted", "declined"]) }))
      .mutation(async ({ input, ctx }) => respondToCollaborationInvitation(input.invitationId, ctx.user.id, input.response)),
  }),

  // ============================================
  // PLAYLISTS
  // ============================================
  playlists: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserPlaylists(ctx.user.id);
    }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getPlaylistById(input.id);
      }),

    tracks: publicProcedure
      .input(z.object({ playlistId: z.number() }))
      .query(async ({ input }) => {
        return await getPlaylistTracks(input.playlistId);
      }),

    create: protectedProcedure
      .input(z.object({ title: z.string().trim().min(1).max(255), description: z.string().trim().max(5000).optional(), visibility: z.enum(["public", "private"]).default("private") }))
      .mutation(async ({ input, ctx }) => createPlaylistRecord({ creatorId: ctx.user.id, ...input })),

    update: protectedProcedure
      .input(z.object({ playlistId: z.number(), title: z.string().trim().min(1).max(255).optional(), description: z.string().trim().max(5000).nullable().optional(), visibility: z.enum(["public", "private"]).optional() }))
      .mutation(async ({ input, ctx }) => updatePlaylistRecord(input.playlistId, ctx.user.id, { title: input.title, description: input.description, visibility: input.visibility })),

    delete: protectedProcedure
      .input(z.object({ playlistId: z.number() }))
      .mutation(async ({ input, ctx }) => deletePlaylistRecord(input.playlistId, ctx.user.id)),

    addTrack: protectedProcedure
      .input(z.object({ playlistId: z.number(), trackId: z.number() }))
      .mutation(async ({ input, ctx }) => addTrackToPlaylistRecord(input.playlistId, input.trackId, ctx.user.id)),

    removeTrack: protectedProcedure
      .input(z.object({ playlistId: z.number(), trackId: z.number() }))
      .mutation(async ({ input, ctx }) => removeTrackFromPlaylistRecord(input.playlistId, input.trackId, ctx.user.id)),
  }),

  // ============================================
  // NOTIFICATIONS
  // ============================================
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return await getUserNotifications(ctx.user.id, input.limit);
      }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const count = await getUnreadNotificationCount(ctx.user.id);
      return { count };
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input, ctx }) => markNotificationRead(input.notificationId, ctx.user.id)),

    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => markAllNotificationsRead(ctx.user.id)),
  }),

  // ============================================
  // USERS & PROFILES
  // ============================================
  users: router({
    profile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => ({ user: await getUserById(input.userId), profile: await getUserProfile(input.userId) })),

    myProfile: protectedProcedure.query(async ({ ctx }) => ({ user: await getUserById(ctx.user.id), profile: await getUserProfile(ctx.user.id) })),

    updateProfile: protectedProcedure
      .input(z.object({ bio: z.string().max(5000).nullable().optional(), avatar: z.string().url().nullable().optional(), website: z.string().url().nullable().optional(), twitter: z.string().max(255).nullable().optional(), instagram: z.string().max(255).nullable().optional(), soundcloud: z.string().max(255).nullable().optional(), location: z.string().max(255).nullable().optional() }))
      .mutation(async ({ input, ctx }) => updateUserProfile(ctx.user.id, input)),

    follow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => followUser(ctx.user.id, input.userId)),

    unfollow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => unfollowUser(ctx.user.id, input.userId)),

    following: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input, ctx }) => ({ following: await isFollowingUser(ctx.user.id, input.userId) })),

    followers: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => getUserFollowers(input.userId)),
  }),

  // ============================================
  // REFERENCE DATA
  // ============================================
  reference: router({
    genres: publicProcedure.query(async () => {
      return await getAllGenres();
    }),

    instruments: publicProcedure.query(async () => {
      return await getAllInstruments();
    }),
  }),
});

export type AppRouter = typeof appRouter;
