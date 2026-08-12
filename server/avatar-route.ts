import type { Express } from "express";
import multer from "multer";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createContext } from "./_core/context";
import { storagePut } from "./storage";
import { updateUserProfile } from "./feature-db";
import { AVATAR_UPLOAD_MAX_BYTES, validateAvatarUpload } from "./avatar-upload";

type AvatarContext = Pick<Awaited<ReturnType<typeof createContext>>, "user">;

type AvatarRouteDependencies = {
  createContext: (opts: CreateExpressContextOptions) => Promise<AvatarContext>;
  storagePut: typeof storagePut;
  updateUserProfile: typeof updateUserProfile;
};

const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_UPLOAD_MAX_BYTES },
});

const defaultDependencies: AvatarRouteDependencies = {
  createContext,
  storagePut,
  updateUserProfile,
};

export function registerAvatarUploadRoute(
  app: Express,
  dependencies: AvatarRouteDependencies = defaultDependencies,
) {
  app.post("/api/upload-avatar", uploadAvatar.single("avatar"), async (req, res) => {
    try {
      const context = await dependencies.createContext({ req, res, info: {} as any });
      if (!context.user) return res.status(401).json({ error: "Authentication required" });

      const file = req.file;
      const validationError = validateAvatarUpload(file);
      if (validationError) {
        const status = validationError.startsWith("Only") ? 415 : 400;
        return res.status(status).json({ error: validationError });
      }
      if (!file) return res.status(400).json({ error: "Profile image is required" });

      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      const stored = await dependencies.storagePut(
        `avatars/${context.user.id}/${Date.now()}-${safeName}`,
        file.buffer,
        file.mimetype,
      );
      const profile = await dependencies.updateUserProfile(context.user.id, { avatar: stored.url });
      return res.status(201).json({ success: true, avatar: stored, profile });
    } catch (error) {
      console.error("[Upload] Avatar upload failed:", error);
      return res.status(500).json({ error: "Profile image upload failed. Please try again." });
    }
  });
}

export type { AvatarRouteDependencies };
