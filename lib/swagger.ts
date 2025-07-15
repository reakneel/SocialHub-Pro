import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SocialHub Pro API',
      version: '1.0.0',
      description: 'Multi-platform social media management API',
      contact: {
        name: 'SocialHub Pro Team',
        email: 'support@socialhub-pro.com',
      },
    },
    servers: [
      {
        url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            full_name: { type: 'string' },
            avatar_url: { type: 'string', format: 'uri', nullable: true },
            role: { type: 'string', enum: ['admin', 'user'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            content: { type: 'string' },
            platforms: {
              type: 'array',
              items: { type: 'string' },
            },
            status: {
              type: 'string',
              enum: ['draft', 'scheduled', 'published', 'failed'],
            },
            scheduled_at: { type: 'string', format: 'date-time', nullable: true },
            published_at: { type: 'string', format: 'date-time', nullable: true },
            media_urls: {
              type: 'array',
              items: { type: 'string', format: 'uri' },
            },
            engagement: {
              type: 'object',
              properties: {
                likes: { type: 'integer' },
                comments: { type: 'integer' },
                shares: { type: 'integer' },
                views: { type: 'integer' },
              },
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        TrackedUser: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            display_name: { type: 'string' },
            avatar_url: { type: 'string', format: 'uri' },
            platforms: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  platform: { type: 'string' },
                  handle: { type: 'string' },
                  verified: { type: 'boolean' },
                  followers: { type: 'integer' },
                  following: { type: 'integer' },
                  posts: { type: 'integer' },
                  engagement: { type: 'number' },
                  last_active: { type: 'string', format: 'date-time' },
                },
              },
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            notes: { type: 'string' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'integer' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./app/api/**/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);