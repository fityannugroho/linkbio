import { createServerFn } from "@tanstack/react-start";
import { eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { links, profile, profileAvatar } from "@/db/schema";
import { getSessionOrThrow } from "@/server/auth";

/**
 * Utility to extract object key from legacy URL.
 * Handles patterns:
 * - /api/s3/avatars/... -> avatars/...
 * - /media/avatars/... -> avatars/...
 * - https://.../avatars/... -> avatars/...
 */
function extractKeyFromLegacyUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (!url.startsWith("http") && !url.startsWith("/")) return url; // Already a key

  // Match common patterns
  const patterns = [/api\/s3\/(.+)$/, /media\/(.+)$/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // Fallback for full URLs if they contain our known paths
  if (url.includes("/avatars/")) {
    const parts = url.split("/avatars/");
    return `avatars/${parts[1]}`;
  }
  if (url.includes("/thumbnails/")) {
    const parts = url.split("/thumbnails/");
    return `thumbnails/${parts[1]}`;
  }

  return url;
}

export const migrateStorageKeysAction = createServerFn({ method: "POST" })
  .inputValidator((data: { confirmed: boolean }) => data)
  .handler(async ({ data }) => {
    if (!data.confirmed) throw new Error("Migration not confirmed");
    await getSessionOrThrow(); // Ensure admin

    let migratedLinks = 0;
    let migratedProfiles = 0;
    let migratedAvatars = 0;

    // 1. Migrate Links
    const allLinks = await db
      .select()
      .from(links)
      .where(
        or(like(links.thumbnailUrl, "http%"), like(links.thumbnailUrl, "/%")),
      );

    for (const link of allLinks) {
      const key = extractKeyFromLegacyUrl(link.thumbnailUrl);
      if (key && key !== link.thumbnailUrl) {
        await db
          .update(links)
          .set({ thumbnailUrl: key })
          .where(eq(links.id, link.id));
        migratedLinks++;
      }
    }

    // 2. Migrate Profiles
    const allProfiles = await db
      .select()
      .from(profile)
      .where(
        or(like(profile.avatarUrl, "http%"), like(profile.avatarUrl, "/%")),
      );

    for (const p of allProfiles) {
      const key = extractKeyFromLegacyUrl(p.avatarUrl);
      if (key && key !== p.avatarUrl) {
        await db
          .update(profile)
          .set({ avatarUrl: key })
          .where(eq(p.userId, p.userId));
        migratedProfiles++;
      }
    }

    // 3. Migrate profile_avatar library
    const allAvatars = await db
      .select()
      .from(profileAvatar)
      .where(
        or(like(profileAvatar.url, "http%"), like(profileAvatar.url, "/%")),
      );

    for (const av of allAvatars) {
      const key = extractKeyFromLegacyUrl(av.url);
      if (key && key !== av.url) {
        await db
          .update(profileAvatar)
          .set({ url: key, objectKey: key })
          .where(eq(profileAvatar.id, av.id));
        migratedAvatars++;
      }
    }

    return {
      success: true,
      migratedLinks,
      migratedProfiles,
      migratedAvatars,
    };
  });
