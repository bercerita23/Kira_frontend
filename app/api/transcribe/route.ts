import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
} from "@aws-sdk/client-transcribe";
import { randomUUID } from "crypto";

const s3 = new S3Client({ region: process.env.KIRA_AWS_DEFAULT_REGION });
const transcribe = new TranscribeClient({
  region: process.env.KIRA_AWS_DEFAULT_REGION,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const key = `transcribe/${randomUUID()}-${file.name}`;

    // Upload audio to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.KIRA_AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
      })
    );

    // Start Transcribe job
    const jobName = `job-${Date.now()}`;
    const command = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: "en-US",
      Media: {
        MediaFileUri: `s3://${process.env.KIRA_AWS_S3_BUCKET_NAME}/${key}`,
      },
      OutputBucketName: process.env.KIRA_AWS_S3_BUCKET_NAME,
      OutputKey: `transcribe/${jobName}-result.json`,
    });

    const response = await transcribe.send(command);

    // ✅ Safe return
    return NextResponse.json({
      job: response.TranscriptionJob ?? null,
      key: key,
    });
  } catch (error: any) {
    console.error("Transcribe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
