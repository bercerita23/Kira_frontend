import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { detail: "Authorization header is required." },
        { status: 401 }
      );
    }

    console.log("📧 Add student request received...");
    console.log("📝 Request body:", body);

    // Validate required fields
    const { username, password, first_name, last_name } = body;

    if (!username || !password || !first_name || !last_name) {
      return NextResponse.json(
        {
          detail:
            "Missing required fields. Username, password, first_name, and last_name are required.",
        },
        { status: 400 }
      );
    }

    // Forward request to production backend
    const response = await fetch("https://kira-api.com/admin/student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    console.log(`🔗 Backend response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Student created successfully:", data);
      return NextResponse.json(data, { status: response.status });
    } else {
      // Handle different error cases
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, use text response
        const errorText = await response.text();
        errorData = { detail: errorText || "Unknown error" };
      }

      console.log("❌ Backend error:", errorData);

      // Return appropriate error message based on status code
      switch (response.status) {
        case 401:
          return NextResponse.json(
            { detail: "Authentication failed. Please log in again." },
            { status: 401 }
          );
        case 403:
          return NextResponse.json(
            { detail: "You don't have permission to add students." },
            { status: 403 }
          );
        case 422:
          return NextResponse.json(
            { detail: errorData.detail || "Invalid data provided." },
            { status: 422 }
          );
        default:
          return NextResponse.json(
            {
              detail:
                errorData.detail ||
                "Failed to create student. Please try again later.",
            },
            { status: response.status }
          );
      }
    }
  } catch (error) {
    console.error("❌ Failed to process student creation request:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return NextResponse.json(
      {
        detail:
          "Internal server error while processing student creation request",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
