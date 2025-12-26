import {
  Github,
  Instagram,
  Linkedin,
  type LucideProps,
  Twitter,
  Youtube,
} from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { SocialPlatform } from "@/lib/validation";

export type SocialItem = {
  key: SocialPlatform;
  label: string;
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  placeholder: string;
  inputType: "username" | "url" | "both"; // username: @handle, url: full URL, both: either
};

export const socialItems: SocialItem[] = [
  {
    key: "twitter",
    label: "X (formerly Twitter)",
    Icon: Twitter,
    placeholder: "@handle",
    inputType: "username",
  },
  {
    key: "instagram",
    label: "Instagram",
    Icon: Instagram,
    placeholder: "@handle",
    inputType: "username",
  },
  {
    key: "github",
    label: "GitHub",
    Icon: Github,
    placeholder: "username",
    inputType: "username",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    Icon: Linkedin,
    placeholder: "username or full URL",
    inputType: "both",
  },
  {
    key: "youtube",
    label: "YouTube",
    Icon: Youtube,
    placeholder: "@handle or full URL",
    inputType: "both",
  },
];

export const defaultSocialOrder = socialItems.map((item) => item.key);
