// app/api/school/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/school`,
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
        },
      }
    );
    const data = await response.json();

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
