import { NextRequest, NextResponse } from 'next/server';

const LIMIT = 100;
const WINDOW_SIZE = 15 * 60 * 1000;
const ipRequestCount: { [key: string]: { count: number; resetTime: number } } = {};

export function checkRateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const now = Date.now();

  if (!ipRequestCount[ip] || now > ipRequestCount[ip].resetTime) {
    ipRequestCount[ip] = { count: 0, resetTime: now + WINDOW_SIZE };
  }

  ipRequestCount[ip].count++;

  if (ipRequestCount[ip].count > LIMIT) {
    return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((ipRequestCount[ip].resetTime - now) / 1000)),
      },
    });
  }

  return null;
}

export function middleware(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
  return NextResponse.next();
}
