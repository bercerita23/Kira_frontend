import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/users/chat/eligibility`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    console.error(error);
  }
}
