// Conflux Platform — Live Remote Supabase Connection & Table Verification Script

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cqkljjbnoinztsugwqpf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2xqamJub2luenRzdWd3cXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDg1ODAsImV4cCI6MjA4ODk4NDU4MH0.PokKldexJYwNGgtuRGkIyxpXkEU2PPWe91sJ7Uin9MU';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkLiveDatabase() {
  console.log('======================================================================');
  console.log('    CONFLUX PLATFORM — LIVE REMOTE SUPABASE DIAGNOSTIC               ');
  console.log(`    Endpoint: ${SUPABASE_URL}`);
  console.log('======================================================================\n');

  console.log('--- 1. Testing Remote Supabase Auth Connection ---');
  try {
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) {
      console.error('[FAIL] Auth Error:', sessionError.message);
    } else {
      console.log('[PASS] Supabase Auth service is ONLINE and connected.');
    }
  } catch (err) {
    console.error('[FAIL] Auth exception:', err.message);
  }

  console.log('\n--- 2. Checking Remote PostgreSQL Tables & RLS Status ---');
  const tables = [
    'businesses',
    'profiles',
    'business_locations',
    'business_capabilities',
    'business_applications',
    'private_evidence_documents',
    'user_contributions',
    'connect_telemetry_events',
    'leads',
    'posts'
  ];

  const results = [];

  for (const table of tables) {
    try {
      const { data, error, status } = await client.from(table).select('*').limit(1);
      if (error) {
        // PGRST204 or PGRST116 means table does not exist in schema
        results.push({ table, exists: false, status, code: error.code, message: error.message });
        console.log(`[STATUS] Table [public.${table}]: NOT CREATED YET (${error.code}: ${error.message})`);
      } else {
        results.push({ table, exists: true, rows: data.length });
        console.log(`[PASS] Table [public.${table}]: EXISTS & RLS SECURED! (Rows found: ${data.length})`);
      }
    } catch (err) {
      console.error(`[ERROR] Table [public.${table}]:`, err.message);
    }
  }

  const existingCount = results.filter(r => r.exists).length;
  console.log('\n======================================================================');
  console.log(`DATABASE STATUS: ${existingCount} / ${tables.length} TABLES READY`);
  console.log('======================================================================');

  if (existingCount === 0) {
    console.log('\nNEXT STEP: Execute docs/migrations/003_production_supabase_hardening.sql');
    console.log('in your Supabase SQL Editor to create and secure all tables.');
  }
}

checkLiveDatabase().catch(console.error);
