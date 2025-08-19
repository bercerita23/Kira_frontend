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
            {
                status: 401,
                headers: noCacheHeaders,
            }
        );
    }

    const { topic_id } = context.params;

    try {
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/approve/${topic_id}`;
        const outgoingHeaders = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        const body = await req.json();

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: outgoingHeaders,
            body: JSON.stringify(body),
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
