import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Key,
  Download,
  Upload,
  Trash2,
  Check,
  X
} from 'lucide-react';

const settingsSections = [
  { id: 'profile', label: '个人资料', icon: User },
  { id: 'notifications', label: '通知设置', icon: Bell },
  { id: 'security', label: '安全设置', icon: Shield },
  { id: 'appearance', label: '外观设置', icon: Palette },
  { id: 'language', label: '语言设置', icon: Globe },
  { id: 'data', label: '数据管理', icon: Database },
];

const connectedPlatforms = [
  { id: 'bilibili', name: '哔哩哔哩', connected: true, lastSync: '2分钟前' },
  { id: 'weibo', name: '微博', connected: true, lastSync: '5分钟前' },
  { id: 'twitter', name: 'X (Twitter)', connected: true, lastSync: '1小时前' },
  { id: 'youtube', name: 'YouTube', connected: false, lastSync: '从未' },
  { id: 'douyu', name: '斗鱼', connected: false, lastSync: '从未' },
];

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    mentions: true,
    followers: false,
    posts: true,
  });

  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('zh-CN');

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">
                  更换头像
                </button>
                <p className="text-sm text-gray-400 mt-2">支持 JPG、PNG 格式，建议尺寸 400x400px</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">用户名</label>
                <input
                  type="text"
                  defaultValue="社交媒体管理员"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
                <input
                  type="email"
                  defaultValue="admin@example.com"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">简介</label>
                <textarea
                  rows={4}
                  defaultValue="专业的社交媒体内容管理专家，致力于帮助企业和个人提升社交媒体影响力。"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all duration-200">
                保存更改
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">通知偏好</h3>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => {
                const labels: Record<string, string> = {
                  email: '邮件通知',
                  push: '推送通知',
                  mentions: '提及通知',
                  followers: '新粉丝通知',
                  posts: '发布提醒',
                };

                return (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{labels[key]}</p>
                      <p className="text-sm text-gray-400">接收相关活动的通知</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">平台连接状态</h3>
              <div className="space-y-4">
                {connectedPlatforms.map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        platform.connected ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-white">{platform.name}</p>
                        <p className="text-sm text-gray-400">
                          最后同步: {platform.lastSync}
                        </p>
                      </div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        platform.connected
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      }`}
                    >
                      {platform.connected ? '断开连接' : '立即连接'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">API密钥管理</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">主API密钥</p>
                      <p className="text-sm text-gray-400">sk-***************xyz123</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">
                    重新生成
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">修改密码</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">当前密码</label>
                  <input
                    type="password"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">新密码</label>
                  <input
                    type="password"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">确认新密码</label>
                  <input
                    type="password"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors">
                  更新密码
                </button>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">主题设置</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'dark', name: '深色主题', preview: 'bg-gray-900' },
                  { id: 'light', name: '浅色主题', preview: 'bg-gray-100' },
                  { id: 'auto', name: '跟随系统', preview: 'bg-gradient-to-r from-gray-900 to-gray-100' },
                ].map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id)}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      theme === themeOption.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-full h-16 ${themeOption.preview} rounded mb-3`}></div>
                    <p className="text-sm font-medium text-white">{themeOption.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">字体大小</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">小</span>
                <input
                  type="range"
                  min="12"
                  max="18"
                  defaultValue="14"
                  className="flex-1"
                />
                <span className="text-sm text-gray-400">大</span>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">界面语言</h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
                <option value="ko-KR">한국어</option>
              </select>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">时区设置</h3>
              <select className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
                <option value="Asia/Tokyo">东京时间 (UTC+9)</option>
                <option value="America/New_York">纽约时间 (UTC-5)</option>
                <option value="Europe/London">伦敦时间 (UTC+0)</option>
              </select>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">数据导出</h3>
              <p className="text-gray-400 mb-4">导出您的所有数据，包括发布历史、分析报告等。</p>
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  <span>导出所有数据</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  <span>导出分析报告</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">数据导入</h3>
              <p className="text-gray-400 mb-4">从其他平台导入您的数据。</p>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors">
                <Upload className="w-4 h-4" />
                <span>选择文件导入</span>
              </button>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-400">危险操作</h3>
              <p className="text-gray-400 mb-4">以下操作将永久删除您的数据，请谨慎操作。</p>
              <div className="space-y-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg font-medium text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  <span>清空所有数据</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg font-medium text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                  <span>删除账户</span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">设置</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 设置导航 */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400'
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 设置内容 */}
        <div className="lg:col-span-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};