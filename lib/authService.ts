// Conflux Platform — Multi-Tenant Authentication & RBAC Service (Supabase Auth & Profiles)

import { supabase, isSupabaseConfigured } from './supabase.ts';
import type { UserProfile, UserRole } from '../types/business.ts';

const LOCAL_STORAGE_USER_KEY = 'conflux_active_user_session';

export class AuthService {
  private memorySession: UserProfile | null | undefined = undefined;

  /**
   * Get current active user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (this.memorySession !== undefined) {
      return this.memorySession;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch authoritative profile from Supabase profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            const userObj: UserProfile = {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              role: profile.role as UserRole,
              phone: profile.phone,
              createdAt: profile.created_at
            };
            this.memorySession = userObj;
            return userObj;
          }

          // If profile table trigger hasn't fired yet, build from user metadata
          const userObj: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            role: (session.user.user_metadata?.role as UserRole) || 'USER',
            createdAt: session.user.created_at
          };
          this.memorySession = userObj;
          return userObj;
        }
      } catch (err) {
        console.error('[AuthService.getCurrentUser] Database session error:', err);
      }
    }

    // Local Storage Session (Development/Testing Mode only)
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.memorySession = parsed;
          return parsed;
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        }
      }
    }

    this.memorySession = null;
    return null;
  }

  /**
   * Set simulated / local session role for test suites
   */
  setLocalSession(user: UserProfile | null) {
    this.memorySession = user;
    if (typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    }
  }

  /**
   * Sign in with email/password via Supabase Auth
   */
  async signIn(email: string, password?: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    if (isSupabaseConfigured()) {
      try {
        if (password) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            return { success: false, error: error.message };
          }
          if (data.user) {
            const profile = await this.getCurrentUser();
            return { success: true, user: profile || undefined };
          }
        } else {
          const { error } = await supabase.auth.signInWithOtp({ email });
          if (error) {
            return { success: false, error: error.message };
          }
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: `[SUPABASE_AUTH_ERROR] ${err.message}` };
      }
    }

    // When Supabase is not configured, development and test mode can use simulated local sessions
    const isProd = (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD) || process.env.NODE_ENV === 'production';
    if (!isProd) {
      const testRole: UserRole = email.includes('admin') ? 'ADMIN' : email.includes('owner') ? 'BUSINESS_OWNER' : 'USER';
      const mockUser: UserProfile = {
        id: `usr_dev_${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: testRole,
        createdAt: new Date().toISOString()
      };
      this.setLocalSession(mockUser);
      return { success: true, user: mockUser };
    }

    return {
      success: false,
      error: 'SUPABASE_NOT_CONFIGURED: Live Supabase database credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are required for user authentication.'
    };
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout notice:', e);
      }
    }
    this.setLocalSession(null);
  }
}

export const authService = new AuthService();
