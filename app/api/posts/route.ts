import { NextRequest, NextResponse } from 'next/server';

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
}

// Mock data - in production, this would come from a database
let posts: Post[] = [
  {
    id: '1',
    content: '新功能发布：AI智能内容优化工具现已上线！',
    platforms: ['bilibili', 'weibo', 'twitter'],
    status: 'published',
    publishedAt: '2024-01-15T10:00:00Z',
    engagement: { likes: 1250, comments: 89, shares: 156, views: 12500 },
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  let filteredPosts = posts;

  if (status) {
    filteredPosts = filteredPosts.filter(post => post.status === status);
  }

  if (platform) {
    filteredPosts = filteredPosts.filter(post => post.platforms.includes(platform));
  }

  const paginatedPosts = filteredPosts.slice(offset, offset + limit);

  return NextResponse.json({
    posts: paginatedPosts,
    total: filteredPosts.length,
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, platforms, scheduledAt } = body;

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Content and platforms are required' },
        { status: 400 }
      );
    }

    const newPost: Post = {
      id: Date.now().toString(),
      content,
      platforms,
      status: scheduledAt ? 'scheduled' : 'published',
      scheduledAt,
      publishedAt: scheduledAt ? undefined : new Date().toISOString(),
      engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.push(newPost);

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}