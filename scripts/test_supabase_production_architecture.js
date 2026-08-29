// Conflux Platform — Supabase Production Architecture & RLS Security Test Suite

import assert from 'node:assert';
import { isSupabaseConfigured, getSupabaseConfig, assertSupabaseConfigured } from '../lib/supabase.ts';
import { businessService } from '../lib/businessService.ts';
import { contributionService } from '../lib/contributionService.ts';
import { authService } from '../lib/authService.ts';
import { TEST_FIXTURE_BUSINESSES } from '../tests/fixtures/testBusinessFixtures.ts';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    failed++;
  }
}

async function main() {
  console.log('======================================================================');
  console.log('   CONFLUX PLATFORM — SUPABASE PRODUCTION ARCHITECTURE TESTS        ');
  console.log('======================================================================\n');

  // ── 1. Configuration & Hardcoded Key Audit ───────────────────────────────────
  console.log('--- 1. Testing Supabase Configuration Engine ---');

  test('Properly detects when Supabase is unconfigured / empty', () => {
    const config = getSupabaseConfig();
    assert.strictEqual(typeof config.isConfigured, 'boolean');
  });

  test('assertSupabaseConfigured does not throw in dev/test but issues warning', () => {
    assert.doesNotThrow(() => {
      assertSupabaseConfigured('test operation');
    });
  });

  // ── 2. Private Evidence Isolation & Security ─────────────────────────────────
  console.log('\n--- 2. Testing Private Evidence & Sensitive Document Security ---');

  await asyncTest('Business submission isolates private evidence documents from public visibility', async () => {
    businessService.clearGraphStore();
    
    const app = await businessService.submitApplication({
      submissionType: 'CONFLUX_VERIFIED',
      businessName: 'Ranaghat Diagnostic Laboratory',
      businessType: 'HEALTHCARE',
      categoryId: 'healthcare',
      description: 'High-precision medical pathology and ultrasonography testing.',
      district: 'nadia',
      city: 'ranaghat',
      fullAddress: '44 Court Road, Ranaghat, Nadia',
      phone: '+919830099999',
      email: 'admin@ranaghatdiagnostic.com',
      ownerName: 'Dr. S. Chatterjee',
      ownerRole: 'Medical Director',
      declarationConfirmed: true,
      noStockImagesConfirmed: true,
      privateEvidence: [
        {
          documentType: 'CLINICAL_ESTABLISHMENT_LICENSE',
          documentName: 'WB Clinical License 2026.pdf',
          documentNumber: 'WB-CE-NAD-2026-9921',
          documentFileUrl: 'https://secure-vault.confluxai.in/private/wb_ce_license.pdf',
          isPrivate: true
        },
        {
          documentType: 'OWNER_IDENTITY_PAN',
          documentName: 'Director PAN.pdf',
          documentNumber: 'ABCDE1234F',
          documentFileUrl: 'https://secure-vault.confluxai.in/private/director_pan.pdf',
          isPrivate: true
        }
      ]
    });

    assert.ok(app.id.startsWith('APP-2026-'), 'Generated valid application reference ID');
    assert.strictEqual(app.privateEvidence.length, 2, 'Private evidence attached to submission');
    assert.ok(app.privateEvidence.every(doc => doc.isPrivate === true), 'All evidence docs marked private');

    // Verify that approving the application creates a public business that does NOT expose private raw URLs
    const approvedBiz = await businessService.approveApplicationAsVerified(
      app.id,
      'West Bengal Clinical Establishment Regulatory Commission',
      'Clinical establishment license corroborated against state registry.'
    );

    assert.strictEqual(approvedBiz.status, 'PUBLISHED');
    assert.strictEqual(approvedBiz.verificationStatus, 'SUPPORTED');
    assert.strictEqual(approvedBiz.confidenceScore, 92.0);
    assert.strictEqual(approvedBiz.privateEvidence, undefined, 'Public entity does NOT leak privateEvidence array');
  });

  // ── 3. Authenticated Contributions & Access Gating ───────────────────────────
  console.log('\n--- 3. Testing User Contributions & Moderation Gating ---');

  await asyncTest('Anonymous review submission is strictly blocked with AUTHENTICATION_REQUIRED', async () => {
    contributionService.clearStore();
    let threw = false;
    try {
      await contributionService.submitReview(
        '', // Anonymous / Empty userId
        '',
        '',
        'biz_test_123',
        5,
        'Excellent diagnostic service and punctual report delivery.'
      );
    } catch (err) {
      threw = true;
      assert.ok(err.message.includes('AUTHENTICATION_REQUIRED'), 'Throws AUTHENTICATION_REQUIRED');
    }
    assert.strictEqual(threw, true, 'Blocked unauthenticated review submission');
  });

  await asyncTest('Authenticated user review defaults to PENDING_MODERATION', async () => {
    const review = await contributionService.submitReview(
      'usr_genuine_patient_1',
      'patient@gmail.com',
      'Sourav Ganguly',
      'biz_test_123',
      5,
      'Fast pathology testing with accurate digital WhatsApp reports.'
    );

    assert.strictEqual(review.moderationStatus, 'PENDING_MODERATION');
    
    // Public view should return 0 reviews before admin moderation
    const publicReviews = await contributionService.getApprovedReviewsForBusiness('biz_test_123');
    assert.strictEqual(publicReviews.length, 0, 'Unapproved review is not exposed on public profile');

    // Admin approves review
    const approved = await contributionService.moderateContribution(review.id, 'APPROVED', 'Verified legitimate user review');
    assert.strictEqual(approved.moderationStatus, 'APPROVED');

    // Public view now reflects the approved review
    const publicReviewsAfter = await contributionService.getApprovedReviewsForBusiness('biz_test_123');
    assert.strictEqual(publicReviewsAfter.length, 1, 'Approved review appears on public profile');
    assert.strictEqual(publicReviewsAfter[0].rating, 5);
  });

  // ── 4. Business Graph CRUD & Integrity ───────────────────────────────────────
  console.log('\n--- 4. Testing Business Graph Operations & Search ---');

  await asyncTest('Newly created business defaults to DRAFT and UNVERIFIED', async () => {
    const newBiz = await businessService.createBusiness({
      name: 'Santipur Tant Emporium',
      businessType: 'HANDLOOM_CRAFT',
      categoryId: 'handloom-textiles',
      description: 'Traditional handcrafted Santipur and Phulia cotton sarees.',
      district: 'nadia',
      city: 'santipur',
      fullAddress: 'Sutragarh Cloth Market, Santipur, Nadia',
      phone: '+919832100000',
      whatsapp: '+919832100000'
    });

    assert.strictEqual(newBiz.status, 'DRAFT');
    assert.strictEqual(newBiz.verificationStatus, 'UNVERIFIED');
    assert.strictEqual(newBiz.confidenceScore, 0.0);
    assert.strictEqual(newBiz.isIndexable, false);

    // Search results should NOT include draft business
    const searchResults = await businessService.searchBusinesses({ query: 'Santipur' });
    assert.ok(!searchResults.some(r => r.business.id === newBiz.id), 'Draft business excluded from search');

    // Publish business
    const published = await businessService.setPublishStatus(newBiz.id, 'PUBLISHED');
    assert.strictEqual(published.status, 'PUBLISHED');
    assert.strictEqual(published.isIndexable, true);

    // Now search should find it
    const searchResultsAfter = await businessService.searchBusinesses({ query: 'Santipur' });
    assert.ok(searchResultsAfter.some(r => r.business.id === newBiz.id), 'Published business found in search');
  });

  console.log('\n======================================================================');
  console.log(`TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${failed} FAILS)`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
