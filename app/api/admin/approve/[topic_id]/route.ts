import { NextRequest } from "next/server";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
  "Content-Type": "application/json",
};

export async function POST(
  req: NextRequest,
  context: { params: { topic_id: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return new Response(
      JSON.stringify({ message: "Missing authentication token" }),
      { status: 401, headers: noCacheHeaders }
    );
  }

  const { topic_id } = context.params;

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/approve/${topic_id}`;
    const outgoingHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // pass through the request body
    const body = await req.json();

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: outgoingHeaders,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const rawText = await response.text();

    // Try to parse JSON, otherwise treat as plain string
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }

    return new Response(
      typeof data === "string"
        ? JSON.stringify({ message: data })
        : JSON.stringify(data),
      { status: response.status, headers: noCacheHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Proxy error", error: String(error) }),
      { status: 500, headers: noCacheHeaders }
    );
  }
}
