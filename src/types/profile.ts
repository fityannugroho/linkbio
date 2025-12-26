import type { SocialPlatform } from "@/lib/validation";

// Use Drizzle inferred types where helpful, but keep some fields optional for compatibility
type SocialRow = typeof import("@/db/schema").socials.$inferSelect;
type ProfileRow = typeof import("@/db/schema").profile.$inferSelect;

export type ProfileSocial = {
  platform: SocialPlatform;
  value: SocialRow["value"];
  order: SocialRow["order"];
  isVisible: SocialRow["isVisible"];
};

export type ProfileWithDetails = ProfileRow & {
  design: Record<string, string | null>;
  socials: ProfileSocial[];
};
