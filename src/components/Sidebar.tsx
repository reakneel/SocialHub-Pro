import React from 'react';
import { 
  Home, 
  Edit3, 
  Calendar, 
  BarChart3, 
  Settings,
  Youtube,
  Twitter,
  Instagram,
  TwitchIcon as Twitch
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
}

const menuItems = [
  { id: 'dashboard', label: '仪表板', icon: Home },
  { id: 'composer', label: '内容创作', icon: Edit3 },
  { id: 'schedule', label: '发布计划', icon: Calendar },
  { id: 'analytics', label: '数据分析', icon: BarChart3 },
  { id: 'settings', label: '设置', icon: Settings },
];

const platforms = [
  { name: '哔哩哔哩', icon: '🅱️', color: 'text-pink-400', connected: true },
  { name: '微博', icon: '微', color: 'text-red-400', connected: true },
  { name: '斗鱼', icon: '🐟', color: 'text-orange-400', connected: false },
  { name: 'X (Twitter)', icon: Twitter, color: 'text-blue-400', connected: true },
  { name: 'YouTube', icon: Youtube, color: 'text-red-500', connected: false },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen }) => {
  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 transition-all duration-300 z-40 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400'
                    : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {isOpen && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">连接的平台</h3>
            <div className="space-y-2">
              {platforms.map((platform, index) => {
                const Icon = typeof platform.icon === 'string' ? null : platform.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50"
                  >
                    <div className="flex items-center space-x-2">
                      {Icon ? (
                        <Icon className={`w-4 h-4 ${platform.color}`} />
                      ) : (
                        <span className="text-sm">{platform.icon}</span>
                      )}
                      <span className="text-sm text-gray-300">{platform.name}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      platform.connected ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};