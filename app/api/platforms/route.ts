import { NextRequest, NextResponse } from 'next/server';

export interface Platform {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  connected: boolean;
  lastSync: string;
  config: {
    characterLimit: number;
    supportsImages: boolean;
    supportsVideos: boolean;
    supportsScheduling: boolean;
  };
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
  };
}

const platforms: Platform[] = [
  {
    id: 'bilibili',
    name: 'bilibili',
    displayName: '哔哩哔哩',
    icon: '🅱️',
    connected: true,
    lastSync: '2024-01-15T10:30:00Z',
    config: {
      characterLimit: 2000,
      supportsImages: true,
      supportsVideos: true,
      supportsScheduling: true,
    },
  },
  {
    id: 'weibo',
    name: 'weibo',
    displayName: '微博',
    icon: '微',
    connected: true,
    lastSync: '2024-01-15T10:25:00Z',
    config: {
      characterLimit: 140,
      supportsImages: true,
      supportsVideos: true,
      supportsScheduling: true,
    },
  },
  {
    id: 'douyu',
    name: 'douyu',
    displayName: '斗鱼',
    icon: '🐟',
    connected: false,
    lastSync: 'never',
    config: {
      characterLimit: 500,
      supportsImages: true,
      supportsVideos: false,
      supportsScheduling: false,
    },
  },
  {
    id: 'twitter',
    name: 'twitter',
    displayName: 'X (Twitter)',
    icon: '𝕏',
    connected: true,
    lastSync: '2024-01-15T09:45:00Z',
    config: {
      characterLimit: 280,
      supportsImages: true,
      supportsVideos: true,
      supportsScheduling: true,
    },
  },
  {
    id: 'youtube',
    name: 'youtube',
    displayName: 'YouTube',
    icon: '📺',
    connected: false,
    lastSync: 'never',
    config: {
      characterLimit: 5000,
      supportsImages: false,
      supportsVideos: true,
      supportsScheduling: true,
    },
  },
];

export async function GET() {
  return NextResponse.json({ platforms });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platformId, action } = body;

    const platform = platforms.find(p => p.id === platformId);
    if (!platform) {
      return NextResponse.json(
        { error: 'Platform not found' },
        { status: 404 }
      );
    }

    if (action === 'connect') {
      platform.connected = true;
      platform.lastSync = new Date().toISOString();
    } else if (action === 'disconnect') {
      platform.connected = false;
      platform.lastSync = 'never';
      delete platform.credentials;
    }

    return NextResponse.json({ platform });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}