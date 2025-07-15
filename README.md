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
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Cache**: Redis
- **File Storage**: Supabase Storage
- **Queue**: Bull (Redis-based)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Deployment**: Netlify

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Supabase account)
- Redis server

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

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret"

# Redis Cache
REDIS_URL="redis://localhost:6379"

# Other configurations...
```

4. Run database migrations:
```bash
# If using Supabase, run the migration file in your Supabase dashboard
# Or use the Supabase CLI:
supabase db push
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All API endpoints require authentication. Include the JWT token in the header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Interactive Documentation
Visit [http://localhost:3000/docs](http://localhost:3000/docs) for interactive API documentation powered by Swagger UI.

### Endpoints

#### Authentication

##### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "username",
  "fullName": "Full Name"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "full_name": "Full Name",
    "role": "user"
  },
  "token": "jwt-token"
}
```

##### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

##### POST /api/auth/logout
Logout user (requires authentication).

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
      "id": "uuid",
      "content": "Post content",
      "platforms": ["bilibili", "weibo"],
      "status": "published",
      "published_at": "2024-01-15T10:00:00Z",
      "engagement": {
        "likes": 1250,
        "comments": 89,
        "shares": 156,
        "views": 12500
      },
      "created_at": "2024-01-15T09:30:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
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
  "scheduledAt": "2024-01-16T10:00:00Z",
  "mediaUrls": ["https://example.com/image.jpg"]
}
```

#### File Upload

##### POST /api/upload
Upload files (images, videos).

**Request:** Multipart form data with `files` field.

**Response:**
```json
{
  "files": [
    {
      "url": "https://storage-url/file.jpg",
      "filename": "user-id/uploads/timestamp.jpg",
      "size": 1024000,
      "type": "image/jpeg"
    }
  ]
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

##### POST /api/users
Add a new user to track.

#### Analytics

##### GET /api/analytics
Retrieve analytics data.

**Query Parameters:**
- `timeRange` (optional): Time range for analytics (`7d`, `30d`, `90d`, `1y`)
- `platform` (optional): Filter by specific platform

#### Platform Management

##### GET /api/platforms
Retrieve platform connection status and configuration.

##### POST /api/platforms
Connect or disconnect a platform.

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
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Architecture

### Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User profiles and authentication
- **posts**: Social media posts and content
- **tracked_users**: Users being monitored across platforms
- **platform_connections**: OAuth connections to social platforms
- **audit_logs**: System audit trail and activity logs

### Caching Strategy

Redis is used for:
- Session management
- API response caching
- Rate limiting counters
- Queue job storage

### Queue System

Bull queues handle:
- **Post Publishing**: Scheduled post publication to platforms
- **Analytics Processing**: Periodic data fetching from platform APIs
- **Notifications**: Email and push notifications

### Security Features

- **JWT Authentication**: Secure token-based authentication
- **Row Level Security**: Database-level access control
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Request data sanitization
- **Audit Logging**: Complete activity tracking

## Development

### Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── posts/          # Posts management
│   │   ├── upload/         # File upload
│   │   ├── users/          # User tracking
│   │   └── docs/           # API documentation
│   ├── docs/               # Swagger UI page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
├── lib/                    # Utility libraries
│   ├── auth.ts            # Authentication service
│   ├── redis.ts           # Cache service
│   ├── upload.ts          # File upload service
│   ├── queue.ts           # Job queue service
│   ├── logger.ts          # Logging service
│   └── supabase.ts        # Database client
├── supabase/
│   └── migrations/        # Database migrations
├── middleware.ts          # Next.js middleware
└── package.json           # Dependencies
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Database Migrations

To create a new migration:

1. Create a new SQL file in `supabase/migrations/`
2. Run the migration in your Supabase dashboard or using the CLI

### Monitoring and Logging

- **Application Logs**: Winston logger with file and console output
- **Audit Logs**: Database-stored user activity tracking
- **Error Tracking**: Structured error logging with stack traces
- **Performance Monitoring**: Request timing and queue job metrics

## Deployment

### Environment Setup

1. Set up production database (Supabase recommended)
2. Configure Redis instance
3. Set up file storage (Supabase Storage)
4. Configure environment variables

### Netlify Deployment

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Document API changes
- Follow conventional commit messages
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@socialhub-pro.com or join our Discord community.

## Roadmap

### Phase 1 (Current)
- [x] Multi-platform posting
- [x] User tracking
- [x] Basic analytics
- [x] File upload
- [x] Authentication system

### Phase 2 (Next)
- [ ] Real-time collaboration
- [ ] Advanced AI content suggestions
- [ ] Video editing tools
- [ ] Mobile app
- [ ] Webhook support

### Phase 3 (Future)
- [ ] Team management features
- [ ] Custom branding options
- [ ] Integration with more platforms
- [ ] Advanced automation workflows
- [ ] Enterprise features

## Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequently accessed data
- **CDN**: Static asset delivery via CDN
- **Image Optimization**: Automatic image compression and resizing
- **Code Splitting**: Lazy loading of components
- **API Rate Limiting**: Prevents abuse and ensures stability

## Security Considerations

- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **HTTPS Only**: Secure communication protocols
- **Input Sanitization**: Protection against XSS and injection attacks
- **Regular Updates**: Dependencies kept up to date
- **Access Control**: Role-based permissions system
- **Audit Trail**: Complete logging of user actions