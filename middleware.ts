import { NextRequest, NextResponse } from 'next/server';
import { apiLimiter, authLimiter, uploadLimiter } from './lib/rate-limit';
import { LogService } from './lib/logger';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting based on route
  let rateLimitResult = null;

  if (pathname.startsWith('/api/auth/')) {
    rateLimitResult = await authLimiter.middleware()(request);
  } else if (pathname.startsWith('/api/upload/')) {
    rateLimitResult = await uploadLimiter.middleware()(request);
  } else if (pathname.startsWith('/api/')) {
    rateLimitResult = await apiLimiter.middleware()(request);
  }

  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Log API requests
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    LogService.info('API Request', {
      method: request.method,
      pathname,
      ip,
      userAgent,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};