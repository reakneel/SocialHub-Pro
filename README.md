# SocialHub Pro

一个现代化的社交媒体管理平台，支持多平台内容发布、分析和用户跟踪。

## 🚀 功能特性

- **多平台支持**: 支持哔哩哔哩、微博、斗鱼、Twitter、YouTube 等主流社交平台
- **内容管理**: 统一的内容创建、编辑和发布界面
- **智能调度**: 支持定时发布和批量操作
- **数据分析**: 实时数据监控和详细的分析报告
- **用户跟踪**: 跟踪和分析目标用户的社交媒体活动
- **文件管理**: 支持图片和视频上传，自动优化处理
- **实时监控**: 系统健康检查和性能监控
- **安全认证**: JWT 认证和角色权限管理

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Prisma ORM
- **数据库**: PostgreSQL
- **缓存**: Redis
- **队列**: Bull (Redis-based)
- **文件处理**: Sharp, Multer
- **监控**: Winston, Sentry
- **认证**: JWT, bcrypt

## 📋 系统要求

- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+
- npm 或 pnpm

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd SocialHub-Pro
```

### 2. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 3. 环境配置

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下必要变量：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/socialhub_pro"

# Redis 连接
REDIS_URL="redis://localhost:6379"

# JWT 密钥
NEXTAUTH_SECRET="your-super-secret-jwt-key-here"

# 其他配置...
```

### 4. 数据库设置

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库架构
npm run db:push

# 填充初始数据
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🔧 一键设置

我们提供了一键设置脚本：

```bash
npm run setup
```

这个脚本会自动：
- 安装依赖
- 生成 Prisma 客户端
- 设置数据库
- 填充初始数据
- 构建应用

## 📚 API 文档

### 认证端点

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 内容管理

- `GET /api/posts` - 获取帖子列表
- `POST /api/posts` - 创建新帖子
- `GET /api/posts/[id]` - 获取单个帖子
- `PUT /api/posts/[id]` - 更新帖子
- `DELETE /api/posts/[id]` - 删除帖子

### 平台管理

- `GET /api/platforms` - 获取平台列表
- `POST /api/platforms` - 连接新平台
- `PUT /api/platforms` - 更新平台设置

### 数据分析

- `GET /api/analytics` - 获取分析数据
- `POST /api/analytics` - 创建分析记录

### 用户跟踪

- `GET /api/users` - 获取跟踪用户列表
- `POST /api/users` - 添加跟踪用户

### 文件上传

- `POST /api/upload` - 上传文件
- `GET /api/upload` - 获取用户文件列表
- `DELETE /api/upload` - 删除文件

### 系统监控

- `GET /api/health` - 健康检查

## 🗄️ 数据库架构

项目使用 Prisma ORM 管理数据库，主要数据模型包括：

- **User**: 用户信息
- **Platform**: 社交平台配置
- **UserPlatform**: 用户平台连接
- **Post**: 帖子内容
- **Analytics**: 分析数据
- **TrackedUser**: 跟踪用户
- **File**: 文件记录
- **AuditLog**: 审计日志

查看完整架构：`prisma/schema.prisma`

## 🔄 队列系统

项目使用 Bull 队列处理异步任务：

- **postQueue**: 处理帖子发布任务
- **analyticsQueue**: 处理数据分析更新

队列服务包括：
- 调度帖子发布
- 调度分析数据更新
- 取消任务
- 查询任务状态

## 📊 监控和日志

### 日志系统
- 使用 Winston 进行结构化日志记录
- 支持文件和控制台输出
- 不同级别的日志分类

### 性能监控
- 请求响应时间跟踪
- 内存和 CPU 使用监控
- 数据库查询性能分析

### 健康检查
- 数据库连接状态
- Redis 连接状态
- 系统资源使用情况

## 🔒 安全特性

- JWT 令牌认证
- 密码加密存储
- 请求速率限制
- 输入验证和清理
- CORS 配置
- 文件上传安全检查

## 📱 支持的社交平台

| 平台 | 状态 | 功能 |
|------|------|------|
| 哔哩哔哩 | ✅ | 发布、分析、用户跟踪 |
| 微博 | ✅ | 发布、分析、用户跟踪 |
| 斗鱼 | ✅ | 发布、用户跟踪 |
| Twitter/X | ✅ | 发布、分析、用户跟踪 |
| YouTube | ✅ | 发布、分析 |

## 🚀 部署

### 生产环境部署

1. 构建应用：
```bash
npm run build
```

2. 启动生产服务器：
```bash
npm start
```

### Docker 部署

```bash
# 构建镜像
docker build -t socialhub-pro .

# 运行容器
docker run -p 3000:3000 socialhub-pro
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果您遇到问题或有疑问，请：

1. 查看 [Issues](../../issues) 页面
2. 创建新的 Issue
3. 联系维护者

## 🔄 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新信息。