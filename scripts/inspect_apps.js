// Diagnostic Script to inspect and clean business_applications table in Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cqkljjbnoinztsugwqpf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2xqamJub2luenRzdWd3cXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDg1ODAsImV4cCI6MjA4ODk4NDU4MH0.PokKldexJYwNGgtuRGkIyxpXkEU2PPWe91sJ7Uin9MU';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectApplications() {
  console.log('--- 1. Fetching all business_applications ---');
  const { data: apps, error: appErr } = await client.from('business_applications').select('*');
  console.log('Applications count:', apps?.length, 'Error:', appErr?.message);
  if (apps && apps.length > 0) {
    console.log('Sample application names:');
    apps.forEach((a, i) => console.log(`${i + 1}. [${a.status}] ${a.business_name} (${a.id})`));
  }
}

inspectApplications().catch(console.error);
