import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // prevent static caching

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Missing authentication token" },
      { status: 401, headers: noStoreHeaders }
    );
  }

  try {
    const apiRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/super_admin/default-prompts`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    const bodyText = await apiRes.text();
    return new NextResponse(bodyText, {
      status: apiRes.status,
      headers: {
        "Content-Type":
          apiRes.headers.get("content-type") ?? "application/json",
        ...noStoreHeaders,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500, headers: noStoreHeaders }
    );
  }
}

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
};
