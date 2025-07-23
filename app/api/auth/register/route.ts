import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { AuditService } from '@/lib/monitoring';
import { 
  withErrorHandling, 
  withLogging, 
  withPerformanceMonitoring,
  withMiddleware,
  ValidationError 
} from '@/lib/middleware';

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

async function register(request: NextRequest) {
  const body = await request.json();
  const validatedData = registerSchema.parse(body);

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: validatedData.email },
        { username: validatedData.username }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === validatedData.email) {
      throw new ValidationError('Email already registered');
    }
    if (existingUser.username === validatedData.username) {
      throw new ValidationError('Username already taken');
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      username: validatedData.username,
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name || validatedData.username,
      role: 'USER'
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });

  // Generate JWT token
  const token = jwt.sign(
    { 
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: '7d' }
  );

  // Log audit event
  await AuditService.log(
    'CREATE',
    'USER',
    user.id,
    user.id,
    { username: user.username, email: user.email },
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  return NextResponse.json({
    user,
    token,
    message: 'User registered successfully'
  }, { status: 201 });
}

async function login(request: NextRequest) {
  const body = await request.json();
  const validatedData = loginSchema.parse(body);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });

  if (!user) {
    throw new ValidationError('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
  
  if (!isValidPassword) {
    throw new ValidationError('Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  // Generate JWT token
  const token = jwt.sign(
    { 
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: '7d' }
  );

  // Log audit event
  await AuditService.log(
    'LOGIN',
    'USER',
    user.id,
    user.id,
    { email: user.email },
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };

  return NextResponse.json({
    user: userResponse,
    token,
    message: 'Login successful'
  });
}

// Export handlers with middleware
export const POST = withMiddleware(
  async (request: NextRequest) => {
    const { pathname } = new URL(request.url);
    
    if (pathname.endsWith('/register')) {
      return register(request);
    } else if (pathname.endsWith('/login')) {
      return login(request);
    } else {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }
  },
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);