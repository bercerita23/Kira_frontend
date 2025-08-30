import { NextRequest, NextResponse } from "next/server";
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";

export async function POST(req: NextRequest) {
  try {
    const audioBuffer = Buffer.from(await req.arrayBuffer());
    console.log("Received audio buffer size:", audioBuffer.length);

    // Check if it's a WAV file and log header info
    if (audioBuffer.length >= 44) {
      const isWAV = audioBuffer.subarray(0, 4).toString() === "RIFF";
      console.log("Is WAV file:", isWAV);

      if (isWAV) {
        const dataSize = audioBuffer.readUInt32LE(40); // Data chunk size
        console.log("WAV data chunk size:", dataSize);
        console.log("Actual audio data size:", audioBuffer.length - 44);
      }
    }

    if (audioBuffer.length < 100) {
      return NextResponse.json(
        { error: "No audio data received" },
        { status: 400 }
      );
    }

    const client = new TranscribeStreamingClient({
      region: process.env.KIRA_AWS_DEFAULT_REGION!,
      credentials: {
        accessKeyId: process.env.KIRA_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.KIRA_AWS_SECRET_ACCESS_KEY!,
      },
    });

    const command = new StartStreamTranscriptionCommand({
      LanguageCode: "en-US",
      MediaEncoding: "pcm",
      MediaSampleRateHertz: 16000, // Changed from 44100 to 16000
      AudioStream: (async function* () {
        // Skip WAV header (first 44 bytes) if present
        const audioData = audioBuffer.subarray(44);
        console.log("Sending audio data size:", audioData.length);

        // Send audio in smaller chunks to avoid "stream too big" error
        const chunkSize = 8192; // 8KB chunks
        for (let i = 0; i < audioData.length; i += chunkSize) {
          const chunk = audioData.subarray(
            i,
            Math.min(i + chunkSize, audioData.length)
          );
          yield { AudioEvent: { AudioChunk: new Uint8Array(chunk) } };
        }
      })(),
    });

    console.log("Starting transcription...");
    const response = await client.send(command);

    let transcript = "";
    let hasResults = false;

    for await (const event of response.TranscriptResultStream ?? []) {
      if (event.TranscriptEvent) {
        hasResults = true;
        for (const r of event.TranscriptEvent.Transcript?.Results ?? []) {
          // ✅ FIX: Only process FINAL results to avoid duplicates
          if (!r.IsPartial && r.Alternatives?.[0]?.Transcript) {
            transcript += r.Alternatives[0].Transcript + " ";
            console.log("Final transcript part:", r.Alternatives[0].Transcript);
          }
          // Optional: Log partial results for debugging (but don't add them)
          else if (r.IsPartial && r.Alternatives?.[0]?.Transcript) {
            console.log("Partial transcript:", r.Alternatives[0].Transcript);
          }
        }
      }
    }

    const finalTranscript = transcript.trim();
    console.log("Complete final transcript:", finalTranscript);

    if (!hasResults && !finalTranscript) {
      return NextResponse.json({
        error: "No speech detected",
        transcript: "",
      });
    }

    return NextResponse.json({
      transcript: finalTranscript,
      success: true,
    });
  } catch (err: any) {
    console.error("Transcribe error:", err);
    return NextResponse.json(
      {
        error: err.message || "Transcription failed",
        details: err.toString(),
      },
      { status: 500 }
    );
  }
}
