@@ .. @@
import React from 'react';
import { 
  Home, 
  Edit3, 
  Calendar, 
  BarChart3, 
  Settings,
  Users,
+  FileText,
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
  { id: 'tracking', label: '用户追踪', icon: Users },
  { id: 'analytics', label: '数据分析', icon: BarChart3 },
+  { id: 'docs', label: 'API文档', icon: FileText },
  { id: 'settings', label: '设置', icon: Settings },
];