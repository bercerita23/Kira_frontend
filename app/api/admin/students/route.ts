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
    const response = await fetch("https://kira-api.com/admin/students", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify(data), {
        status: response.status,
      });
    }

    return new Response(
      JSON.stringify(Object.values(data.student_data || {})),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
