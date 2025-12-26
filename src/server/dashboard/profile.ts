import { createServerFn } from "@tanstack/react-start";
import { upsertDesigns } from "@/data/designs";
import { upsertProfile } from "@/data/profile";
import { reorderSocials, upsertSocials } from "@/data/socials";
import { getInvalidSocialValues } from "@/lib/social";
import type { SocialPlatform } from "@/lib/validation";
import { getSessionOrThrow } from "@/server/auth";
import type { ProfileSocial } from "@/types/profile";

// Update basic profile information only (displayName, bio, avatarUrl)
export const updateProfileAction = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      displayName: string;
      bio: string | null;
      avatarUrl?: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();

    await upsertProfile({
      userId: session.user.id,
      displayName: data.displayName,
      bio: data.bio,
      avatarUrl: data.avatarUrl || null,
    });
  });

// Update social links only
export const updateSocialsAction = createServerFn({ method: "POST" })
  .inputValidator((data: { socials: ProfileSocial[] }) => data)
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();

    const invalidSocials = getInvalidSocialValues(data.socials);
    if (invalidSocials.length > 0) {
      throw new Error(
        `${invalidSocials[0].charAt(0).toUpperCase() + invalidSocials[0].slice(1)} value is invalid`,
      );
    }

    await upsertSocials(session.user.id, data.socials);
  });

// Update design settings only
export const updateDesignsAction = createServerFn({ method: "POST" })
  .inputValidator((data: { design: Record<string, string | null> }) => data)
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();

    await upsertDesigns(session.user.id, data.design);
  });

// Reorder social links
export const reorderSocialsAction = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { socials: Array<{ platform: string; order: number }> }) => data,
  )
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();

    await reorderSocials(
      session.user.id,
      data.socials as Array<{ platform: SocialPlatform; order: number }>,
    );
  });
