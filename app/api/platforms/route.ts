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
const connectPlatformSchema = z.object({
  platformId: z.string(),
  credentials: z.object({
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional()
  }),
  settings: z.object({
    autoPost: z.boolean().default(false),
    defaultHashtags: z.array(z.string()).default([]),
    postFormat: z.string().optional()
  }).optional()
});

const updatePlatformSchema = z.object({
  credentials: z.object({
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional()
  }).optional(),
  settings: z.object({
    autoPost: z.boolean().optional(),
    defaultHashtags: z.array(z.string()).optional(),
    postFormat: z.string().optional()
  }).optional(),
  connected: z.boolean().optional()
});

async function getPlatforms(
  request: NextRequest,
  user: any
) {
  // Check cache first
  const cache = CacheService.getInstance();
  const cacheKey = `platforms:${user.sub}`;
  
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json(JSON.parse(cachedData));
  }

  // Get all available platforms
  const allPlatforms = await prisma.platform.findMany({
    orderBy: { name: 'asc' }
  });

  // Get user's platform connections
  const userPlatforms = await prisma.userPlatform.findMany({
    where: { userId: user.sub },
    include: { platform: true }
  });

  // Create a map for quick lookup
  const userPlatformMap = new Map(
    userPlatforms.map(up => [up.platformId, up])
  );

  // Format response
  const platforms = allPlatforms.map(platform => {
    const userPlatform = userPlatformMap.get(platform.id);
    
    return {
      id: platform.id,
      name: platform.name,
      displayName: platform.displayName,
      icon: platform.icon,
      color: platform.color,
      description: platform.description,
      features: platform.features,
      isConnected: !!userPlatform?.connected,
      connectionStatus: userPlatform?.connected ? 'connected' : 'disconnected',
      lastSync: userPlatform?.lastSync?.toISOString(),
      followers: userPlatform?.followers || 0,
      following: userPlatform?.following || 0,
      posts: userPlatform?.posts || 0,
      settings: userPlatform?.settings || {},
      connectedAt: userPlatform?.connectedAt?.toISOString(),
      updatedAt: userPlatform?.updatedAt?.toISOString()
    };
  });

  const result = {
    platforms,
    summary: {
      total: platforms.length,
      connected: platforms.filter(p => p.isConnected).length,
      totalFollowers: platforms.reduce((sum, p) => sum + p.followers, 0),
      totalPosts: platforms.reduce((sum, p) => sum + p.posts, 0)
    }
  };

  // Cache for 5 minutes
  await cache.set(cacheKey, JSON.stringify(result), 300);

  return NextResponse.json(result);
}

async function connectPlatform(
  request: NextRequest,
  user: any
) {
  const body = await request.json();
  const validatedData = connectPlatformSchema.parse(body);

  // Verify platform exists
  const platform = await prisma.platform.findUnique({
    where: { id: validatedData.platformId }
  });

  if (!platform) {
    return NextResponse.json(
      { error: 'Platform not found' },
      { status: 404 }
    );
  }

  // Check if already connected
  const existingConnection = await prisma.userPlatform.findUnique({
    where: {
      userId_platformId: {
        userId: user.sub,
        platformId: validatedData.platformId
      }
    }
  });

  if (existingConnection?.connected) {
    return NextResponse.json(
      { error: 'Platform already connected' },
      { status: 409 }
    );
  }

  // TODO: Validate credentials with actual platform API
  // For now, we'll simulate credential validation
  const isValidCredentials = await validatePlatformCredentials(
    validatedData.platformId,
    validatedData.credentials
  );

  if (!isValidCredentials) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // Create or update platform connection
  const userPlatform = await prisma.userPlatform.upsert({
    where: {
      userId_platformId: {
        userId: user.sub,
        platformId: validatedData.platformId
      }
    },
    update: {
      connected: true,
      credentials: validatedData.credentials,
      settings: validatedData.settings || {},
      connectedAt: new Date(),
      updatedAt: new Date()
    },
    create: {
      userId: user.sub,
      platformId: validatedData.platformId,
      connected: true,
      credentials: validatedData.credentials,
      settings: validatedData.settings || {},
      connectedAt: new Date()
    },
    include: {
      platform: true
    }
  });

  // Log audit event
  await AuditService.log(
    'CONNECT',
    'PLATFORM',
    validatedData.platformId,
    user.sub,
    { platformId: validatedData.platformId },
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  // Invalidate cache
  const cache = CacheService.getInstance();
  await cache.del(`platforms:${user.sub}`);

  const result = {
    id: userPlatform.platformId,
    name: userPlatform.platform.name,
    displayName: userPlatform.platform.displayName,
    isConnected: userPlatform.connected,
    connectionStatus: 'connected',
    connectedAt: userPlatform.connectedAt?.toISOString(),
    settings: userPlatform.settings
  };

  return NextResponse.json(result, { status: 201 });
}

async function updatePlatform(
  request: NextRequest,
  user: any
) {
  const body = await request.json();
  const { platformId, ...updateData } = body;
  const validatedData = updatePlatformSchema.parse(updateData);

  // Check if platform connection exists
  const userPlatform = await prisma.userPlatform.findUnique({
    where: {
      userId_platformId: {
        userId: user.sub,
        platformId
      }
    }
  });

  if (!userPlatform) {
    return NextResponse.json(
      { error: 'Platform not connected' },
      { status: 404 }
    );
  }

  // If updating credentials, validate them
  if (validatedData.credentials) {
    const isValidCredentials = await validatePlatformCredentials(
      platformId,
      validatedData.credentials
    );

    if (!isValidCredentials) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  }

  // Update platform connection
  const updatedUserPlatform = await prisma.userPlatform.update({
    where: {
      userId_platformId: {
        userId: user.sub,
        platformId
      }
    },
    data: {
      ...(validatedData.credentials && { credentials: validatedData.credentials }),
      ...(validatedData.settings && { settings: validatedData.settings }),
      ...(validatedData.connected !== undefined && { connected: validatedData.connected }),
      updatedAt: new Date()
    },
    include: {
      platform: true
    }
  });

  // Log audit event
  await AuditService.log(
    validatedData.connected === false ? 'DISCONNECT' : 'UPDATE',
    'PLATFORM',
    platformId,
    user.sub,
    validatedData,
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  // Invalidate cache
  const cache = CacheService.getInstance();
  await cache.del(`platforms:${user.sub}`);

  const result = {
    id: updatedUserPlatform.platformId,
    name: updatedUserPlatform.platform.name,
    displayName: updatedUserPlatform.platform.displayName,
    isConnected: updatedUserPlatform.connected,
    connectionStatus: updatedUserPlatform.connected ? 'connected' : 'disconnected',
    connectedAt: updatedUserPlatform.connectedAt?.toISOString(),
    updatedAt: updatedUserPlatform.updatedAt.toISOString(),
    settings: updatedUserPlatform.settings
  };

  return NextResponse.json(result);
}

// Helper function to validate platform credentials
async function validatePlatformCredentials(
  platformId: string,
  credentials: any
): Promise<boolean> {
  // TODO: Implement actual credential validation for each platform
  // For now, we'll simulate validation
  
  switch (platformId) {
    case 'twitter':
      return !!(credentials.accessToken && credentials.apiKey);
    case 'weibo':
      return !!(credentials.accessToken && credentials.apiSecret);
    case 'bilibili':
      return !!(credentials.username && credentials.password);
    case 'douyu':
      return !!(credentials.apiKey);
    case 'youtube':
      return !!(credentials.accessToken && credentials.refreshToken);
    default:
      return false;
  }
}

// Export handlers with middleware
export const GET = withMiddleware(
  (request: NextRequest) => withAuth(request, getPlatforms),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);

export const POST = withMiddleware(
  (request: NextRequest) => withAuth(request, connectPlatform),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);

export const PUT = withMiddleware(
  (request: NextRequest) => withAuth(request, updatePlatform),
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);