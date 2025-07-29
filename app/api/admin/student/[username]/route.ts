import { NextRequest } from "next/server";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
  "Content-Type": "application/json",
};

export async function GET(
  req: NextRequest,
  context: { params: { username: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return new Response(
      JSON.stringify({ message: "Missing authentication token" }),
      {
        status: 401,
        headers: noCacheHeaders,
      }
    );
  }

  const { username } = context.params;

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/student/${username}`;
    const outgoingHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: outgoingHeaders,
      cache: "no-store", // prevent fetch caching
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
        headers: noCacheHeaders,
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: noCacheHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Proxy error", error: String(error) }),
      {
        status: 500,
        headers: noCacheHeaders,
      }
    );
  }
}
