import { useEffect, useState } from "react";
import { socialItemByKey } from "@/constants/social";
import {
  buildSocialForm,
  buildSocialPayload,
  getInvalidSocialValues,
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

  useEffect(() => {
    setSocialForm(buildSocialForm(profile?.socials));
  }, [profile?.socials]);

  const updateSocialUrl = (key: SocialPlatform, value: string) => {
    if (value && !isValidSocialValue(key, value)) {
      const item = socialItemByKey[key];
      throw new Error(`Please enter a valid ${item?.inputLabel}`);
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
      const item = socialItemByKey[key];
      errors[key] = `Enter a valid ${item?.inputLabel}`;
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
