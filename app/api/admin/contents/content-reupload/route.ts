//api/admin/content-reupload/route.ts

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
    const formData = await req.formData();

    console.log("📝 Content reupload request received...");
    console.log("📑 Form data fields:", Array.from(formData.keys()));

    // Validate required fields according to API spec
    const requiredFields = {
      file: (value: FormDataEntryValue | null) => value instanceof File,
      title: (value: FormDataEntryValue | null) =>
        typeof value === "string" && value.toString().trim().length > 0,
      week_number: (value: FormDataEntryValue | null) => {
        const num = Number(value);
        return !isNaN(num) && Number.isInteger(num) && num > 0;
      },
      topic_id: (value: FormDataEntryValue | null) => {
        const num = Number(value);
        return !isNaN(num) && Number.isInteger(num) && num > 0;
      },
    };

    // API spec validation
    for (const [field, validator] of Object.entries(requiredFields)) {
      const value = formData.get(field);
      if (!value) {
        return NextResponse.json(
          {
            detail: [
              {
                loc: ["body", field],
                msg: "Field required",
                type: "value_error.missing",
              },
            ],
          },
          { status: 422 }
        );
      }

      if (!validator(value)) {
        return NextResponse.json(
          {
            detail: [
              {
                loc: ["body", field],
                msg: `Invalid value for ${field}`,
                type: "value_error.invalid",
              },
            ],
          },
          { status: 422 }
        );
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/content-reupload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Handle error responses
    try {
      const errorData = await response.json();
      return NextResponse.json(
        {
          detail: errorData.detail || [
            {
              loc: ["body"],
              msg: "Backend error",
              type: "server_error",
            },
          ],
        },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (parseError) {
      return NextResponse.json(
        {
          detail: [
            {
              loc: ["body"],
              msg: "Failed to parse backend response",
              type: "server_error",
            },
          ],
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("❌ Content reupload error:", error);

    return NextResponse.json(
      {
        detail: [
          {
            loc: ["body"],
            msg: "Internal server error",
            type: "server_error",
          },
        ],
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
