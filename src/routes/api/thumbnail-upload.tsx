import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { buildPublicUrl } from "@/lib/storage.server";
import {
  ALLOWED_THUMBNAIL_CONTENT_TYPES,
  ensureThumbnailObjectKey,
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
        try {
          ensureThumbnailObjectKey(session.user.id, objectKey, "local");
        } catch (error) {
          return new Response(
            error instanceof Error ? error.message : "Invalid thumbnail key",
            { status: 400 },
          );
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

        const destination = path.join(process.cwd(), "public", objectKey);
        await mkdir(path.dirname(destination), { recursive: true });
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(destination, buffer);

        const thumbnailUrl = buildPublicUrl(objectKey);

        return new Response(JSON.stringify({ thumbnailUrl, objectKey }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
