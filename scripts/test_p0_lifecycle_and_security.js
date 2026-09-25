// P0 Lifecycle & Security Verification Test Suite for Conflux AI

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = 'https://cqkljjbnoinztsugwqpf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2xqamJub2luenRzdWd3cXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDg1ODAsImV4cCI6MjA4ODk4NDU4MH0.PokKldexJYwNGgtuRGkIyxpXkEU2PPWe91sJ7Uin9MU';

import fs from 'fs';

// Load local test env if present
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = (match[2] || '').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[key] = process.env[key] || val;
    }
  }
}

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'founder@confluxai.in';
const ADMIN_PASS = process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

async function runTests() {
  if (!ADMIN_PASS) {
    console.error('[ERROR] TEST_ADMIN_PASSWORD or ADMIN_PASSWORD env var required.');
    process.exit(1);
  }
  console.log('=== CONFLUX AI — P0 LIFECYCLE & SECURITY ACCEPTANCE SUITE ===\n');
  let passCount = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${message}`);
      passCount++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${message}`);
    }
  }

  // Client 1: Anonymous public client
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Client 2: Authenticated Admin client
  const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // -------------------------------------------------------------
    // Test 1: Admin Authentication & Role Verification
    // -------------------------------------------------------------
    console.log('Step 1: Admin Authentication & Authorization');
    const { data: authData, error: authError } = await adminClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASS
    });
    if (authError) {
      console.error('Auth error encountered:', authError);
    }
    assert(!authError && authData?.user, `Admin signed in successfully (${ADMIN_EMAIL})`);
    if (!authData?.user) return;

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    assert(!profileError && profile && profile.role === 'ADMIN', `Admin user has role='ADMIN' in public.profiles (Actual: ${profile?.role})`);

    // Verify admin@confluxai.in is also ADMIN
    const { data: secondaryAdminProfile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('email', 'admin@confluxai.in')
      .single();
    assert(secondaryAdminProfile && secondaryAdminProfile.role === 'ADMIN', `admin@confluxai.in is established as ADMIN in profiles (Actual: ${secondaryAdminProfile?.role})`);

    // -------------------------------------------------------------
    // Test 2: Admin Business Creation (Direct Supabase Persistence)
    // -------------------------------------------------------------
    console.log('\nStep 2: Business Creation Lifecycle in Supabase');
    const businessId = crypto.randomUUID();
    const locationId = crypto.randomUUID();
    const testBusinessSlug = `p0-test-business-${Date.now()}`;
    const testBusiness = {
      id: businessId,
      conflux_business_id: `CB-${Date.now()}`,
      slug: testBusinessSlug,
      name: 'P0 Audit Test Diagnostic Lab',
      legal_name: 'P0 Audit Diagnostic Laboratory Pvt Ltd',
      business_type: 'HEALTHCARE',
      category_id: 'healthcare',
      category_name: 'Healthcare',
      services: ['Blood Test', 'Health Checkup', 'Pathology'],
      landmark: 'Near District Hospital',
      description: 'Test business created to rigorously verify P0 database persistence lifecycle.',
      short_summary: 'Certified diagnostic laboratory in Ranaghat.',
      status: 'DRAFT',
      claim_status: 'UNCLAIMED_PUBLIC',
      verification_status: 'UNVERIFIED',
      verification_level: 'NONE',
      confidence_score: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdBiz, error: createBizErr } = await adminClient
      .from('businesses')
      .insert([testBusiness])
      .select()
      .single();

    assert(!createBizErr && createdBiz && createdBiz.id, `Admin created business '${testBusiness.name}' directly in Supabase (ID: ${createdBiz?.id})`);

    const { error: locErr } = await adminClient
      .from('business_locations')
      .insert([{
        id: locationId,
        business_id: businessId,
        country: 'India',
        state: 'West Bengal',
        district: 'nadia',
        city: 'Ranaghat',
        landmark: 'Near District Hospital',
        full_address: '12 Hospital Road, Ranaghat, Nadia, West Bengal 741201',
        is_primary: true
      }]);
    assert(!locErr, `Admin created business_locations record for business (ID: ${locationId})`);

    // -------------------------------------------------------------
    // Test 3: Admin Business Status Update (Publishing)
    // -------------------------------------------------------------
    console.log('\nStep 3: Business Publishing Update');
    const { data: updatedBiz, error: updateBizErr } = await adminClient
      .from('businesses')
      .update({ status: 'PUBLISHED', verification_status: 'SUPPORTED', verification_level: 'STATUTORY_VERIFIED' })
      .eq('id', businessId)
      .select()
      .single();

    assert(!updateBizErr && updatedBiz && updatedBiz.status === 'PUBLISHED', `Business published in Supabase (status: ${updatedBiz?.status}, level: ${updatedBiz?.verification_level})`);

    // -------------------------------------------------------------
    // Test 4: Anonymous / Public Querying (Cross-browser simulation)
    // -------------------------------------------------------------
    console.log('\nStep 4: Unauthenticated Public Retrieval');
    const { data: publicBiz, error: publicBizErr } = await anonClient
      .from('businesses')
      .select('*, business_locations(*)')
      .eq('slug', testBusinessSlug)
      .single();

    assert(!publicBizErr && publicBiz && publicBiz.status === 'PUBLISHED', `Unauthenticated visitor can query published business by slug '${testBusinessSlug}'`);

    // -------------------------------------------------------------
    // Test 5: Negative RLS Enforcement on Businesses Table
    // -------------------------------------------------------------
    console.log('\nStep 5: Negative RLS Security Enforcement');
    const unauthorizedBiz = {
      id: crypto.randomUUID(),
      conflux_business_id: `CB-ROGUE-${Date.now()}`,
      slug: `rogue-${Date.now()}`,
      name: 'Unauthorized Rogue Business',
      status: 'PUBLISHED'
    };

    const { data: rogueData, error: rogueErr } = await anonClient
      .from('businesses')
      .insert([unauthorizedBiz]);

    assert(Boolean(rogueErr), `Anonymous business insertion blocked by RLS (Expected 42501, Received: ${rogueErr?.code})`);

    // Anonymous update attempt
    const { data: anonUpdateData, error: anonUpdateErr } = await anonClient
      .from('businesses')
      .update({ name: 'Hacked Business Name' })
      .eq('id', businessId);

    // In postgres RLS, anonymous update either returns error 42501 or affects 0 rows
    const { data: postCheckBiz } = await anonClient.from('businesses').select('name').eq('id', businessId).single();
    assert(postCheckBiz?.name === 'P0 Audit Test Diagnostic Lab', `Anonymous business update prevented (Name unaltered: '${postCheckBiz?.name}')`);

    // -------------------------------------------------------------
    // Test 6: Inbound Lead Flow Truth & RLS Enforcement
    // -------------------------------------------------------------
    console.log('\nStep 6: Inbound Lead Persistence Truth & Isolation');
    const leadId = crypto.randomUUID();
    const testLead = {
      id: leadId,
      business_id: businessId,
      business_name: 'P0 Audit Test Diagnostic Lab',
      contact_name: 'Dr. Sourav Ganguly',
      contact_email: 'sourav@example.com',
      contact_phone: '+91 98300 12345',
      service_requested: 'Pathology Diagnostics Package',
      message: 'Inquiring regarding diagnostic test scheduling.',
      status: 'PENDING'
    };

    // Anon submission to leads table (allowed by policy "Anyone can submit a lead")
    const { error: leadInsertErr } = await anonClient.from('leads').insert([testLead]);
    assert(!leadInsertErr, `Anonymous visitor can submit lead to public.leads (Lead ID: ${leadId})`);

    // Negative test: Anonymous visitor must NOT be able to view / scrape leads
    const { data: anonLeads, error: anonLeadsErr } = await anonClient.from('leads').select('*');
    assert(Array.isArray(anonLeads) && anonLeads.length === 0, `Anonymous visitor blocked from viewing leads (Received ${anonLeads?.length || 0} rows)`);

    // Admin MUST be able to view submitted leads
    const { data: adminLeads, error: adminLeadsErr } = await adminClient.from('leads').select('*').eq('id', leadId);
    assert(!adminLeadsErr && adminLeads && adminLeads.length === 1, `Admin can view submitted lead (Found: ${adminLeads?.[0]?.contact_name})`);

    // -------------------------------------------------------------
    // Test 7: Telemetry Events & Anonymous Logging
    // -------------------------------------------------------------
    console.log('\nStep 7: Connect Telemetry Insertion');
    const { error: telemetryErr } = await anonClient.from('connect_telemetry_events').insert([{
      business_id: businessId,
      event_type: 'BUSINESS_VIEW',
      channel: 'HUMAN_WEB',
      session_pseudonym: 'test_session_p0'
    }]);
    assert(!telemetryErr, 'Anonymous visitor can log interaction telemetry');

    // -------------------------------------------------------------
    // Step 8: Cascade Cleanup
    // -------------------------------------------------------------
    console.log('\nStep 8: Acceptance Test Cleanup');
    await adminClient.from('leads').delete().eq('id', leadId);
    const { error: deleteBizErr } = await adminClient.from('businesses').delete().eq('id', businessId);
    assert(!deleteBizErr, `Admin cleaned up test business and cascade dependencies (ID: ${businessId})`);

    // Confirm deleted
    const { data: postDeleteBiz } = await anonClient.from('businesses').select('id').eq('id', businessId);
    assert(postDeleteBiz?.length === 0, 'Test business confirmed deleted from Supabase');

  } catch (err) {
    console.error('Fatal unexpected error during test suite execution:', err);
  }

  console.log('\n=============================================================');
  console.log(`TOTAL ACCEPTANCE TESTS: ${totalTests} | PASSED: ${passCount} | FAILED: ${totalTests - passCount}`);
  console.log('=============================================================');
}

runTests();
