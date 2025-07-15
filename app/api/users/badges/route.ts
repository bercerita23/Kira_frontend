import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return new Response(
      JSON.stringify({ message: "Missing authentication token" }),
      {
        status: 401,
      }
    );
  }

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "https://kira-api.bercerita.org"
      }/users/badges`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Log backend error details for debugging
      console.error("Backend error:", data);
      return new Response(
        JSON.stringify({
          message: "Backend error",
          backendStatus: response.status,
          backendData: data,
        }),
        {
          status: response.status,
        }
      );
    }

    return new Response(JSON.stringify({ badges: data.badges || [] }), {
      status: 200,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
