import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://kira-api.bercerita.org";

    const response = await fetch(`${apiUrl}/auth/request-reset-pw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("Non-JSON response from backend:", text);
      return NextResponse.json({ detail: text }, { status: response.status });
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { detail: "Network error occurred" },
      { status: 500 }
    );
  }
}
