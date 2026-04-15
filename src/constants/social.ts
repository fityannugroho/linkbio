import { MailIcon } from "lucide-react";
import { FacebookIcon } from "@/components/icons/Facebook";
import { GitHubIcon } from "@/components/icons/GitHub";
import { LinkedInIcon } from "@/components/icons/LinkedIn";
import { InstagramIcon } from "@/components/icons/Instagram";
import { PinterestIcon } from "@/components/icons/Pinterest";
import { TelegramIcon } from "@/components/icons/Telegram";
import { ThreadsIcon } from "@/components/icons/Threads";
import { TikTokIcon } from "@/components/icons/TikTok";
import { TwitterIcon } from "@/components/icons/Twitter";
import { WhatsAppIcon } from "@/components/icons/WhatsApp";
import { YouTubeIcon } from "@/components/icons/YouTube";

export type SocialItem = {
  key: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  placeholder: string;
  inputLabel: string;
  baseUrl: string;
  validation: RegExp;
};

export const socialItems = [
  {
    key: "twitter",
    label: "X (formerly Twitter)",
    Icon: TwitterIcon,
    placeholder: "@handle or link",
    inputLabel: "Username or Link",
    baseUrl: "https://x.com/",
    validation:
      /^(?:@?|https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/)([a-zA-Z0-9_]{1,15})\/?$/,
  },
  {
    key: "facebook",
    label: "Facebook",
    Icon: FacebookIcon,
    placeholder: "username or link",
    inputLabel: "Username or Link",
    baseUrl: "https://facebook.com/",
    validation:
      /^(?:@?|https?:\/\/(?:www\.)?facebook\.com\/)([a-zA-Z0-9.]{5,50})\/?$/,
  },
  {
    key: "instagram",
    label: "Instagram",
    Icon: InstagramIcon,
    placeholder: "@handle or link",
    inputLabel: "Username or Link",
    baseUrl: "https://instagram.com/",
    validation:
      /^(?:@?|https?:\/\/(?:www\.)?instagram\.com\/)([a-zA-Z0-9._]{1,30})\/?$/,
  },
  {
    key: "threads",
    label: "Threads",
    Icon: ThreadsIcon,
    placeholder: "@handle or link",
    inputLabel: "Username or Link",
    baseUrl: "https://www.threads.net/@",
    validation:
      /^(?:@?|https?:\/\/(?:www\.)?threads\.net\/@?)([a-zA-Z0-9._]{1,30})\/?$/,
  },
  {
    key: "pinterest",
    label: "Pinterest",
    Icon: PinterestIcon,
    placeholder: "@handle or link",
    inputLabel: "Username or Link",
    baseUrl: "https://pinterest.com/",
    validation:
      /^(?:@?|https?:\/\/(?:www\.)?(?:pinterest\.com|pinterest\.[a-z]{2,3})\/)([a-zA-Z0-9_]{1,30})\/?$/,
  },
  {
    key: "github",
    label: "GitHub",
    Icon: GitHubIcon,
    placeholder: "username or link",
    inputLabel: "Username or Link",
    baseUrl: "https://github.com/",
    validation:
      /^(?:@?|https?:\/\/(?:www\.)?github\.com\/)([a-zA-Z0-9-]{1,39})\/?$/,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    Icon: LinkedInIcon,
    placeholder: "username or link",
    inputLabel: "Username or Link",
    baseUrl: "https://linkedin.com/in/",
    validation:
      /^(?:@?|https?:\/\/(?:www\.)?linkedin\.com\/in\/)([a-zA-Z0-9-]{1,100})\/?$/,
  },
  {
    key: "youtube",
    label: "YouTube",
    Icon: YouTubeIcon,
    placeholder: "@handle or link",
    inputLabel: "Username or Link",
    baseUrl: "https://youtube.com/@",
    validation:
      /^(?:@?|https?:\/\/(?:www\.)?(?:youtube\.com\/@|youtu\.be\/))([a-zA-Z0-9._-]{1,30})\/?$/,
  },
  {
    key: "tiktok",
    label: "TikTok",
    Icon: TikTokIcon,
    placeholder: "@handle or link",
    inputLabel: "Username or Link",
    baseUrl: "https://www.tiktok.com/@",
    validation:
      /^(?:@?|https?:\/\/(?:www\.)?tiktok\.com\/@?)([a-zA-Z0-9._-]{1,30})\/?$/,
  },
  {
    key: "telegram",
    label: "Telegram",
    Icon: TelegramIcon,
    placeholder: "@handle or link",
    inputLabel: "Username or Link",
    baseUrl: "https://t.me/",
    validation: /^(?:@?|https?:\/\/t\.me\/)([a-zA-Z0-9_]{1,32})\/?$/,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    Icon: WhatsAppIcon,
    placeholder: "+6281234567890",
    inputLabel: "WhatsApp Number",
    baseUrl: "https://wa.me/",
    validation: /^(\+[1-9]\d{1,14})$/,
  },
  {
    key: "email",
    label: "Email",
    Icon: MailIcon,
    placeholder: "email@example.com",
    inputLabel: "Email Address",
    baseUrl: "mailto:",
    validation: /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
  },
] as const satisfies SocialItem[];

export type SocialPlatform = (typeof socialItems)[number]["key"];

export const socialItemByKey = Object.fromEntries(
  socialItems.map((item) => [item.key, item]),
) as Record<SocialPlatform, SocialItem>;
