export type SocialPlatform =
  | "instagram"
  | "twitter"
  | "github"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "email";

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

export const isValidSocialUrl = (platform: SocialPlatform, value: string) => {
  if (platform === "email") {
    return value.includes("@");
  }

  if (!isValidHttpUrl(value)) return false;
  const hostname = stripWww(new URL(value).hostname);
  switch (platform) {
    case "instagram":
      return hostname === "instagram.com";
    case "twitter":
      return hostname === "twitter.com" || hostname === "x.com";
    case "github":
      return hostname === "github.com";
    case "linkedin":
      return hostname === "linkedin.com";
    case "youtube":
      return hostname === "youtube.com" || hostname === "youtu.be";
    case "tiktok":
      return hostname === "tiktok.com";
    default:
      return false;
  }
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
