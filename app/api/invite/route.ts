import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json({ detail: "Authorization header is required." }, { status: 401 });
    }

    console.log("📧 Proxying invite request to backend...");
    console.log("🔑 Auth header:", authHeader);
    console.log("📝 Request body:", body);

    // The body should contain an array of invitations
    const { invitations } = body;
    
    if (!invitations || !Array.isArray(invitations)) {
      return NextResponse.json({ detail: "Invalid request format. Expected 'invitations' array." }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Send individual invitations to the backend
    for (const invitation of invitations) {
      try {
        console.log(`🔄 Sending invitation for ${invitation.email}...`);
        console.log("📋 Invitation data:", invitation);
        
        const response = await fetch("https://kira-api.com/super_admin/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            authorization: authHeader,
          },
          body: JSON.stringify({
            school_id: invitation.school_id,
            email: invitation.email,
            first_name: invitation.first_name,
            last_name: invitation.last_name
          }),
        });

        console.log(`📡 Backend response status for ${invitation.email}:`, response.status);
        console.log(`📡 Backend response headers for ${invitation.email}:`, response.headers);

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error(`❌ Failed to parse JSON for ${invitation.email}:`, jsonError);
          throw new Error(`Invalid JSON response from backend`);
        }

        if (!response.ok) {
          console.error("❌ Backend error for", invitation.email, ":", data);
          console.error("❌ Full response:", response);
          errors.push({
            email: invitation.email,
            error: data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`
          });
        } else {
          console.log("✅ Backend response received for", invitation.email, ":", data);
          results.push({
            email: invitation.email,
            status: "sent"
          });
        }
      } catch (error) {
        console.error("❌ Network error for", invitation.email, ":", error);
        console.error("❌ Error type:", error.constructor.name);
        console.error("❌ Error message:", error.message);
        console.error("❌ Full error object:", error);
        
        errors.push({
          email: invitation.email,
          error: `Network error: ${error.message}`
        });
      }
    }

    // Return combined results
    return NextResponse.json({
      successful: results,
      failed: errors,
      total: invitations.length,
      sent: results.length,
      failed_count: errors.length
    });
    
  } catch (error) {
    console.error("❌ Failed to send invitations:", error);
    return NextResponse.json(
      { 
        detail: "Please check the Kira API documentation for the correct invite endpoint",
        error: error.message 
      },
      { status: 500 }
    );
  }
} 