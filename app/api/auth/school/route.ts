// app/api/school/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "https://kira-api.bercerita.org"
      }/auth/school/`
    );
    const data = await res.json();

    // ✅ Extract and return only the schools array
    return NextResponse.json(data.schools);
  } catch (error) {
    console.error("School fetch failed", error);
    return NextResponse.json(
      { detail: "Failed to load schools" },
      { status: 500 }
    );
  }
}
