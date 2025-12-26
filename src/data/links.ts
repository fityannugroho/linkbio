import { eq } from "drizzle-orm";
import { db } from "@/db";
import { links } from "@/db/schema";

export const listLinks = async (userId: string) =>
  db.select().from(links).where(eq(links.userId, userId)).orderBy(links.order);

export const addLink = async (data: {
  userId: string;
  title: string;
  url: string;
}) => {
  const existing = await listLinks(data.userId);
  const newOrder =
    existing.length > 0
      ? Math.max(...existing.map((link) => link.order)) + 1
      : 0;

  await db.insert(links).values({
    userId: data.userId,
    title: data.title,
    url: data.url,
    isVisible: true,
    order: newOrder,
  });
};

export const updateLink = async (data: {
  id: number;
  title: string;
  url: string;
}) => {
  await db
    .update(links)
    .set({
      title: data.title,
      url: data.url,
    })
    .where(eq(links.id, data.id));
};

export const reorderLinks = async (
  data: { id: number; newOrder: number }[],
) => {
  for (const item of data) {
    await db
      .update(links)
      .set({ order: item.newOrder })
      .where(eq(links.id, item.id));
  }
};

export const toggleLinkVisibility = async (id: number) => {
  const link = await db.select().from(links).where(eq(links.id, id));
  if (link[0]) {
    await db
      .update(links)
      .set({ isVisible: !link[0].isVisible })
      .where(eq(links.id, id));
  }
};

export const deleteLink = async (id: number) => {
  await db.delete(links).where(eq(links.id, id));
};
