#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting SocialHub Pro deployment...\n');

const deploymentType = process.argv[2] || 'development';

try {
  if (deploymentType === 'docker') {
    console.log('🐳 Docker deployment...');
    
    // Check if Docker is installed
    try {
      execSync('docker --version', { stdio: 'pipe' });
      execSync('docker-compose --version', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Docker or Docker Compose is not installed.');
      console.log('Please install Docker Desktop from https://www.docker.com/products/docker-desktop');
      process.exit(1);
    }

    // Build and start containers
    console.log('📦 Building Docker images...');
    execSync('docker-compose build', { stdio: 'inherit' });

    console.log('🚀 Starting containers...');
    execSync('docker-compose up -d', { stdio: 'inherit' });

    console.log('⏳ Waiting for services to be ready...');
    // Wait a bit for services to start
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Run database migrations
    console.log('🗄️  Running database migrations...');
    execSync('docker-compose exec app npx prisma db push', { stdio: 'inherit' });

    // Seed database
    console.log('🌱 Seeding database...');
    execSync('docker-compose exec app npm run db:seed', { stdio: 'inherit' });

    console.log('\n✅ Docker deployment completed successfully!');
    console.log('🌐 Application is running at: http://localhost:3000');
    console.log('🗄️  Database is running at: localhost:5432');
    console.log('🔴 Redis is running at: localhost:6379');
    console.log('\n📋 Useful commands:');
    console.log('   docker-compose logs app     # View application logs');
    console.log('   docker-compose stop         # Stop all services');
    console.log('   docker-compose down         # Stop and remove containers');

  } else if (deploymentType === 'production') {
    console.log('🏭 Production deployment...');

    // Check environment variables
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env file not found. Please create one from .env.example');
      process.exit(1);
    }

    // Install dependencies
    console.log('📦 Installing production dependencies...');
    execSync('npm ci --only=production', { stdio: 'inherit' });

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Run database migrations
    console.log('🗄️  Running database migrations...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    // Build application
    console.log('🏗️  Building application...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('\n✅ Production build completed successfully!');
    console.log('🚀 Start the application with: npm start');

  } else {
    console.log('🛠️  Development deployment...');
    
    // Run setup script
    execSync('npm run setup', { stdio: 'inherit' });

    console.log('\n✅ Development setup completed successfully!');
    console.log('🚀 Start the development server with: npm run dev');
  }

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}

// Helper function for async/await in Node.js script
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}