import React from 'react';
import { TrendingUp, Users, MessageSquare, Heart, Eye, Calendar } from 'lucide-react';

const stats = [
  { label: '总发布量', value: '2,847', change: '+12%', icon: MessageSquare, color: 'text-blue-400' },
  { label: '总粉丝数', value: '156.2K', change: '+8.5%', icon: Users, color: 'text-green-400' },
  { label: '互动总数', value: '89.3K', change: '+15.2%', icon: Heart, color: 'text-pink-400' },
  { label: '总曝光量', value: '2.1M', change: '+22.1%', icon: Eye, color: 'text-purple-400' },
];

const recentPosts = [
  {
    id: 1,
    content: '今天分享一个超实用的前端开发技巧！',
    platforms: ['哔哩哔哩', '微博', 'X'],
    status: '已发布',
    engagement: '1.2K',
    time: '2小时前'
  },
  {
    id: 2,
    content: '新的产品功能即将上线，敬请期待！',
    platforms: ['微博', 'X'],
    status: '已发布',
    engagement: '856',
    time: '5小时前'
  },
  {
    id: 3,
    content: '周末愉快！来看看这周的精彩回顾',
    platforms: ['哔哩哔哩', 'YouTube'],
    status: '定时发布',
    engagement: '0',
    time: '明天 10:00'
  },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">仪表板</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>最近 30 天</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 最近发布 */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">最近发布</h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            查看全部
          </button>
        </div>

        <div className="space-y-4">
          {recentPosts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
            >
              <div className="flex-1">
                <p className="text-white mb-2">{post.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span>平台:</span>
                    <div className="flex space-x-1">
                      {post.platforms.map((platform, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-700 rounded text-xs"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span>互动: {post.engagement}</span>
                  <span>{post.time}</span>
                </div>
              </div>
              <div className="ml-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  post.status === '已发布'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {post.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 平台状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">平台表现</h3>
          <div className="space-y-3">
            {[
              { name: '哔哩哔哩', followers: '45.2K', growth: '+2.1K' },
              { name: '微博', followers: '68.9K', growth: '+3.5K' },
              { name: 'X (Twitter)', followers: '32.1K', growth: '+1.8K' },
              { name: 'YouTube', followers: '10.0K', growth: '+0.7K' },
            ].map((platform, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300">{platform.name}</span>
                <div className="text-right">
                  <p className="text-white font-medium">{platform.followers}</p>
                  <p className="text-green-400 text-sm">{platform.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">发布日程</h3>
          <div className="space-y-3">
            {[
              { time: '今天 18:00', content: '技术分享视频', platform: 'YouTube' },
              { time: '明天 10:00', content: '产品更新公告', platform: '微博' },
              { time: '明天 15:00', content: '用户互动直播', platform: '哔哩哔哩' },
            ].map((schedule, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-white">{schedule.content}</p>
                  <p className="text-gray-400 text-sm">{schedule.time}</p>
                </div>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                  {schedule.platform}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};