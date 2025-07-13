# SocialHub Pro

A comprehensive multi-platform social media management tool supporting Bilibili, Weibo, Douyu, X (Twitter), and YouTube.

## Features

### 🚀 Core Features
- **Multi-Platform Support**: Manage content across Bilibili, Weibo, Douyu, X (Twitter), and YouTube
- **Content Creation**: Rich text editor with platform-specific optimization
- **Scheduling**: Advanced post scheduling with calendar view
- **User Tracking**: Monitor and analyze specific users across platforms
- **Analytics**: Comprehensive analytics and reporting
- **Real-time Dashboard**: Live metrics and performance tracking

### 📱 Platform Support
- **哔哩哔哩 (Bilibili)**: Video content, dynamic posts, live streaming
- **微博 (Weibo)**: Microblogging, image posts, trending topics
- **斗鱼 (Douyu)**: Live streaming, gaming content
- **X (Twitter)**: Tweets, threads, media posts
- **YouTube**: Video uploads, community posts, shorts

### 🎯 User Tracking
- Track competitors, influencers, and industry leaders
- Monitor follower growth, engagement rates, and content performance
- Real-time activity monitoring
- Custom tags and notes for organization
- Multi-platform user profiles

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Netlify

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/socialhub-pro.git
cd socialhub-pro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All API endpoints require authentication. Include the API key in the header:
```
Authorization: Bearer YOUR_API_KEY
```

### Endpoints

#### Posts Management

##### GET /api/posts
Retrieve posts with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by post status (`draft`, `scheduled`, `published`, `failed`)
- `platform` (optional): Filter by platform (`bilibili`, `weibo`, `twitter`, `youtube`, `douyu`)
- `limit` (optional): Number of posts to return (default: 10)
- `offset` (optional): Number of posts to skip (default: 0)

**Response:**
```json
{
  "posts": [
    {
      "id": "1",
      "content": "Post content",
      "platforms": ["bilibili", "weibo"],
      "status": "published",
      "publishedAt": "2024-01-15T10:00:00Z",
      "engagement": {
        "likes": 1250,
        "comments": 89,
        "shares": 156,
        "views": 12500
      },
      "createdAt": "2024-01-15T09:30:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

##### POST /api/posts
Create a new post.

**Request Body:**
```json
{
  "content": "Your post content",
  "platforms": ["bilibili", "weibo"],
  "scheduledAt": "2024-01-16T10:00:00Z" // Optional for scheduled posts
}
```

**Response:**
```json
{
  "id": "2",
  "content": "Your post content",
  "platforms": ["bilibili", "weibo"],
  "status": "scheduled",
  "scheduledAt": "2024-01-16T10:00:00Z",
  "engagement": {
    "likes": 0,
    "comments": 0,
    "shares": 0,
    "views": 0
  },
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

##### GET /api/posts/[id]
Retrieve a specific post by ID.

##### PUT /api/posts/[id]
Update a specific post.

##### DELETE /api/posts/[id]
Delete a specific post.

#### Analytics

##### GET /api/analytics
Retrieve analytics data.

**Query Parameters:**
- `timeRange` (optional): Time range for analytics (`7d`, `30d`, `90d`, `1y`)
- `platform` (optional): Filter by specific platform

**Response:**
```json
{
  "data": [
    {
      "platform": "bilibili",
      "metrics": {
        "followers": 45234,
        "posts": 156,
        "engagement": 12453,
        "reach": 234567
      },
      "growth": {
        "followers": 2.1,
        "engagement": 15.2
      },
      "timeRange": "30d"
    }
  ],
  "summary": {
    "totalFollowers": 156336,
    "totalPosts": 493,
    "totalEngagement": 29860,
    "totalReach": 791355
  }
}
```

#### User Tracking

##### GET /api/users
Retrieve tracked users.

**Query Parameters:**
- `platform` (optional): Filter by platform
- `tag` (optional): Filter by tag
- `active` (optional): Filter by active status (`true`, `false`)
- `search` (optional): Search by username or display name

**Response:**
```json
{
  "users": [
    {
      "id": "1",
      "username": "tech_guru",
      "displayName": "科技大师",
      "avatar": "https://example.com/avatar.jpg",
      "platforms": [
        {
          "platform": "bilibili",
          "handle": "@tech_guru",
          "verified": true,
          "followers": 125000,
          "following": 456,
          "posts": 234,
          "engagement": 8.5,
          "lastActive": "2024-01-15T10:30:00Z"
        }
      ],
      "tags": ["科技", "KOL", "竞争对手"],
      "notes": "主要竞争对手，关注其内容策略",
      "isActive": true,
      "addedAt": "2024-01-01T00:00:00Z",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

##### POST /api/users
Add a new user to track.

**Request Body:**
```json
{
  "username": "new_user",
  "displayName": "New User",
  "platforms": [
    {
      "platform": "bilibili",
      "handle": "@new_user",
      "verified": false,
      "followers": 1000,
      "following": 100,
      "posts": 50,
      "engagement": 5.0,
      "lastActive": "2024-01-15T10:00:00Z"
    }
  ],
  "tags": ["新用户"],
  "notes": "新添加的用户"
}
```

#### Platform Management

##### GET /api/platforms
Retrieve platform connection status and configuration.

**Response:**
```json
{
  "platforms": [
    {
      "id": "bilibili",
      "name": "bilibili",
      "displayName": "哔哩哔哩",
      "icon": "🅱️",
      "connected": true,
      "lastSync": "2024-01-15T10:30:00Z",
      "config": {
        "characterLimit": 2000,
        "supportsImages": true,
        "supportsVideos": true,
        "supportsScheduling": true
      }
    }
  ]
}
```

##### POST /api/platforms
Connect or disconnect a platform.

**Request Body:**
```json
{
  "platformId": "bilibili",
  "action": "connect" // or "disconnect"
}
```

### Error Responses

All endpoints return appropriate HTTP status codes and error messages:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── posts/          # Posts management
│   │   ├── analytics/      # Analytics data
│   │   ├── users/          # User tracking
│   │   └── platforms/      # Platform management
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Dashboard.tsx
│   ├── Composer.tsx
│   ├── Schedule.tsx
│   ├── Analytics.tsx
│   ├── Settings.tsx
│   └── UserTracking.tsx
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@socialhub-pro.com or join our Discord community.

## Roadmap

- [ ] Real-time collaboration
- [ ] Advanced AI content suggestions
- [ ] Video editing tools
- [ ] Mobile app
- [ ] API rate limiting and caching
- [ ] Advanced analytics with charts
- [ ] Webhook support
- [ ] Team management features
- [ ] Custom branding options
- [ ] Integration with more platforms