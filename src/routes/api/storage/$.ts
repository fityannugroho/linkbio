import { Readable } from "node:stream";
import { createFileRoute } from "@tanstack/react-router";
import { getStorageObject } from "@/lib/storage.server";

export const Route = createFileRoute("/api/storage/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params._splat;
        if (!key) {
          return new Response("Missing file key", { status: 400 });
        }

        // Security: Prevent path traversal
        if (key.includes("..")) {
          return new Response("Invalid key", { status: 400 });
        }

        try {
          // getStorageObject handles both S3 and local storage
          const output = await getStorageObject(key);

          if (!output.Body) {
            return new Response("File not found", { status: 404 });
          }

          let stream: ReadableStream;
          if (output.Body instanceof Readable) {
            // Convert Node.js Readable to Web ReadableStream
            stream = new ReadableStream({
              start(controller) {
                (output.Body as Readable).on("data", (chunk) =>
                  controller.enqueue(chunk),
                );
                (output.Body as Readable).on("end", () => controller.close());
                (output.Body as Readable).on("error", (err) =>
                  controller.error(err),
                );
              },
            });
          } else if (
            output.Body instanceof Uint8Array ||
            Buffer.isBuffer(output.Body)
          ) {
            // If it's a buffer (local files), creating a Response from it is easy
            return new Response(output.Body, {
              status: 200,
              headers: {
                "Content-Type":
                  output.ContentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            });
          } else {
            // Assume it's already a web stream or blob
            stream = output.Body as unknown as ReadableStream;
          }

          const headers = new Headers();
          if (output.ContentType) {
            headers.set("Content-Type", output.ContentType);
          }
          // Cache control for performance (e.g., 1 year immutable)
          headers.set("Cache-Control", "public, max-age=31536000, immutable");

          return new Response(stream, {
            status: 200,
            headers,
          });
        } catch (error) {
          if (
            error instanceof Error &&
            (error.name === "NoSuchKey" ||
              error.name === "NotFound" ||
              (error as { code?: string }).code === "ENOENT")
          ) {
            return new Response("File not found", { status: 404 });
          }
          console.error("Storage Error:", error);
          return new Response("Error fetching file", { status: 500 });
        }
      },
    },
  },
});
