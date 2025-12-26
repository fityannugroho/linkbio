import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { socials } from "@/db/schema";
import type { SocialPlatform } from "@/lib/validation";

export async function getSocialsByUserId(userId: string) {
  return await db
    .select()
    .from(socials)
    .where(eq(socials.userId, userId))
    .orderBy(socials.order);
}

export async function upsertSocials(
  userId: string,
  data: Array<{
    platform: SocialPlatform;
    value: string | null;
    order?: number;
    isVisible?: boolean;
  }>,
) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item.value || item.value.trim() === "") {
      await db
        .delete(socials)
        .where(
          and(eq(socials.userId, userId), eq(socials.platform, item.platform)),
        );
      continue;
    }
    await db
      .insert(socials)
      .values({
        userId,
        platform: item.platform,
        value: item.value,
        order: item.order ?? i,
        isVisible: item.isVisible ?? true,
      })
      .onConflictDoUpdate({
        target: [socials.userId, socials.platform],
        set: {
          value: item.value,
          order: item.order ?? i,
          isVisible: item.isVisible ?? true,
          updatedAt: new Date(),
        },
      });
  }
}

export async function reorderSocials(
  userId: string,
  data: Array<{ platform: SocialPlatform; order: number }>,
) {
  for (const item of data) {
    await db
      .update(socials)
      .set({ order: item.order, updatedAt: new Date() })
      .where(
        and(eq(socials.userId, userId), eq(socials.platform, item.platform)),
      );
  }
}

export async function clearSocials(userId: string) {
  await db.delete(socials).where(eq(socials.userId, userId));
}
