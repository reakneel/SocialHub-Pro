import React, { useState } from 'react';
import { 
  Image, 
  Video, 
  Smile, 
  Calendar, 
  Send, 
  Hash, 
  AtSign,
  Globe,
  Clock
} from 'lucide-react';

const platforms = [
  { id: 'bilibili', name: '哔哩哔哩', limit: 2000, connected: true },
  { id: 'weibo', name: '微博', limit: 140, connected: true },
  { id: 'douyu', name: '斗鱼', limit: 500, connected: false },
  { id: 'twitter', name: 'X (Twitter)', limit: 280, connected: true },
  { id: 'youtube', name: 'YouTube', limit: 5000, connected: false },
];

export const Composer: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['bilibili', 'weibo']);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const getCharacterLimit = () => {
    const selectedPlatformLimits = platforms
      .filter(p => selectedPlatforms.includes(p.id))
      .map(p => p.limit);
    return Math.min(...selectedPlatformLimits);
  };

  const characterLimit = getCharacterLimit();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">内容创作</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsScheduled(!isScheduled)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              isScheduled
                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>定时发布</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主编辑区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 内容编辑器 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">内容</label>
                <span className={`text-sm ${
                  content.length > characterLimit 
                    ? 'text-red-400' 
                    : content.length > characterLimit * 0.8 
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
                }`}>
                  {content.length}/{characterLimit}
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享你的想法..."
                className="w-full h-40 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* 工具栏 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Image className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Video className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Smile className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Hash className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <AtSign className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              <button className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all duration-200">
                {isScheduled ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>{isScheduled ? '安排发布' : '立即发布'}</span>
              </button>
            </div>
          </div>

          {/* 定时发布设置 */}
          {isScheduled && (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">发布时间设置</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">日期</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">时间</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 预览区域 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">内容预览</h3>
            <div className="space-y-4">
              {selectedPlatforms.map(platformId => {
                const platform = platforms.find(p => p.id === platformId);
                if (!platform) return null;

                return (
                  <div key={platformId} className="border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-300">{platform.name}</span>
                      <span className="text-xs text-gray-400">
                        {content.length}/{platform.limit}
                      </span>
                    </div>
                    <p className="text-white">
                      {content.length > platform.limit 
                        ? content.substring(0, platform.limit) + '...'
                        : content || '内容预览将在这里显示...'
                      }
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 平台选择 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">选择发布平台</h3>
            <div className="space-y-3">
              {platforms.map(platform => (
                <div
                  key={platform.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    !platform.connected
                      ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                      : selectedPlatforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                  onClick={() => platform.connected && togglePlatform(platform.id)}
                >
                  <div>
                    <p className="font-medium text-white">{platform.name}</p>
                    <p className="text-sm text-gray-400">字符限制: {platform.limit}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!platform.connected && (
                      <span className="text-xs text-gray-500">未连接</span>
                    )}
                    <div className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
                      selectedPlatforms.includes(platform.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-600'
                    }`}>
                      {selectedPlatforms.includes(platform.id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 发布设置 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">发布设置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">允许评论</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">添加位置信息</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">自动优化内容</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                </button>
              </div>
            </div>
          </div>

          {/* 快速模板 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">快速模板</h3>
            <div className="space-y-2">
              {[
                '产品更新公告',
                '技术分享',
                '用户互动',
                '活动推广',
                '节日祝福'
              ].map((template, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                  onClick={() => setContent(`${template}模板内容...`)}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};