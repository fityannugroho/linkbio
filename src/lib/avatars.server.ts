import { randomUUID } from "node:crypto";

export const MAX_AVATAR_SIZE = 10 * 1024 * 1024;
export const ALLOWED_AVATAR_CONTENT_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export type AvatarStorageMode = "s3" | "local";

export function getAvatarExtension(contentType: string) {
  return ALLOWED_AVATAR_CONTENT_TYPES.get(contentType) || null;
}

export function createAvatarObjectKey(
  userId: string,
  contentType: string,
  mode: AvatarStorageMode,
) {
  const extension = getAvatarExtension(contentType);
  if (!extension) {
    throw new Error("Unsupported image type");
  }
  const basePath = mode === "s3" ? "avatars" : "media/avatars";
  return `${basePath}/${userId}/${randomUUID()}.${extension}`;
}

export function ensureAvatarObjectKey(
  userId: string,
  objectKey: string,
  mode: AvatarStorageMode,
) {
  const basePath = mode === "s3" ? "avatars" : "media/avatars";
  if (!objectKey.startsWith(`${basePath}/${userId}/`)) {
    throw new Error("Invalid avatar key");
  }
}
