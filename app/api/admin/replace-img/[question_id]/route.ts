import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { question_id: string } }
) {
  const token = req.cookies.get("token")?.value;
  const { question_id } = params;

  console.log("=== REPLACE IMAGE API ROUTE DEBUG ===");
  console.log("Question ID received:", question_id);
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
    const formData = await req.formData();
    const file = formData.get("file") as File;

    console.log("=== RECEIVED FILE DATA ===");
    console.log("File received:", !!file);
    console.log("File name:", file?.name);
    console.log("File size:", file?.size);
    console.log("File type:", file?.type);

    // Validate required file
    if (!file) {
      console.error("Missing required file");
      return new Response(
        JSON.stringify({
          message: "Missing required field: file is required",
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

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/replace-img/${question_id}`;
    console.log("Backend URL:", backendUrl);
    console.log("Environment API URL:", process.env.NEXT_PUBLIC_API_URL);

    // Create FormData for backend request
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    console.log("=== SENDING TO BACKEND ===");
    console.log("Forwarding file to backend");

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
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
    console.error("=== REPLACE IMAGE ROUTE ERROR ===");
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
