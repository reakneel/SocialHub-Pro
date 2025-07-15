import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase';
import { cache } from './redis';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'user';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  static async getUserFromToken(token: string): Promise<User | null> {
    const payload = this.verifyToken(token);
    if (!payload) return null;

    // Check cache first
    const cacheKey = `user:${payload.userId}`;
    let user = await cache.get<User>(cacheKey);
    
    if (!user) {
      // Fetch from database
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', payload.userId)
        .single();

      if (error || !data) return null;

      user = data as User;
      // Cache for 1 hour
      await cache.set(cacheKey, user, 3600);
    }

    return user;
  }

  static async authenticateRequest(request: NextRequest): Promise<User | null> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    return this.getUserFromToken(token);
  }

  static async register(email: string, password: string, username: string, fullName: string): Promise<{ user: User; token: string } | { error: string }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .single();

      if (existingUser) {
        return { error: 'User already exists' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          username,
          full_name: fullName,
          role: 'user',
        })
        .select()
        .single();

      if (error || !user) {
        return { error: 'Failed to create user' };
      }

      // Create auth record in Supabase Auth
      const { error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          username,
          full_name: fullName,
        },
      });

      if (authError) {
        // Rollback user creation
        await supabaseAdmin.from('users').delete().eq('id', user.id);
        return { error: 'Failed to create authentication' };
      }

      const token = this.generateToken(user as User);
      return { user: user as User, token };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Internal server error' };
    }
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string } | { error: string }> {
    try {
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return { error: 'Invalid credentials' };
      }

      // Get user profile
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return { error: 'User not found' };
      }

      const token = this.generateToken(user as User);
      
      // Cache user
      await cache.set(`user:${user.id}`, user, 3600);

      return { user: user as User, token };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Internal server error' };
    }
  }

  static async logout(userId: string): Promise<void> {
    // Clear user cache
    await cache.del(`user:${userId}`);
  }
}