import React, { useState } from 'react';
import { Calendar, Clock, Edit, Trash2, Copy, MoreHorizontal } from 'lucide-react';

const scheduledPosts = [
  {
    id: 1,
    content: '新功能发布：AI智能内容优化工具现已上线！帮助您创作更优质的社交媒体内容。',
    platforms: ['哔哩哔哩', '微博', 'X'],
    date: '2024-01-15',
    time: '10:00',
    status: '等待发布',
    engagement: 0
  },
  {
    id: 2,
    content: '周末技术分享：前端性能优化的10个实用技巧，让你的网站飞起来！',
    platforms: ['YouTube', '哔哩哔哩'],
    date: '2024-01-16',
    time: '15:30',
    status: '等待发布',
    engagement: 0
  },
  {
    id: 3,
    content: '感谢大家对我们产品的支持！用户数突破10万，我们会继续努力！',
    platforms: ['微博', 'X'],
    date: '2024-01-17',
    time: '18:00',
    status: '等待发布',
    engagement: 0
  },
  {
    id: 4,
    content: '直播预告：明晚8点，我们将在线分享最新的AI技术趋势，不见不散！',
    platforms: ['哔哩哔哩', '斗鱼'],
    date: '2024-01-18',
    time: '20:00',
    status: '等待发布',
    engagement: 0
  }
];

export const Schedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '等待发布':
        return 'bg-yellow-500/20 text-yellow-400';
      case '已发布':
        return 'bg-green-500/20 text-green-400';
      case '发布失败':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">发布计划</h2>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              列表视图
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              日历视图
            </button>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all duration-200">
            新建计划
          </button>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors">
            <option value="">所有平台</option>
            <option value="bilibili">哔哩哔哩</option>
            <option value="weibo">微博</option>
            <option value="twitter">X (Twitter)</option>
            <option value="youtube">YouTube</option>
          </select>
          <select className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors">
            <option value="">所有状态</option>
            <option value="pending">等待发布</option>
            <option value="published">已发布</option>
            <option value="failed">发布失败</option>
          </select>
        </div>
      </div>

      {/* 计划列表 */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {scheduledPosts.map((post) => (
            <div
              key={post.id}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{post.time}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                  
                  <p className="text-white mb-3 leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">发布平台:</span>
                      <div className="flex space-x-1">
                        {post.platforms.map((platform, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                    <Edit className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                    <Copy className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-800 hover:bg-red-600 transition-colors">
                    <Trash2 className="w-4 h-4 text-gray-300 hover:text-white" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 日历视图 */}
      {viewMode === 'calendar' && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="text-center text-gray-400 py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">日历视图功能开发中...</p>
            <p className="text-sm mt-2">敬请期待更直观的时间管理体验</p>
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {scheduledPosts.filter(p => p.status === '等待发布').length}
          </div>
          <div className="text-gray-400">等待发布</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">12</div>
          <div className="text-gray-400">本月已发布</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">8</div>
          <div className="text-gray-400">本周计划</div>
        </div>
      </div>
    </div>
  );
};