import { createServerFn } from "@tanstack/react-start";
import { listAvatarsByUserId } from "@/data/avatars";
import {
  addLink,
  deleteLink,
  getLink,
  listLinks,
  reorderLinks,
  toggleLinkVisibility,
  updateLink,
} from "@/data/links";
import { getProfileByUserId } from "@/data/profile";
import { getPublicUrl } from "@/lib/storage";
import { deleteFile, extractKey } from "@/lib/storage.server";
import { isValidHttpUrl } from "@/lib/validation";
import { getSessionOrThrow } from "@/server/auth";

export const getDashboardData = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSessionOrThrow();
    const userProfile = await getProfileByUserId(session.user.id);
    const avatars = await listAvatarsByUserId(session.user.id);
    const allLinks = await listLinks(session.user.id);

    return {
      profile: userProfile
        ? {
            ...userProfile,
            ...(userProfile.avatarUrl && {
              avatarUrl: getPublicUrl(userProfile.avatarUrl),
            }),
          }
        : null,
      avatars: avatars.map((a) => ({
        ...a,
        url: getPublicUrl(a.url),
      })),
      links: allLinks.map((l) => ({
        ...l,
        ...(l.thumbnailUrl && {
          thumbnailUrl: getPublicUrl(l.thumbnailUrl),
        }),
      })),
    };
  },
);

export const addLinkAction = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { title: string; url: string; thumbnailUrl?: string }) => {
      if (!data.title.trim()) {
        throw new Error("Title is required");
      }
      if (!isValidHttpUrl(data.url)) {
        throw new Error("URL is invalid");
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();
    // Ensure we store the key
    const thumbnailUrl = extractKey(data.thumbnailUrl);
    await addLink({ ...data, userId: session.user.id, thumbnailUrl });
  });

export const updateLinkAction = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id: number;
      title: string;
      url: string;
      thumbnailUrl?: string | null;
    }) => {
      if (!data.title.trim()) {
        throw new Error("Title is required");
      }
      if (!isValidHttpUrl(data.url)) {
        throw new Error("URL is invalid");
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();

    // Check if thumbnail changed
    const oldLink = await getLink(session.user.id, data.id);
    const newKey = extractKey(data.thumbnailUrl);

    if (oldLink?.thumbnailUrl && oldLink.thumbnailUrl !== newKey) {
      // If it's a key (doesn't start with http), delete it
      if (!oldLink.thumbnailUrl.startsWith("http")) {
        await deleteFile(oldLink.thumbnailUrl).catch(() => {
          // Ignore deletion errors
        });
      }
    }

    await updateLink(session.user.id, { ...data, thumbnailUrl: newKey });
  });

export const reorderLinksAction = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; newOrder: number }[]) => data)
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();
    await reorderLinks(session.user.id, data);
  });

export const toggleLinkVisibilityAction = createServerFn({ method: "POST" })
  .inputValidator((data: number) => data)
  .handler(async ({ data: id }) => {
    const session = await getSessionOrThrow();
    await toggleLinkVisibility(session.user.id, id);
  });

export const deleteLinkAction = createServerFn({ method: "POST" })
  .inputValidator((data: number) => data)
  .handler(async ({ data: id }) => {
    const session = await getSessionOrThrow();

    const link = await getLink(session.user.id, id);
    if (link?.thumbnailUrl && !link.thumbnailUrl.startsWith("http")) {
      await deleteFile(link.thumbnailUrl).catch(() => {
        // Ignore deletion errors
      });
    }

    await deleteLink(session.user.id, id);
  });
