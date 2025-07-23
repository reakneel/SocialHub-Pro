import Queue from 'bull';
import { redis } from './redis';
import { prisma } from './prisma';
import { PostStatus, JobStatus, JobType } from '@prisma/client';

// Create job queues
export const postQueue = new Queue('post publishing', {
  redis: {
    port: parseInt(process.env.REDIS_PORT || '6379'),
    host: process.env.REDIS_HOST || 'localhost',
  },
});

export const analyticsQueue = new Queue('analytics update', {
  redis: {
    port: parseInt(process.env.REDIS_PORT || '6379'),
    host: process.env.REDIS_HOST || 'localhost',
  },
});

// Job processors
postQueue.process('publish-post', async (job) => {
  const { postId, platformId } = job.data;
  
  try {
    // Update job status
    await prisma.postJob.update({
      where: { jobId: job.id.toString() },
      data: { 
        status: JobStatus.PROCESSING,
        executedAt: new Date()
      }
    });

    // Get post and platform data
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true,
        platforms: {
          where: { platformId },
          include: { platform: true }
        }
      }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const postPlatform = post.platforms[0];
    if (!postPlatform) {
      throw new Error('Platform configuration not found');
    }

    // Get user platform credentials
    const userPlatform = await prisma.userPlatform.findUnique({
      where: {
        userId_platformId: {
          userId: post.userId,
          platformId
        }
      }
    });

    if (!userPlatform || !userPlatform.connected) {
      throw new Error('Platform not connected');
    }

    // Simulate platform API call
    const publishResult = await publishToSocialPlatform(
      platformId,
      post.content,
      userPlatform.accessToken!,
      post.images,
      post.videos
    );

    // Update post platform status
    await prisma.postPlatform.update({
      where: { id: postPlatform.id },
      data: {
        status: PostStatus.PUBLISHED,
        platformPostId: publishResult.postId,
        publishedAt: new Date()
      }
    });

    // Update main post status if all platforms are published
    const allPlatforms = await prisma.postPlatform.findMany({
      where: { postId }
    });

    const allPublished = allPlatforms.every(p => 
      p.status === PostStatus.PUBLISHED || p.status === PostStatus.FAILED
    );

    if (allPublished) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: PostStatus.PUBLISHED,
          publishedAt: new Date()
        }
      });
    }

    // Update job status
    await prisma.postJob.update({
      where: { jobId: job.id.toString() },
      data: { status: JobStatus.COMPLETED }
    });

    return { success: true, platformPostId: publishResult.postId };

  } catch (error) {
    console.error('Post publishing failed:', error);

    // Update post platform status
    await prisma.postPlatform.updateMany({
      where: { postId, platformId },
      data: {
        status: PostStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    // Update job status
    await prisma.postJob.update({
      where: { jobId: job.id.toString() },
      data: { 
        status: JobStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    throw error;
  }
});

analyticsQueue.process('update-analytics', async (job) => {
  const { platformId, date } = job.data;
  
  try {
    // Simulate fetching analytics data from platform API
    const analyticsData = await fetchPlatformAnalytics(platformId, date);
    
    // Update or create analytics record
    await prisma.analytics.upsert({
      where: {
        platformId_date: {
          platformId,
          date: new Date(date)
        }
      },
      update: {
        followers: analyticsData.followers,
        posts: analyticsData.posts,
        engagement: analyticsData.engagement,
        reach: analyticsData.reach
      },
      create: {
        platformId,
        date: new Date(date),
        followers: analyticsData.followers,
        posts: analyticsData.posts,
        engagement: analyticsData.engagement,
        reach: analyticsData.reach
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Analytics update failed:', error);
    throw error;
  }
});

// Helper functions for platform API integration
async function publishToSocialPlatform(
  platformId: string,
  content: string,
  accessToken: string,
  images: string[],
  videos: string[]
): Promise<{ postId: string }> {
  // This would integrate with actual platform APIs
  // For now, we'll simulate the API call
  
  console.log(`Publishing to ${platformId}:`, { content, images, videos });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate success/failure
  if (Math.random() > 0.1) { // 90% success rate
    return { postId: `${platformId}_${Date.now()}` };
  } else {
    throw new Error(`Failed to publish to ${platformId}`);
  }
}

async function fetchPlatformAnalytics(
  platformId: string,
  date: string
): Promise<{
  followers: number;
  posts: number;
  engagement: number;
  reach: number;
}> {
  // This would integrate with actual platform APIs
  // For now, we'll simulate the data
  
  console.log(`Fetching analytics for ${platformId} on ${date}`);
  
  return {
    followers: Math.floor(Math.random() * 100000) + 10000,
    posts: Math.floor(Math.random() * 50) + 1,
    engagement: Math.floor(Math.random() * 10000) + 100,
    reach: Math.floor(Math.random() * 500000) + 50000
  };
}

// Queue management utilities
export class QueueService {
  static async schedulePost(postId: string, platformId: string, scheduledAt: Date) {
    const job = await postQueue.add(
      'publish-post',
      { postId, platformId },
      {
        delay: scheduledAt.getTime() - Date.now(),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    // Save job reference in database
    await prisma.postJob.create({
      data: {
        postId,
        jobId: job.id.toString(),
        type: JobType.PUBLISH_POST,
        status: JobStatus.PENDING,
        scheduledAt
      }
    });

    return job.id;
  }

  static async scheduleAnalyticsUpdate(platformId: string, date: Date) {
    const job = await analyticsQueue.add(
      'update-analytics',
      { platformId, date: date.toISOString() },
      {
        repeat: { cron: '0 2 * * *' }, // Daily at 2 AM
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );

    return job.id;
  }

  static async cancelJob(jobId: string) {
    const job = await postQueue.getJob(jobId);
    if (job) {
      await job.remove();
      
      // Update database
      await prisma.postJob.update({
        where: { jobId },
        data: { status: JobStatus.CANCELLED }
      });
    }
  }

  static async getJobStatus(jobId: string) {
    const job = await postQueue.getJob(jobId);
    return job ? job.opts : null;
  }
}