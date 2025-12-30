import { createFileRoute } from "@tanstack/react-router";
import { insertAvatar } from "@/data/avatars";
import { updateProfileAvatar } from "@/data/profile";
import { auth } from "@/lib/auth";
import {
  ALLOWED_AVATAR_CONTENT_TYPES,
  MAX_AVATAR_SIZE,
} from "@/lib/avatars.server";
import { getPublicUrl } from "@/lib/storage";
import { uploadFile } from "@/lib/storage.server";

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
        if (!objectKey || !objectKey.startsWith("avatars/")) {
          return new Response("Invalid avatar key", { status: 400 });
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

        const buffer = Buffer.from(await file.arrayBuffer());
        await uploadFile(buffer, objectKey, file.type);

        const avatar = await insertAvatar({
          userId: session.user.id,
          objectKey,
          url: objectKey,
        });
        await updateProfileAvatar(session.user.id, objectKey);

        return new Response(
          JSON.stringify({
            avatar: {
              ...avatar,
              url: getPublicUrl(avatar.url),
            },
          }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      },
    },
  },
});
