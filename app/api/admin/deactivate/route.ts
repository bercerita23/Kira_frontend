import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
};

export async function POST(req: NextRequest) {
  // auth via cookie
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Missing authentication token" },
      { status: 401, headers: noStore }
    );
  }

  try {
    // body must be parsed explicitly
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || !("email" in body)) {
      return NextResponse.json(
        { message: "Invalid or missing JSON body (expected { email })" },
        { status: 400, headers: noStore }
      );
    }

    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) {
      console.error("API_URL is not set");
      return NextResponse.json(
        { message: "Server misconfiguration: API_URL is not set" },
        { status: 500, headers: noStore }
      );
    }
    const url = `${base.replace(/\/+$/, "")}/super_admin/deactivate_admin`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

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
  } catch (error) {
    console.error("Proxy error (/api/admin/deactivate):", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500, headers: noStore }
    );
  }
}
