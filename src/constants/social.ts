import { LinkedinIcon, MailIcon } from "lucide-react";
import { GitHubIcon } from "@/components/icons/GitHub";
import { InstagramIcon } from "@/components/icons/Instagram";
import { TikTokIcon } from "@/components/icons/TikTok";
import { TwitterIcon } from "@/components/icons/Twitter";
import { YouTubeIcon } from "@/components/icons/YouTube";
import type { SocialPlatform } from "@/lib/validation";

export type SocialItem = {
  key: SocialPlatform;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  placeholder: string;
  inputType: "username" | "url" | "both"; // username: @handle, url: full URL, both: either
};

export const socialItems: SocialItem[] = [
  {
    key: "twitter",
    label: "X (formerly Twitter)",
    Icon: TwitterIcon,
    placeholder: "@handle",
    inputType: "username",
  },
  {
    key: "instagram",
    label: "Instagram",
    Icon: InstagramIcon,
    placeholder: "@handle",
    inputType: "username",
  },
  {
    key: "github",
    label: "GitHub",
    Icon: GitHubIcon,
    placeholder: "username",
    inputType: "username",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    Icon: LinkedinIcon,
    placeholder: "username or full URL",
    inputType: "both",
  },
  {
    key: "youtube",
    label: "YouTube",
    Icon: YouTubeIcon,
    placeholder: "@handle or full URL",
    inputType: "both",
  },
  {
    key: "tiktok",
    label: "TikTok",
    Icon: TikTokIcon,
    placeholder: "@handle",
    inputType: "username",
  },
  {
    key: "email",
    label: "Email",
    Icon: MailIcon,
    placeholder: "email address",
    inputType: "url",
  },
];

export const defaultSocialOrder = socialItems.map((item) => item.key);
