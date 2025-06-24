import { NextRequest, NextResponse } from 'next/server';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://kira-api.com';

// Handle GET request
export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

// Handle DELETE request
export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

// Shared handler function for both GET and DELETE
async function handleRequest(request: NextRequest, method: 'GET' | 'DELETE') {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ detail: 'Missing email parameter' }, { status: 400 });
    }

    const backendResponse = await fetch(`${apiUrl}/auth/code?email=${email}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
    });

    const contentType = backendResponse.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await backendResponse.json();
    } else {
      const text = await backendResponse.text();
      console.error('Non-JSON response from backend:', text);
      return NextResponse.json({ detail: text }, { status: backendResponse.status });
    }

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ detail: 'Network error occurred' }, { status: 500 });
  }
}
