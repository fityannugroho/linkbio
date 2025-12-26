import { eq } from "drizzle-orm";
import { db } from "@/db";
import { designs } from "@/db/schema";

export async function getDesignsByUserId(userId: string) {
  return await db.select().from(designs).where(eq(designs.userId, userId));
}

export async function upsertDesigns(
  userId: string,
  data: Record<string, string | null>,
) {
  for (const [attribute, value] of Object.entries(data)) {
    await db
      .insert(designs)
      .values({
        userId,
        attribute,
        value,
      })
      .onConflictDoUpdate({
        target: [designs.userId, designs.attribute],
        set: { value, updatedAt: new Date() },
      });
  }
}

export async function clearDesigns(userId: string) {
  await db.delete(designs).where(eq(designs.userId, userId));
}
