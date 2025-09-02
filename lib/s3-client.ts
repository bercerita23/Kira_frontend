// src/lib/s3-client.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_KIRA_AWS_DEFAULT_REGION!,
  credentials: {
    accessKeyId: process.env.KIRA_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.KIRA_AWS_SECRET_ACCESS_KEY!,
  },
});

// Get a blob URL from a bucket key like: "visuals/SCH001/1/t36/q16.png"
export async function getS3BlobUrl(key: string): Promise<string> {
  const bucket = process.env.NEXT_PUBLIC_KIRA_AWS_S3_BUCKET_NAME!;
  const out = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

  // In browsers, Body is ReadableStream<Uint8Array>
  const stream = out.Body as ReadableStream<Uint8Array>;

  // Convert stream -> Blob in a type-safe way
  const blob = await new Response(stream).blob();

  return URL.createObjectURL(blob);
}

/** Extract the S3 key from a full URL like
 *  https://kira-school-content.s3.us-east-2.amazonaws.com/visuals/SCH001/1/t36/q16.png
 *  or return the input if it's already a key.
 */
export function toS3Key(input: string): string {
  try {
    // If it's a URL, grab pathname without leading slash
    const u = new URL(input);
    return u.pathname.replace(/^\/+/, "");
  } catch {
    // Not a URL — assume it's already a key
    return input;
  }
}
