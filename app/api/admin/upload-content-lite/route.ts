import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { detail: "Missing authentication token" },
      { status: 401 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    let title: string | null = null;
    let week_number: string | null = null; // backend will coerce to int
    let hash_value: string | null = null;

    if (contentType.startsWith("application/json")) {
      // Support old callers that still send JSON
      const body = await req.json();
      title = body?.title ?? null;
      week_number = body?.week_number != null ? String(body.week_number) : null;
      hash_value = body?.hash_value ?? null;
    } else {
      // New path: client sent multipart/form-data
      const form = await req.formData();
      title = (form.get("title") as string) ?? null;
      week_number = (form.get("week_number") as string) ?? null;
      hash_value = (form.get("hash_value") as string) ?? null;
    }

    if (!title || !week_number || !hash_value) {
      return NextResponse.json(
        {
          detail:
            "Missing required fields. title, week_number, and hash_value are required.",
        },
        { status: 400 }
      );
    }

    // Always forward as FormData to FastAPI (expects Form(...))
    const backendForm = new FormData();
    backendForm.append("title", title.trim());
    backendForm.append("week_number", week_number);
    backendForm.append("hash_value", hash_value);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/uplaod-content-lite`,
      {
        method: "POST",
        headers: {
          // Do NOT set Content-Type; let fetch set the multipart boundary
          Authorization: `Bearer ${token}`,
        },
        body: backendForm,
      }
    );

    // Try to return backend JSON; fall back to text
    let payload: any;
    try {
      payload = await response.json();
    } catch {
      const text = await response.text();
      payload = text ? { detail: text } : {};
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("❌ Failed to process upload-content-lite request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      {
        detail: "Internal server error while processing request",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
