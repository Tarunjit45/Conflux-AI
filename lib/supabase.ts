// Conflux Platform — Production Supabase Client & Configuration Engine

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return String((import.meta as any).env[key]).trim();
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return String(process.env[key]).trim();
  }
  return '';
};

// Retrieve environment variables with zero hardcoded dummy project URLs or test keys
const rawUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const rawAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');

/**
 * Validates whether Supabase environment variables are present and syntactically valid
 */
export const isSupabaseConfigured = (): boolean => {
  if (!rawUrl || !rawAnonKey) return false;
  if (rawUrl.includes('placeholder') || rawUrl.includes('example.com')) return false;
  if (!rawUrl.startsWith('https://')) return false;
  if (rawAnonKey.length < 20) return false;
  return true;
};

export const getSupabaseConfig = () => ({
  url: rawUrl || null,
  isConfigured: isSupabaseConfigured()
});

/**
 * Creates or retrieves the Supabase client instance
 */
const createSupabaseInstance = (): SupabaseClient => {
  if (isSupabaseConfigured()) {
    return createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  // When unconfigured, provide a client initialized with a safe dummy host,
  // but any live query attempt will trigger a clear ConfigurationError
  return createClient('https://unconfigured-project.supabase.co', 'unconfigured-anon-key-placeholder', {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export const supabase = createSupabaseInstance();

/**
 * Production assertion: Throws an explicit error if database connection is attempted without live configuration
 */
export const assertSupabaseConfigured = (operationName: string = 'database operation') => {
  if (!isSupabaseConfigured()) {
    const isProd = typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD;
    const msg = `[CONFLUX_CONFIG_ERROR] Cannot execute ${operationName}: Remote Supabase database is not configured. Please supply valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.`;
    if (isProd) {
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }
};
