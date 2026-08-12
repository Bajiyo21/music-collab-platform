import crypto from "node:crypto";
import type { Server } from "node:http";
import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerTrackUploadRoute, type UploadRouteDependencies } from "./upload-route";

const openServers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    openServers.splice(0).map(
      server =>
        new Promise<void>(resolve => {
          server.close(() => resolve());
        }),
    ),
  );
});

async function createTestServer(
  overrides: Partial<UploadRouteDependencies> = {},
): Promise<{ baseUrl: string; server: Server; dependencies: UploadRouteDependencies }> {
  const app = express();
  const dependencies: UploadRouteDependencies = {
    createContext: vi.fn(async () => ({ user: { id: 42 } as any })),
    findTrackByHash: vi.fn(async () => undefined),
    storagePut: vi.fn(async () => ({
      key: "tracks/42/stored-demo.mp3",
      url: "/manus-storage/tracks/42/stored-demo.mp3",
    })),
    createTrackRecord: vi.fn(async input => ({ id: 9001, ...input })),
    ...overrides,
  };

  registerTrackUploadRoute(app, dependencies);
  const server = await new Promise<Server>(resolve => {
    const nextServer = app.listen(0, () => resolve(nextServer));
  });
  openServers.push(server);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not expose a port");

  return { baseUrl: `http://127.0.0.1:${address.port}`, server, dependencies };
}

async function postUpload(
  baseUrl: string,
  options: {
    title?: string;
    description?: string;
    genre?: string;
    tags?: string;
    bytes?: Uint8Array;
    mimeType?: string;
    filename?: string;
    visibility?: "public" | "private" | "unlisted";
    coverArtBytes?: Uint8Array;
    coverArtMimeType?: string;
    coverArtFilename?: string;
    includeFile?: boolean;
  } = {},
) {
  const form = new FormData();
  if (options.title !== undefined) form.append("title", options.title);
  if (options.description !== undefined) form.append("description", options.description);
  if (options.genre !== undefined) form.append("genre", options.genre);
  if (options.tags !== undefined) form.append("tags", options.tags);
  if (options.visibility !== undefined) form.append("visibility", options.visibility);
  if (options.coverArtBytes) {
    form.append("coverArt", new Blob([options.coverArtBytes], { type: options.coverArtMimeType ?? "image/png" }), options.coverArtFilename ?? "cover.png");
  }
  if (options.includeFile !== false) {
    const bytes = options.bytes ?? new Uint8Array([84, 85, 78, 69]);
    const mimeType = options.mimeType ?? "audio/mpeg";
    form.append("audio", new Blob([bytes], { type: mimeType }), options.filename ?? "demo.mp3");
  }

  const response = await fetch(`${baseUrl}/api/upload-track`, { method: "POST", body: form });
  return { response, body: (await response.json()) as Record<string, any> };
}

describe("POST /api/upload-track", () => {
  it("stores the audio and persists its copyright and storage metadata", async () => {
    const { baseUrl, dependencies } = await createTestServer();
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    const expectedHash = crypto.createHash("sha256").update(bytes).digest("hex");

    const { response, body } = await postUpload(baseUrl, {
      title: "Midnight Signal",
      description: "A protected test stem",
      genre: "Synthwave",
      bytes,
      filename: "midnight signal.mp3",
    });

    expect(response.status).toBe(201);
    expect(body).toMatchObject({ success: true, fileHash: expectedHash });

    const storagePut = dependencies.storagePut as ReturnType<typeof vi.fn>;
    expect(storagePut).toHaveBeenCalledWith(
      `tracks/42/${expectedHash}-midnight_signal.mp3`,
      expect.any(Buffer),
      "audio/mpeg",
    );

    const createTrackRecord = dependencies.createTrackRecord as ReturnType<typeof vi.fn>;
    expect(createTrackRecord).toHaveBeenCalledWith({
      creatorId: 42,
      title: "Midnight Signal",
      description: "A protected test stem",
      fileKey: "tracks/42/stored-demo.mp3",
      fileUrl: "/manus-storage/tracks/42/stored-demo.mp3",
      fileHash: expectedHash,
      mimeType: "audio/mpeg",
      fileSize: 5,
      coverArtKey: null,
      coverArtUrl: null,
      tags: ["Synthwave"],
      visibility: "public",
    });
  });

  it("stores optional cover art and selected visibility alongside the audio metadata", async () => {
    const storagePut = vi.fn(async (key: string, _data: Buffer, contentType?: string) => ({ key, url: `/manus-storage/${key}`, contentType }));
    const { baseUrl, dependencies } = await createTestServer({ storagePut });
    const { response } = await postUpload(baseUrl, {
      title: "Artwork Signal",
      genre: "Synthwave",
      tags: "night drive, breakbeat",
      visibility: "unlisted",
      coverArtBytes: new Uint8Array([137, 80, 78, 71]),
      coverArtFilename: "art work.png",
    });

    expect(response.status).toBe(201);
    expect(storagePut).toHaveBeenCalledTimes(2);
    expect(storagePut).toHaveBeenNthCalledWith(2, expect.stringContaining("-cover-art_work.png"), expect.any(Buffer), "image/png");
    expect(dependencies.createTrackRecord).toHaveBeenCalledWith(expect.objectContaining({
      coverArtKey: expect.stringContaining("-cover-art_work.png"),
      coverArtUrl: expect.stringContaining("-cover-art_work.png"),
      visibility: "unlisted",
      tags: ["Synthwave", "night drive", "breakbeat"],
    }));
  });

  it("rejects unauthenticated uploads before storage or persistence", async () => {
    const { baseUrl, dependencies } = await createTestServer({
      createContext: vi.fn(async () => ({ user: null })),
    });

    const { response, body } = await postUpload(baseUrl, { title: "Private Take" });

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Authentication required" });
    expect(dependencies.storagePut).not.toHaveBeenCalled();
    expect(dependencies.createTrackRecord).not.toHaveBeenCalled();
  });

  it("rejects non-audio files with an unsupported-media response", async () => {
    const { baseUrl, dependencies } = await createTestServer();

    const { response, body } = await postUpload(baseUrl, {
      title: "Not Audio",
      mimeType: "image/png",
      filename: "cover.png",
    });

    expect(response.status).toBe(415);
    expect(body).toEqual({ error: "Only audio files are supported" });
    expect(dependencies.storagePut).not.toHaveBeenCalled();
    expect(dependencies.createTrackRecord).not.toHaveBeenCalled();
  });

  it("rejects an exact duplicate hash before uploading a second copy", async () => {
    const duplicate = { id: 77, title: "Already Registered" } as any;
    const findTrackByHash = vi.fn(async () => duplicate);
    const { baseUrl, dependencies } = await createTestServer({ findTrackByHash });

    const { response, body } = await postUpload(baseUrl, { title: "Duplicate Take" });

    expect(response.status).toBe(409);
    expect(body).toEqual({
      error: "This exact audio file has already been uploaded",
      trackId: 77,
      title: "Already Registered",
    });
    expect(findTrackByHash).toHaveBeenCalledOnce();
    expect(dependencies.storagePut).not.toHaveBeenCalled();
    expect(dependencies.createTrackRecord).not.toHaveBeenCalled();
  });
});
