import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
};

// Service role client (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Client component client
export const createClientSupabaseClient = () => createClientComponentClient();

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          role: 'admin' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          role?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: 'admin' | 'user';
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          platforms: string[];
          status: 'draft' | 'scheduled' | 'published' | 'failed';
          scheduled_at: string | null;
          published_at: string | null;
          media_urls: string[];
          engagement: {
            likes: number;
            comments: number;
            shares: number;
            views: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          platforms: string[];
          status?: 'draft' | 'scheduled' | 'published' | 'failed';
          scheduled_at?: string | null;
          published_at?: string | null;
          media_urls?: string[];
          engagement?: {
            likes: number;
            comments: number;
            shares: number;
            views: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          platforms?: string[];
          status?: 'draft' | 'scheduled' | 'published' | 'failed';
          scheduled_at?: string | null;
          published_at?: string | null;
          media_urls?: string[];
          engagement?: {
            likes: number;
            comments: number;
            shares: number;
            views: number;
          };
          updated_at?: string;
        };
      };
      tracked_users: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          display_name: string;
          avatar_url: string;
          platforms: {
            platform: string;
            handle: string;
            verified: boolean;
            followers: number;
            following: number;
            posts: number;
            engagement: number;
            last_active: string;
          }[];
          tags: string[];
          notes: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          display_name: string;
          avatar_url: string;
          platforms: {
            platform: string;
            handle: string;
            verified: boolean;
            followers: number;
            following: number;
            posts: number;
            engagement: number;
            last_active: string;
          }[];
          tags?: string[];
          notes?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string;
          avatar_url?: string;
          platforms?: {
            platform: string;
            handle: string;
            verified: boolean;
            followers: number;
            following: number;
            posts: number;
            engagement: number;
            last_active: string;
          }[];
          tags?: string[];
          notes?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      platform_connections: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          platform_user_id: string;
          access_token: string;
          refresh_token: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          platform_user_id: string;
          access_token: string;
          refresh_token?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          platform_user_id?: string;
          access_token?: string;
          refresh_token?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details: Record<string, any>;
          ip_address: string;
          user_agent: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details: Record<string, any>;
          ip_address: string;
          user_agent: string;
          created_at?: string;
        };
      };
    };
  };
};