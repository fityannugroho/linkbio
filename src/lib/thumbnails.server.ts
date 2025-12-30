import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  createStorageClient,
  getStorageBucket,
  isS3Enabled,
} from "@/lib/storage.server";

export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
export const ALLOWED_THUMBNAIL_CONTENT_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export type ThumbnailStorageMode = "s3" | "local";

export function getThumbnailExtension(contentType: string) {
  return ALLOWED_THUMBNAIL_CONTENT_TYPES.get(contentType) || null;
}

export function createThumbnailObjectKey(
  userId: string,
  contentType: string,
  mode: ThumbnailStorageMode,
) {
  const extension = getThumbnailExtension(contentType);
  if (!extension) {
    throw new Error("Unsupported image type");
  }
  const basePath = mode === "s3" ? "thumbnails" : "media/thumbnails";
  return `${basePath}/${userId}/${randomUUID()}.${extension}`;
}

export function ensureThumbnailObjectKey(
  userId: string,
  objectKey: string,
  mode: ThumbnailStorageMode,
) {
  const basePath = mode === "s3" ? "thumbnails" : "media/thumbnails";

  // Prevent path traversal
  if (objectKey.includes("..") || objectKey.includes("\0")) {
    throw new Error("Invalid thumbnail key");
  }

  if (!objectKey.startsWith(`${basePath}/${userId}/`)) {
    throw new Error("Invalid thumbnail key");
  }
}

export async function deleteThumbnailFile(userId: string, objectKey: string) {
  const mode = isS3Enabled() ? "s3" : "local";

  ensureThumbnailObjectKey(userId, objectKey, mode);

  if (isS3Enabled()) {
    const client = createStorageClient();
    await client.send(
      new DeleteObjectCommand({
        Bucket: getStorageBucket(),
        Key: objectKey,
      }),
    );
  } else {
    const targetPath = path.join(process.cwd(), "public", objectKey);
    await rm(targetPath, { force: true });
  }
}
