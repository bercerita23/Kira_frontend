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
    const backendUrl = `${
      process.env.NEXT_PUBLIC_API_URL || "https://kira-api.bercerita.org"
    }/super_admin/`;
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
    const users = data["Hello_Form:"];
    return new Response(JSON.stringify(Array.isArray(users) ? users : []), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Proxy error", error: String(error) }),
      { status: 500 }
    );
  }
}
