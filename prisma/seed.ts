import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default platforms
  const platforms = [
    {
      id: 'bilibili',
      name: 'bilibili',
      displayName: '哔哩哔哩',
      icon: '🅱️',
      color: '#00A1D6',
      description: '中国最大的年轻人文化社区',
      features: {
        characterLimit: 2000,
        supportsImages: true,
        supportsVideos: true,
        supportsScheduling: true,
        supportsHashtags: true,
        supportsMentions: true
      }
    },
    {
      id: 'weibo',
      name: 'weibo',
      displayName: '微博',
      icon: '微',
      color: '#E6162D',
      description: '中国最大的社交媒体平台',
      features: {
        characterLimit: 140,
        supportsImages: true,
        supportsVideos: true,
        supportsScheduling: true,
        supportsHashtags: true,
        supportsMentions: true
      }
    },
    {
      id: 'douyu',
      name: 'douyu',
      displayName: '斗鱼',
      icon: '🐟',
      color: '#FF7500',
      description: '中国领先的游戏直播平台',
      features: {
        characterLimit: 500,
        supportsImages: true,
        supportsVideos: false,
        supportsScheduling: false,
        supportsHashtags: false,
        supportsMentions: true
      }
    },
    {
      id: 'twitter',
      name: 'twitter',
      displayName: 'X (Twitter)',
      icon: '𝕏',
      color: '#1DA1F2',
      description: '全球社交媒体平台',
      features: {
        characterLimit: 280,
        supportsImages: true,
        supportsVideos: true,
        supportsScheduling: true,
        supportsHashtags: true,
        supportsMentions: true
      }
    },
    {
      id: 'youtube',
      name: 'youtube',
      displayName: 'YouTube',
      icon: '📺',
      color: '#FF0000',
      description: '全球最大的视频分享平台',
      features: {
        characterLimit: 5000,
        supportsImages: false,
        supportsVideos: true,
        supportsScheduling: true,
        supportsHashtags: true,
        supportsMentions: false
      }
    }
  ];

  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { id: platform.id },
      update: platform,
      create: platform
    });
    console.log(`✅ Created/updated platform: ${platform.displayName}`);
  }

  // Create demo user (optional)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@socialhub.com' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@socialhub.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: demo123
      name: 'Demo User',
      role: 'USER'
    }
  });
  console.log(`✅ Created demo user: ${demoUser.email}`);

  // Create sample analytics data for demo user
  const now = new Date();
  const analyticsData = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    for (const platform of platforms.slice(0, 3)) { // Only for first 3 platforms
      analyticsData.push({
        userId: demoUser.id,
        platformId: platform.id,
        date,
        followers: Math.floor(Math.random() * 10000) + 1000,
        posts: Math.floor(Math.random() * 10) + 1,
        likes: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
        views: Math.floor(Math.random() * 50000) + 5000
      });
    }
  }

  await prisma.analytics.createMany({
    data: analyticsData,
    skipDuplicates: true
  });
  console.log(`✅ Created ${analyticsData.length} analytics records`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });