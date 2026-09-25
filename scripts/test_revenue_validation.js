// Conflux Platform — Revenue Validation & Value Measurement Acceptance Suite

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { subscriptionService } from '../lib/subscriptionService.ts';
import { connectService } from '../lib/connectService.ts';

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

async function runRevenueValidationTests() {
  if (!ADMIN_PASS) {
    console.error('[ERROR] TEST_ADMIN_PASSWORD or ADMIN_PASSWORD env var required.');
    process.exit(1);
  }
  console.log('=== CONFLUX AI — REVENUE VALIDATION & VALUE ACCEPTANCE SUITE ===\n');
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

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let testBusinessId = null;
  let testLeadId = null;

  try {
    // -------------------------------------------------------------
    // Step 1: Admin Authentication
    // -------------------------------------------------------------
    console.log('Step 1: Administrator Authentication');
    const { data: authData, error: authErr } = await adminClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASS
    });
    assert(!authErr && authData?.user, `Admin signed in successfully (${ADMIN_EMAIL})`);
    if (!authData?.user) return;

    // -------------------------------------------------------------
    // Step 2: Provision Test Business Entity in Supabase
    // -------------------------------------------------------------
    console.log('\nStep 2: Provision Production Test Business Entity');
    testBusinessId = crypto.randomUUID();
    const testLocationId = crypto.randomUUID();
    const testSlug = `rev-test-biz-${Date.now()}`;

    const testBiz = {
      id: testBusinessId,
      conflux_business_id: `CFX-TEST-${Date.now()}`,
      slug: testSlug,
      name: 'Nadia Advanced Imaging Center',
      legal_name: 'Nadia Advanced Imaging & Diagnostics Pvt Ltd',
      business_type: 'HEALTHCARE',
      category_id: 'healthcare',
      category_name: 'Healthcare & Diagnostics',
      services: ['MRI', 'CT Scan', 'Pathology'],
      landmark: 'Opposite Sub-Divisional Hospital',
      description: 'Advanced diagnostic imaging center providing NABL accredited diagnostics.',
      short_summary: 'Comprehensive multi-slice CT & ultrasound imaging.',
      status: 'PUBLISHED',
      claim_status: 'UNCLAIMED_PUBLIC',
      verification_status: 'UNVERIFIED',
      verification_level: 'NONE',
      confidence_score: 55,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdBiz, error: createBizErr } = await adminClient
      .from('businesses')
      .insert([testBiz])
      .select()
      .single();

    assert(!createBizErr && createdBiz?.id, `Test business created in Supabase (ID: ${createdBiz?.id})`);

    const { error: locErr } = await adminClient
      .from('business_locations')
      .insert([{
        id: testLocationId,
        business_id: testBusinessId,
        country: 'India',
        state: 'West Bengal',
        district: 'nadia',
        city: 'Ranaghat',
        landmark: 'Opposite Sub-Divisional Hospital',
        full_address: '44 Court Road, Ranaghat, Nadia, West Bengal 741201',
        is_primary: true
      }]);
    assert(!locErr, `Location record provisioned for business`);

    // -------------------------------------------------------------
    // Step 3: Production Lead Delivery & Persistence
    // -------------------------------------------------------------
    console.log('\nStep 3: Inbound Lead Creation & Persistence');
    testLeadId = crypto.randomUUID();
    const testLead = {
      id: testLeadId,
      business_id: testBusinessId,
      business_name: 'Nadia Advanced Imaging Center',
      contact_name: 'Amitava Roy',
      contact_email: 'amitava.roy@example.com',
      contact_phone: '+91 98310 99887',
      service_requested: 'Brain MRI with Contrast',
      message: 'Urgent appointment inquiry for doctor prescribed MRI scan.',
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    // Anonymous submission into public.leads
    const { error: leadInsertErr } = await anonClient
      .from('leads')
      .insert([testLead]);
    assert(!leadInsertErr, `Anonymous visitor submitted lead with valid UUID (ID: ${testLeadId})`);

    // Retrieve lead as Admin
    const { data: fetchedLeads, error: fetchLeadErr } = await adminClient
      .from('leads')
      .select('*')
      .eq('id', testLeadId);
    assert(!fetchLeadErr && fetchedLeads?.length === 1, `Lead persisted and retrieved with business_id: ${fetchedLeads?.[0]?.business_id}`);
    assert(fetchedLeads?.[0]?.contact_name === 'Amitava Roy', `Lead contact name verified: ${fetchedLeads?.[0]?.contact_name}`);

    // Negative RLS test: Anonymous user must be BLOCKED from reading leads
    const { data: anonScrapeLeads } = await anonClient
      .from('leads')
      .select('*')
      .eq('id', testLeadId);
    assert(Array.isArray(anonScrapeLeads) && anonScrapeLeads.length === 0, `Anonymous user blocked from reading leads (Received: ${anonScrapeLeads?.length || 0} rows)`);

    // -------------------------------------------------------------
    // Step 4: Business Telemetry Event Logging & Persistence
    // -------------------------------------------------------------
    console.log('\nStep 4: Business Telemetry Event Logging (All 7 Event Types)');
    const eventTypes = [
      'BUSINESS_VIEW',
      'PHONE_CLICK',
      'WHATSAPP_CLICK',
      'WEBSITE_CLICK',
      'DIRECTIONS_CLICK',
      'BOOKING_CLICK',
      'LEAD_SUBMITTED'
    ];

    const telemetryRows = eventTypes.map(ev => ({
      business_id: testBusinessId,
      event_type: ev,
      channel: 'HUMAN_WEB',
      session_pseudonym: `ses_${crypto.randomBytes(4).toString('hex')}`,
      created_at: new Date().toISOString()
    }));

    const { error: telemErr } = await anonClient
      .from('connect_telemetry_events')
      .insert(telemetryRows);
    assert(!telemErr, `All 7 telemetry event types inserted successfully into Supabase`);

    // Retrieve via connectService.getBusinessActivityReport (authenticated admin view)
    const activityReport = await connectService.getBusinessActivityReport(testBusinessId, 'Nadia Advanced Imaging Center', adminClient);
    assert(activityReport.totalViews >= 1, `Activity Report reflects totalViews: ${activityReport.totalViews}`);
    assert(activityReport.whatsappClicks >= 1, `Activity Report reflects whatsappClicks: ${activityReport.whatsappClicks}`);
    assert(activityReport.phoneClicks >= 1, `Activity Report reflects phoneClicks: ${activityReport.phoneClicks}`);
    assert(activityReport.websiteClicks >= 1, `Activity Report reflects websiteClicks: ${activityReport.websiteClicks}`);
    assert(activityReport.directionsClicks >= 1, `Activity Report reflects directionsClicks: ${activityReport.directionsClicks}`);
    assert(activityReport.bookingClicks >= 1, `Activity Report reflects bookingClicks: ${activityReport.bookingClicks}`);
    assert(activityReport.leadSubmissions >= 1, `Activity Report reflects leadSubmissions: ${activityReport.leadSubmissions}`);
    assert(activityReport.totalContactActions >= 5, `Activity Report reflects totalContactActions: ${activityReport.totalContactActions}`);

    // -------------------------------------------------------------
    // Step 5: Commercial Plan & Entitlements Engine
    // -------------------------------------------------------------
    console.log('\nStep 5: Commercial Subscription & Entitlements Engine');
    // Test initial FREE state
    const initialEnt = await subscriptionService.getBusinessEntitlements(testBusinessId, adminClient);
    assert(initialEnt.isPaid === false, `Initial business has isPaid === false`);
    assert(initialEnt.plan === 'FREE', `Initial business has plan === 'FREE'`);
    assert(initialEnt.features.directLeadForwarding === false, `Free plan has directLeadForwarding === false`);
    assert(initialEnt.features.partnerBadge === false, `Free plan has partnerBadge === false`);

    // Activate VERIFIED_GROWTH Plan
    const activatedSub = await subscriptionService.updateBusinessSubscription({
      businessId: testBusinessId,
      plan: 'VERIFIED_GROWTH',
      status: 'ACTIVE',
      durationDays: 30,
      paymentProvider: 'OFFLINE_MANUAL',
      paymentReference: 'INVOICE-TEST-001',
      client: adminClient
    });
    assert(activatedSub.status === 'ACTIVE' && activatedSub.plan === 'VERIFIED_GROWTH', `Subscription activated: VERIFIED_GROWTH (ACTIVE)`);

    // Check Entitlements on Paid Plan
    const paidEnt = await subscriptionService.getBusinessEntitlements(testBusinessId, adminClient);
    assert(paidEnt.isPaid === true, `Paid business has isPaid === true`);
    assert(paidEnt.features.directLeadForwarding === true, `Paid business has directLeadForwarding === true`);
    assert(paidEnt.features.directActionCtas === true, `Paid business has directActionCtas === true`);
    assert(paidEnt.features.analyticsReporting === true, `Paid business has analyticsReporting === true`);
    assert(paidEnt.features.partnerBadge === true, `Paid business has partnerBadge === true`);

    // CRITICAL INTEGRITY CHECK: Paid status must NEVER falsely alter statutory verification!
    const { data: checkBizPostSub } = await adminClient
      .from('businesses')
      .select('verification_status')
      .eq('id', testBusinessId)
      .single();
    assert(checkBizPostSub?.verification_status === 'UNVERIFIED', `INTEGRITY CHECK: Paid plan did not falsely alter statutory verification (Remains UNVERIFIED)`);

    // Test Expiration Behavior
    const expiredSub = {
      ...activatedSub,
      expiresAt: new Date(Date.now() - 10000).toISOString() // expired 10 seconds ago
    };
    const expiredEnt = subscriptionService.evaluateEntitlements(expiredSub);
    assert(expiredEnt.isPaid === false, `Expired subscription evaluates isPaid === false`);
    assert(expiredEnt.status === 'PAST_DUE', `Expired subscription evaluates status === 'PAST_DUE'`);
    assert(expiredEnt.features.directLeadForwarding === false, `Expired subscription revokes directLeadForwarding`);

    // -------------------------------------------------------------
    // Step 6: Public Business Profile Unauthenticated Retrieval
    // -------------------------------------------------------------
    console.log('\nStep 6: Public Business Profile Fetch & Verification Integrity');
    const { data: publicProfile, error: publicErr } = await anonClient
      .from('businesses')
      .select('*, business_locations(*)')
      .eq('slug', testSlug)
      .single();

    assert(!publicErr && publicProfile?.name === 'Nadia Advanced Imaging Center', `Public profile retrieved by slug: ${publicProfile?.name}`);
    assert(publicProfile?.business_locations?.[0]?.city === 'Ranaghat', `Public location verified: ${publicProfile?.business_locations?.[0]?.city}`);

    // -------------------------------------------------------------
    // Step 7: Acceptance Test Cleanup
    // -------------------------------------------------------------
    console.log('\nStep 7: Cascade Cleanup');
    await adminClient.from('leads').delete().eq('id', testLeadId);
    await adminClient.from('connect_telemetry_events').delete().eq('business_id', testBusinessId);
    const { error: delErr } = await adminClient.from('businesses').delete().eq('id', testBusinessId);
    assert(!delErr, `Test business and associated cascade dependencies deleted`);

    const { data: postDel } = await anonClient.from('businesses').select('id').eq('id', testBusinessId);
    assert(postDel?.length === 0, `Test entity confirmed removed from Supabase`);

  } catch (err) {
    console.error('Fatal unexpected error during test execution:', err);
  }

  console.log('\n=============================================================');
  console.log(`TOTAL REVENUE VALIDATION TESTS: ${totalTests} | PASSED: ${passCount} | FAILED: ${totalTests - passCount}`);
  console.log('=============================================================');
}

runRevenueValidationTests();
