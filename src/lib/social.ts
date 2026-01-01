import { socialItems } from "@/constants/social";
import type { SocialPlatform } from "@/lib/validation";
import { isEmptyOrValidSocialValue } from "@/lib/validation";
import type { ProfileSocial } from "@/types/profile";

export type SocialForm = Record<
  SocialPlatform,
  { value: string; isVisible: boolean }
>;
export type SocialFields = Record<SocialPlatform, string>;

const socialLabelByKey = Object.fromEntries(
  socialItems.map((item) => [item.key, item.label]),
);

const socialBaseUrlByKey = Object.fromEntries(
  socialItems.map((item) => [item.key, item.baseUrl]),
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

export const buildSocialUrl = (platform: SocialPlatform, value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  return `${socialBaseUrlByKey[platform]}${trimmed}`;
};
