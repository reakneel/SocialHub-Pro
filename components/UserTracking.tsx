import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Grid, 
  List, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Star,
  Tag
} from 'lucide-react';

interface TrackedUser {
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
    growth: number;
    lastActive: string;
  }[];
  tags: string[];
  notes: string;
  isActive: boolean;
  addedAt: string;
}

const mockUsers: TrackedUser[] = [
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
        growth: 2.3,
        lastActive: '2小时前',
      },
      {
        platform: 'weibo',
        handle: '@科技大师',
        verified: true,
        followers: 89000,
        following: 234,
        posts: 567,
        engagement: 6.2,
        growth: 1.8,
        lastActive: '1小时前',
      },
    ],
    tags: ['科技', 'KOL', '竞争对手'],
    notes: '主要竞争对手，关注其内容策略',
    isActive: true,
    addedAt: '2024-01-01',
  },
  {
    id: '2',
    username: 'design_master',
    displayName: '设计大师',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100',
    platforms: [
      {
        platform: 'twitter',
        handle: '@design_master',
        verified: false,
        followers: 45000,
        following: 1200,
        posts: 890,
        engagement: 4.7,
        growth: -0.5,
        lastActive: '30分钟前',
      },
      {
        platform: 'youtube',
        handle: 'Design Master',
        verified: true,
        followers: 78000,
        following: 89,
        posts: 156,
        engagement: 12.3,
        growth: 5.2,
        lastActive: '3小时前',
      },
    ],
    tags: ['设计', '创意', '学习'],
    notes: '优秀的设计内容创作者',
    isActive: true,
    addedAt: '2024-01-05',
  },
  {
    id: '3',
    username: 'startup_ceo',
    displayName: '创业CEO',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100',
    platforms: [
      {
        platform: 'twitter',
        handle: '@startup_ceo',
        verified: true,
        followers: 234000,
        following: 567,
        posts: 1234,
        engagement: 15.6,
        growth: 8.9,
        lastActive: '15分钟前',
      },
    ],
    tags: ['创业', '商业', 'CEO'],
    notes: '关注其商业洞察和创业经验分享',
    isActive: false,
    addedAt: '2024-01-10',
  },
];

export const UserTracking: React.FC = () => {
  const [users, setUsers] = useState<TrackedUser[]>(mockUsers);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = !selectedPlatform || 
                           user.platforms.some(p => p.platform === selectedPlatform);
    const matchesTag = !selectedTag || user.tags.includes(selectedTag);
    
    return matchesSearch && matchesPlatform && matchesTag;
  });

  const allTags = Array.from(new Set(users.flatMap(user => user.tags)));

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'bilibili': '🅱️',
      'weibo': '微',
      'twitter': '𝕏',
      'youtube': '📺',
      'douyu': '🐟',
    };
    return icons[platform] || '📱';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const UserCard = ({ user }: { user: TrackedUser }) => (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar}
            alt={user.displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-white">{user.displayName}</h3>
            <p className="text-sm text-gray-400">@{user.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <button className="p-1 rounded hover:bg-gray-700 transition-colors">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {user.platforms.map((platform, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getPlatformIcon(platform.platform)}</span>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white">{platform.handle}</span>
                  {platform.verified && <Star className="w-3 h-3 text-yellow-400" />}
                </div>
                <p className="text-xs text-gray-400">{platform.lastActive}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-white">{formatNumber(platform.followers)}</span>
                {platform.growth > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
              </div>
              <p className="text-xs text-gray-400">互动率: {platform.engagement}%</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {user.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {user.notes && (
        <p className="text-sm text-gray-400 mb-3">{user.notes}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>添加于 {user.addedAt}</span>
        <div className="flex space-x-2">
          <button className="p-1 rounded hover:bg-gray-700 transition-colors">
            <Eye className="w-3 h-3" />
          </button>
          <button className="p-1 rounded hover:bg-gray-700 transition-colors">
            <Heart className="w-3 h-3" />
          </button>
          <button className="p-1 rounded hover:bg-gray-700 transition-colors">
            <MessageSquare className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  const UserListItem = ({ user }: { user: TrackedUser }) => (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar}
            alt={user.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium text-white">{user.displayName}</h3>
            <p className="text-sm text-gray-400">@{user.username}</p>
          </div>
          <div className="flex space-x-2">
            {user.platforms.map((platform, idx) => (
              <span key={idx} className="text-sm">{getPlatformIcon(platform.platform)}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              {formatNumber(user.platforms.reduce((sum, p) => sum + p.followers, 0))}
            </p>
            <p className="text-xs text-gray-400">总粉丝</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              {user.platforms.reduce((sum, p) => sum + p.posts, 0)}
            </p>
            <p className="text-xs text-gray-400">总发布</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              {(user.platforms.reduce((sum, p) => sum + p.engagement, 0) / user.platforms.length).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400">平均互动率</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">用户追踪</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>添加用户</span>
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">所有平台</option>
            <option value="bilibili">哔哩哔哩</option>
            <option value="weibo">微博</option>
            <option value="twitter">X (Twitter)</option>
            <option value="youtube">YouTube</option>
            <option value="douyu">斗鱼</option>
          </select>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">所有标签</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>共 {filteredUsers.length} 个用户</span>
          <span>•</span>
          <span>{filteredUsers.filter(u => u.isActive).length} 个活跃</span>
          <span>•</span>
          <span>{filteredUsers.filter(u => !u.isActive).length} 个非活跃</span>
        </div>
      </div>

      {/* 用户列表 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <UserListItem key={user.id} user={user} />
          ))}
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <p className="text-lg text-gray-400">没有找到匹配的用户</p>
          <p className="text-sm text-gray-500 mt-2">尝试调整搜索条件或添加新用户</p>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">{users.length}</div>
          <div className="text-gray-400">追踪用户</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {users.filter(u => u.isActive).length}
          </div>
          <div className="text-gray-400">活跃用户</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {users.reduce((sum, u) => sum + u.platforms.length, 0)}
          </div>
          <div className="text-gray-400">平台连接</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">{allTags.length}</div>
          <div className="text-gray-400">标签分类</div>
        </div>
      </div>
    </div>
  );
};