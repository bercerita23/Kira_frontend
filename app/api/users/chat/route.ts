import { NextResponse } from "next/server";

// This dummy route just confirms the chat root exists
export async function GET() {
  return NextResponse.json({
    message: "Chat API root – available endpoints: /start, /send",
  });
}
