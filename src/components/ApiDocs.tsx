import React, { useState } from 'react';
import { FileText, Code, Database, Shield, Upload, Users, BarChart3, Settings } from 'lucide-react';

const apiEndpoints = [
  {
    category: 'Authentication',
    icon: Shield,
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/register',
        description: '用户注册',
        request: {
          email: 'user@example.com',
          password: 'securepassword',
          username: 'username',
          fullName: 'Full Name'
        },
        response: {
          user: {
            id: 'uuid',
            email: 'user@example.com',
            username: 'username',
            full_name: 'Full Name',
            role: 'user'
          },
          token: 'jwt-token'
        }
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: '用户登录',
        request: {
          email: 'user@example.com',
          password: 'securepassword'
        },
        response: {
          user: { id: 'uuid', email: 'user@example.com' },
          token: 'jwt-token'
        }
      }
    ]
  },
  {
    category: 'Posts',
    icon: FileText,
    endpoints: [
      {
        method: 'GET',
        path: '/api/posts',
        description: '获取帖子列表',
        params: 'status, platform, limit, offset',
        response: {
          posts: [
            {
              id: 'uuid',
              content: 'Post content',
              platforms: ['bilibili', 'weibo'],
              status: 'published',
              engagement: { likes: 1250, comments: 89 }
            }
          ],
          total: 1
        }
      },
      {
        method: 'POST',
        path: '/api/posts',
        description: '创建新帖子',
        request: {
          content: 'Your post content',
          platforms: ['bilibili', 'weibo'],
          scheduledAt: '2024-01-16T10:00:00Z'
        }
      }
    ]
  },
  {
    category: 'File Upload',
    icon: Upload,
    endpoints: [
      {
        method: 'POST',
        path: '/api/upload',
        description: '上传文件',
        request: 'multipart/form-data with files field',
        response: {
          files: [
            {
              url: 'https://storage-url/file.jpg',
              filename: 'user-id/uploads/timestamp.jpg',
              size: 1024000,
              type: 'image/jpeg'
            }
          ]
        }
      }
    ]
  },
  {
    category: 'User Tracking',
    icon: Users,
    endpoints: [
      {
        method: 'GET',
        path: '/api/users',
        description: '获取追踪用户',
        params: 'platform, tag, active, search',
        response: {
          users: [
            {
              id: 'uuid',
              username: 'tech_guru',
              platforms: [
                {
                  platform: 'bilibili',
                  followers: 125000,
                  engagement: 8.5
                }
              ]
            }
          ]
        }
      }
    ]
  },
  {
    category: 'Analytics',
    icon: BarChart3,
    endpoints: [
      {
        method: 'GET',
        path: '/api/analytics',
        description: '获取分析数据',
        params: 'timeRange, platform',
        response: {
          data: [
            {
              platform: 'bilibili',
              metrics: { followers: 45234, engagement: 12453 },
              growth: { followers: 2.1, engagement: 15.2 }
            }
          ]
        }
      }
    ]
  }
];

export const ApiDocs: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Authentication');
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);

  const currentCategory = apiEndpoints.find(cat => cat.category === selectedCategory);
  const currentEndpoint = currentCategory?.endpoints[selectedEndpoint];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-400 bg-green-500/20';
      case 'POST': return 'text-blue-400 bg-blue-500/20';
      case 'PUT': return 'text-yellow-400 bg-yellow-500/20';
      case 'DELETE': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API 文档</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Code className="w-4 h-4" />
          <span>RESTful API v1.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* API 分类导航 */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">API 分类</h3>
          <nav className="space-y-2">
            {apiEndpoints.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.category}
                  onClick={() => {
                    setSelectedCategory(category.category);
                    setSelectedEndpoint(0);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    selectedCategory === category.category
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400'
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{category.category}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* API 端点列表 */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">{selectedCategory} 端点</h3>
          <div className="space-y-2">
            {currentCategory?.endpoints.map((endpoint, index) => (
              <button
                key={index}
                onClick={() => setSelectedEndpoint(index)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedEndpoint === index
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-gray-300">{endpoint.path}</code>
                </div>
                <p className="text-sm text-gray-400">{endpoint.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* API 详情 */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          {currentEndpoint && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded font-medium ${getMethodColor(currentEndpoint.method)}`}>
                    {currentEndpoint.method}
                  </span>
                  <code className="text-lg font-mono text-white">{currentEndpoint.path}</code>
                </div>
                <p className="text-gray-300">{currentEndpoint.description}</p>
              </div>

              {currentEndpoint.params && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">查询参数</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <code className="text-green-400">{currentEndpoint.params}</code>
                  </div>
                </div>
              )}

              {currentEndpoint.request && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">请求体</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400">
                      {JSON.stringify(currentEndpoint.request, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {currentEndpoint.response && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">响应示例</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-blue-400">
                      {JSON.stringify(currentEndpoint.response, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold mb-3">认证</h4>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    <Shield className="w-4 h-4 inline mr-2" />
                    大部分端点需要在请求头中包含 JWT 令牌：
                  </p>
                  <code className="block mt-2 text-gray-300">
                    Authorization: Bearer YOUR_JWT_TOKEN
                  </code>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">错误响应</h4>
                <div className="space-y-2">
                  {[
                    { code: 400, message: 'Bad Request - 请求参数错误' },
                    { code: 401, message: 'Unauthorized - 未授权访问' },
                    { code: 403, message: 'Forbidden - 权限不足' },
                    { code: 404, message: 'Not Found - 资源不存在' },
                    { code: 429, message: 'Too Many Requests - 请求过于频繁' },
                    { code: 500, message: 'Internal Server Error - 服务器内部错误' }
                  ].map((error) => (
                    <div key={error.code} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                      <span className="text-red-400 font-mono">{error.code}</span>
                      <span className="text-gray-300 text-sm">{error.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 快速开始指南 */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">快速开始</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-blue-400">1. 获取访问令牌</h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <pre className="text-sm text-green-400">
{`curl -X POST /api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'`}
              </pre>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-purple-400">2. 使用令牌访问 API</h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <pre className="text-sm text-blue-400">
{`curl -X GET /api/posts \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};