import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { CacheService } from '@/lib/redis';
import { 
  withAuth, 
  withErrorHandling, 
  withLogging, 
  withPerformanceMonitoring,
  withMiddleware 
} from '@/lib/middleware';

// Validation schema
const analyticsQuerySchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  platform: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

async function getAnalytics(
  request: NextRequest,
  user: any
) {
  const { searchParams } = new URL(request.url);
  const queryParams = {
    timeRange: searchParams.get('timeRange') || '30d',
    platform: searchParams.get('platform') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined
  };

  const validatedParams = analyticsQuerySchema.parse(queryParams);
  
  // Calculate date range
  const endDate = validatedParams.endDate ? new Date(validatedParams.endDate) : new Date();
  let startDate: Date;
  
  if (validatedParams.startDate) {
    startDate = new Date(validatedParams.startDate);
  } else {
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = daysMap[validatedParams.timeRange];
    startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  }

  // Check cache first
  const cache = CacheService.getInstance();
  const cacheKey = `analytics:${user.sub}:${validatedParams.timeRange}:${validatedParams.platform || 'all'}:${startDate.toISOString()}:${endDate.toISOString()}`;
  
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json(JSON.parse(cachedData));
  }

  // Get user's connected platforms
  const userPlatforms = await prisma.userPlatform.findMany({
    where: {
      userId: user.sub,
      connected: true,
      ...(validatedParams.platform && { platformId: validatedParams.platform })
    },
    include: {
      platform: true
    }
  });

  if (userPlatforms.length === 0) {
    return NextResponse.json({
      data: [],
      summary: {
        totalFollowers: 0,
        totalPosts: 0,
        totalEngagement: 0,
        totalReach: 0
      }
    });
  }

  const platformIds = userPlatforms.map(up => up.platformId);

  // Get analytics data
  const analyticsData = await prisma.analytics.findMany({
    where: {
      platformId: { in: platformIds },
      userId: user.sub,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      platform: true
    },
    orderBy: {
      date: 'desc'
    }
  });

  // Group by platform and calculate metrics
  const platformMetrics = new Map();
  
  for (const platform of userPlatforms) {
    const platformAnalytics = analyticsData.filter(a => a.platformId === platform.platformId);
    
    if (platformAnalytics.length === 0) {
      // If no analytics data, use platform connection data as baseline
      platformMetrics.set(platform.platformId, {
        platform: platform.platformId,
        platformName: platform.platform.name,
        metrics: {
          followers: platform.followers || 0,
          posts: 0,
          engagement: 0,
          reach: 0
        },
        growth: {
          followers: 0,
          engagement: 0
        },
        timeRange: validatedParams.timeRange
      });
      continue;
    }

    // Calculate current metrics (latest data)
    const latestData = platformAnalytics[0];
    const oldestData = platformAnalytics[platformAnalytics.length - 1];
    
    // Calculate totals for the period
    const totalEngagement = platformAnalytics.reduce((sum, a) => sum + (a.likes + a.comments + a.shares), 0);
    const totalReach = platformAnalytics.reduce((sum, a) => sum + a.views, 0);
    const totalPosts = platformAnalytics.reduce((sum, a) => sum + a.posts, 0);

    // Calculate growth rates
    const followersGrowth = oldestData.followers > 0 
      ? ((latestData.followers - oldestData.followers) / oldestData.followers) * 100 
      : 0;
    
    const oldEngagement = oldestData.likes + oldestData.comments + oldestData.shares;
    const newEngagement = latestData.likes + latestData.comments + latestData.shares;
    const engagementGrowth = oldEngagement > 0 
      ? ((newEngagement - oldEngagement) / oldEngagement) * 100 
      : 0;

    platformMetrics.set(platform.platformId, {
      platform: platform.platformId,
      platformName: platform.platform.name,
      metrics: {
        followers: latestData.followers,
        posts: totalPosts,
        engagement: totalEngagement,
        reach: totalReach
      },
      growth: {
        followers: Math.round(followersGrowth * 100) / 100,
        engagement: Math.round(engagementGrowth * 100) / 100
      },
      timeRange: validatedParams.timeRange,
      trend: platformAnalytics.slice(0, 30).map(a => ({
        date: a.date.toISOString().split('T')[0],
        followers: a.followers,
        engagement: a.likes + a.comments + a.shares,
        reach: a.views
      }))
    });
  }

  const data = Array.from(platformMetrics.values());
  
  // Calculate summary
  const summary = {
    totalFollowers: data.reduce((sum, d) => sum + d.metrics.followers, 0),
    totalPosts: data.reduce((sum, d) => sum + d.metrics.posts, 0),
    totalEngagement: data.reduce((sum, d) => sum + d.metrics.engagement, 0),
    totalReach: data.reduce((sum, d) => sum + d.metrics.reach, 0),
    averageGrowth: {
      followers: data.length > 0 ? data.reduce((sum, d) => sum + d.growth.followers, 0) / data.length : 0,
      engagement: data.length > 0 ? data.reduce((sum, d) => sum + d.growth.engagement, 0) / data.length : 0
    }
  };

  const result = { data, summary };

  // Cache the result for 5 minutes
  await cache.set(cacheKey, JSON.stringify(result), 300);

  return NextResponse.json(result);
}

async function createAnalytics(
  request: NextRequest,
  user: any
) {
  const body = await request.json();
  
  const createSchema = z.object({
    platformId: z.string(),
    date: z.string().datetime(),
    followers: z.number().min(0),
    posts: z.number().min(0),
    likes: z.number().min(0),
    comments: z.number().min(0),
    shares: z.number().min(0),
    views: z.number().min(0)
  });

  const validatedData = createSchema.parse(body);

  // Verify user has access to this platform
  const userPlatform = await prisma.userPlatform.findFirst({
    where: {
      userId: user.sub,
      platformId: validatedData.platformId,
      connected: true
    }
  });

  if (!userPlatform) {
    return NextResponse.json(
      { error: 'Platform not connected or accessible' },
      { status: 403 }
    );
  }

  // Upsert analytics data
  const analytics = await prisma.analytics.upsert({
    where: {
      userId_platformId_date: {
        userId: user.sub,
        platformId: validatedData.platformId,
        date: new Date(validatedData.date)
      }
    },
    update: {
      followers: validatedData.followers,
      posts: validatedData.posts,
      likes: validatedData.likes,
      comments: validatedData.comments,
      shares: validatedData.shares,
      views: validatedData.views,
      updatedAt: new Date()
    },
    create: {
      userId: user.sub,
      platformId: validatedData.platformId,
      date: new Date(validatedData.date),
      followers: validatedData.followers,
      posts: validatedData.posts,
      likes: validatedData.likes,
      comments: validatedData.comments,
      shares: validatedData.shares,
      views: validatedData.views
    }
  });

  // Invalidate cache
  const cache = CacheService.getInstance();
  await cache.invalidatePattern(`analytics:${user.sub}:*`);

  return NextResponse.json(analytics);
}

// Export handlers with middleware
export const GET = withMiddleware(
  (request: NextRequest) => withAuth(request, getAnalytics),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);

export const POST = withMiddleware(
  (request: NextRequest) => withAuth(request, createAnalytics),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);