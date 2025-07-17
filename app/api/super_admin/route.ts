import { NextRequest } from "next/server";

function decodeJWTPayload(token: string | undefined) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

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
    const outgoingHeaders = {
      Authorization: `Bearer ${token}`,
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/super_admin`,
      {
        method: "GET",
        headers: outgoingHeaders,
      }
    );
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
      {
        status: 500,
      }
    );
  }
}
