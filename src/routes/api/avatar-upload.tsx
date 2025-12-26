import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import { insertAvatar } from "@/data/avatars";
import { updateProfileAvatar } from "@/data/profile";
import { auth } from "@/lib/auth";
import {
  ALLOWED_AVATAR_CONTENT_TYPES,
  ensureAvatarObjectKey,
  MAX_AVATAR_SIZE,
} from "@/lib/avatars.server";
import { buildPublicUrl } from "@/lib/storage.server";

export const Route = createFileRoute("/api/avatar-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });
        if (!session) {
          return new Response("Unauthorized", { status: 401 });
        }

        const url = new URL(request.url);
        const objectKey = url.searchParams.get("key") || "";
        try {
          ensureAvatarObjectKey(session.user.id, objectKey, "local");
        } catch (error) {
          return new Response(
            error instanceof Error ? error.message : "Invalid avatar key",
            { status: 400 },
          );
        }

        const formData = await request.formData();
        const file = formData.get("file");
        if (!file || !(file instanceof File)) {
          return new Response("Missing file", { status: 400 });
        }

        if (!ALLOWED_AVATAR_CONTENT_TYPES.has(file.type)) {
          return new Response("Only image uploads are allowed", {
            status: 400,
          });
        }

        if (file.size > MAX_AVATAR_SIZE) {
          return new Response("Avatar must be 10MB or less", { status: 400 });
        }

        const destination = path.join(process.cwd(), "public", objectKey);
        await mkdir(path.dirname(destination), { recursive: true });
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(destination, buffer);

        const urlPath = buildPublicUrl(objectKey);
        const avatar = await insertAvatar({
          userId: session.user.id,
          objectKey,
          url: urlPath,
        });
        await updateProfileAvatar(session.user.id, urlPath);

        return new Response(JSON.stringify({ avatar }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
