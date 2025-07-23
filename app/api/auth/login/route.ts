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

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

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
  login,
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);