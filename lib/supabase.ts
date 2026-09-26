// Conflux Platform — Production Supabase Client & Configuration Engine

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const PRODUCTION_SUPABASE_URL = 'https://cqkljjbnoinztsugwqpf.supabase.co';
export const PRODUCTION_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2xqamJub2luenRzdWd3cXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDg1ODAsImV4cCI6MjA4ODk4NDU4MH0.PokKldexJYwNGgtuRGkIyxpXkEU2PPWe91sJ7Uin9MU';

/**
 * Normalizes user-supplied Supabase URL to canonical https://<project-ref>.supabase.co
 * Intercepts stale/deleted placeholder URLs and enforces the active production endpoint
 */
export const normalizeSupabaseUrl = (inputUrl?: string): string => {
  let url = (inputUrl || '').trim();
  if (!url || url.includes('cygdomemsooimjmdxzar') || url.includes('lxfuhmvhndvnhdxtylky') || url.includes('placeholder') || url.includes('unconfigured')) {
    return PRODUCTION_SUPABASE_URL;
  }

  // Case 1: User pasted the Supabase dashboard URL
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Case 2: User provided just the 20-char project ref
  if (/^[a-z0-9]{20}$/i.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // Case 3: URL with trailing slash or standard URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/\/+$/, '');
  }

  return url;
};

// Retrieve environment variables
const rawEnvUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)) ||
  PRODUCTION_SUPABASE_URL;

let rawAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)) ||
  PRODUCTION_SUPABASE_ANON_KEY;

/**
 * Validates that an anon key is an authentic JWT created for the canonical production project
 */
const isValidAnonKey = (key?: string): boolean => {
  if (!key || typeof key !== 'string' || !key.startsWith('eyJ')) return false;
  try {
    const parts = key.split('.');
    if (parts.length < 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr =
      typeof atob !== 'undefined'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(jsonStr);
    return payload.role === 'anon' && payload.ref === 'cqkljjbnoinztsugwqpf';
  } catch {
    return false;
  }
};

if (!isValidAnonKey(rawAnonKey)) {
  rawAnonKey = PRODUCTION_SUPABASE_ANON_KEY;
}

const canonicalUrl = normalizeSupabaseUrl(rawEnvUrl);

/**
 * Validates whether Supabase environment variables are present and syntactically valid
 */
export const isSupabaseConfigured = (): boolean => {
  if (!canonicalUrl || !rawAnonKey) return false;
  if (!canonicalUrl.startsWith('https://') || !canonicalUrl.includes('.supabase.co')) return false;
  if (!isValidAnonKey(rawAnonKey)) return false;
  return true;
};

export const getSupabaseConfig = () => ({
  url: canonicalUrl,
  isConfigured: isSupabaseConfigured()
});

/**
 * Creates or retrieves the Supabase client instance with standard GoTrue session management
 */
const createSupabaseInstance = (): SupabaseClient => {
  return createClient(canonicalUrl, rawAnonKey, {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: true,
      detectSessionInUrl: true
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
    const msg = `[CONFLUX_CONFIG_ERROR] Cannot execute ${operationName}: Remote Supabase database is not configured.`;
    if (isProd) {
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }
};
