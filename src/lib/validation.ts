import type { SocialPlatform } from "@/constants/social";
import { socialItemByKey } from "@/constants/social";
export type { SocialPlatform };

const stripWww = (hostname: string) =>
  hostname.toLowerCase().replace(/^www\./, "");

export const isValidHttpUrl = (value: string) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_err) {
    return false;
  }
};

const extractHostnamesFromBaseUrl = (baseUrl: string): string[] => {
  if (baseUrl.startsWith("mailto:")) return [""];
  try {
    const url = new URL(baseUrl);
    const hostname = stripWww(url.hostname);
    if (hostname === "twitter.com") return ["twitter.com", "x.com"];
    if (hostname === "youtube.com") return ["youtube.com", "youtu.be"];
    return [hostname];
  } catch {
    return [];
  }
};

export const isValidSocialUrl = (platform: SocialPlatform, value: string) => {
  if (platform === "email") {
    return value.includes("@");
  }

  if (!isValidHttpUrl(value)) return false;
  const hostname = stripWww(new URL(value).hostname);
  const item = socialItemByKey[platform];
  if (!item) return false;
  const validHostnames = extractHostnamesFromBaseUrl(item.baseUrl);
  return validHostnames.includes(hostname);
};

export const isEmptyOrValidUrl = (value: string) =>
  !value || isValidHttpUrl(value);

const SOCIAL_USERNAME_PATTERN = /^[A-Za-z0-9@._/-]{1,80}$/;

export const isValidSocialValue = (platform: SocialPlatform, value: string) => {
  if (!value.trim()) return false;

  const isUrl = isValidHttpUrl(value);
  const isUsername = SOCIAL_USERNAME_PATTERN.test(value.trim());

  // For validation, check what type of input was provided
  if (isUrl) {
    return isValidSocialUrl(platform, value);
  }

  // If not a URL, must be username format
  return isUsername;
};

export const isEmptyOrValidSocialValue = (
  platform: SocialPlatform,
  value: string,
) => !value || isValidSocialValue(platform, value);
