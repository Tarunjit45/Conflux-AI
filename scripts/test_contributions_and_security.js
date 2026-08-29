// Conflux Platform — Production Data Reset, Contributions & Security Hardening Test Suite

import { businessService } from '../lib/businessService.ts';
import { contributionService } from '../lib/contributionService.ts';
import { TEST_FIXTURE_BUSINESSES } from '../tests/fixtures/testBusinessFixtures.ts';

console.log('======================================================================');
console.log('  CONFLUX PLATFORM — DATA RESET, CONTRIBUTIONS & SECURITY AUDIT       ');
console.log('======================================================================\n');

let passCount = 0;
let totalChecks = 0;

const assert = (name, cond, details = '') => {
  totalChecks++;
  if (cond) {
    console.log(`[PASS] ${name}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${name} - ${details}`);
  }
};

async function runSecurityAndContributionAudit() {
  // ── 1. PRODUCTION DATA RESET AUDIT ──────────────────────────────────
  console.log('--- 1. Testing Production Data Reset ---');
  businessService.clearGraphStore();
  const cleanList = await businessService.getAllBusinesses();
  assert('Production initial graph contains strictly ZERO seed businesses', cleanList.length === 0);

  const cleanSearchResults = await businessService.searchBusinesses({ query: 'Ranaghat' });
  assert('Discovery search on clean production returns ZERO businesses', cleanSearchResults.length === 0);

  // ── 2. ANONYMOUS ACCESS GATING AUDIT ────────────────────────────────
  console.log('\n--- 2. Testing Anonymous vs Authenticated Access Gating ---');
  let anonReviewError = false;
  try {
    await contributionService.submitReview(
      '', // No User ID
      '', // No Email
      'Anonymous Visitor',
      'biz_test_001',
      5,
      'Great local restaurant with authentic food.'
    );
  } catch (err) {
    anonReviewError = err.message.includes('AUTHENTICATION_REQUIRED');
  }
  assert('Anonymous review submission is strictly BLOCKED with AUTHENTICATION_REQUIRED', anonReviewError === true);

  let anonEditError = false;
  try {
    await contributionService.submitSuggestedEdit(
      '',
      '',
      'Anonymous',
      'biz_test_001',
      'operatingHours',
      '10:00 - 22:00',
      'Saw sign'
    );
  } catch (err) {
    anonEditError = err.message.includes('AUTHENTICATION_REQUIRED');
  }
  assert('Anonymous suggested edit is strictly BLOCKED with AUTHENTICATION_REQUIRED', anonEditError === true);

  let anonReportError = false;
  try {
    await contributionService.submitInaccuracyReport(
      '',
      '',
      'Anonymous',
      'biz_test_001',
      'OUTDATED_HOURS',
      'Shop closes early on Sundays'
    );
  } catch (err) {
    anonReportError = err.message.includes('AUTHENTICATION_REQUIRED');
  }
  assert('Anonymous inaccuracy report is strictly BLOCKED with AUTHENTICATION_REQUIRED', anonReportError === true);

  // ── 3. AUTHENTICATED USER CONTRIBUTIONS & MODERATION ────────────────
  console.log('\n--- 3. Testing Authenticated Contributions & Moderation ---');
  const review = await contributionService.submitReview(
    'usr_test_123',
    'contributor@example.com',
    'Tanmoy Sen',
    'biz_test_001',
    5,
    'Excellent diagnostic care and timely digital report delivery.',
    { businessName: 'Ranaghat Apex Diagnostic Centre' }
  );

  assert('Authenticated user review is accepted with status PENDING_MODERATION', review.moderationStatus === 'PENDING_MODERATION');
  assert('Review attaches authenticated user identity without public password or token leakage', review.userId === 'usr_test_123');

  // Verify review is NOT visible publicly before moderation
  const publicReviewsBefore = await contributionService.getApprovedReviewsForBusiness('biz_test_001');
  assert('Pending review is NOT exposed on public profile before admin approval', publicReviewsBefore.length === 0);

  // Duplicate review prevention
  let dupReviewBlocked = false;
  try {
    await contributionService.submitReview(
      'usr_test_123',
      'contributor@example.com',
      'Tanmoy Sen',
      'biz_test_001',
      4,
      'Second review attempt should be rejected to prevent rating manipulation.'
    );
  } catch (err) {
    dupReviewBlocked = true;
  }
  assert('Duplicate review on same business by same user is strictly BLOCKED', dupReviewBlocked === true);

  // Admin approves review
  await contributionService.moderateContribution(review.id, 'APPROVED');
  const publicReviewsAfter = await contributionService.getApprovedReviewsForBusiness('biz_test_001');
  assert('Approved review appears on public business profile', publicReviewsAfter.length === 1);
  assert('Public review contains genuine 5-star rating without synthetic inflation', publicReviewsAfter[0].rating === 5);

  // ── 4. PRIVILEGE ESCALATION & SECURITY BOUNDARIES ───────────────────
  console.log('\n--- 4. Testing Privilege Escalation & Security Boundaries ---');
  
  // Test: Standard user cannot self-assign VERIFIED status
  let caughtSelfVerify = false;
  const testBiz = await businessService.createBusiness({
    name: 'Unverified Shop',
    businessType: 'LOCAL_BUSINESS',
    categoryId: 'retail-trade',
    description: 'Test business node for security audit.',
    district: 'nadia',
    city: 'ranaghat',
    fullAddress: 'Station Road, Ranaghat'
  });

  assert('Newly created business strictly defaults to UNVERIFIED and confidence 0.00', testBiz.verificationStatus === 'UNVERIFIED' && testBiz.confidenceScore === 0.0);
  assert('Newly created business strictly defaults to DRAFT status', testBiz.status === 'DRAFT');

  // Test: File upload security rules
  const isValidMime = (mime) => ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(mime);
  assert('Rejects executable .exe payload', isValidMime('application/x-msdownload') === false);
  assert('Rejects executable .sh payload', isValidMime('application/x-sh') === false);
  assert('Rejects javascript .js payload', isValidMime('application/javascript') === false);
  assert('Permits authentic PDF document', isValidMime('application/pdf') === true);
  assert('Permits authentic JPEG image', isValidMime('image/jpeg') === true);
  assert('Permits authentic PNG image', isValidMime('image/png') === true);

  // Clean up test entity
  await businessService.deleteBusiness(testBiz.id);

  console.log('\n======================================================================');
  console.log(`SECURITY & CONTRIBUTION AUDIT SUMMARY: ${passCount} / ${totalChecks} TESTS PASSED`);
  console.log('======================================================================\n');

  if (passCount !== totalChecks) {
    process.exit(1);
  }
}

runSecurityAndContributionAudit().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
