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
import { extractObjectKeyFromUrl } from "@/lib/storage.server";
import { deleteThumbnailFile } from "@/lib/thumbnails.server";
import { isValidHttpUrl } from "@/lib/validation";
import { getSessionOrThrow } from "@/server/auth";

export const getDashboardData = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSessionOrThrow();
    const userProfile = await getProfileByUserId(session.user.id);
    const avatars = await listAvatarsByUserId(session.user.id);
    const allLinks = await listLinks(session.user.id);

    return {
      profile: userProfile,
      avatars,
      links: allLinks,
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
    await addLink({ ...data, userId: session.user.id });
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
    if (oldLink?.thumbnailUrl && oldLink.thumbnailUrl !== data.thumbnailUrl) {
      const oldKey = extractObjectKeyFromUrl(oldLink.thumbnailUrl);
      if (oldKey) {
        await deleteThumbnailFile(session.user.id, oldKey).catch(() => {
          // Ignore deletion errors to not block the update
        });
      }
    }

    await updateLink(session.user.id, data);
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
    if (link?.thumbnailUrl) {
      const key = extractObjectKeyFromUrl(link.thumbnailUrl);
      if (key) {
        await deleteThumbnailFile(session.user.id, key).catch(() => {
          // Ignore deletion errors to not block the deletion
        });
      }
    }

    await deleteLink(session.user.id, id);
  });
