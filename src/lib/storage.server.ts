import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

type StorageConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
  forcePathStyle: boolean;
  region: string;
};

function getStorageConfig(): StorageConfig {
  const {
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_BUCKET,
    S3_ENDPOINT,
    S3_REGION,
    S3_FORCE_PATH_STYLE,
  } = process.env;

  if (!isS3Enabled()) {
    throw new Error("S3 is disabled");
  }

  if (!S3_ACCESS_KEY_ID) {
    throw new Error("S3_ACCESS_KEY_ID is missing");
  }
  if (!S3_SECRET_ACCESS_KEY) {
    throw new Error("S3_SECRET_ACCESS_KEY is missing");
  }
  if (!S3_BUCKET) {
    throw new Error("S3_BUCKET is missing");
  }
  if (!S3_ENDPOINT) {
    throw new Error("S3_ENDPOINT is missing");
  }
  if (!S3_REGION) {
    throw new Error("S3_REGION is missing");
  }

  return {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    bucket: S3_BUCKET,
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    forcePathStyle: S3_FORCE_PATH_STYLE === "true",
  };
}

export function isS3Enabled() {
  return process.env.S3_ENABLED === "true";
}

export function createStorageClient() {
  const config = getStorageConfig();
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function getStorageBucket() {
  return getStorageConfig().bucket;
}

export async function getStorageObject(key: string) {
  if (isS3Enabled()) {
    const client = createStorageClient();
    const bucket = getStorageBucket();
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return client.send(command);
  }

  const filePath = path.join(process.cwd(), "public", "media", key);
  const body = await readFile(filePath);
  // Mock S3-like response for local files
  return {
    Body: body,
    ContentType: getContentTypeFromPath(filePath),
  };
}

export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string,
) {
  if (isS3Enabled()) {
    const client = createStorageClient();
    const command = new PutObjectCommand({
      Bucket: getStorageBucket(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    return client.send(command);
  }

  const filePath = path.join(process.cwd(), "public", "media", key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
}

export async function deleteFile(key: string) {
  if (isS3Enabled()) {
    const client = createStorageClient();
    const command = new DeleteObjectCommand({
      Bucket: getStorageBucket(),
      Key: key,
    });
    return client.send(command);
  }

  const filePath = path.join(process.cwd(), "public", "media", key);
  await rm(filePath, { force: true });
}

export function extractKey(url: string | null | undefined): string | null {
  if (!url) return null;

  // If it starts with our API prefixes, extract the key
  if (url.startsWith("/api/storage/")) {
    return url.replace("/api/storage/", "");
  }
  if (url.startsWith("/api/s3/")) {
    return url.replace("/api/s3/", "");
  }

  // Handle media folder prefix if present
  if (url.startsWith("/media/")) {
    return url.replace("/media/", "");
  }

  // If it's a full URL, we might need a more complex regex if they are from a specific domain,
  // but usually our database will either have a key or a relative /api/... path now.
  // For legacy full URLs, we can try to find avatars/ or thumbnails/
  if (url.startsWith("http")) {
    const avatarMatch = url.match(/\/avatars\/(.+)$/);
    if (avatarMatch) return `avatars/${avatarMatch[1]}`;
    const thumbnailMatch = url.match(/\/thumbnails\/(.+)$/);
    if (thumbnailMatch) return `thumbnails/${thumbnailMatch[1]}`;
  }

  return url;
}

function getContentTypeFromPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}
