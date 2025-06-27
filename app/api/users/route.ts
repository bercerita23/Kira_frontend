import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json({ detail: "Authorization header is required." }, { status: 401 });
    }

    console.log("🔄 Proxying request to backend users endpoint...");
    console.log("🔑 Auth header:", authHeader);

    const response = await fetch(
      "https://kira-api.com/users",
      {
        headers: {
          accept: "application/json",
          authorization: authHeader,
        },
      }
    );

    console.log("📡 Backend response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Backend error:", error);
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ Backend response received:", data);
    console.log("✅ Backend response type:", typeof data);
    console.log("✅ Backend response keys:", Object.keys(data));
    console.log("✅ Backend Hello_Form:", data.Hello_Form);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Failed to fetch users:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
} 