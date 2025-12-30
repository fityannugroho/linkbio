import { randomUUID } from "node:crypto";

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
