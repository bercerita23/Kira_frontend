// app/api/auth/register-admin/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch("https://kira-api.com/auth/register-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error during registration.";
    console.error("Register Admin Proxy Error:", error);
    return NextResponse.json(
      { detail: message },
      { status: 500 }
    );
  }
}
