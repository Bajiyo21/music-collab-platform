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
      .input(z.object({ query: z.string(), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await searchTracks(input.query, input.limit);
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getTrackById(input.id);
      }),

    userTracks: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getUserTracks(input.userId);
      }),

    myTracks: protectedProcedure.query(async ({ ctx }) => {
      return await getUserTracks(ctx.user.id);
    }),

    comments: publicProcedure
      .input(z.object({ trackId: z.number() }))
      .query(async ({ input }) => {
        return await getTrackComments(input.trackId);
      }),

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
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserCollaborations(ctx.user.id);
    }),

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
      .input(
        z.object({
          collabId: z.number(),
          userId: z.number(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement invitation system
        return {
          success: true,
          message: "Collaboration invitation endpoint ready for implementation",
        };
      }),
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
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          visibility: z.enum(["public", "private"]).default("private"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement playlist creation
        return {
          success: true,
          message: "Playlist creation endpoint ready for implementation",
        };
      }),

    addTrack: protectedProcedure
      .input(z.object({ playlistId: z.number(), trackId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement add track to playlist
        return {
          success: true,
          message: "Add track to playlist endpoint ready for implementation",
        };
      }),
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
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement mark as read
        return {
          success: true,
          message: "Mark notification as read endpoint ready for implementation",
        };
      }),
  }),

  // ============================================
  // USERS & PROFILES
  // ============================================
  users: router({
    profile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getUserProfile(input.userId);
      }),

    myProfile: protectedProcedure.query(async ({ ctx }) => {
      return await getUserProfile(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          bio: z.string().optional(),
          avatar: z.string().optional(),
          website: z.string().optional(),
          twitter: z.string().optional(),
          instagram: z.string().optional(),
          soundcloud: z.string().optional(),
          location: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement profile update
        return {
          success: true,
          message: "Profile update endpoint ready for implementation",
        };
      }),

    follow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement follow user
        return {
          success: true,
          message: "Follow user endpoint ready for implementation",
        };
      }),

    unfollow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement unfollow user
        return {
          success: true,
          message: "Unfollow user endpoint ready for implementation",
        };
      }),
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
