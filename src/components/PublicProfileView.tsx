import { SocialIcons } from "@/components/SocialIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUmami } from "@/lib/umami";
import { cn } from "@/lib/utils";
import type { ProfileWithDetails } from "@/types/profile";

type Link = typeof import("@/db/schema").links.$inferSelect;

type PublicProfileViewProps = {
  profile: ProfileWithDetails | null;
  links: Link[];
  enableTracking?: boolean;
  showFooter?: boolean;
  variant?: "page" | "preview";
};

export function PublicProfileView({
  profile,
  links,
  enableTracking = true,
  showFooter = true,
  variant = "page",
}: PublicProfileViewProps) {
  if (!profile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <div className="text-center">
          <p className="text-lg">No profile found</p>
        </div>
      </div>
    );
  }

  const design = profile.design || {};

  // Build background style from design
  const bgType = design["wallpaper.type"] || "solid";
  const bgStyle =
    bgType === "gradient"
      ? {
          backgroundImage: `linear-gradient(${
            design["wallpaper.gradient_direction"] || "to bottom"
          }, ${design["wallpaper.gradient_from"] || "#18181b"}, ${
            design["wallpaper.gradient_to"] || "#09090b"
          })`,
        }
      : {
          backgroundColor: design["wallpaper.solid_color"] || "#18181b",
        };

  const fontColor = design["text.color"] || "#ffffff";
  const buttonStyle = design["button.style"] || "default";
  const isPreview = variant === "preview";

  const socialPosition =
    (design["social_icons.position"] as "top" | "bottom") || "top";

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center transition-colors px-1",
        isPreview
          ? "h-full overflow-y-auto pt-8 pb-12 px-4"
          : "min-h-screen py-12 px-4",
      )}
      style={{ ...bgStyle, color: fontColor }}
    >
      <div className="mb-8 text-center max-w-md w-full">
        <Avatar className="h-24 w-24 mx-auto mb-4 shadow-xl">
          <AvatarImage
            src={profile.avatarUrl || ""}
            alt={profile.displayName}
          />
          <AvatarFallback>
            {profile.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold tracking-tight">
          {profile.displayName}
        </h1>
        {profile.bio && (
          <p className="mt-2 text-sm opacity-80">{profile.bio}</p>
        )}

        {socialPosition === "top" && (
          <SocialIcons
            socials={profile.socials}
            enableTracking={enableTracking}
            className="mt-6"
          />
        )}
      </div>

      <div className="flex flex-col gap-4 w-full max-w-lg mb-8">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="w-full group"
            onClick={() => {
              if (!enableTracking) return;
              const umami = getUmami();
              umami?.track("click-link", {
                id: link.id,
                title: link.title,
                url: link.url,
              });
            }}
          >
            <div
              className={cn(
                "w-full min-h-[64px] py-4 rounded-full text-center font-medium transition-all duration-300 ease-out",
                "hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center relative",
                link.thumbnailUrl ? "px-16" : "px-6",
                {
                  "border-2 border-current hover:bg-current/10":
                    buttonStyle === "outline",
                  "bg-current/10 backdrop-blur-md backdrop-saturate-150 border border-current/30 hover:bg-current/20 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]":
                    buttonStyle === "glass",
                  "bg-white text-black hover:bg-gray-50 shadow-md hover:shadow-xl":
                    buttonStyle === "default",
                },
              )}
              style={
                buttonStyle === "default" || buttonStyle === "glass"
                  ? undefined
                  : { borderColor: fontColor }
              }
            >
              {link.thumbnailUrl && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 overflow-hidden rounded-full">
                  <img
                    src={link.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <span className="line-clamp-2 wrap-break-word text-sm sm:text-base">
                {link.title}
              </span>
            </div>
          </a>
        ))}
        {links.length === 0 && (
          <div className="text-center opacity-50 text-sm mt-4">
            No links added yet.
          </div>
        )}
      </div>

      {socialPosition === "bottom" && (
        <SocialIcons
          socials={profile.socials}
          enableTracking={enableTracking}
          className="mt-6"
        />
      )}

      {showFooter && (
        <footer className="mt-auto pt-8 pb-4 text-xs opacity-40">
          <a href="/" className="hover:underline">
            LinkBio
          </a>
        </footer>
      )}
    </div>
  );
}
