// app/api/markdown/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-static';

export async function GET(request: Request) {
  // Return a static response for static export
  return new Response(JSON.stringify({
    message: "This API is not available in static exports. Please use client-side fetching instead."
  }), {
    headers: {
      'content-type': 'application/json',
    },
  });
}
