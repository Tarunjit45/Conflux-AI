// Detailed Database Inspection
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cqkljjbnoinztsugwqpf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2xqamJub2luenRzdWd3cXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDg1ODAsImV4cCI6MjA4ODk4NDU4MH0.PokKldexJYwNGgtuRGkIyxpXkEU2PPWe91sJ7Uin9MU';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectAll() {
  console.log('--- 1. Checking businesses table ---');
  const { data: businesses, error: bizErr } = await client.from('businesses').select('id, name, conflux_business_id, status, claim_status, verification_status');
  console.log(`Businesses count: ${businesses?.length || 0}`, bizErr?.message || '');
  if (businesses && businesses.length > 0) {
    businesses.forEach((b, i) => console.log(`${i+1}. [${b.status} / ${b.claim_status}] ${b.name} (${b.conflux_business_id})`));
  }

  console.log('\n--- 2. Checking business_applications table ---');
  const { data: apps, error: appErr } = await client.from('business_applications').select('*');
  console.log(`Applications count: ${apps?.length || 0}`, appErr?.message || '');

  console.log('\n--- 3. Checking user_contributions table ---');
  const { data: contribs, error: cErr } = await client.from('user_contributions').select('*');
  console.log(`Contributions count: ${contribs?.length || 0}`, cErr?.message || '');
}

inspectAll().catch(console.error);
