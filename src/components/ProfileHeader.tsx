import { Camera, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { socialItems } from "@/constants/social";
import { cn } from "@/lib/utils";
import type { SocialPlatform } from "@/lib/validation";

import type { ProfileWithDetails } from "@/types/profile";

type ProfileHeaderProps = {
  profile: ProfileWithDetails | null;
  onEditProfile: () => void;
  onEditSocial: (key?: SocialPlatform) => void;
  onEditAvatar: () => void;
  className?: string;
};

export function ProfileHeader({
  profile,
  onEditProfile,
  onEditSocial,
  onEditAvatar,
  className,
}: ProfileHeaderProps) {
  const hasSocials = (profile?.socials?.length || 0) > 0;

  return (
    <div
      className={cn(
        `flex flex-col gap-4 md:flex-row md:items-center md:justify-between`,
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onEditAvatar}
          className="group relative"
          title="Edit avatar"
        >
          <Avatar className="h-14 w-14 border">
            <AvatarImage src={profile?.avatarUrl || ""} alt="Profile" />
            <AvatarFallback>
              {profile?.displayName?.slice(0, 2).toUpperCase() || "LT"}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-background bg-muted text-muted-foreground shadow-sm transition group-hover:bg-background">
            <Camera size={12} />
          </span>
        </button>
        <div className="flex flex-col items-start">
          <Button
            onClick={onEditProfile}
            variant="link"
            className="p-0 flex-col gap-0 items-start mb-1.5 h-auto underline-offset-2"
            title="Edit title and bio"
          >
            <span className="text-lg font-semibold text-foreground">
              {profile?.displayName || "Your title"}
            </span>
            {profile?.bio && (
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            )}
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {hasSocials
              ? profile?.socials
                  ?.slice()
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((social) => {
                    const item = socialItems.find(
                      (i) => i.key === social.platform,
                    );
                    if (!item || !social.value) return null;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onEditSocial(item.key)}
                        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted transition-colors"
                        title={`Edit ${item.label}`}
                      >
                        <item.Icon size={18} />
                      </button>
                    );
                  })
              : ["instagram", "twitter", "youtube"].map((key) => {
                  const item = socialItems.find((i) => i.key === key);
                  if (!item) return null;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onEditSocial(item.key as SocialPlatform)}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground hover:bg-muted transition-colors"
                      title={`Add ${item.label}`}
                    >
                      <item.Icon size={18} className="opacity-50" />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-background bg-muted text-muted-foreground shadow-sm">
                        <Plus size={8} />
                      </span>
                    </button>
                  );
                })}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => onEditSocial()}
              title="Edit social icons"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
