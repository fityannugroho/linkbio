import { useState } from "react";
import { socialItems } from "@/constants/social";
import {
  buildSocialForm,
  buildSocialPayload,
  getInvalidSocialValues,
  getSocialLabel,
  type SocialForm,
} from "@/lib/social";
import type { SocialPlatform } from "@/lib/validation";
import { isValidSocialValue } from "@/lib/validation";
import type { ProfileSocial } from "@/types/profile";

type UseSocialFormOptions = {
  profile: {
    socials?: ProfileSocial[] | null;
  } | null;
};

export const useSocialForm = ({ profile }: UseSocialFormOptions) => {
  const [socialForm, setSocialForm] = useState<SocialForm>(() =>
    buildSocialForm(profile?.socials),
  );

  const updateSocialUrl = (key: SocialPlatform, value: string) => {
    if (value && !isValidSocialValue(key, value)) {
      const item = socialItems.find((i) => i.key === key);
      const inputType = item?.inputType || "both";
      const errorMsg =
        inputType === "username"
          ? "Please enter a valid username (e.g., @handle or username)"
          : inputType === "url"
            ? "Please enter a valid URL (e.g., https://...)"
            : "Please enter a valid username or URL";
      throw new Error(errorMsg);
    }
    setSocialForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  const toggleSocialVisibility = (key: SocialPlatform) => {
    setSocialForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], isVisible: !prev[key].isVisible },
    }));
  };

  const removeSocial = (key: SocialPlatform) => {
    setSocialForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], value: "" },
    }));
  };

  const validateAndGetPayload = () => {
    const socialPayload = buildSocialPayload(socialForm);
    const errors: Record<string, string> = {};

    for (const key of getInvalidSocialValues(socialPayload)) {
      const item = socialItems.find((i) => i.key === key);
      const inputType = item?.inputType || "both";
      const label = getSocialLabel(key);
      errors[key] =
        inputType === "username"
          ? `Enter a valid ${label} username`
          : inputType === "url"
            ? `Enter a valid ${label} URL`
            : `Enter a valid ${label} username or URL`;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      socialPayload,
      errors,
    };
  };

  return {
    socialForm,
    updateSocialUrl,
    toggleSocialVisibility,
    removeSocial,
    validateAndGetPayload,
  };
};
