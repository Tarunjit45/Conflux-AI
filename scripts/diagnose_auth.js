// Auth Diagnostic Script
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cqkljjbnoinztsugwqpf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2xqamJub2luenRzdWd3cXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDg1ODAsImV4cCI6MjA4ODk4NDU4MH0.PokKldexJYwNGgtuRGkIyxpXkEU2PPWe91sJ7Uin9MU';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnose() {
  console.log('--- 1. Testing Session Retrieval ---');
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  console.log('Session result:', sessionData?.session ? 'Found' : 'None', 'Error:', sessionError?.message);

  console.log('\n--- 2. Checking Existing Profiles in Database ---');
  const { data: profiles, error: profError } = await client.from('profiles').select('*');
  console.log('Profiles in DB:', profiles?.length, 'Error:', profError?.message);
  if (profiles) {
    console.log('Profiles data:', profiles);
  }
}

diagnose().catch(console.error);
