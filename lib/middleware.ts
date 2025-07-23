import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from 'express-rate-limit';
import { logger, PerformanceMonitor, ErrorTracker } from './monitoring';

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication middleware
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return await handler(request, token);
  } catch (error) {
    ErrorTracker.captureException(error as Error, { 
      path: request.nextUrl.pathname,
      method: request.method 
    });
    
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

// Role-based authorization middleware
export async function withRole(
  request: NextRequest,
  requiredRole: string,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withAuth(request, async (req, user) => {
    if (user.role !== requiredRole && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return await handler(req, user);
  });
}

// Performance monitoring middleware
export function withPerformanceMonitoring(
  handler: (request: NextRequest) => Promise<NextResponse>,
  label?: string
) {
  return async (request: NextRequest) => {
    const endTimer = PerformanceMonitor.startTimer(
      label || `${request.method} ${request.nextUrl.pathname}`
    );

    try {
      const response = await handler(request);
      endTimer();
      return response;
    } catch (error) {
      endTimer();
      throw error;
    }
  };
}

// Error handling middleware
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      ErrorTracker.captureException(error as Error, {
        path: request.nextUrl.pathname,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries())
      });

      logger.error('API Error', {
        path: request.nextUrl.pathname,
        method: request.method,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: 400 }
        );
      }

      if (error instanceof NotFoundError) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      if (error instanceof UnauthorizedError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }

      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Request logging middleware
export function withLogging(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const start = Date.now();
    const { method, url } = request;

    logger.info('API Request', {
      method,
      url,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for')
    });

    try {
      const response = await handler(request);
      const duration = Date.now() - start;

      logger.info('API Response', {
        method,
        url,
        status: response.status,
        duration
      });

      return response;
    } catch (error) {
      const duration = Date.now() - start;

      logger.error('API Error Response', {
        method,
        url,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  };
}

// Validation middleware
export function withValidation<T>(
  schema: any, // Zod schema
  handler: (request: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return await handler(request, validatedData);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: (error as any).errors 
          },
          { status: 400 }
        );
      }
      throw error;
    }
  };
}

// Combine multiple middlewares
export function withMiddleware(
  handler: (request: NextRequest) => Promise<NextResponse>,
  ...middlewares: Array<(handler: any) => any>
) {
  return middlewares.reduce((acc, middleware) => middleware(acc), handler);
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// CORS middleware
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const response = await handler(request);

    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  };
}