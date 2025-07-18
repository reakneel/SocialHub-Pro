import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { LogService } from '@/lib/logger';
import { QueueService } from '@/lib/queue';
import { supabaseAdmin } from '@/lib/supabase';
import { cache } from '@/lib/redis';

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get posts with optional filtering
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, scheduled, published, failed]
 *         description: Filter by post status
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of posts to skip
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check cache first
    const cacheKey = `posts:${user.id}:${status || 'all'}:${platform || 'all'}:${limit}:${offset}`;
    let cachedResult = await cache.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Build query
    let query = supabaseAdmin
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (platform) {
      query = query.contains('platforms', [platform]);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      throw error;
    }

    const result = {
      posts: posts || [],
      total: count || 0,
      limit,
      offset,
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300);

    return NextResponse.json(result);
  } catch (error) {
    LogService.error('Get posts error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - platforms
 *             properties:
 *               content:
 *                 type: string
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               mediaUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, platforms, scheduledAt, mediaUrls } = body;

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Content and platforms are required' },
        { status: 400 }
      );
    }

    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
    const status = isScheduled ? 'scheduled' : 'draft';

    const { data: newPost, error } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        platforms,
        status,
        scheduled_at: scheduledAt || null,
        media_urls: mediaUrls || [],
        engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
      })
      .select()
      .single();

    if (error || !newPost) {
      throw error || new Error('Failed to create post');
    }

    // Schedule post if needed
    if (isScheduled) {
      await QueueService.schedulePost(newPost.id, user.id, new Date(scheduledAt));
    }

    // Log post creation
    await LogService.auditLog({
      userId: user.id,
      action: 'post_created',
      resourceType: 'post',
      resourceId: newPost.id,
      details: { content: content.substring(0, 100), platforms, status },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Clear cache
    const cachePattern = `posts:${user.id}:*`;
    const keys = await cache.getPattern(cachePattern);
    await Promise.all(keys.map(key => cache.del(key)));

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    LogService.error('Create post error', error as Error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}