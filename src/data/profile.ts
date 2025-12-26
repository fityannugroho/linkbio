import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { profile } from "@/db/schema";
import type { SocialPlatform } from "@/lib/validation";
import type { ProfileSocial, ProfileWithDetails } from "@/types/profile";
import { getDesignsByUserId, upsertDesigns } from "./designs";
import { getSocialsByUserId, upsertSocials } from "./socials";

export const getProfileByUserId = async (
  userId: string,
): Promise<ProfileWithDetails | null> => {
  const result = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1);

  if (result.length === 0) return null;

  const profileData = result[0];
  const socialData = await getSocialsByUserId(userId);
  const designData = await getDesignsByUserId(userId);

  return {
    ...profileData,
    socials: socialData.map((s) => ({
      platform: s.platform as SocialPlatform,
      value: s.value,
      order: s.order,
      isVisible: s.isVisible,
    })),
    design: Object.fromEntries(designData.map((d) => [d.attribute, d.value])),
  };
};

export const upsertProfile = async (data: {
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  socials?: ProfileSocial[];
  design?: Record<string, string | null>;
}) => {
  await db
    .insert(profile)
    .values({
      userId: data.userId,
      displayName: data.displayName,
      username: data.displayName.toLowerCase().replace(/\s+/g, "-"),
      bio: data.bio,
      avatarUrl: data.avatarUrl,
    })
    .onConflictDoUpdate({
      target: [profile.userId],
      set: {
        displayName: data.displayName,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        updatedAt: new Date(),
      },
    });

  if (data.socials) {
    await upsertSocials(data.userId, data.socials);
  }

  if (data.design) {
    await upsertDesigns(data.userId, data.design);
  }
};

export async function updateProfileAvatar(
  userId: string,
  avatarUrl: string | null,
) {
  await db.update(profile).set({ avatarUrl }).where(eq(profile.userId, userId));
}

export async function clearProfileAvatarIfMatches(
  userId: string,
  avatarUrl: string,
) {
  await db
    .update(profile)
    .set({ avatarUrl: null })
    .where(and(eq(profile.userId, userId), eq(profile.avatarUrl, avatarUrl)));
}
