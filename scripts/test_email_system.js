// Conflux Platform — Centralized Transactional Email System Test Suite
// Verifies recipient formatting, template compilation, idempotency deduplication,
// verification boundaries, admin alerts, retry handling, and preference separation.

import assert from 'assert';
import { compileEmailTemplate } from '../lib/emailTemplates.ts';
import { emailService } from '../lib/emailService.ts';

console.log('\n======================================================');
console.log('    CONFLUX PLATFORM — TRANSACTIONAL EMAIL TEST SUITE ');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function main() {
  // Clear any existing store state before tests
  emailService.clearStore();

  // -------------------------------------------------------------
  // TEST 1: Template Branding & Required Legal Elements
  // -------------------------------------------------------------
  await runTest('Template Branding: Header, Support Email, Terms & Privacy Links', () => {
    const rendered = compileEmailTemplate('ACCOUNT_CREATED', { fullName: 'Tarun Biswas' });

    assert.ok(rendered.subject.includes('Welcome to Conflux AI'));
    assert.ok(rendered.html.includes('CONFLUX'));
    assert.ok(rendered.html.includes('AI'));
    assert.ok(rendered.html.includes('contact@confluxai.in'));
    assert.ok(rendered.html.includes('https://www.confluxai.in/terms'));
    assert.ok(rendered.html.includes('https://www.confluxai.in/privacy'));
    assert.ok(rendered.html.includes('https://www.confluxai.in/refund'));
    assert.ok(rendered.text.includes('Tarun Biswas'));
  });

  // -------------------------------------------------------------
  // TEST 2: Verification Payment Success (Strict Transparency Invariant)
  // -------------------------------------------------------------
  await runTest('Payment Success Email: ₹499 INR, Neutral GST, and Payment ≠ Verification Guarantee', () => {
    const orderData = {
      orderId: 'cfx_verify_test_101',
      businessSlug: 'ranaghat-confectionery',
      businessName: 'Ranaghat Confectionery',
      customerName: 'Amiya Mondal',
      amountInr: 499.00,
      paymentReference: 'cf_pay_ref_9921',
      paymentTime: '2026-09-25T11:00:00.000Z'
    };

    const rendered = compileEmailTemplate('VERIFICATION_PAYMENT_SUCCESS', orderData);

    // Docket details
    assert.ok(rendered.subject.includes('cfx_verify_test_101'));
    assert.ok(rendered.subject.includes('Ranaghat Confectionery'));
    assert.ok(rendered.html.includes('cfx_verify_test_101'));
    assert.ok(rendered.html.includes('cf_pay_ref_9921'));
    assert.ok(rendered.html.includes('499.00'));
    // GST Notice: Must NOT claim exempt/zero-rated; must be neutral
    assert.ok(rendered.html.includes('GST is not charged'));
    assert.ok(!rendered.html.includes('zero-rated'));
    assert.ok(!rendered.html.includes('small service provider threshold'));
    // Verification boundary invariant
    assert.ok(rendered.html.includes('does NOT guarantee verification approval'));
    assert.ok(rendered.html.includes('Submit Verification Evidence'));
    assert.ok(rendered.html.includes('verify/payment-return?order_id=cfx_verify_test_101'));
  });

  // -------------------------------------------------------------
  // TEST 3: Verification Evidence Submitted
  // -------------------------------------------------------------
  await runTest('Evidence Submitted Email: Typical 1-2 business days turnaround & order status link', () => {
    const rendered = compileEmailTemplate('VERIFICATION_SUBMITTED', {
      orderId: 'cfx_verify_test_102',
      businessName: 'Nadia Handloom Emporium'
    });

    assert.ok(rendered.subject.includes('Evidence In Review'));
    assert.ok(rendered.subject.includes('Nadia Handloom Emporium'));
    assert.ok(rendered.html.includes('1–2 business days'));
    assert.ok(rendered.html.includes('Check Order Status'));
    assert.ok(rendered.text.includes('1–2 business days'));
  });

  // -------------------------------------------------------------
  // TEST 4: Verification More Evidence Requested
  // -------------------------------------------------------------
  await runTest('More Evidence Email: Reviewer Notes, 14-day window, zero extra charge', () => {
    const notes = 'Please provide a clear color photograph of your shop storefront showing the municipal registration board.';
    const rendered = compileEmailTemplate('VERIFICATION_MORE_EVIDENCE', {
      orderId: 'cfx_verify_test_103',
      businessName: 'Kalyani Tech Hub',
      notes
    });

    assert.ok(rendered.subject.includes('Action Required: Additional Evidence Needed'));
    assert.ok(rendered.html.includes(notes));
    assert.ok(rendered.html.includes('14-Day Resubmission Window'));
    assert.ok(rendered.html.includes('zero additional charge'));
    assert.ok(rendered.html.includes('Upload Additional Evidence'));
  });

  // -------------------------------------------------------------
  // TEST 5: Verification Approved
  // -------------------------------------------------------------
  await runTest('Verification Approved Email: Conflux Verified badge, 1-year temporal validity', () => {
    const rendered = compileEmailTemplate('VERIFICATION_APPROVED', {
      orderId: 'cfx_verify_test_104',
      businessSlug: 'ma-tara-diagnostics',
      businessName: 'Ma Tara Diagnostics',
      verifiedAt: '2026-09-25T12:00:00.000Z',
      expiresAt: '2027-09-25T12:00:00.000Z'
    });

    assert.ok(rendered.subject.includes('✓ Conflux Verified Approved'));
    assert.ok(rendered.html.includes('✓ Conflux Verified'));
    assert.ok(rendered.html.includes('1 Year'));
    assert.ok(rendered.html.includes('View Public Verified Profile'));
    assert.ok(rendered.html.includes('/business/ma-tara-diagnostics'));
  });

  // -------------------------------------------------------------
  // TEST 6: Verification Rejected (Evaluation Outcome & Rationale)
  // -------------------------------------------------------------
  await runTest('Verification Rejected Email: Specific rationale, non-refundable investigation explanation', () => {
    const reason = 'Trade license number TL-88291 could not be corroborated with Ranaghat Municipality registers.';
    const rendered = compileEmailTemplate('VERIFICATION_REJECTED', {
      orderId: 'cfx_verify_test_105',
      businessName: 'City Opticals',
      reason
    });

    assert.ok(rendered.subject.includes('Verification Decision Notice'));
    assert.ok(rendered.html.includes(reason));
    assert.ok(rendered.html.includes('non-refundable'));
    assert.ok(rendered.text.includes(reason));
  });

  // -------------------------------------------------------------
  // TEST 7: Business Submission & Claim Emails
  // -------------------------------------------------------------
  await runTest('Business Lifecycle Emails: Submission received, approved, and claimed', () => {
    const sub = compileEmailTemplate('BUSINESS_SUBMITTED', { businessName: 'Mondal Sweets', city: 'Ranaghat' });
    assert.ok(sub.subject.includes('Business Submission Received'));
    assert.ok(sub.html.includes('Mondal Sweets'));

    const app = compileEmailTemplate('BUSINESS_APPROVED', { businessName: 'Mondal Sweets', businessSlug: 'mondal-sweets' });
    assert.ok(app.subject.includes('Your Business is Now Live'));
    assert.ok(app.html.includes('/business/mondal-sweets'));

    const clm = compileEmailTemplate('BUSINESS_CLAIMED', { businessName: 'Mondal Sweets', ownerName: 'Debabrata Mondal' });
    assert.ok(clm.subject.includes('Ownership Claim Received'));
    assert.ok(clm.html.includes('Debabrata Mondal'));
  });

  // -------------------------------------------------------------
  // TEST 8: Admin Operational Notifications
  // -------------------------------------------------------------
  await runTest('Admin Operational Notifications: New payment, submission queue, and security alert', () => {
    const pmt = compileEmailTemplate('ADMIN_VERIFICATION_PAYMENT', {
      orderId: 'cfx_9901',
      businessName: 'Apex Dental',
      customerEmail: 'dr.apex@dental.in',
      amountInr: 499.00
    });
    assert.ok(pmt.subject.includes('[Admin] ₹499 Paid'));
    assert.ok(pmt.html.includes('Apex Dental'));

    const sub = compileEmailTemplate('ADMIN_NEW_BUSINESS_SUBMISSION', {
      businessName: 'Ranaghat Printing Works',
      city: 'Ranaghat',
      submitterEmail: 'print@ranaghat.in'
    });
    assert.ok(sub.subject.includes('[Admin] New Business Submitted'));

    const sec = compileEmailTemplate('ADMIN_SECURITY_ALERT', {
      title: 'Repeated Webhook Signature Failure',
      details: 'Detected 5 invalid HMAC signatures from unknown IP range.'
    });
    assert.ok(sec.subject.includes('[Admin Alert]'));
  });

  // -------------------------------------------------------------
  // TEST 9: EmailService Dispatch & Sandbox Delivery
  // -------------------------------------------------------------
  await runTest('EmailService Dispatch: Successful sandbox delivery & log persistence', async () => {
    const result = await emailService.sendVerificationPaymentSuccess({
      id: 'uuid-1',
      orderId: 'cfx_ord_test_001',
      businessSlug: 'test-pharmacy',
      businessName: 'Test Pharmacy',
      customerName: 'Dr. Sen',
      customerEmail: 'sen@testpharmacy.com',
      customerPhone: '9830000000',
      amountInr: 499.00,
      currency: 'INR',
      paymentStatus: 'PAID',
      verificationStatus: 'PAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'SANDBOX');
    assert.ok(result.idempotencyKey.includes('cfx_ord_test_001'));
    assert.ok(result.messageId.startsWith('sbx_'));

    // Verify log is retrievable
    const logs = await emailService.getAllEmailLogs();
    const found = logs.find(l => l.idempotencyKey === result.idempotencyKey);
    assert.ok(found, 'Dispatched email must be recorded in email audit logs');
    assert.strictEqual(found.recipient, 'sen@testpharmacy.com');
    assert.strictEqual(found.eventType, 'VERIFICATION_PAYMENT_SUCCESS');
  });

  // -------------------------------------------------------------
  // TEST 10: Idempotency & Duplicate-Event Protection
  // -------------------------------------------------------------
  await runTest('Idempotency: Repeated dispatch with identical idempotencyKey is skipped', async () => {
    const order = {
      id: 'uuid-2',
      orderId: 'cfx_ord_test_002',
      businessSlug: 'test-bakery',
      businessName: 'Test Bakery',
      customerName: 'Ramen Roy',
      customerEmail: 'ramen@bakery.com',
      customerPhone: '9830000001',
      amountInr: 499.00,
      currency: 'INR',
      paymentStatus: 'PAID',
      verificationStatus: 'PAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // First call: Should succeed and log
    const firstCall = await emailService.sendVerificationPaymentSuccess(order);
    assert.strictEqual(firstCall.success, true);
    assert.strictEqual(firstCall.status, 'SANDBOX');

    // Second call: Replay with identical idempotencyKey
    const secondCall = await emailService.sendVerificationPaymentSuccess(order);
    assert.strictEqual(secondCall.success, true);
    assert.strictEqual(secondCall.status, 'SKIPPED_DUPLICATE', 'Second call must be marked as SKIPPED_DUPLICATE');
    assert.strictEqual(secondCall.idempotencyKey, firstCall.idempotencyKey);
  });

  // -------------------------------------------------------------
  // TEST 11: User Preferences: Transactional vs Optional Marketing
  // -------------------------------------------------------------
  await runTest('User Preferences: Transactional emails always deliver; Marketing emails respect opt-out', async () => {
    const userEmail = 'optout@example.com';
    
    // Set user preferences with marketing disallowed
    emailService.setUserPreferences({
      email: userEmail,
      allowMarketing: false,
      allowCommunityUpdates: false,
      updatedAt: new Date().toISOString()
    });

    // 1. Transactional email MUST deliver even if opted out of marketing
    const transResult = await emailService.sendEventEmail({
      eventType: 'ACCOUNT_SECURITY_ALERT',
      recipient: userEmail,
      category: 'TRANSACTIONAL',
      idempotencyKey: `SEC_ALERT_${Date.now()}`,
      data: { details: 'Password updated from trusted session.' }
    });
    assert.strictEqual(transResult.success, true);
    assert.strictEqual(transResult.status, 'SANDBOX', 'Transactional email must deliver regardless of marketing preferences');

    // 2. Marketing email MUST be skipped when marketing preference is false
    const mktResult = await emailService.sendEventEmail({
      eventType: 'ACCOUNT_CREATED',
      recipient: userEmail,
      category: 'MARKETING',
      idempotencyKey: `MKT_PROMO_${Date.now()}`,
      data: { message: 'Special weekend business spotlight.' }
    });
    assert.strictEqual(mktResult.success, true);
    assert.strictEqual(mktResult.status, 'SKIPPED_PREFERENCE', 'Marketing email must be skipped when user has not opted in');
  });

  // -------------------------------------------------------------
  // TEST 12: Admin Notification Dispatch
  // -------------------------------------------------------------
  await runTest('Admin Notification Dispatch: Sends to contact@confluxai.in with correct event details', async () => {
    const adminResult = await emailService.sendAdminVerificationPayment({
      orderId: 'cfx_admin_test_01',
      businessName: 'Ranaghat Gold House',
      customerEmail: 'gold@ranaghat.in',
      amountInr: 499.00
    });

    assert.strictEqual(adminResult.success, true);
    const logs = await emailService.getAllEmailLogs();
    const adminLog = logs.find(l => l.eventType === 'ADMIN_VERIFICATION_PAYMENT');
    assert.ok(adminLog);
    assert.strictEqual(adminLog.recipient, 'contact@confluxai.in');
    assert.ok(adminLog.subject.includes('₹499 Paid'));
  });

  // -------------------------------------------------------------
  // TEST 13: Non-Blocking Safe Error Handling
  // -------------------------------------------------------------
  await runTest('Safe Isolation: Missing or corrupted recipient returns clean failure without throwing', async () => {
    const failResult = await emailService.sendEventEmail({
      eventType: 'VERIFICATION_PAYMENT_SUCCESS',
      recipient: '', // Empty recipient
      data: {}
    });

    assert.strictEqual(failResult.success, false);
    assert.strictEqual(failResult.status, 'FAILED');
    assert.ok(failResult.error.includes('Missing recipient'));
  });

  // -------------------------------------------------------------
  // TEST 14: Verification State Lifecycle End-to-End Triggers
  // -------------------------------------------------------------
  await runTest('Verification Lifecycle: Submitted -> More Evidence -> Approved -> Rejected email triggers', async () => {
    const dummyOrder = {
      orderId: 'cfx_flow_901',
      businessSlug: 'bengal-sweets',
      businessName: 'Bengal Sweets',
      customerName: 'Prabir Das',
      customerEmail: 'prabir@bengalsweets.in',
      amountInr: 499.00,
      paymentReference: 'bank_ref_771'
    };

    // 1. Evidence submitted
    const subResult = await emailService.sendVerificationSubmitted(dummyOrder);
    assert.strictEqual(subResult.success, true);

    // 2. More evidence requested
    const moreResult = await emailService.sendVerificationMoreEvidence(dummyOrder, 'Please re-upload front page of GST certificate.');
    assert.strictEqual(moreResult.success, true);

    // 3. Approved
    const appResult = await emailService.sendVerificationApproved({
      ...dummyOrder,
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString()
    });
    assert.strictEqual(appResult.success, true);

    // 4. Rejected
    const rejResult = await emailService.sendVerificationRejected(dummyOrder, 'GSTIN canceled by registrar.');
    assert.strictEqual(rejResult.success, true);

    // Verify all 4 lifecycle logs exist
    const logs = await emailService.getAllEmailLogs();
    const orderLogs = logs.filter(l => l.entityId === 'cfx_flow_901');
    assert.strictEqual(orderLogs.length >= 4, true, 'All 4 verification lifecycle emails must be recorded');
  });

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n------------------------------------------------------');
  console.log(`  RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('------------------------------------------------------\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test runner exception:', err);
  process.exit(1);
});
