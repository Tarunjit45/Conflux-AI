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

/**
 * Normalizes user-supplied Supabase URL to canonical https://<project-ref>.supabase.co
 * Handles cases where a user pastes the dashboard URL, project reference ID, or trailing slashes
 */
export const normalizeSupabaseUrl = (inputUrl: string): string => {
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

// Retrieve environment variables
const rawEnvUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const canonicalUrl = normalizeSupabaseUrl(rawEnvUrl);
const rawAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');

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

  // When unconfigured, provide a safe client instance that warns on attempt
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
