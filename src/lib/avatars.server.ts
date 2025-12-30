import { randomUUID } from "node:crypto";

export const MAX_AVATAR_SIZE = 10 * 1024 * 1024;
export const ALLOWED_AVATAR_CONTENT_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function getAvatarExtension(contentType: string) {
  return ALLOWED_AVATAR_CONTENT_TYPES.get(contentType) || null;
}

export function createAvatarObjectKey(userId: string, contentType: string) {
  const extension = getAvatarExtension(contentType);
  if (!extension) {
    throw new Error("Unsupported image type");
  }
  return `avatars/${userId}/${randomUUID()}.${extension}`;
}
