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
  withMiddleware,
  NotFoundError 
} from '@/lib/middleware';
import { PostStatus } from '@prisma/client';

// Validation schema
const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  platforms: z.array(z.string()).min(1).optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional()
});

async function getPost(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
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
    }
  });
  
  if (!post) {
    throw new NotFoundError('Post not found');
  }

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
    videos: post.videos,
    user: post.user
  };

  return NextResponse.json(formattedPost);
}

async function updatePost(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validatedData = updatePostSchema.parse(body);

  // Check if post exists and user has permission
  const existingPost = await prisma.post.findFirst({
    where: { 
      id: params.id,
      userId: user.sub 
    },
    include: {
      platforms: true
    }
  });

  if (!existingPost) {
    throw new NotFoundError('Post not found or access denied');
  }

  // Verify platforms if provided
  if (validatedData.platforms) {
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
  }

  const scheduledAt = validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : undefined;
  const isScheduled = scheduledAt && scheduledAt > new Date();

  // Update post
  const updatedPost = await prisma.post.update({
    where: { id: params.id },
    data: {
      ...(validatedData.content && { content: validatedData.content }),
      ...(validatedData.scheduledAt && { scheduledAt }),
      ...(validatedData.status && { status: validatedData.status.toUpperCase() as PostStatus }),
      ...(validatedData.images && { images: validatedData.images }),
      ...(validatedData.videos && { videos: validatedData.videos }),
      updatedAt: new Date()
    },
    include: {
      platforms: {
        include: {
          platform: true
        }
      }
    }
  });

  // Update platforms if provided
  if (validatedData.platforms) {
    // Remove old platform associations
    await prisma.postPlatform.deleteMany({
      where: { postId: params.id }
    });

    // Create new platform associations
    await prisma.postPlatform.createMany({
      data: validatedData.platforms.map(platformId => ({
        postId: params.id,
        platformId,
        status: isScheduled ? PostStatus.SCHEDULED : PostStatus.DRAFT
      }))
    });

    // Cancel existing jobs if rescheduling
    const existingJobs = await prisma.postJob.findMany({
      where: { 
        postId: params.id,
        status: 'PENDING'
      }
    });

    for (const job of existingJobs) {
      await QueueService.cancelJob(job.jobId);
    }

    // Schedule new jobs if needed
    if (isScheduled && scheduledAt) {
      for (const platformId of validatedData.platforms) {
        await QueueService.schedulePost(params.id, platformId, scheduledAt);
      }
    }
  }

  // Log audit event
  await AuditService.log(
    'UPDATE',
    'POST',
    params.id,
    user.sub,
    validatedData,
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  // Invalidate cache
  const cache = CacheService.getInstance();
  await cache.invalidatePattern('posts:*');

  const formattedPost = {
    id: updatedPost.id,
    content: updatedPost.content,
    platforms: updatedPost.platforms.map(p => p.platformId),
    status: updatedPost.status.toLowerCase(),
    scheduledAt: updatedPost.scheduledAt?.toISOString(),
    publishedAt: updatedPost.publishedAt?.toISOString(),
    engagement: {
      likes: updatedPost.totalLikes,
      comments: updatedPost.totalComments,
      shares: updatedPost.totalShares,
      views: updatedPost.totalViews
    },
    createdAt: updatedPost.createdAt.toISOString(),
    updatedAt: updatedPost.updatedAt.toISOString(),
    images: updatedPost.images,
    videos: updatedPost.videos
  };

  return NextResponse.json(formattedPost);
}

async function deletePost(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  // Check if post exists and user has permission
  const existingPost = await prisma.post.findFirst({
    where: { 
      id: params.id,
      userId: user.sub 
    }
  });

  if (!existingPost) {
    throw new NotFoundError('Post not found or access denied');
  }

  // Cancel any pending jobs
  const pendingJobs = await prisma.postJob.findMany({
    where: { 
      postId: params.id,
      status: 'PENDING'
    }
  });

  for (const job of pendingJobs) {
    await QueueService.cancelJob(job.jobId);
  }

  // Delete post (cascade will handle related records)
  await prisma.post.delete({
    where: { id: params.id }
  });

  // Log audit event
  await AuditService.log(
    'DELETE',
    'POST',
    params.id,
    user.sub,
    null,
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  // Invalidate cache
  const cache = CacheService.getInstance();
  await cache.invalidatePattern('posts:*');

  return NextResponse.json({ success: true });
}

// Export handlers with middleware
export const GET = withMiddleware(
  getPost,
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);

export const PUT = withMiddleware(
  (request: NextRequest, context: { params: { id: string } }) => 
    withAuth(request, (req, user) => updatePost(req, user, context)),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);

export const DELETE = withMiddleware(
  (request: NextRequest, context: { params: { id: string } }) => 
    withAuth(request, (req, user) => deletePost(req, user, context)),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);