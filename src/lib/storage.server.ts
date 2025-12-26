import { S3Client } from "@aws-sdk/client-s3";

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

export function buildPublicUrl(objectKey: string) {
  if (!isS3Enabled()) {
    const key = objectKey.replace(/^\/+/, "");
    return `/${key}`;
  }

  const { endpoint, bucket, forcePathStyle } = getStorageConfig();
  const base = endpoint.replace(/\/+$/, "");
  const key = objectKey.replace(/^\/+/, "");

  if (forcePathStyle) {
    // Path-style: https://s3.provider.com/{bucket}/{key}
    return `${base}/${bucket}/${key}`;
  }

  // Virtual-hosted–style: https://{bucket}.s3.provider.com/{key}
  try {
    const url = new URL(base);
    return `${url.protocol}//${bucket}.${url.host}/${key}`;
  } catch {
    // If endpoint is not a full URL, assume https
    return `https://${bucket}.${base}/${key}`;
  }
}
