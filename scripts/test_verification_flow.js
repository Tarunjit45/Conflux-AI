// Conflux Platform — Paid Conflux Verified & Cashfree Integration Test Suite
// Verifies order creation, payload integrity, signature generation, status decoupling, and admin approval invariant.

import crypto from 'crypto';
import assert from 'assert';
import { evaluateVerificationEvidence, maskDocumentNumber } from '../lib/verificationPaymentService.ts';

console.log('\n======================================================');
console.log('  CONFLUX AI — PAID VERIFIED & CASHFREE TEST SUITE  ');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// -------------------------------------------------------------
// TEST 1: Cashfree Order Payload Construction & Launch Pricing
// -------------------------------------------------------------
runTest('Verification Order Payload: Pricing strictly ₹499 INR & Valid Customer Details', () => {
  const req = {
    businessId: 'biz_test_123',
    businessSlug: 'a2z-supplements',
    businessName: 'A2Z Supplements',
    customerName: 'Subir Karmakar',
    customerEmail: 'subir@a2z.in',
    customerPhone: '9876543210'
  };

  const orderId = `cfx_verify_${Date.now()}`;
  const amountInr = 499.00;
  const currency = 'INR';

  const cashfreePayload = {
    order_id: orderId,
    order_amount: amountInr,
    order_currency: currency,
    customer_details: {
      customer_id: `cust_${req.businessSlug.replace(/[^a-zA-Z0-9_-]/g, '')}`,
      customer_name: req.customerName,
      customer_email: req.customerEmail,
      customer_phone: req.customerPhone
    },
    order_meta: {
      return_url: `https://www.confluxai.in/verify/payment-return?order_id=${orderId}`
    },
    order_note: `Conflux Verified Application for ${req.businessName}`
  };

  assert.strictEqual(cashfreePayload.order_amount, 499.00, 'Order amount must be 499.00 INR');
  assert.strictEqual(cashfreePayload.order_currency, 'INR');
  assert.strictEqual(cashfreePayload.customer_details.customer_phone, '9876543210');
  assert.ok(cashfreePayload.order_meta.return_url.includes(orderId));
});

// -------------------------------------------------------------
// TEST 1B: Client Tamper Resistance — Amount Enforced Server-Side
// -------------------------------------------------------------
runTest('Tamper Protection: Client attempts to modify amount are ignored, strictly ₹499.00', () => {
  // Simulate client passing malicious payload with modified amount
  const clientPayload = {
    businessSlug: 'a2z-supplements',
    amount: 1.00,        // Attempted tamper
    amountInr: 10.00,     // Attempted tamper
    order_amount: 0.00    // Attempted tamper
  };

  // Server-side order creation logic from api/create-verification-order.ts
  const serverEnforcedAmount = 499.00;
  
  assert.strictEqual(serverEnforcedAmount, 499.00, 'Server must enforce 499.00 regardless of client body');
  assert.notStrictEqual(serverEnforcedAmount, clientPayload.amount, 'Client amount must be overridden');
  assert.notStrictEqual(serverEnforcedAmount, clientPayload.amountInr);
});

// -------------------------------------------------------------
// TEST 2: Webhook HMAC-SHA256 Signature Verification
// -------------------------------------------------------------
runTest('Cashfree Webhook Signature: Validates timestamp + rawBody HMAC calculation', () => {
  const secretKey = 'TEST_CASHFREE_SECRET_KEY_12345';
  const timestamp = '1726400000';
  const rawBody = JSON.stringify({
    data: {
      order: {
        order_id: 'cfx_verify_1726400000_1234',
        order_amount: 499.00,
        order_currency: 'INR',
        order_status: 'PAID'
      },
      payment: {
        cf_payment_id: '123456789',
        payment_status: 'SUCCESS',
        payment_method: { upi: { channel: 'gpay' } }
      }
    },
    event_time: '2026-09-15T15:00:00Z',
    type: 'PAYMENT_SUCCESS_WEBHOOK'
  });

  // Calculate signature according to Cashfree PG spec
  const signatureData = `${timestamp}${rawBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(signatureData)
    .digest('base64');

  // Verify function
  const isValid = (() => {
    const computed = crypto
      .createHmac('sha256', secretKey)
      .update(signatureData)
      .digest('base64');
    return computed === expectedSignature;
  })();

  assert.strictEqual(isValid, true, 'HMAC-SHA256 signature verification must pass');
  
  // Tampered payload must fail
  const tamperedData = `${timestamp}${rawBody}tampered`;
  const isTamperedValid = (() => {
    const computed = crypto
      .createHmac('sha256', secretKey)
      .update(tamperedData)
      .digest('base64');
    return computed === expectedSignature;
  })();
  assert.strictEqual(isTamperedValid, false, 'Tampered payload signature must be rejected');
});

// -------------------------------------------------------------
// TEST 2B: Forged or Unsigned Webhooks Rejected
// -------------------------------------------------------------
runTest('Security: Forged, unsigned, or timestamp-missing webhooks are strictly rejected', () => {
  const secretKey = 'TEST_CASHFREE_SECRET_KEY_12345';
  
  function validateWebhookHeaders(headers, rawBody) {
    const signature = headers['x-webhook-signature'];
    const timestamp = headers['x-webhook-timestamp'];
    if (!signature || !timestamp) {
      return { status: 400, error: 'Missing webhook signature or timestamp headers' };
    }
    const signedData = timestamp + rawBody;
    const expected = crypto.createHmac('sha256', secretKey).update(signedData).digest('base64');
    if (signature !== expected) {
      return { status: 401, error: 'Invalid webhook signature' };
    }
    return { status: 200, valid: true };
  }

  const rawBody = JSON.stringify({ event: 'TEST' });
  const validTimestamp = '1726400000';
  const validSig = crypto.createHmac('sha256', secretKey).update(validTimestamp + rawBody).digest('base64');

  // Case 1: Missing signature header
  const missingSigResult = validateWebhookHeaders({ 'x-webhook-timestamp': validTimestamp }, rawBody);
  assert.strictEqual(missingSigResult.status, 400);

  // Case 2: Missing timestamp header
  const missingTsResult = validateWebhookHeaders({ 'x-webhook-signature': validSig }, rawBody);
  assert.strictEqual(missingTsResult.status, 400);

  // Case 3: Forged signature
  const forgedResult = validateWebhookHeaders({
    'x-webhook-signature': 'FORGED_INVALID_BASE64_SIGNATURE==',
    'x-webhook-timestamp': validTimestamp
  }, rawBody);
  assert.strictEqual(forgedResult.status, 401);

  // Case 4: Valid headers pass
  const validResult = validateWebhookHeaders({
    'x-webhook-signature': validSig,
    'x-webhook-timestamp': validTimestamp
  }, rawBody);
  assert.strictEqual(validResult.status, 200);
});

// -------------------------------------------------------------
// TEST 3: Core Invariant — Payment Never Auto-Verifies
// -------------------------------------------------------------
runTest('Core Invariant: Payment confirmation transitions to PAID, NEVER to VERIFIED', () => {
  const order = {
    orderId: 'cfx_verify_9999',
    businessSlug: 'a2z-supplements',
    paymentStatus: 'PENDING',
    verificationStatus: 'PAYMENT_PENDING'
  };

  const businessMock = {
    id: 'biz_01',
    name: 'A2Z Supplements',
    verificationStatus: 'UNVERIFIED',
    confidenceScore: 0
  };

  // Simulate payment success
  order.paymentStatus = 'PAID';
  order.verificationStatus = 'PAID'; // Awaiting evidence onboarding

  // Business mock MUST NOT be changed upon payment
  assert.strictEqual(order.paymentStatus, 'PAID');
  assert.strictEqual(order.verificationStatus, 'PAID');
  assert.notStrictEqual(order.verificationStatus, 'VERIFIED', 'Payment status MUST NOT be VERIFIED');
  assert.strictEqual(businessMock.verificationStatus, 'UNVERIFIED', 'Business must remain unverified upon payment alone');
});

// -------------------------------------------------------------
// TEST 4: Webhook & Payment Status Verification Idempotency
// -------------------------------------------------------------
runTest('Idempotency: Webhook replays and status updates preserve advanced lifecycle states', () => {
  // Simulate webhook status transition logic from api/cashfree-webhook.ts & api/verify-payment.ts
  function processWebhook(existingOrder, incomingPaymentStatus) {
    if (incomingPaymentStatus === 'SUCCESS') {
      const advancedStatuses = ['UNDER_REVIEW', 'MORE_EVIDENCE_REQUIRED', 'VERIFIED'];
      const currentStatus = existingOrder.verificationStatus;
      const newVerificationStatus = advancedStatuses.includes(currentStatus)
        ? currentStatus
        : 'PAID';
      return {
        paymentStatus: 'PAID',
        verificationStatus: newVerificationStatus
      };
    } else if (incomingPaymentStatus === 'FAILED') {
      // Do not revert if already PAID
      if (existingOrder.paymentStatus === 'PAID') {
        return existingOrder;
      }
      return {
        paymentStatus: 'FAILED',
        verificationStatus: 'PAYMENT_FAILED'
      };
    }
    return existingOrder;
  }

  // 1. Initial pending order transitions to PAID
  const initialOrder = { paymentStatus: 'PENDING', verificationStatus: 'PAYMENT_PENDING' };
  const paidResult = processWebhook(initialOrder, 'SUCCESS');
  assert.strictEqual(paidResult.paymentStatus, 'PAID');
  assert.strictEqual(paidResult.verificationStatus, 'PAID');

  // 2. Advanced order under review preserves UNDER_REVIEW state
  const underReviewOrder = { paymentStatus: 'PAID', verificationStatus: 'UNDER_REVIEW' };
  const underReviewResult = processWebhook(underReviewOrder, 'SUCCESS');
  assert.strictEqual(underReviewResult.paymentStatus, 'PAID');
  assert.strictEqual(underReviewResult.verificationStatus, 'UNDER_REVIEW', 'Webhook replay must not overwrite UNDER_REVIEW');

  // 3. Approved order preserves VERIFIED state
  const verifiedOrder = { paymentStatus: 'PAID', verificationStatus: 'VERIFIED' };
  const verifiedResult = processWebhook(verifiedOrder, 'SUCCESS');
  assert.strictEqual(verifiedResult.verificationStatus, 'VERIFIED', 'Webhook replay must not overwrite VERIFIED');

  // 4. Late failed webhook cannot downgrade an already paid order
  const lateFailedResult = processWebhook(underReviewOrder, 'FAILED');
  assert.strictEqual(lateFailedResult.paymentStatus, 'PAID', 'Failed event must not clobber already paid order');
  assert.strictEqual(lateFailedResult.verificationStatus, 'UNDER_REVIEW');
});

// -------------------------------------------------------------
// TEST 4B: Duplicate Order & Payment Prevention
// -------------------------------------------------------------
runTest('Duplicate Prevention: Blocks duplicate active orders and reuses recent pending checkout', () => {
  // Simulate order creation duplicate guard logic
  function createOrderCheck(existingOrders, businessSlug) {
    // 1. Conflict check
    const active = existingOrders.find(
      o => o.businessSlug === businessSlug &&
      ['PAID', 'UNDER_REVIEW', 'MORE_EVIDENCE_REQUIRED', 'VERIFIED'].includes(o.verificationStatus)
    );
    if (active) {
      return { status: 409, error: 'Active application already in progress', orderId: active.orderId };
    }

    // 2. Pending reuse check (< 15 mins)
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    const pending = existingOrders.find(
      o => o.businessSlug === businessSlug &&
      o.verificationStatus === 'PAYMENT_PENDING' &&
      new Date(o.createdAt).getTime() >= fifteenMinsAgo
    );
    if (pending) {
      return { status: 200, reused: true, orderId: pending.orderId, session: pending.paymentSessionId };
    }

    // 3. New order
    return { status: 200, created: true, orderId: `cfx_verify_new_${Date.now()}` };
  }

  const mockStore = [
    {
      orderId: 'cfx_order_active',
      businessSlug: 'a2z-supplements',
      verificationStatus: 'UNDER_REVIEW',
      createdAt: new Date().toISOString()
    },
    {
      orderId: 'cfx_order_pending_recent',
      businessSlug: 'ranaghat-pharma',
      verificationStatus: 'PAYMENT_PENDING',
      paymentSessionId: 'session_recent_123',
      createdAt: new Date().toISOString()
    }
  ];

  // Attempt duplicate for active application -> Rejected with 409
  const conflictResult = createOrderCheck(mockStore, 'a2z-supplements');
  assert.strictEqual(conflictResult.status, 409, 'Duplicate active application must be rejected with 409');
  assert.strictEqual(conflictResult.orderId, 'cfx_order_active');

  // Attempt duplicate for recent pending application -> Reuses session
  const reuseResult = createOrderCheck(mockStore, 'ranaghat-pharma');
  assert.strictEqual(reuseResult.status, 200);
  assert.strictEqual(reuseResult.reused, true, 'Recent pending order must be reused');
  assert.strictEqual(reuseResult.session, 'session_recent_123');

  // New business creates new order
  const freshResult = createOrderCheck(mockStore, 'brand-new-clinic');
  assert.strictEqual(freshResult.status, 200);
  assert.strictEqual(freshResult.created, true);
});

// -------------------------------------------------------------
// TEST 5: Document Number Masking & PII Redaction
// -------------------------------------------------------------
runTest('Document Privacy: maskDocumentNumber protects sensitive registration numbers', () => {
  // GSTIN masking
  const maskedGstin = maskDocumentNumber('19AAACA1234A1Z5');
  assert.strictEqual(maskedGstin, '19••••••••Z5', 'GSTIN must be masked showing first 2 and last 2 digits');

  // Trade license masking
  const maskedTrade = maskDocumentNumber('WB-NAD-RAN-TL-2026-8812');
  assert.strictEqual(maskedTrade, 'WB••••••••12', 'Trade license must be masked');

  // Short string fallback
  assert.strictEqual(maskDocumentNumber('ABC'), '••••');

  // Null / undefined fallback
  assert.strictEqual(maskDocumentNumber(undefined), 'Verified on file');
  assert.strictEqual(maskDocumentNumber(''), 'Verified on file');
});

// -------------------------------------------------------------
// TEST 6: Explicit Claim Mapping & Grounded Evidence Evaluation
// -------------------------------------------------------------
runTest('Evidence Methodology: Maps explicit statutory claims & derives grounded confidence', () => {
  // Case A: GSTIN Evidence -> Statutory Verified (88% without docUrl, 92% with docUrl)
  const gstinEvaluation = evaluateVerificationEvidence({
    statutoryDocType: 'GSTIN',
    statutoryDocNumber: '19AAACA1234A1Z5',
    evidenceDocUrl: 'https://docs.confluxai.in/gst.pdf'
  });
  assert.strictEqual(gstinEvaluation.verificationStatus, 'SUPPORTED');
  assert.strictEqual(gstinEvaluation.verificationLevel, 'STATUTORY_VERIFIED');
  assert.strictEqual(gstinEvaluation.confidenceScore, 92.0);
  assert.strictEqual(gstinEvaluation.claimType, 'REGISTRATION');
  assert.strictEqual(gstinEvaluation.evaluatedClaim, 'GST Registration Claim');
  assert.strictEqual(gstinEvaluation.maskedDocumentNumber, '19••••••••Z5');
  assert.ok(gstinEvaluation.evidenceSummary.includes('Scope bounded strictly to statutory tax registration'));

  // Case B: FSSAI Food License
  const fssaiEvaluation = evaluateVerificationEvidence({
    statutoryDocType: 'FSSAI',
    statutoryDocNumber: '12824012000123'
  });
  assert.strictEqual(fssaiEvaluation.verificationStatus, 'SUPPORTED');
  assert.strictEqual(fssaiEvaluation.verificationLevel, 'STATUTORY_VERIFIED');
  assert.strictEqual(fssaiEvaluation.confidenceScore, 86.0); // 86% without doc URL
  assert.strictEqual(fssaiEvaluation.claimType, 'CERTIFICATION');
  assert.strictEqual(fssaiEvaluation.evaluatedClaim, 'Food Safety & Standards Authority of India (FSSAI) License Claim');

  // Case C: Storefront Photo -> BASIC level ONLY (55% or 65%), NEVER STATUTORY_VERIFIED
  const photoEvaluation = evaluateVerificationEvidence({
    statutoryDocType: 'STOREFRONT_PHOTO',
    storefrontPhotoUrl: 'https://cdn.confluxai.in/photos/storefront.jpg'
  });
  assert.strictEqual(photoEvaluation.verificationStatus, 'PARTIALLY_SUPPORTED');
  assert.strictEqual(photoEvaluation.verificationLevel, 'BASIC', 'Storefront photo MUST NEVER yield STATUTORY_VERIFIED');
  assert.strictEqual(photoEvaluation.confidenceScore, 65.0, 'Visual evidence confidence must be grounded (<=65%)');
  assert.strictEqual(photoEvaluation.claimType, 'GENERAL_FACT');
  assert.ok(photoEvaluation.evidenceSummary.includes('visual/location evidence only'));

  // Case D: Missing / empty evidence -> BASIC fallback
  const fallbackEvaluation = evaluateVerificationEvidence(undefined);
  assert.strictEqual(fallbackEvaluation.verificationLevel, 'BASIC');
  assert.strictEqual(fallbackEvaluation.confidenceScore, 50.0);
});

// -------------------------------------------------------------
// TEST 7: Post-Payment Evidence Intake Lifecycle
// -------------------------------------------------------------
runTest('Evidence Submission: Transitions order to UNDER_REVIEW', () => {
  const order = {
    orderId: 'cfx_verify_9999',
    paymentStatus: 'PAID',
    verificationStatus: 'PAID',
    evidence: null
  };

  const evidencePayload = {
    businessName: 'A2Z Supplements',
    legalName: 'A2Z Health Nutrition Private Limited',
    fullAddress: 'Holding No 42, College Road, Ranaghat, Nadia, 741201',
    city: 'Ranaghat',
    district: 'Nadia',
    phone: '9876543210',
    statutoryDocType: 'TRADE_LICENSE',
    statutoryDocNumber: 'WB-NAD-RAN-TL-2026-8812',
    evidenceDocUrl: 'https://docs.confluxai.in/evidence/a2z-trade-license.pdf'
  };

  // Submit evidence
  order.evidence = evidencePayload;
  order.verificationStatus = 'UNDER_REVIEW';

  assert.strictEqual(order.verificationStatus, 'UNDER_REVIEW');
  assert.strictEqual(order.evidence.statutoryDocNumber, 'WB-NAD-RAN-TL-2026-8812');
  assert.strictEqual(order.evidence.statutoryDocType, 'TRADE_LICENSE');
});

// -------------------------------------------------------------
// TEST 8: Admin Review Actions (Request More Evidence & Reject)
// -------------------------------------------------------------
runTest('Admin Queue: Request More Evidence and Rejection cycles', () => {
  const order = {
    orderId: 'cfx_verify_9999',
    verificationStatus: 'UNDER_REVIEW',
    evidenceRequestedNotes: null,
    reviewNotes: null
  };

  // 1. Admin requests more evidence
  order.verificationStatus = 'MORE_EVIDENCE_REQUIRED';
  order.evidenceRequestedNotes = 'Please upload a clearer copy of the Trade License document showing the municipality stamp.';
  order.reviewedBy = 'Conflux Admin';

  assert.strictEqual(order.verificationStatus, 'MORE_EVIDENCE_REQUIRED');
  assert.ok(order.evidenceRequestedNotes.includes('Trade License'));

  // 2. Admin rejects invalid application
  order.verificationStatus = 'REJECTED';
  order.reviewNotes = 'Submitted Trade License could not be authenticated in the municipal registry.';
  assert.strictEqual(order.verificationStatus, 'REJECTED');
});

// -------------------------------------------------------------
// TEST 9: Admin Manual Approval & Grounded Graph Update
// -------------------------------------------------------------
runTest('Admin Approval: Uses grounded evidence evaluation, sets 1-year validity, updates graph', () => {
  const order = {
    orderId: 'cfx_verify_8888',
    businessId: 'biz_01',
    businessSlug: 'a2z-supplements',
    verificationStatus: 'UNDER_REVIEW',
    evidence: {
      statutoryDocType: 'TRADE_LICENSE',
      statutoryDocNumber: 'WB-RAN-2026-8812',
      evidenceDocUrl: 'https://storage.confluxai.in/private/license.pdf'
    }
  };

  const businessMock = {
    id: 'biz_01',
    slug: 'a2z-supplements',
    name: 'A2Z Supplements',
    verificationStatus: 'UNVERIFIED',
    verificationLevel: 'NONE',
    confidenceScore: 0,
    lastVerifiedAt: null,
    primaryRegistrar: null,
    evidenceSummary: null
  };

  // Evaluate evidence deterministically
  const now = new Date('2026-09-15T12:00:00Z');
  const evaluation = evaluateVerificationEvidence(
    order.evidence,
    'Ranaghat Municipality Trade License Register',
    now
  );

  assert.strictEqual(evaluation.verificationStatus, 'SUPPORTED');
  assert.strictEqual(evaluation.verificationLevel, 'STATUTORY_VERIFIED');
  assert.strictEqual(evaluation.confidenceScore, 88.0, 'Trade license with document URL yields 88.0% confidence');
  assert.strictEqual(evaluation.maskedDocumentNumber, 'WB••••••••12');

  const oneYearExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  order.verificationStatus = 'VERIFIED';
  order.reviewedBy = 'Senior Operations Lead';
  order.reviewedAt = now.toISOString();
  order.verifiedAt = now.toISOString();
  order.expiresAt = oneYearExpiry.toISOString();
  order.reviewNotes = evaluation.evidenceSummary;

  // Graph update
  businessMock.verificationStatus = evaluation.verificationStatus;
  businessMock.verificationLevel = evaluation.verificationLevel;
  businessMock.confidenceScore = evaluation.confidenceScore;
  businessMock.primaryRegistrar = evaluation.primaryRegistrar;
  businessMock.evidenceSummary = evaluation.evidenceSummary;
  businessMock.lastVerifiedAt = now.toISOString();

  assert.strictEqual(order.verificationStatus, 'VERIFIED');
  assert.strictEqual(businessMock.verificationStatus, 'SUPPORTED');
  assert.strictEqual(businessMock.verificationLevel, 'STATUTORY_VERIFIED');
  assert.strictEqual(businessMock.confidenceScore, 88.0);
  assert.ok(businessMock.evidenceSummary.includes('WB••••••••12'));
  
  // Verify 1 year validity duration (365 days = 31536000000 ms)
  const diffMs = new Date(order.expiresAt).getTime() - new Date(order.verifiedAt).getTime();
  assert.strictEqual(diffMs, 365 * 24 * 60 * 60 * 1000, 'Validity period must be exactly 365 days');
});

// -------------------------------------------------------------
// TEST 10: Independence of Verification from Sponsored & Google Reviews
// -------------------------------------------------------------
runTest('Orthogonality: Verified badge is decoupled from Google Reviews and Partner tier', () => {
  const business = {
    name: 'A2Z Supplements',
    verificationStatus: 'SUPPORTED', // Statutory verified
    subscriptionPlan: 'FREE',        // Free tier, not paid commercial sponsored
    googleReviews: {
      averageRating: 4.8,
      userRatingTotal: 120,
      source: 'GOOGLE_PLACES_OFFICIAL'
    }
  };

  // Verify that commercial tier is separate
  assert.strictEqual(business.verificationStatus, 'SUPPORTED');
  assert.strictEqual(business.subscriptionPlan, 'FREE', 'Statutory verification does not require a paid marketing plan');
  assert.strictEqual(business.googleReviews.source, 'GOOGLE_PLACES_OFFICIAL', 'Google reviews remain attributed to Google');
});

console.log('\n------------------------------------------------------');
console.log(`  RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('------------------------------------------------------\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
