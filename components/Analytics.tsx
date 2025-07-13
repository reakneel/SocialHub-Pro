import React, { useState } from 'react';
import { TrendingUp, Users, Heart, Eye, MessageSquare, Share2, BarChart3, PieChart } from 'lucide-react';

const timeRanges = [
  { label: '最近7天', value: '7d' },
  { label: '最近30天', value: '30d' },
  { label: '最近90天', value: '90d' },
  { label: '最近1年', value: '1y' },
];

const platforms = [
  { name: '哔哩哔哩', followers: 45234, growth: 2.1, color: 'text-pink-400' },
  { name: '微博', followers: 68912, growth: 3.5, color: 'text-red-400' },
  { name: 'X (Twitter)', followers: 32156, growth: 1.8, color: 'text-blue-400' },
  { name: 'YouTube', followers: 10034, growth: 0.7, color: 'text-red-500' },
];

const engagementData = [
  { platform: '哔哩哔哩', likes: 12453, comments: 3421, shares: 1876 },
  { platform: '微博', likes: 8765, comments: 2134, shares: 987 },
  { platform: 'X', likes: 5432, comments: 1654, shares: 2341 },
  { platform: 'YouTube', likes: 3210, comments: 876, shares: 543 },
];

export const Analytics: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const metrics = [
    { id: 'overview', label: '总览', icon: BarChart3 },
    { id: 'engagement', label: '互动数据', icon: Heart },
    { id: 'growth', label: '增长分析', icon: TrendingUp },
    { id: 'content', label: '内容表现', icon: PieChart },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">数据分析</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all duration-200">
            导出报告
          </button>
        </div>
      </div>

      {/* 指标导航 */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedMetric === metric.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{metric.label}</span>
            </button>
          );
        })}
      </div>

      {/* 总览数据 */}
      {selectedMetric === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: '总曝光量', value: '2.1M', change: '+22.1%', icon: Eye, color: 'text-blue-400' },
              { label: '总互动数', value: '89.3K', change: '+15.2%', icon: Heart, color: 'text-pink-400' },
              { label: '新增粉丝', value: '8.2K', change: '+18.7%', icon: Users, color: 'text-green-400' },
              { label: '内容发布', value: '156', change: '+12.3%', icon: MessageSquare, color: 'text-purple-400' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
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

          {/* 平台表现 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6">平台表现</h3>
            <div className="space-y-6">
              {platforms.map((platform, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${platform.color.replace('text-', 'bg-')}`}></div>
                    <div>
                      <p className="font-medium text-white">{platform.name}</p>
                      <p className="text-sm text-gray-400">{platform.followers.toLocaleString()} 粉丝</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">+{platform.growth}%</p>
                    <p className="text-sm text-gray-400">增长率</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 互动数据 */}
      {selectedMetric === 'engagement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6">平台互动对比</h3>
            <div className="space-y-4">
              {engagementData.map((data, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{data.platform}</h4>
                    <span className="text-sm text-gray-400">总互动: {(data.likes + data.comments + data.shares).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-pink-400 font-bold">{data.likes.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">点赞</p>
                    </div>
                    <div>
                      <p className="text-blue-400 font-bold">{data.comments.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">评论</p>
                    </div>
                    <div>
                      <p className="text-green-400 font-bold">{data.shares.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">分享</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6">互动趋势</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>互动趋势图表</p>
                <p className="text-sm mt-2">图表组件开发中...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 增长分析 */}
      {selectedMetric === 'growth' && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">粉丝增长趋势</h3>
          <div className="h-96 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p className="text-lg">增长趋势图表</p>
              <p className="text-sm mt-2">详细的增长分析图表正在开发中...</p>
            </div>
          </div>
        </div>
      )}

      {/* 内容表现 */}
      {selectedMetric === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6">热门内容</h3>
            <div className="space-y-4">
              {[
                { title: 'AI技术发展趋势分析', engagement: 12450, platform: '哔哩哔哩' },
                { title: '前端开发最佳实践', engagement: 8900, platform: 'YouTube' },
                { title: '产品设计心得分享', engagement: 7650, platform: '微博' },
                { title: '技术团队文化建设', engagement: 6200, platform: 'X' },
              ].map((content, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium mb-1">{content.title}</p>
                    <p className="text-sm text-gray-400">{content.platform}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-bold">{content.engagement.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">互动数</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6">内容类型分布</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>内容分析图表</p>
                <p className="text-sm mt-2">饼图组件开发中...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};