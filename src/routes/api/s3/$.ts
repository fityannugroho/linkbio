import { Readable } from "node:stream";
import { createFileRoute } from "@tanstack/react-router";
import { getStorageObject } from "@/lib/storage.server";

export const Route = createFileRoute("/api/s3/$")({
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
          // getStorageObject uses the server-side credentials
          const output = await getStorageObject(key);

          if (!output.Body) {
            return new Response("File not found", { status: 404 });
          }

          // Convert the S3 stream to a Web ReadableStream
          // Node.js S3 SDK returns a Node stream (IncomingMessage) or similar
          // We need to ensure it's compatible with the Web Response API.
          // @aws-sdk/client-s3 Body is "Readable | ReadableStream | Blob"

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
          } else {
            // Assume it's already a web stream or blob
            stream = output.Body as unknown as ReadableStream;
          }

          const headers = new Headers();
          if (output.ContentType) {
            headers.set("Content-Type", output.ContentType);
          }
          if (output.ContentLength) {
            headers.set("Content-Length", output.ContentLength.toString());
          }
          if (output.ETag) {
            headers.set("ETag", output.ETag);
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
            (error.name === "NoSuchKey" || error.name === "NotFound")
          ) {
            return new Response("File not found", { status: 404 });
          }
          console.error("S3 Proxy Error:", error);
          return new Response("Error fetching file", { status: 500 });
        }
      },
    },
  },
});
