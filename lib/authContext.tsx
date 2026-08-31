// Conflux Platform — React Authentication & Role Context

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserProfile, UserRole } from '../types/business';
import { authService } from './authService';
import { supabase, isSupabaseConfigured } from './supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isOwner: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: { email: string; password: string; fullName?: string; role: UserRole; phone?: string }) => Promise<{ success: boolean; error?: string; isRateLimit?: boolean; isAlreadyRegistered?: boolean }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial user load
    authService.getCurrentUser(true).then(u => {
      setUser(u);
      setIsLoading(false);
    });

    // Subscribe to auth state changes from Supabase
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const freshUser = await authService.getCurrentUser(true);
          setUser(freshUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await authService.signIn(email, password);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return { success: res.success, error: res.error };
  };

  const register = async (input: { email: string; password: string; fullName?: string; role: UserRole; phone?: string }) => {
    const res = await authService.signUp(input);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return { success: res.success, error: res.error, isRateLimit: res.isRateLimit, isAlreadyRegistered: res.isAlreadyRegistered };
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const updated: UserProfile = { ...user, role };
    setUser(updated);
    authService.setLocalSession(updated);
  };

  const role: UserRole = user?.role || 'PUBLIC_USER';
  const isAdmin = role === 'ADMIN';
  const isOwner = role === 'BUSINESS_OWNER' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isOwner,
        isLoading,
        login,
        register,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
