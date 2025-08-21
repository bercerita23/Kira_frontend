import { NextRequest } from "next/server";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
  "Content-Type": "application/json",
};

export async function GET(
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/review-questions/${topic_id}`;
    const outgoingHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: outgoingHeaders,
      cache: "no-store", // prevent fetch caching
    });

    const rawData = await response.text();
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      data = { quiz_name: "", quiz_description: "", questions: [] };
    }

    if (!response.ok) {
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: noCacheHeaders,
      });
    }

    // Ensure the response has the expected structure with quiz metadata
    const responseData = {
      quiz_name: data.quiz_name || "",
      quiz_description: data.quiz_description || "",
      questions: data.questions || [],
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: noCacheHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Proxy error",
        error: String(error),
        quiz_name: "",
        quiz_description: "",
        questions: [],
      }),
      {
        status: 500,
        headers: noCacheHeaders,
      }
    );
  }
}
