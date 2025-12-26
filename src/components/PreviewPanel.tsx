import { useMemo } from "react";
import type { ProfileWithDetails } from "@/types/profile";

type Link = typeof import("@/db/schema").links.$inferSelect;

type PreviewPanelProps = {
  profile: ProfileWithDetails | null;
  links: Link[];
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
};

const stableStringify = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b),
  );
  return `{${entries
    .map(([key, val]) => `${key}:${stableStringify(val)}`)
    .join(",")}}`;
};

export function PreviewPanel({ profile, links }: PreviewPanelProps) {
  const previewScale = 0.7;
  const previewKey = useMemo(() => {
    if (!profile) return "";
    const profileKey = stableStringify({
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      socials: profile.socials,
      design: profile.design,
    });
    const linksKey = links
      .map(
        (link) =>
          `${link.id}:${link.title}:${link.url}:${link.isVisible}:${link.order}`,
      )
      .join("|");
    return hashString(`${profileKey}-${linksKey}`);
  }, [profile, links]);

  const iframeSrc = previewKey ? `/?preview=${previewKey}` : "/";
  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Preview</h2>
      </div>

      <div className="mt-4 flex-1 flex items-start justify-center">
        <div className="w-70 h-130 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          {profile ? (
            <div className="relative h-full w-full overflow-hidden">
              <iframe
                title="Public profile preview"
                key={previewKey}
                src={iframeSrc}
                className="border-0 absolute top-0 left-1/2 block"
                style={{
                  transform: `translateX(-50%) scale(${previewScale})`,
                  transformOrigin: "top center",
                  width: `${100 / previewScale}%`,
                  height: `${100 / previewScale}%`,
                }}
              />
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
              Preview will appear after you save your profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
