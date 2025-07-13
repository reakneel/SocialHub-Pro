import { NextRequest, NextResponse } from 'next/server';

export interface TrackedUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  platforms: {
    platform: string;
    handle: string;
    verified: boolean;
    followers: number;
    following: number;
    posts: number;
    engagement: number;
    lastActive: string;
  }[];
  tags: string[];
  notes: string;
  isActive: boolean;
  addedAt: string;
  lastUpdated: string;
}

// Mock data
let trackedUsers: TrackedUser[] = [
  {
    id: '1',
    username: 'tech_guru',
    displayName: '科技大师',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
    platforms: [
      {
        platform: 'bilibili',
        handle: '@tech_guru',
        verified: true,
        followers: 125000,
        following: 456,
        posts: 234,
        engagement: 8.5,
        lastActive: '2024-01-15T10:30:00Z',
      },
      {
        platform: 'weibo',
        handle: '@科技大师',
        verified: true,
        followers: 89000,
        following: 234,
        posts: 567,
        engagement: 6.2,
        lastActive: '2024-01-15T09:15:00Z',
      },
    ],
    tags: ['科技', 'KOL', '竞争对手'],
    notes: '主要竞争对手，关注其内容策略',
    isActive: true,
    addedAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-15T10:30:00Z',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const tag = searchParams.get('tag');
  const active = searchParams.get('active');
  const search = searchParams.get('search');

  let filteredUsers = trackedUsers;

  if (platform) {
    filteredUsers = filteredUsers.filter(user =>
      user.platforms.some(p => p.platform === platform)
    );
  }

  if (tag) {
    filteredUsers = filteredUsers.filter(user =>
      user.tags.includes(tag)
    );
  }

  if (active !== null) {
    filteredUsers = filteredUsers.filter(user =>
      user.isActive === (active === 'true')
    );
  }

  if (search) {
    filteredUsers = filteredUsers.filter(user =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.displayName.toLowerCase().includes(search.toLowerCase())
    );
  }

  return NextResponse.json({
    users: filteredUsers,
    total: filteredUsers.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, displayName, platforms, tags, notes } = body;

    if (!username || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Username and platforms are required' },
        { status: 400 }
      );
    }

    const newUser: TrackedUser = {
      id: Date.now().toString(),
      username,
      displayName: displayName || username,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
      platforms,
      tags: tags || [],
      notes: notes || '',
      isActive: true,
      addedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    trackedUsers.push(newUser);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}