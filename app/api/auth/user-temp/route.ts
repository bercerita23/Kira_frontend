// app/api/auth/user-temp/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ detail: "Email is required." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://kira-api.com/auth/user-temp?email=${encodeURIComponent(email)}`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch user-temp info:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
