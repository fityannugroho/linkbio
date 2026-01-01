import { describe, expect, it } from "vitest";
import { buildSocialUrl } from "../lib/social";
import { isValidSocialValue, normalizeSocialValue } from "../lib/validation";

describe("Social Validation", () => {
  describe("Twitter/X", () => {
    it("accepts valid username with @", () => {
      expect(isValidSocialValue("twitter", "@username")).toBe(true);
      expect(normalizeSocialValue("twitter", "@username")).toBe("username");
    });

    it("accepts valid username without @", () => {
      expect(isValidSocialValue("twitter", "username")).toBe(true);
      expect(normalizeSocialValue("twitter", "username")).toBe("username");
    });

    it("accepts valid Twitter URL", () => {
      expect(
        isValidSocialValue("twitter", "https://twitter.com/username"),
      ).toBe(true);
      expect(
        normalizeSocialValue("twitter", "https://twitter.com/username"),
      ).toBe("username");
    });

    it("accepts valid X.com URL", () => {
      expect(isValidSocialValue("twitter", "https://x.com/username")).toBe(
        true,
      );
      expect(normalizeSocialValue("twitter", "https://x.com/username")).toBe(
        "username",
      );
    });

    it("rejects URL with path after username", () => {
      expect(
        isValidSocialValue("twitter", "https://x.com/username/status/123"),
      ).toBe(false);
    });

    it("rejects username longer than 15 chars", () => {
      expect(isValidSocialValue("twitter", `@${"a".repeat(16)}`)).toBe(false);
    });

    it("rejects invalid characters", () => {
      expect(isValidSocialValue("twitter", "@user-name")).toBe(false);
    });
  });

  describe("Facebook", () => {
    it("accepts valid username with @", () => {
      expect(isValidSocialValue("facebook", "@username")).toBe(true);
      expect(normalizeSocialValue("facebook", "@username")).toBe("username");
    });

    it("accepts valid username without @", () => {
      expect(isValidSocialValue("facebook", "username")).toBe(true);
      expect(normalizeSocialValue("facebook", "username")).toBe("username");
    });

    it("accepts valid Facebook URL", () => {
      expect(
        isValidSocialValue("facebook", "https://facebook.com/username"),
      ).toBe(true);
      expect(
        normalizeSocialValue("facebook", "https://facebook.com/username"),
      ).toBe("username");
    });

    it("accepts username with dots", () => {
      expect(isValidSocialValue("facebook", "@user.name")).toBe(true);
      expect(normalizeSocialValue("facebook", "@user.name")).toBe("user.name");
    });

    it("rejects username shorter than 5 chars", () => {
      expect(isValidSocialValue("facebook", "@abcd")).toBe(false);
    });

    it("rejects username longer than 50 chars", () => {
      expect(isValidSocialValue("facebook", `@${"a".repeat(51)}`)).toBe(false);
    });

    it("rejects invalid characters", () => {
      expect(isValidSocialValue("facebook", "@user_name")).toBe(false);
    });
  });

  describe("Instagram", () => {
    it("accepts valid username with @", () => {
      expect(isValidSocialValue("instagram", "@username")).toBe(true);
      expect(normalizeSocialValue("instagram", "@username")).toBe("username");
    });

    it("accepts valid username without @", () => {
      expect(isValidSocialValue("instagram", "username")).toBe(true);
      expect(normalizeSocialValue("instagram", "username")).toBe("username");
    });

    it("accepts valid Instagram URL", () => {
      expect(
        isValidSocialValue("instagram", "https://instagram.com/username"),
      ).toBe(true);
      expect(
        normalizeSocialValue("instagram", "https://instagram.com/username"),
      ).toBe("username");
    });

    it("accepts username with dots", () => {
      expect(isValidSocialValue("instagram", "@user.name")).toBe(true);
      expect(normalizeSocialValue("instagram", "@user.name")).toBe("user.name");
    });

    it("accepts username with underscores", () => {
      expect(isValidSocialValue("instagram", "@user_name")).toBe(true);
      expect(normalizeSocialValue("instagram", "@user_name")).toBe("user_name");
    });

    it("rejects username longer than 30 chars", () => {
      expect(isValidSocialValue("instagram", `@${"a".repeat(31)}`)).toBe(false);
    });

    it("rejects username with hyphens", () => {
      expect(isValidSocialValue("instagram", "@user-name")).toBe(false);
    });
  });

  describe("GitHub", () => {
    it("accepts valid username", () => {
      expect(isValidSocialValue("github", "username")).toBe(true);
      expect(normalizeSocialValue("github", "username")).toBe("username");
    });

    it("accepts valid GitHub URL", () => {
      expect(isValidSocialValue("github", "https://github.com/username")).toBe(
        true,
      );
      expect(
        normalizeSocialValue("github", "https://github.com/username"),
      ).toBe("username");
    });

    it("accepts username with hyphens", () => {
      expect(isValidSocialValue("github", "user-name")).toBe(true);
      expect(normalizeSocialValue("github", "user-name")).toBe("user-name");
    });

    it("rejects username with underscores", () => {
      expect(isValidSocialValue("github", "user_name")).toBe(false);
    });

    it("rejects username longer than 39 chars", () => {
      expect(isValidSocialValue("github", `${"a".repeat(40)}`)).toBe(false);
    });
  });

  describe("LinkedIn", () => {
    it("accepts valid username", () => {
      expect(isValidSocialValue("linkedin", "username")).toBe(true);
      expect(normalizeSocialValue("linkedin", "username")).toBe("username");
    });

    it("accepts valid LinkedIn URL", () => {
      expect(
        isValidSocialValue("linkedin", "https://linkedin.com/in/username"),
      ).toBe(true);
      expect(
        normalizeSocialValue("linkedin", "https://linkedin.com/in/username"),
      ).toBe("username");
    });

    it("rejects URL with /company/ path", () => {
      expect(
        isValidSocialValue("linkedin", "https://linkedin.com/company/username"),
      ).toBe(false);
    });

    it("accepts username with hyphens", () => {
      expect(isValidSocialValue("linkedin", "user-name")).toBe(true);
      expect(normalizeSocialValue("linkedin", "user-name")).toBe("user-name");
    });

    it("rejects username longer than 100 chars", () => {
      const longUsername = "a".repeat(101);
      expect(isValidSocialValue("linkedin", longUsername)).toBe(false);
    });
  });

  describe("YouTube", () => {
    it("accepts valid username with @", () => {
      expect(isValidSocialValue("youtube", "@username")).toBe(true);
      expect(normalizeSocialValue("youtube", "@username")).toBe("username");
    });

    it("accepts valid YouTube URL", () => {
      expect(
        isValidSocialValue("youtube", "https://youtube.com/@username"),
      ).toBe(true);
      expect(
        normalizeSocialValue("youtube", "https://youtube.com/@username"),
      ).toBe("username");
    });

    it("accepts youtu.be URL", () => {
      expect(isValidSocialValue("youtube", "https://youtu.be/username")).toBe(
        true,
      );
      expect(normalizeSocialValue("youtube", "https://youtu.be/username")).toBe(
        "username",
      );
    });

    it("accepts username with dots", () => {
      expect(isValidSocialValue("youtube", "@user.name")).toBe(true);
      expect(normalizeSocialValue("youtube", "@user.name")).toBe("user.name");
    });

    it("rejects URL without @ in path", () => {
      expect(
        isValidSocialValue("youtube", "https://youtube.com/username"),
      ).toBe(false);
    });

    it("rejects username longer than 30 chars", () => {
      expect(isValidSocialValue("youtube", `@${"a".repeat(31)}`)).toBe(false);
    });
  });

  describe("TikTok", () => {
    it("accepts valid username with @", () => {
      expect(isValidSocialValue("tiktok", "@username")).toBe(true);
      expect(normalizeSocialValue("tiktok", "@username")).toBe("username");
    });

    it("accepts valid TikTok URL", () => {
      expect(
        isValidSocialValue("tiktok", "https://www.tiktok.com/@username"),
      ).toBe(true);
      expect(
        normalizeSocialValue("tiktok", "https://www.tiktok.com/@username"),
      ).toBe("username");
    });

    it("accepts username with hyphens", () => {
      expect(isValidSocialValue("tiktok", "@user-name")).toBe(true);
      expect(normalizeSocialValue("tiktok", "@user-name")).toBe("user-name");
    });

    it("accepts username with dots and underscores", () => {
      expect(isValidSocialValue("tiktok", "@user_name.test")).toBe(true);
      expect(normalizeSocialValue("tiktok", "@user_name.test")).toBe(
        "user_name.test",
      );
    });

    it("rejects username longer than 30 chars", () => {
      expect(isValidSocialValue("tiktok", `@${"a".repeat(31)}`)).toBe(false);
    });
  });

  describe("Telegram", () => {
    it("accepts valid username with @", () => {
      expect(isValidSocialValue("telegram", "@username")).toBe(true);
      expect(normalizeSocialValue("telegram", "@username")).toBe("username");
    });

    it("accepts valid Telegram URL", () => {
      expect(isValidSocialValue("telegram", "https://t.me/username")).toBe(
        true,
      );
      expect(normalizeSocialValue("telegram", "https://t.me/username")).toBe(
        "username",
      );
    });

    it("rejects username longer than 32 chars", () => {
      expect(isValidSocialValue("telegram", `@${"a".repeat(33)}`)).toBe(false);
    });

    it("rejects username with hyphens", () => {
      expect(isValidSocialValue("telegram", "@user-name")).toBe(false);
    });

    it("rejects username with dots", () => {
      expect(isValidSocialValue("telegram", "@user.name")).toBe(false);
    });
  });

  describe("WhatsApp", () => {
    it("accepts valid phone number with country code", () => {
      expect(isValidSocialValue("whatsapp", "+6281234567890")).toBe(true);
      expect(normalizeSocialValue("whatsapp", "+6281234567890")).toBe(
        "+6281234567890",
      );
    });

    it("rejects phone number starting with 0", () => {
      expect(isValidSocialValue("whatsapp", "081234567890")).toBe(false);
    });

    it("rejects phone number without +", () => {
      expect(isValidSocialValue("whatsapp", "6281234567890")).toBe(false);
    });

    it("rejects phone number with separators", () => {
      expect(isValidSocialValue("whatsapp", "+62 812-3456-7890")).toBe(false);
    });

    it("rejects phone number longer than 15 digits", () => {
      expect(isValidSocialValue("whatsapp", "+1234567890123456")).toBe(false);
    });

    it("rejects phone number with letters", () => {
      expect(isValidSocialValue("whatsapp", "+62abc123456")).toBe(false);
    });
  });

  describe("Email", () => {
    it("accepts valid email", () => {
      expect(isValidSocialValue("email", "user@example.com")).toBe(true);
      expect(normalizeSocialValue("email", "user@example.com")).toBe(
        "user@example.com",
      );
    });

    it("accepts email with dots in local part", () => {
      expect(isValidSocialValue("email", "user.name@example.com")).toBe(true);
      expect(normalizeSocialValue("email", "user.name@example.com")).toBe(
        "user.name@example.com",
      );
    });

    it("accepts email with plus in local part", () => {
      expect(isValidSocialValue("email", "user+tag@example.com")).toBe(true);
      expect(normalizeSocialValue("email", "user+tag@example.com")).toBe(
        "user+tag@example.com",
      );
    });

    it("normalizes email to lowercase", () => {
      expect(normalizeSocialValue("email", "User@Example.com")).toBe(
        "user@example.com",
      );
    });

    it("rejects email without @", () => {
      expect(isValidSocialValue("email", "userexample.com")).toBe(false);
    });

    it("rejects email with spaces", () => {
      expect(isValidSocialValue("email", "user @example.com")).toBe(false);
    });

    it("rejects mailto: prefix", () => {
      expect(isValidSocialValue("email", "mailto:user@example.com")).toBe(
        false,
      );
    });
  });

  describe("General", () => {
    it("rejects empty string", () => {
      expect(isValidSocialValue("twitter", "")).toBe(false);
    });

    it("rejects whitespace only", () => {
      expect(isValidSocialValue("twitter", "   ")).toBe(false);
    });

    it("normalizes username to lowercase", () => {
      expect(normalizeSocialValue("twitter", "@UserName")).toBe("username");
    });

    it("throws error for invalid value", () => {
      expect(() => normalizeSocialValue("twitter", "invalid!@#")).toThrow();
    });

    it("handles whitespace trimming", () => {
      expect(isValidSocialValue("twitter", "  @username  ")).toBe(true);
      expect(normalizeSocialValue("twitter", "  @username  ")).toBe("username");
    });
  });
});

describe("Social URL Building", () => {
  describe("buildSocialUrl", () => {
    it("builds Twitter URL from username", () => {
      expect(buildSocialUrl("twitter", "username")).toBe(
        "https://x.com/username",
      );
    });

    it("builds Instagram URL from username", () => {
      expect(buildSocialUrl("instagram", "username")).toBe(
        "https://instagram.com/username",
      );
    });

    it("builds WhatsApp URL from phone number", () => {
      expect(buildSocialUrl("whatsapp", "+6281234567890")).toBe(
        "https://wa.me/+6281234567890",
      );
    });

    it("builds email URL from email", () => {
      expect(buildSocialUrl("email", "user@example.com")).toBe(
        "mailto:user@example.com",
      );
    });

    it("returns empty string for empty value", () => {
      expect(buildSocialUrl("twitter", "")).toBe("");
    });
  });
});
