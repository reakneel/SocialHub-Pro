import { NextRequest, NextResponse } from 'next/server';
import { cache } from './redis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      keyGenerator: (req) => this.getClientIP(req),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return 'unknown';
  }

  async checkLimit(request: NextRequest): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  }> {
    const key = this.config.keyGenerator!(request);
    const windowKey = `rate_limit:${key}:${Math.floor(Date.now() / this.config.windowMs)}`;
    
    const current = await cache.increment(windowKey, Math.ceil(this.config.windowMs / 1000));
    const remaining = Math.max(0, this.config.maxRequests - current);
    const resetTime = Math.ceil(Date.now() / this.config.windowMs) * this.config.windowMs + this.config.windowMs;

    return {
      allowed: current <= this.config.maxRequests,
      limit: this.config.maxRequests,
      remaining,
      resetTime,
    };
  }

  middleware() {
    return async (request: NextRequest) => {
      const result = await this.checkLimit(request);

      if (!result.allowed) {
        return NextResponse.json(
          { error: 'Too many requests' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      return null; // Continue to next middleware/handler
    };
  }
}

// Pre-configured rate limiters
export const apiLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // Stricter for auth endpoints
});

export const uploadLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // File upload limit
});