import { LinkedinIcon, MailIcon } from "lucide-react";
import { GitHubIcon } from "@/components/icons/GitHub";
import { InstagramIcon } from "@/components/icons/Instagram";
import { ThreadsIcon } from "@/components/icons/Threads";
import { TikTokIcon } from "@/components/icons/TikTok";
import { TwitterIcon } from "@/components/icons/Twitter";
import { YouTubeIcon } from "@/components/icons/YouTube";

export type SocialItem = {
  key: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  placeholder: string;
  inputType: "username" | "url" | "both";
  baseUrl: string;
};

export const socialItems = [
  {
    key: "twitter",
    label: "X (formerly Twitter)",
    Icon: TwitterIcon,
    placeholder: "@handle",
    inputType: "username",
    baseUrl: "https://twitter.com/",
  },
  {
    key: "instagram",
    label: "Instagram",
    Icon: InstagramIcon,
    placeholder: "@handle",
    inputType: "username",
    baseUrl: "https://instagram.com/",
  },
  {
    key: "threads",
    label: "Threads",
    Icon: ThreadsIcon,
    placeholder: "@handle",
    inputType: "username",
    baseUrl: "https://www.threads.net/@",
  },
  {
    key: "github",
    label: "GitHub",
    Icon: GitHubIcon,
    placeholder: "username",
    inputType: "username",
    baseUrl: "https://github.com/",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    Icon: LinkedinIcon,
    placeholder: "username or full URL",
    inputType: "both",
    baseUrl: "https://linkedin.com/in/",
  },
  {
    key: "youtube",
    label: "YouTube",
    Icon: YouTubeIcon,
    placeholder: "@handle or full URL",
    inputType: "both",
    baseUrl: "https://youtube.com/@",
  },
  {
    key: "tiktok",
    label: "TikTok",
    Icon: TikTokIcon,
    placeholder: "@handle",
    inputType: "username",
    baseUrl: "https://www.tiktok.com/@",
  },
  {
    key: "email",
    label: "Email",
    Icon: MailIcon,
    placeholder: "email address",
    inputType: "url",
    baseUrl: "mailto:",
  },
] as const satisfies SocialItem[];

export type SocialPlatform = (typeof socialItems)[number]["key"];

export const socialItemByKey = Object.fromEntries(
  socialItems.map((item) => [item.key, item]),
) as Record<SocialPlatform, SocialItem>;
