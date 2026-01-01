import type { SocialPlatform } from "@/constants/social";
import { socialItemByKey } from "@/constants/social";
export type { SocialPlatform };

export const isValidHttpUrl = (value: string) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const isValidSocialValue = (platform: SocialPlatform, value: string) => {
  if (!value.trim()) return false;

  const item = socialItemByKey[platform];
  if (!item) return false;

  return item.validation.test(value.trim());
};

export const normalizeSocialValue = (platform: SocialPlatform, raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const item = socialItemByKey[platform];
  if (!item) return trimmed;

  const match = trimmed.match(item.validation);
  if (!match) {
    throw new Error(`Invalid ${item.label} value`);
  }

  if (match.groups?.username) {
    return match.groups.username.toLowerCase();
  }

  if (match.groups?.email) {
    return match.groups.email.toLowerCase();
  }

  if (match.groups?.phone) {
    return match.groups.phone;
  }

  return trimmed;
};

export const isEmptyOrValidSocialValue = (
  platform: SocialPlatform,
  value: string,
) => !value || isValidSocialValue(platform, value);
