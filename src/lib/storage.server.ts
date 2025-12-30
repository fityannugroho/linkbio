import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

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
  const client = createStorageClient();
  const bucket = getStorageBucket();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return client.send(command);
}

export function buildPublicUrl(objectKey: string) {
  if (!isS3Enabled()) {
    const key = objectKey.replace(/^\/+/, "");
    return `/${key}`;
  }

  // For private buckets, we must proxy the content through our server
  // or return a presigned URL (cached).
  // Given the 'avatars' use case on a public profile, a proxy route is cleaner
  // than managing presigned URL expiration for every viewer.
  const key = objectKey.replace(/^\/+/, "");
  return `/api/s3/${key}`;
}

export function extractObjectKeyFromUrl(url: string | null | undefined) {
  if (!url) return null;

  // Remove leading slash for consistency
  let key = url;
  if (key.startsWith("/")) {
    key = key.slice(1);
  }

  // Remove S3 proxy prefix if present
  if (key.startsWith("api/s3/")) {
    key = key.replace("api/s3/", "");
  }

  return key;
}
