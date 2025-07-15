import Bull from 'bull';
import { supabaseAdmin } from './supabase';
import { LogService } from './logger';

// Create job queues
export const postQueue = new Bull('post publishing', process.env.REDIS_URL || 'redis://localhost:6379');
export const analyticsQueue = new Bull('analytics processing', process.env.REDIS_URL || 'redis://localhost:6379');
export const notificationQueue = new Bull('notifications', process.env.REDIS_URL || 'redis://localhost:6379');

// Post publishing job processor
postQueue.process('publish-post', async (job) => {
  const { postId, userId } = job.data;
  
  try {
    LogService.info('Processing post publication', { postId, userId });

    // Get post data
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !post) {
      throw new Error('Post not found');
    }

    // Get user's platform connections
    const { data: connections } = await supabaseAdmin
      .from('platform_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .in('platform', post.platforms);

    if (!connections || connections.length === 0) {
      throw new Error('No active platform connections found');
    }

    const results = [];

    // Publish to each platform
    for (const connection of connections) {
      try {
        const result = await publishToPlatform(connection, post);
        results.push({ platform: connection.platform, success: true, result });
      } catch (error) {
        results.push({ 
          platform: connection.platform, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Update post status
    const allSuccessful = results.every(r => r.success);
    const status = allSuccessful ? 'published' : 'failed';

    await supabaseAdmin
      .from('posts')
      .update({
        status,
        published_at: allSuccessful ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    // Log audit trail
    await LogService.auditLog({
      userId,
      action: 'post_published',
      resourceType: 'post',
      resourceId: postId,
      details: { results, status },
      ipAddress: 'system',
      userAgent: 'queue-worker',
    });

    LogService.info('Post publication completed', { postId, status, results });

    return { success: allSuccessful, results };
  } catch (error) {
    LogService.error('Post publication failed', error as Error, { postId, userId });
    
    // Update post status to failed
    await supabaseAdmin
      .from('posts')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    throw error;
  }
});

// Analytics processing job processor
analyticsQueue.process('update-analytics', async (job) => {
  const { userId, platform } = job.data;
  
  try {
    LogService.info('Processing analytics update', { userId, platform });

    // Fetch analytics data from platform APIs
    const analyticsData = await fetchPlatformAnalytics(platform, userId);

    // Store analytics data (you would implement this based on your schema)
    // await storeAnalyticsData(userId, platform, analyticsData);

    LogService.info('Analytics update completed', { userId, platform });

    return analyticsData;
  } catch (error) {
    LogService.error('Analytics update failed', error as Error, { userId, platform });
    throw error;
  }
});

// Notification job processor
notificationQueue.process('send-notification', async (job) => {
  const { userId, type, message, data } = job.data;
  
  try {
    LogService.info('Processing notification', { userId, type });

    // Send notification (implement based on your notification system)
    await sendNotification(userId, type, message, data);

    LogService.info('Notification sent', { userId, type });

    return { success: true };
  } catch (error) {
    LogService.error('Notification failed', error as Error, { userId, type });
    throw error;
  }
});

// Helper functions (implement based on your platform integrations)
async function publishToPlatform(connection: any, post: any) {
  // This is where you would implement actual platform publishing
  // For now, we'll simulate the process
  
  switch (connection.platform) {
    case 'bilibili':
      return await publishToBilibili(connection, post);
    case 'weibo':
      return await publishToWeibo(connection, post);
    case 'twitter':
      return await publishToTwitter(connection, post);
    case 'youtube':
      return await publishToYouTube(connection, post);
    case 'douyu':
      return await publishToDouyu(connection, post);
    default:
      throw new Error(`Unsupported platform: ${connection.platform}`);
  }
}

async function publishToBilibili(connection: any, post: any) {
  // Implement Bilibili API integration
  LogService.info('Publishing to Bilibili', { postId: post.id });
  return { platform_post_id: 'bilibili_' + Date.now() };
}

async function publishToWeibo(connection: any, post: any) {
  // Implement Weibo API integration
  LogService.info('Publishing to Weibo', { postId: post.id });
  return { platform_post_id: 'weibo_' + Date.now() };
}

async function publishToTwitter(connection: any, post: any) {
  // Implement Twitter API integration
  LogService.info('Publishing to Twitter', { postId: post.id });
  return { platform_post_id: 'twitter_' + Date.now() };
}

async function publishToYouTube(connection: any, post: any) {
  // Implement YouTube API integration
  LogService.info('Publishing to YouTube', { postId: post.id });
  return { platform_post_id: 'youtube_' + Date.now() };
}

async function publishToDouyu(connection: any, post: any) {
  // Implement Douyu API integration
  LogService.info('Publishing to Douyu', { postId: post.id });
  return { platform_post_id: 'douyu_' + Date.now() };
}

async function fetchPlatformAnalytics(platform: string, userId: string) {
  // Implement platform analytics fetching
  LogService.info('Fetching analytics', { platform, userId });
  return { followers: 1000, engagement: 5.5, posts: 50 };
}

async function sendNotification(userId: string, type: string, message: string, data: any) {
  // Implement notification sending (email, push, etc.)
  LogService.info('Sending notification', { userId, type, message });
}

// Job scheduling helpers
export class QueueService {
  static async schedulePost(postId: string, userId: string, scheduledAt: Date) {
    const delay = scheduledAt.getTime() - Date.now();
    
    if (delay <= 0) {
      // Publish immediately
      return postQueue.add('publish-post', { postId, userId });
    } else {
      // Schedule for later
      return postQueue.add('publish-post', { postId, userId }, { delay });
    }
  }

  static async scheduleAnalyticsUpdate(userId: string, platform: string) {
    return analyticsQueue.add('update-analytics', { userId, platform }, {
      repeat: { cron: '0 */6 * * *' }, // Every 6 hours
    });
  }

  static async sendNotification(userId: string, type: string, message: string, data?: any) {
    return notificationQueue.add('send-notification', { userId, type, message, data });
  }

  static async getJobStats() {
    const [postStats, analyticsStats, notificationStats] = await Promise.all([
      postQueue.getJobCounts(),
      analyticsQueue.getJobCounts(),
      notificationQueue.getJobCounts(),
    ]);

    return {
      posts: postStats,
      analytics: analyticsStats,
      notifications: notificationStats,
    };
  }
}