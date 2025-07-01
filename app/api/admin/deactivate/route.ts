import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json({ detail: "Authorization header is required." }, { status: 401 });
    }

    console.log("🔄 Deactivate admin request received...");
    console.log("📝 Request body:", body);

    // Validate required fields
    const { admin_email } = body;
    
    if (!admin_email) {
      return NextResponse.json({ 
        detail: "Missing required field: admin_email" 
      }, { status: 400 });
    }

    // Note: This would need a corresponding backend endpoint
    // For now, this is a placeholder that simulates the functionality
    // The actual endpoint would be something like PUT /super_admin/deactivate_admin
    
    // Placeholder response since backend endpoint doesn't exist yet
    console.log(`⚠️ Would deactivate admin: ${admin_email}`);
    
    return NextResponse.json({ 
      message: `Admin ${admin_email} would be deactivated (backend endpoint needed)`,
      detail: "Backend endpoint /super_admin/deactivate_admin needs to be implemented"
    }, { status: 501 }); // 501 Not Implemented
    
    /* 
    // This is what the implementation would look like when backend is ready:
    
    const response = await fetch('https://kira-api.com/super_admin/deactivate_admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ admin_email }),
    });

    console.log(`🔗 Backend response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Admin deactivated successfully:", data);
      return NextResponse.json(data, { status: response.status });
    } else {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        errorData = { detail: errorText || 'Unknown error' };
      }

      console.log("❌ Backend error:", errorData);
      
      switch (response.status) {
        case 401:
          return NextResponse.json({ detail: "Authentication failed. Please log in again." }, { status: 401 });
        case 403:
          return NextResponse.json({ detail: "You don't have permission to deactivate admins." }, { status: 403 });
        case 404:
          return NextResponse.json({ detail: "Admin not found." }, { status: 404 });
        default:
          return NextResponse.json({ 
            detail: errorData.detail || "Failed to deactivate admin. Please try again later." 
          }, { status: response.status });
      }
    }
    */
    
  } catch (error) {
    console.error("❌ Failed to process admin deactivation request:", error);
    
    const errorMessage = error instanceof Error
      ? error.message
      : "An unexpected error occurred.";

    return NextResponse.json(
      { 
        detail: "Internal server error while processing admin deactivation request",
        error: errorMessage
      },
      { status: 500 }
    );
  }
} 