import { rm } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServerFn } from "@tanstack/react-start";
import {
  deleteAvatarById,
  getAvatarByIdForUser,
  insertAvatar,
  listAvatarsByUserId,
} from "@/data/avatars";
import {
  clearProfileAvatarIfMatches,
  updateProfileAvatar,
} from "@/data/profile";
import {
  ALLOWED_AVATAR_CONTENT_TYPES,
  createAvatarObjectKey,
  ensureAvatarObjectKey,
  MAX_AVATAR_SIZE,
} from "@/lib/avatars.server";
import {
  buildPublicUrl,
  createStorageClient,
  getStorageBucket,
  isS3Enabled,
} from "@/lib/storage.server";
import { getSessionOrThrow } from "@/server/auth";

export const listAvatarsAction = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSessionOrThrow();
    return await listAvatarsByUserId(session.user.id);
  },
);

export const createAvatarUploadAction = createServerFn({ method: "POST" })
  .inputValidator((data: { contentType: string; size: number }) => {
    if (!ALLOWED_AVATAR_CONTENT_TYPES.has(data.contentType)) {
      throw new Error("Only image uploads are allowed");
    }
    if (data.size > MAX_AVATAR_SIZE) {
      throw new Error("Avatar must be 10MB or less");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();
    const mode = isS3Enabled() ? "s3" : "local";
    const objectKey = createAvatarObjectKey(
      session.user.id,
      data.contentType,
      mode,
    );

    if (!isS3Enabled()) {
      return {
        uploadUrl: `/api/avatar-upload?key=${encodeURIComponent(objectKey)}`,
        uploadMethod: "POST",
        objectKey,
        requiresSave: false,
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
      uploadMethod: "PUT",
      objectKey,
      requiresSave: true,
      publicUrl: buildPublicUrl(objectKey),
    };
  });

export const saveAvatarAction = createServerFn({ method: "POST" })
  .inputValidator((data: { objectKey: string }) => {
    if (!data.objectKey.trim()) {
      throw new Error("Avatar key is missing");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();
    ensureAvatarObjectKey(session.user.id, data.objectKey, "s3");
    const url = buildPublicUrl(data.objectKey);
    const created = await insertAvatar({
      userId: session.user.id,
      objectKey: data.objectKey,
      url,
    });
    await updateProfileAvatar(session.user.id, url);
    return created;
  });

export const setProfileAvatarAction = createServerFn({ method: "POST" })
  .inputValidator((data: { avatarId: number }) => data)
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();
    const avatar = await getAvatarByIdForUser(data.avatarId, session.user.id);
    if (!avatar) {
      throw new Error("Avatar not found");
    }
    await updateProfileAvatar(session.user.id, avatar.url);
    return avatar;
  });

export const clearProfileAvatarAction = createServerFn({ method: "POST" })
  .inputValidator((data: { confirmed: boolean }) => data)
  .handler(async ({ data }) => {
    if (!data.confirmed) {
      throw new Error("Avatar removal not confirmed");
    }
    const session = await getSessionOrThrow();
    await updateProfileAvatar(session.user.id, null);
  });

export const deleteAvatarAction = createServerFn({ method: "POST" })
  .inputValidator((data: { avatarId: number }) => data)
  .handler(async ({ data }) => {
    const session = await getSessionOrThrow();
    const avatar = await getAvatarByIdForUser(data.avatarId, session.user.id);
    if (!avatar) {
      throw new Error("Avatar not found");
    }

    if (isS3Enabled()) {
      const client = createStorageClient();
      await client.send(
        new DeleteObjectCommand({
          Bucket: getStorageBucket(),
          Key: avatar.objectKey,
        }),
      );
    } else {
      ensureAvatarObjectKey(session.user.id, avatar.objectKey, "local");
      const targetPath = path.join(process.cwd(), "public", avatar.objectKey);
      await rm(targetPath, { force: true });
    }

    await deleteAvatarById(avatar.id);
    await clearProfileAvatarIfMatches(session.user.id, avatar.url);
    return { deletedId: avatar.id };
  });
