import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    
    // Use environment variable for API URL with kira-api.com as default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://kira-api.com';
    
    const response = await fetch(`${apiUrl}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { detail: 'Network error occurred' },
      { status: 500 }
    );
  }
} 