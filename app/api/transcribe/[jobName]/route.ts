import { NextRequest, NextResponse } from "next/server";
import {
  TranscribeClient,
  GetTranscriptionJobCommand,
} from "@aws-sdk/client-transcribe";
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

const transcribe = new TranscribeClient({
  region: process.env.NEXT_PUBLIC_KIRA_AWS_DEFAULT_REGION,
});
const s3 = new S3Client({ region: process.env.NEXT_PUBLIC_KIRA_AWS_DEFAULT_REGION });

async function streamToString(stream: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { jobName: string } }
) {
  try {
    const cmd = new GetTranscriptionJobCommand({
      TranscriptionJobName: params.jobName,
    });
    const result = await transcribe.send(cmd);
    const job = result.TranscriptionJob;

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.TranscriptionJobStatus === "COMPLETED") {
      const bucket = process.env.NEXT_PUBLIC_KIRA_AWS_S3_BUCKET_NAME!;
      const jsonKey = `transcribe/${params.jobName}-result.json`;

      // 1. Get transcript JSON from S3
      const s3Res = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key: jsonKey })
      );
      const body: string = await streamToString(s3Res.Body as Readable);
      const transcriptJson = JSON.parse(body);
      const text = transcriptJson.results.transcripts[0].transcript;

      // 2. Cleanup: delete everything under transcribe/
      const listRes = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: "transcribe/",
        })
      );

      if (listRes.Contents && listRes.Contents.length > 0) {
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
              Objects: listRes.Contents.map((obj) => ({ Key: obj.Key! })),
              Quiet: true,
            },
          })
        );
      }

      // 3. Return transcript text
      return NextResponse.json({ status: "COMPLETED", text });
    }

    return NextResponse.json({ status: job.TranscriptionJobStatus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
