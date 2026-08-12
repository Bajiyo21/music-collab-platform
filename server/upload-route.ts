import crypto from "node:crypto";
import type { Express } from "express";
import multer from "multer";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../drizzle/schema";
import { createTrackRecord, findTrackByHash } from "./db";
import { storagePut } from "./storage";
import { createContext } from "./_core/context";
import { TRACK_UPLOAD_MAX_BYTES, validateTrackUpload } from "./upload";

type UploadContext = Pick<Awaited<ReturnType<typeof createContext>>, "user">;

type UploadRouteDependencies = {
  createContext: (opts: CreateExpressContextOptions) => Promise<UploadContext>;
  findTrackByHash: typeof findTrackByHash;
  storagePut: typeof storagePut;
  createTrackRecord: typeof createTrackRecord;
};

const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TRACK_UPLOAD_MAX_BYTES },
});

const defaultDependencies: UploadRouteDependencies = {
  createContext,
  findTrackByHash,
  storagePut,
  createTrackRecord,
};

export function registerTrackUploadRoute(
  app: Express,
  dependencies: UploadRouteDependencies = defaultDependencies,
) {
  app.post("/api/upload-track", uploadAudio.single("audio"), async (req, res) => {
    try {
      const context = await dependencies.createContext({ req, res, info: {} as any });
      if (!context.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const file = req.file;
      const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
      const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
      const genre = typeof req.body.genre === "string" ? req.body.genre.trim() : "";

      const validationError = validateTrackUpload(file, title);
      if (validationError) {
        const status = validationError.includes("Only audio") ? 415 : 400;
        return res.status(status).json({ error: validationError });
      }
      if (!file) {
        return res.status(400).json({ error: "Audio file is required" });
      }

      const fileHash = crypto.createHash("sha256").update(file.buffer).digest("hex");
      const duplicate = await dependencies.findTrackByHash(fileHash);
      if (duplicate) {
        return res.status(409).json({
          error: "This exact audio file has already been uploaded",
          trackId: duplicate.id,
          title: duplicate.title,
        });
      }

      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      const stored = await dependencies.storagePut(
        `tracks/${context.user.id}/${fileHash}-${safeName}`,
        file.buffer,
        file.mimetype,
      );
      const track = await dependencies.createTrackRecord({
        creatorId: context.user.id,
        title,
        description,
        fileKey: stored.key,
        fileUrl: stored.url,
        fileHash,
        mimeType: file.mimetype,
        fileSize: file.size,
        tags: genre ? [genre] : [],
      });

      return res.status(201).json({ success: true, track, fileHash });
    } catch (error) {
      console.error("[Upload] Track upload failed:", error);
      return res.status(500).json({ error: "Track upload failed. Please try again." });
    }
  });
}

export type { UploadRouteDependencies };
export type { User };
