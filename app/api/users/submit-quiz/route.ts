import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
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
    const body = await req.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/submit-quiz`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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

    return new Response(JSON.stringify(data), {
      status: response.status,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
