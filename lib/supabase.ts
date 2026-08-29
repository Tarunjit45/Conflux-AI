// Conflux Platform — Production Supabase Client & Configuration Engine

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Normalizes user-supplied Supabase URL to canonical https://<project-ref>.supabase.co
 * Handles cases where a user pastes the dashboard URL, project reference ID, or trailing slashes
 */
export const normalizeSupabaseUrl = (inputUrl?: string): string => {
  let url = (inputUrl || '').trim();
  if (!url) return '';

  // Case 1: User pasted the Supabase dashboard URL, e.g. https://supabase.com/dashboard/project/cqkljjbnoinztsugwqpf
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Case 2: User provided just the 20-char project ref, e.g. "cqkljjbnoinztsugwqpf"
  if (/^[a-z0-9]{20}$/i.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // Case 3: URL with trailing slash or standard URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/\/+$/, '');
  }

  return url;
};

// Retrieve environment variables with direct static references (required for Vite bundler AST replacement)
const rawEnvUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)) ||
  'https://cqkljjbnoinztsugwqpf.supabase.co';

const rawAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2xqamJub2luenRzdWd3cXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDg1ODAsImV4cCI6MjA4ODk4NDU4MH0.PokKldexJYwNGgtuRGkIyxpXkEU2PPWe91sJ7Uin9MU';

const canonicalUrl = normalizeSupabaseUrl(rawEnvUrl);

/**
 * Validates whether Supabase environment variables are present and syntactically valid
 */
export const isSupabaseConfigured = (): boolean => {
  if (!canonicalUrl || !rawAnonKey) return false;
  if (canonicalUrl.includes('placeholder') || canonicalUrl.includes('example.com') || canonicalUrl.includes('unconfigured')) return false;
  if (!canonicalUrl.startsWith('https://') || !canonicalUrl.includes('.supabase.co')) return false;
  if (rawAnonKey.length < 20) return false;
  return true;
};

export const getSupabaseConfig = () => ({
  url: canonicalUrl || null,
  isConfigured: isSupabaseConfigured()
});

/**
 * Creates or retrieves the Supabase client instance
 */
const createSupabaseInstance = (): SupabaseClient => {
  if (isSupabaseConfigured()) {
    return createClient(canonicalUrl, rawAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  // Safe fallback client instance
  return createClient('https://cqkljjbnoinztsugwqpf.supabase.co', rawAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
};

export const supabase = createSupabaseInstance();

/**
 * Production assertion: Throws an explicit error if database connection is attempted without live configuration
 */
export const assertSupabaseConfigured = (operationName: string = 'database operation') => {
  if (!isSupabaseConfigured()) {
    const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;
    const msg = `[CONFLUX_CONFIG_ERROR] Cannot execute ${operationName}: Remote Supabase database is not configured. Please supply valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.`;
    if (isProd) {
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }
};
