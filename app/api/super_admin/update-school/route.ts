import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Missing authentication token" },
        { status: 401, headers: noStoreHeaders }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid or missing JSON body" },
        { status: 400, headers: noStoreHeaders }
      );
    }

    const upstream = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/super_admin/updateschool`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
        ...noStoreHeaders,
      },
    });
  } catch (err) {
    console.error("updateschool proxy error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
