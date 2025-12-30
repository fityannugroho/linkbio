export function getPublicUrl(objectKey: string): string;
export function getPublicUrl(
  objectKey: string | null | undefined,
): string | null;
export function getPublicUrl(
  objectKey: string | null | undefined,
): string | null {
  if (!objectKey) return null;

  // If it's already a full URL or data URI, return it as is
  if (
    objectKey.startsWith("http") ||
    objectKey.startsWith("https") ||
    objectKey.startsWith("data:")
  ) {
    return objectKey;
  }

  // If it already starts with the storage API prefix, return it as is
  if (objectKey.startsWith("/api/storage/")) {
    return objectKey;
  }

  // Ensure leading slash is removed from key
  const cleanedKey = objectKey.replace(/^\/+/, "");
  return `/api/storage/${cleanedKey}`;
}
