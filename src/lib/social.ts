import { socialItems } from "@/constants/social";
import type { SocialPlatform } from "@/lib/validation";
import { isEmptyOrValidSocialValue, isValidHttpUrl } from "@/lib/validation";
import type { ProfileSocial } from "@/types/profile";

export type SocialForm = Record<
  SocialPlatform,
  { value: string; isVisible: boolean }
>;
export type SocialFields = Record<SocialPlatform, string>;

const socialLabelByKey = Object.fromEntries(
  socialItems.map((item) => [item.key, item.label]),
);

export const getSocialLabel = (key: SocialPlatform) =>
  socialLabelByKey[key] || key;

export const getInvalidSocialValues = (
  socials: ProfileSocial[],
): SocialPlatform[] =>
  socials
    .filter(
      (item) =>
        item.value && !isEmptyOrValidSocialValue(item.platform, item.value),
    )
    .map((item) => item.platform);

export const buildSocialForm = (
  socials?: ProfileSocial[] | null,
): SocialForm => {
  const socialMap = new Map(
    (socials || []).map((item) => [item.platform, item]),
  );
  return Object.fromEntries(
    socialItems.map((item) => [
      item.key,
      {
        value: socialMap.get(item.key)?.value || "",
        isVisible: socialMap.get(item.key)?.isVisible ?? true,
      },
    ]),
  ) as SocialForm;
};

export const buildSocialPayload = (form: SocialForm): ProfileSocial[] => {
  return socialItems.map((item, index) => ({
    platform: item.key,
    value: form[item.key].value.trim(),
    order: index,
    isVisible: form[item.key].isVisible,
  }));
};

export const buildSocialFields = (
  socials?: ProfileSocial[] | null,
): SocialFields =>
  Object.fromEntries(
    socialItems.map((item) => [
      item.key,
      socials?.find((entry) => entry.platform === item.key)?.value || "",
    ]),
  ) as SocialFields;

export const getSocialLinksFromFields = (fields: SocialFields) =>
  Object.fromEntries(
    socialItems.map((item) => [item.key, fields[item.key]]),
  ) as Record<string, string>;

const socialBaseUrl: Record<SocialPlatform, string> = {
  instagram: "https://instagram.com/",
  twitter: "https://twitter.com/",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/in/",
  youtube: "https://youtube.com/@",
  tiktok: "https://www.tiktok.com/@",
  email: "mailto:",
};

export const buildSocialUrl = (platform: SocialPlatform, value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isValidHttpUrl(trimmed)) return trimmed;
  const normalized = trimmed.replace(/^@/, "");
  return `${socialBaseUrl[platform]}${encodeURIComponent(normalized)}`;
};
