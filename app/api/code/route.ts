import { NextRequest, NextResponse } from "next/server";

// Handle GET request
export async function GET(request: NextRequest) {
  return handleRequest(request, "GET");
}

// Handle DELETE request
export async function DELETE(request: NextRequest) {
  return handleRequest(request, "DELETE");
}

// Shared handler function for both GET and DELETE
async function handleRequest(request: NextRequest, method: "GET" | "DELETE") {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { detail: "Missing email parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/code`, {
      method,
      headers: { "Content-Type": "application/json" },
    });
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
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
