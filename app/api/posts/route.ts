import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { CacheService } from '@/lib/redis';
import { QueueService } from '@/lib/queue';
import { AuditService } from '@/lib/monitoring';
import { 
  withAuth, 
  withErrorHandling, 
  withLogging, 
  withPerformanceMonitoring,
  withValidation,
  withMiddleware,
  NotFoundError 
} from '@/lib/middleware';
import { PostStatus } from '@prisma/client';

export interface Post {
  id: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: string;
  publishedAt?: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  createdAt: string;
  updatedAt: string;
  images?: string[];
  videos?: string[];
}

// Validation schemas
const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  platforms: z.array(z.string()).min(1, 'At least one platform is required'),
  scheduledAt: z.string().datetime().optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional()
});

const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  platforms: z.array(z.string()).min(1).optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional()
});

async function getPosts(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as PostStatus | null;
  const platform = searchParams.get('platform');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  // Try to get from cache first
  const cache = CacheService.getInstance();
  const cacheKey = `posts:${status || 'all'}:${platform || 'all'}:${limit}:${offset}`;
  const cachedResult = await cache.get(cacheKey);
  
  if (cachedResult) {
    return NextResponse.json(cachedResult);
  }

  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (platform) {
    where.platforms = {
      some: {
        platformId: platform
      }
    };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        platforms: {
          include: {
            platform: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.post.count({ where })
  ]);

  const formattedPosts = posts.map(post => ({
    id: post.id,
    content: post.content,
    platforms: post.platforms.map(p => p.platformId),
    status: post.status.toLowerCase(),
    scheduledAt: post.scheduledAt?.toISOString(),
    publishedAt: post.publishedAt?.toISOString(),
    engagement: {
      likes: post.totalLikes,
      comments: post.totalComments,
      shares: post.totalShares,
      views: post.totalViews
    },
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    images: post.images,
    videos: post.videos,
    user: post.user
  }));

  const result = {
    posts: formattedPosts,
    total,
    limit,
    offset,
  };

  // Cache the result for 5 minutes
  await cache.set(cacheKey, result, 300);

  return NextResponse.json(result);
}

async function createPost(request: NextRequest, user: any) {
  const body = await request.json();
  const validatedData = createPostSchema.parse(body);

  // Verify platforms exist and user has access
  const userPlatforms = await prisma.userPlatform.findMany({
    where: {
      userId: user.sub,
      platformId: { in: validatedData.platforms },
      connected: true
    }
  });

  if (userPlatforms.length !== validatedData.platforms.length) {
    return NextResponse.json(
      { error: 'Some platforms are not connected or accessible' },
      { status: 400 }
    );
  }

  const scheduledAt = validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null;
  const isScheduled = scheduledAt && scheduledAt > new Date();

  const post = await prisma.post.create({
    data: {
      userId: user.sub,
      content: validatedData.content,
      status: isScheduled ? PostStatus.SCHEDULED : PostStatus.DRAFT,
      scheduledAt,
      images: validatedData.images || [],
      videos: validatedData.videos || [],
      platforms: {
        create: validatedData.platforms.map(platformId => ({
          platformId,
          status: isScheduled ? PostStatus.SCHEDULED : PostStatus.DRAFT
        }))
      }
    },
    include: {
      platforms: {
        include: {
          platform: true
        }
      }
    }
  });

  // Schedule publishing jobs if needed
  if (isScheduled && scheduledAt) {
    for (const platformId of validatedData.platforms) {
      await QueueService.schedulePost(post.id, platformId, scheduledAt);
    }
  }

  // Log audit event
  await AuditService.log(
    'CREATE',
    'POST',
    post.id,
    user.sub,
    { platforms: validatedData.platforms, scheduled: isScheduled },
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  // Invalidate cache
  const cache = CacheService.getInstance();
  await cache.invalidatePattern('posts:*');

  const formattedPost = {
    id: post.id,
    content: post.content,
    platforms: post.platforms.map(p => p.platformId),
    status: post.status.toLowerCase(),
    scheduledAt: post.scheduledAt?.toISOString(),
    publishedAt: post.publishedAt?.toISOString(),
    engagement: {
      likes: post.totalLikes,
      comments: post.totalComments,
      shares: post.totalShares,
      views: post.totalViews
    },
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    images: post.images,
    videos: post.videos
  };

  return NextResponse.json(formattedPost, { status: 201 });
}

// Export handlers with middleware
export const GET = withMiddleware(
  getPosts,
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);

export const POST = withMiddleware(
  (request: NextRequest) => withAuth(request, createPost),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);