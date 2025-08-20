import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { topic_id: string } }
) {
  const token = req.cookies.get("token")?.value;
  const { topic_id } = params;

  console.log("=== APPROVE API ROUTE DEBUG ===");
  console.log("Topic ID received:", topic_id);
  console.log("Has auth token:", !!token);

  if (!token) {
    console.log("No token found, returning 401");
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
    const approvalData = await req.json();

    console.log("=== RECEIVED APPROVAL DATA ===");
    console.log("Raw approval data:", approvalData);
    console.log("Quiz name received:", approvalData.quiz_name);
    console.log("Quiz description received:", approvalData.quiz_description);
    console.log("Questions count:", approvalData.questions?.length || 0);
    console.log("Full data structure:", JSON.stringify(approvalData, null, 2));

    // Validate required fields
    if (!approvalData.quiz_name || !approvalData.questions) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({
          message:
            "Missing required fields: quiz_name and questions are required",
        }),
        {
          status: 400,
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

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/approve/${topic_id}`;
    console.log("Backend URL:", backendUrl);
    console.log("Environment API URL:", process.env.NEXT_PUBLIC_API_URL);

    const backendPayload = {
      quiz_name: approvalData.quiz_name,
      quiz_description: approvalData.quiz_description || "",
      questions: approvalData.questions,
    };

    console.log("=== SENDING TO BACKEND ===");
    console.log("Backend payload:", JSON.stringify(backendPayload, null, 2));

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
      cache: "no-store",
    });

    console.log("=== BACKEND RESPONSE ===");
    console.log("Backend response status:", response.status);
    console.log("Backend response ok:", response.ok);

    const responseText = await response.text();
    console.log("Backend response body (raw):", responseText);

    if (!response.ok) {
      console.error("Backend error response:", responseText);
      return new Response(responseText, {
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

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("Backend response data (parsed):", responseData);
    } catch (e) {
      console.log("Backend response is not JSON, using raw text");
      responseData = { message: responseText };
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
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
    console.error("=== APPROVE ROUTE ERROR ===");
    console.error("Error type:", typeof error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );

    return new Response(
      JSON.stringify({
        message: "Proxy error",
        error: String(error),
      }),
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
