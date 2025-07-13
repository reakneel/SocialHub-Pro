import { NextRequest, NextResponse } from 'next/server';

export interface AnalyticsData {
  platform: string;
  metrics: {
    followers: number;
    posts: number;
    engagement: number;
    reach: number;
  };
  growth: {
    followers: number;
    engagement: number;
  };
  timeRange: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || '30d';
  const platform = searchParams.get('platform');

  // Mock analytics data
  const analyticsData: AnalyticsData[] = [
    {
      platform: 'bilibili',
      metrics: { followers: 45234, posts: 156, engagement: 12453, reach: 234567 },
      growth: { followers: 2.1, engagement: 15.2 },
      timeRange,
    },
    {
      platform: 'weibo',
      metrics: { followers: 68912, posts: 203, engagement: 8765, reach: 345678 },
      growth: { followers: 3.5, engagement: 12.8 },
      timeRange,
    },
    {
      platform: 'twitter',
      metrics: { followers: 32156, posts: 89, engagement: 5432, reach: 123456 },
      growth: { followers: 1.8, engagement: 8.9 },
      timeRange,
    },
    {
      platform: 'youtube',
      metrics: { followers: 10034, posts: 45, engagement: 3210, reach: 87654 },
      growth: { followers: 0.7, engagement: 5.4 },
      timeRange,
    },
  ];

  let filteredData = analyticsData;

  if (platform) {
    filteredData = analyticsData.filter(data => data.platform === platform);
  }

  return NextResponse.json({
    data: filteredData,
    summary: {
      totalFollowers: analyticsData.reduce((sum, data) => sum + data.metrics.followers, 0),
      totalPosts: analyticsData.reduce((sum, data) => sum + data.metrics.posts, 0),
      totalEngagement: analyticsData.reduce((sum, data) => sum + data.metrics.engagement, 0),
      totalReach: analyticsData.reduce((sum, data) => sum + data.metrics.reach, 0),
    },
  });
}