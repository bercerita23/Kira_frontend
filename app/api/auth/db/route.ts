import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Use environment variable for API URL with kira-api.com as default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://kira-api.com';
    
    const response = await fetch(`${apiUrl}/auth/db`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache-busting to ensure fresh data
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Return response with cache-busting headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('DB proxy error:', error);
    return NextResponse.json(
      { detail: 'Network error occurred' },
      { status: 500 }
    );
  }
} 