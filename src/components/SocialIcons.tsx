import { socialItems } from "@/constants/social";
import { buildSocialUrl } from "@/lib/social";
import { getUmami } from "@/lib/umami";
import { cn } from "@/lib/utils";
import type { ProfileSocial } from "@/types/profile";

type SocialIconsProps = {
  socials: ProfileSocial[];
  enableTracking?: boolean;
  className?: string;
};

export function SocialIcons({
  socials,
  enableTracking = true,
  className,
}: SocialIconsProps) {
  const visibleSocials = socials
    .filter((s) => s.isVisible !== false && s.value)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (visibleSocials.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap justify-center gap-4", className)}>
      {visibleSocials.map((social) => {
        const item = socialItems.find((i) => i.key === social.platform);
        if (!item) return null;

        const Icon = item.Icon;

        const value = social.value;
        if (!value) return null;

        const url = buildSocialUrl(social.platform, value);

        return (
          <a
            key={social.platform}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="hover:scale-110 transition-transform text-current opacity-80 hover:opacity-100"
            onClick={() => {
              if (!enableTracking) return;
              const umami = getUmami();
              umami?.track("click-social", {
                platform: social.platform,
                url,
              });
            }}
          >
            <Icon className="h-6 w-6" />
          </a>
        );
      })}
    </div>
  );
}
