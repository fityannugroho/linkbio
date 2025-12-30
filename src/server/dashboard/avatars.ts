import { PutObjectCommand } from "@aws-sdk/client-s3";
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
  MAX_AVATAR_SIZE,
} from "@/lib/avatars.server";
import { getPublicUrl } from "@/lib/storage";
import {
  createStorageClient,
  deleteFile,
  getStorageBucket,
  isS3Enabled,
} from "@/lib/storage.server";
import { getSessionOrThrow } from "@/server/auth";

export const listAvatarsAction = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSessionOrThrow();
    const avatars = await listAvatarsByUserId(session.user.id);
    return avatars.map((avatar) => ({
      ...avatar,
      url: getPublicUrl(avatar.url),
    }));
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
    const objectKey = createAvatarObjectKey(session.user.id, data.contentType);

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
      publicUrl: getPublicUrl(objectKey),
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
    const created = await insertAvatar({
      userId: session.user.id,
      objectKey: data.objectKey,
      url: data.objectKey,
    });
    await updateProfileAvatar(session.user.id, data.objectKey);
    return {
      ...created,
      url: getPublicUrl(created.url),
    };
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
    return {
      ...avatar,
      url: getPublicUrl(avatar.url),
    };
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

    await deleteFile(avatar.objectKey);
    await deleteAvatarById(avatar.id);
    await clearProfileAvatarIfMatches(session.user.id, avatar.url);
    return { deletedId: avatar.id };
  });
