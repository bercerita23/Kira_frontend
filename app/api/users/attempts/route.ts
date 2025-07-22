import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return new Response(
      JSON.stringify({ message: "Missing authentication token" }),
      { status: 401 }
    );
  }

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/attempts`;
    const outgoingHeaders = {
      Authorization: `Bearer ${token}`,
    };
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: outgoingHeaders,
    });
    const rawData = await response.text();
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      data = {};
    }
    if (!response.ok) {
      return new Response(JSON.stringify(data), {
        status: response.status,
      });
    }
    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Proxy error", error: String(error) }),
      { status: 500 }
    );
  }
}
