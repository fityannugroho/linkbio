import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { profileAvatar } from "@/db/schema";

export async function listAvatarsByUserId(userId: string) {
  return await db
    .select()
    .from(profileAvatar)
    .where(eq(profileAvatar.userId, userId))
    .orderBy(desc(profileAvatar.createdAt));
}

export async function insertAvatar(data: {
  userId: string;
  objectKey: string;
  url: string;
}) {
  const [created] = await db
    .insert(profileAvatar)
    .values({
      userId: data.userId,
      objectKey: data.objectKey,
      url: data.url,
    })
    .returning();
  return created;
}

export async function getAvatarByIdForUser(id: number, userId: string) {
  const result = await db
    .select()
    .from(profileAvatar)
    .where(and(eq(profileAvatar.id, id), eq(profileAvatar.userId, userId)))
    .limit(1);
  return result[0] || null;
}

export async function deleteAvatarById(id: number) {
  await db.delete(profileAvatar).where(eq(profileAvatar.id, id));
}
