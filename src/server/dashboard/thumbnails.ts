import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServerFn } from "@tanstack/react-start";
import {
  buildPublicUrl,
  createStorageClient,
  getStorageBucket,
  isS3Enabled,
} from "@/lib/storage.server";
import {
  ALLOWED_THUMBNAIL_CONTENT_TYPES,
  createThumbnailObjectKey,
  deleteThumbnailFile,
  MAX_THUMBNAIL_SIZE,
} from "@/lib/thumbnails.server";
import { getSessionOrThrow } from "@/server/auth";

export const createThumbnailUploadAction = createServerFn({ method: "POST" })
  .inputValidator((data: { contentType: string; size: number }) => {
    if (!ALLOWED_THUMBNAIL_CONTENT_TYPES.has(data.contentType)) {
      throw new Error("Only image uploads are allowed");
    }
    if (data.size > MAX_THUMBNAIL_SIZE) {
      throw new Error("Thumbnail must be 5MB or less");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();
    const mode = isS3Enabled() ? "s3" : "local";
    const objectKey = createThumbnailObjectKey(
      session.user.id,
      data.contentType,
      mode,
    );

    if (!isS3Enabled()) {
      return {
        uploadUrl: `/api/thumbnail-upload?key=${encodeURIComponent(objectKey)}`,
        uploadMethod: "POST" as const,
        objectKey,
        thumbnailUrl: buildPublicUrl(objectKey),
      };
    }

    const client = createStorageClient();
    const command = new PutObjectCommand({
      Bucket: getStorageBucket(),
      Key: objectKey,
      ContentType: data.contentType,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

    return {
      uploadUrl,
      uploadMethod: "PUT" as const,
      objectKey,
      thumbnailUrl: buildPublicUrl(objectKey),
    };
  });

export const deleteThumbnailAction = createServerFn({ method: "POST" })
  .inputValidator((data: { objectKey: string }) => {
    if (!data.objectKey.trim()) {
      throw new Error("Thumbnail key is missing");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();
    await deleteThumbnailFile(session.user.id, data.objectKey);
    return { deleted: true };
  });
