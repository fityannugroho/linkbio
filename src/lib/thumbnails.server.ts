import { randomUUID } from "node:crypto";

export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
export const ALLOWED_THUMBNAIL_CONTENT_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function getThumbnailExtension(contentType: string) {
  return ALLOWED_THUMBNAIL_CONTENT_TYPES.get(contentType) || null;
}

export function createThumbnailObjectKey(userId: string, contentType: string) {
  const extension = getThumbnailExtension(contentType);
  if (!extension) {
    throw new Error("Unsupported image type");
  }
  return `thumbnails/${userId}/${randomUUID()}.${extension}`;
}
