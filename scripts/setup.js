#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting SocialHub Pro setup...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Please copy .env.example to .env and configure your environment variables.');
  console.log('📋 Required environment variables:');
  console.log('   - DATABASE_URL (PostgreSQL connection string)');
  console.log('   - REDIS_URL (Redis connection string)');
  console.log('   - NEXTAUTH_SECRET (JWT secret key)');
  console.log('   - And other configuration variables...\n');
  process.exit(1);
}

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Generate Prisma client
  console.log('\n🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Run database migrations
  console.log('\n🗄️  Running database migrations...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  // Seed database
  console.log('\n🌱 Seeding database...');
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });

  // Build the application
  console.log('\n🏗️  Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n✅ Setup completed successfully!');
  console.log('\n🎉 You can now start the application with:');
  console.log('   npm run dev (development)');
  console.log('   npm start (production)');
  console.log('\n📚 API Documentation:');
  console.log('   Health Check: GET /api/health');
  console.log('   Authentication: POST /api/auth/login, POST /api/auth/register');
  console.log('   Posts: GET/POST /api/posts');
  console.log('   Analytics: GET /api/analytics');
  console.log('   Platforms: GET/POST/PUT /api/platforms');
  console.log('   File Upload: POST /api/upload');
  console.log('   User Tracking: GET/POST /api/users');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}