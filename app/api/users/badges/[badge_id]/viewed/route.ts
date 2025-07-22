import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { badge_id: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return new Response(
      JSON.stringify({ message: "Missing authentication token" }),
      {
        status: 401,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
          "Content-Type": "application/json",
        },
      }
    );
  }

  const badgeId = params.badge_id; // 👈 Clean dynamic param

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/badges/${badgeId}/viewed`;
    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // 💥 Force no-cache on fetch
    });

    const rawData = await response.text();
    let data;
    try {
      data = JSON.parse(rawData);
    } catch {
      data = {};
    }

    if (!response.ok) {
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Proxy error", error: String(error) }),
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
