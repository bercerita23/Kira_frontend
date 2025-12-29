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
    const formData = await req.formData();

    console.log("📝 Chunked content upload request received...");
    console.log("📑 Form data fields:", Array.from(formData.keys()));

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/content-upload-chunk`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    console.log(`🔗 Backend response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Chunk uploaded successfully:", data);
      return NextResponse.json(data, { status: response.status });
    } else {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        errorData = { detail: errorText || "Unknown error" };
      }

      console.log("❌ Backend error:", errorData);

      switch (response.status) {
        case 401:
          return NextResponse.json(
            { detail: "Authentication failed. Please log in again." },
            { status: 401 }
          );
        case 403:
          return NextResponse.json(
            { detail: "You don't have permission to upload content." },
            { status: 403 }
          );
        case 422:
          return NextResponse.json(errorData, { status: 422 });
        default:
          return NextResponse.json(
            {
              detail:
                errorData.detail ||
                "Failed to upload chunk. Please try again later.",
            },
            { status: response.status }
          );
      }
    }
  } catch (error) {
    console.error("❌ Failed to process chunk upload request:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return NextResponse.json(
      {
        detail: "Internal server error while processing chunk upload request",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
