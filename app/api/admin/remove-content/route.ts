import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
        return NextResponse.json(
            { detail: "Missing authentication token" },
            { status: 401 }
        );
    }

    try {
        const contentType = req.headers.get("content-type") || "";

        let topic_id: string | null = null;

        if (contentType.startsWith("application/json")) {
            // Support old callers that still send JSON
            const body = await req.json();
            topic_id = body?.topic_id != null ? String(body.topic_id) : null;
        } else {
            // New path: client sent multipart/form-data
            const form = await req.formData();
            topic_id = (form.get("topic_id") as string) ?? null;
        }

        if (!topic_id) {
            return NextResponse.json(
                {
                    detail: "Missing required field. topic_id is required.",
                },
                { status: 400 }
            );
        }

        // Always forward as FormData to FastAPI (expects Form(...))
        const backendForm = new FormData();
        backendForm.append("topic_id", topic_id);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/remove-content`,
            {
                method: "POST",
                headers: {
                    // Do NOT set Content-Type; let fetch set the multipart boundary
                    Authorization: `Bearer ${token}`,
                },
                body: backendForm,
            }
        );

        // Try to return backend JSON; fall back to text
        let payload: any;
        try {
            payload = await response.json();
        } catch {
            const text = await response.text();
            payload = text ? { detail: text } : {};
        }

        return NextResponse.json(payload, { status: response.status });
    } catch (error) {
        console.error("❌ Failed to process remove-content request:", error);
        const errorMessage =
            error instanceof Error ? error.message : "An unexpected error occurred.";
        return NextResponse.json(
            {
                detail: "Internal server error while processing request",
                error: errorMessage,
            },
            { status: 500 }
        );
    }
}
