import { createServerFn } from "@tanstack/react-start";
import { listAvatarsByUserId } from "@/data/avatars";
import {
  addLink,
  deleteLink,
  listLinks,
  reorderLinks,
  toggleLinkVisibility,
  updateLink,
} from "@/data/links";
import { getProfileByUserId } from "@/data/profile";
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
  .inputValidator((data: { title: string; url: string }) => {
    if (!data.title.trim()) {
      throw new Error("Title is required");
    }
    if (!isValidHttpUrl(data.url)) {
      throw new Error("URL is invalid");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();
    await addLink({ ...data, userId: session.user.id });
  });

export const updateLinkAction = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; title: string; url: string }) => {
    if (!data.title.trim()) {
      throw new Error("Title is required");
    }
    if (!isValidHttpUrl(data.url)) {
      throw new Error("URL is invalid");
    }
    return data;
  })
  .handler(async ({ data }) => {
    await getSessionOrThrow();
    await updateLink(data);
  });

export const reorderLinksAction = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; newOrder: number }[]) => data)
  .handler(async ({ data }) => {
    await getSessionOrThrow();
    await reorderLinks(data);
  });

export const toggleLinkVisibilityAction = createServerFn({ method: "POST" })
  .inputValidator((data: number) => data)
  .handler(async ({ data: id }) => {
    await getSessionOrThrow();
    await toggleLinkVisibility(id);
  });

export const deleteLinkAction = createServerFn({ method: "POST" })
  .inputValidator((data: number) => data)
  .handler(async ({ data: id }) => {
    await getSessionOrThrow();
    await deleteLink(id);
  });
