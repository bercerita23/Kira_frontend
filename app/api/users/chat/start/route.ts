import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("=== CHAT START ROUTE DEBUG ===");

  const token = req.cookies.get("token")?.value;
  console.log("Token present:", !!token);

  if (!token) {
    console.log("Missing token, returning 401");
    return new Response(
      JSON.stringify({ message: "Missing authentication token" }),
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    console.log("Received JSON body:", body);
    console.log("Quiz name from body:", body.quiz_name);
    console.log("Body type:", typeof body);
    console.log("Full body JSON stringified:", JSON.stringify(body));

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/chat/start`;
    console.log("Backend API URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("Full backend URL:", backendUrl);
    console.log("JSON body being sent to backend:", JSON.stringify(body));

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", response.status);

    const data = await response.json();
    console.log("Backend response data:", data);

    if (!response.ok) {
      console.error("Backend error details:");
      console.error("- Status:", response.status);
      console.error("- Data:", data);
      console.error("- Body sent:", JSON.stringify(body));

      return new Response(
        JSON.stringify({
          message: "Backend error",
          backendStatus: response.status,
          backendData: data,
        }),
        { status: response.status }
      );
    }

    console.log("Success! Returning data:", data);
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
