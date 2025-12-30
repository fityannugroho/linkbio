import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { getPublicUrl } from "@/lib/storage";
import { uploadFile } from "@/lib/storage.server";
import {
  ALLOWED_THUMBNAIL_CONTENT_TYPES,
  MAX_THUMBNAIL_SIZE,
} from "@/lib/thumbnails.server";

export const Route = createFileRoute("/api/thumbnail-upload")({
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
        if (!objectKey || !objectKey.startsWith("thumbnails/")) {
          return new Response("Invalid thumbnail key", { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get("file");
        if (!file || !(file instanceof File)) {
          return new Response("Missing file", { status: 400 });
        }

        if (!ALLOWED_THUMBNAIL_CONTENT_TYPES.has(file.type)) {
          return new Response("Only image uploads are allowed", {
            status: 400,
          });
        }

        if (file.size > MAX_THUMBNAIL_SIZE) {
          return new Response("Thumbnail must be 5MB or less", { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        await uploadFile(buffer, objectKey, file.type);

        return new Response(
          JSON.stringify({ thumbnailUrl: getPublicUrl(objectKey), objectKey }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      },
    },
  },
});
