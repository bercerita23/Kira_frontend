import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
};

export async function GET(
  req: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Missing authentication token" },
        { status: 401, headers: noStore }
      );
    }

    const upstream = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/super_admin/chat-history/${encodeURIComponent(
        params.session_id
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
        ...noStore,
        Vary: "Cookie",
      },
    });
  } catch (err) {
    console.error("chat-history proxy error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500, headers: noStore }
    );
  }
}
