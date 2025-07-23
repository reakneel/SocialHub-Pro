import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { CacheService } from '@/lib/redis';
import { AuditService } from '@/lib/monitoring';
import { 
  withAuth, 
  withErrorHandling, 
  withLogging, 
  withPerformanceMonitoring,
  withMiddleware 
} from '@/lib/middleware';

// Validation schemas
const trackedUserQuerySchema = z.object({
  platform: z.string().optional(),
  tags: z.string().optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10')
});

const createTrackedUserSchema = z.object({
  username: z.string().min(1).max(100),
  platformId: z.string(),
  displayName: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional(),
  followers: z.number().min(0).optional(),
  following: z.number().min(0).optional(),
  posts: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  isCompetitor: z.boolean().default(false),
  notes: z.string().max(2000).optional()
});

const updateTrackedUserSchema = createTrackedUserSchema.partial();

async function getTrackedUsers(
  request: NextRequest,
  user: any
) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  const validatedParams = trackedUserQuerySchema.parse(queryParams);

  const { platform, tags, search, page, limit } = validatedParams;
  const offset = (page - 1) * limit;

  // Check cache first
  const cache = CacheService.getInstance();
  const cacheKey = `tracked-users:${user.sub}:${JSON.stringify(validatedParams)}`;
  
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json(JSON.parse(cachedData));
  }

  // Build where clause
  const where: any = {
    userId: user.sub
  };

  if (platform) {
    where.platformId = platform;
  }

  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    where.tags = {
      hasSome: tagArray
    };
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { displayName: { contains: search, mode: 'insensitive' } },
      { bio: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Get tracked users with pagination
  const [trackedUsers, total] = await Promise.all([
    prisma.trackedUser.findMany({
      where,
      include: {
        platform: true,
        platforms: {
          include: {
            platform: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip: offset,
      take: limit
    }),
    prisma.trackedUser.count({ where })
  ]);

  // Format response
  const formattedUsers = trackedUsers.map(user => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    platform: user.platformId,
    platformName: user.platform.name,
    followers: user.followers,
    following: user.following,
    posts: user.posts,
    tags: user.tags,
    isCompetitor: user.isCompetitor,
    notes: user.notes,
    lastUpdated: user.updatedAt.toISOString(),
    createdAt: user.createdAt.toISOString(),
    platforms: user.platforms.map(p => ({
      id: p.platformId,
      name: p.platform.name,
      followers: p.followers,
      following: p.following,
      posts: p.posts,
      lastUpdated: p.updatedAt.toISOString()
    }))
  }));

  const result = {
    users: formattedUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    summary: {
      totalUsers: total,
      competitors: trackedUsers.filter(u => u.isCompetitor).length,
      totalFollowers: trackedUsers.reduce((sum, u) => sum + (u.followers || 0), 0),
      platforms: [...new Set(trackedUsers.map(u => u.platformId))].length
    }
  };

  // Cache for 2 minutes
  await cache.set(cacheKey, JSON.stringify(result), 120);

  return NextResponse.json(result);
}

async function createTrackedUser(
  request: NextRequest,
  user: any
) {
  const body = await request.json();
  const validatedData = createTrackedUserSchema.parse(body);

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

  // Check if user is already being tracked
  const existingUser = await prisma.trackedUser.findFirst({
    where: {
      userId: user.sub,
      username: validatedData.username,
      platformId: validatedData.platformId
    }
  });

  if (existingUser) {
    return NextResponse.json(
      { error: 'User is already being tracked on this platform' },
      { status: 409 }
    );
  }

  // Create tracked user
  const trackedUser = await prisma.trackedUser.create({
    data: {
      userId: user.sub,
      username: validatedData.username,
      platformId: validatedData.platformId,
      displayName: validatedData.displayName,
      bio: validatedData.bio,
      avatarUrl: validatedData.avatarUrl,
      followers: validatedData.followers || 0,
      following: validatedData.following || 0,
      posts: validatedData.posts || 0,
      tags: validatedData.tags || [],
      isCompetitor: validatedData.isCompetitor,
      notes: validatedData.notes
    },
    include: {
      platform: true
    }
  });

  // Log audit event
  await AuditService.log(
    'CREATE',
    'TRACKED_USER',
    trackedUser.id,
    user.sub,
    validatedData,
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  // Invalidate cache
  const cache = CacheService.getInstance();
  await cache.invalidatePattern(`tracked-users:${user.sub}:*`);

  const formattedUser = {
    id: trackedUser.id,
    username: trackedUser.username,
    displayName: trackedUser.displayName,
    bio: trackedUser.bio,
    avatarUrl: trackedUser.avatarUrl,
    platform: trackedUser.platformId,
    platformName: trackedUser.platform.name,
    followers: trackedUser.followers,
    following: trackedUser.following,
    posts: trackedUser.posts,
    tags: trackedUser.tags,
    isCompetitor: trackedUser.isCompetitor,
    notes: trackedUser.notes,
    lastUpdated: trackedUser.updatedAt.toISOString(),
    createdAt: trackedUser.createdAt.toISOString()
  };

  return NextResponse.json(formattedUser, { status: 201 });
}

// Export handlers with middleware
export const GET = withMiddleware(
  (request: NextRequest) => withAuth(request, getTrackedUsers),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);

export const POST = withMiddleware(
  (request: NextRequest) => withAuth(request, createTrackedUser),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);