// Conflux Platform — Phase 1 Business Graph & Discovery Test Suite

import { generateConfluxBusinessId, isValidConfluxBusinessId, slugifyBusinessName } from '../lib/businessId.ts';
import { businessService, INITIAL_SEED_BUSINESSES } from '../lib/businessService.ts';
import { connectService } from '../lib/connectService.ts';

console.log('======================================================================');
console.log('    CONFLUX PLATFORM — PHASE 1 BUSINESS GRAPH TEST SUITE             ');
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

async function runPhase1Tests() {
  // 1. Conflux Business ID Engine Tests
  const cfxId1 = generateConfluxBusinessId({ district: 'nadia', sequenceNumber: 1 });
  assert('Generates canonical Conflux Business ID with 6-digit padding', cfxId1 === 'CFX-IN-WB-NADIA-000001');

  const cfxId2 = generateConfluxBusinessId({ district: 'Kolkata', sequenceNumber: 42 });
  assert('Handles casing and variable sequence numbers correctly', cfxId2 === 'CFX-IN-WB-KOLKATA-000042');

  const cfxId3 = generateConfluxBusinessId({ district: 'north-24-parganas', sequenceNumber: 105 });
  assert('Maps multi-word district slugs to standard short codes', cfxId3 === 'CFX-IN-WB-N24PGS-000105');

  assert('Validates correct Conflux Business ID syntax', isValidConfluxBusinessId('CFX-IN-WB-NADIA-000001') === true);
  assert('Rejects invalid Conflux Business ID syntax', isValidConfluxBusinessId('INVALID-ID-123') === false);

  // 2. Slug Normalizer
  assert('Slugifies business names safely', slugifyBusinessName('Ranaghat Agro Processing & Co., Pvt. Ltd.') === 'ranaghat-agro-processing-co-pvt-ltd');

  // 3. Seed Businesses Graph Integrity
  assert('Initial seed graph contains exactly 4 canonical businesses', INITIAL_SEED_BUSINESSES.length === 4);

  const ranaghatAgro = INITIAL_SEED_BUSINESSES.find(b => b.confluxBusinessId === 'CFX-IN-WB-NADIA-000001');
  assert('Seed business #1 contains valid Conflux Business ID', ranaghatAgro !== undefined && ranaghatAgro.confluxBusinessId === 'CFX-IN-WB-NADIA-000001');
  assert('Seed business #1 is marked as STATUTORY_VERIFIED with FSSAI registrar', ranaghatAgro.verificationLevel === 'STATUTORY_VERIFIED' && ranaghatAgro.primaryRegistrar.includes('FSSAI'));
  assert('Seed business #1 exposes supported machine capabilities (CALL, WHATSAPP, BOOKING, DIRECTIONS)', ranaghatAgro.capabilities.length >= 4);

  // 4. Business Creation Rule (Strict UNVERIFIED & DRAFT Defaults)
  const createdBiz = await businessService.createBusiness({
    name: 'Kalyani Modern Diagnostics',
    legalName: 'Kalyani Diagnostic Care LLP',
    businessType: 'HEALTHCARE',
    categoryId: 'healthcare',
    description: 'Advanced pathology laboratory and ultrasound diagnostic center in Kalyani.',
    district: 'nadia',
    city: 'kalyani',
    fullAddress: 'Central Park B-Block, Kalyani, Nadia 741235',
    phone: '+919830998877',
    whatsapp: '+919830998877'
  });

  assert('Newly created business defaults to DRAFT status', createdBiz.status === 'DRAFT');
  assert('Newly created business strictly defaults to UNVERIFIED verification status', createdBiz.verificationStatus === 'UNVERIFIED');
  assert('Newly created business has confidence score of 0.00', createdBiz.confidenceScore === 0.0);
  assert('Newly created business receives auto-generated Conflux Business ID', isValidConfluxBusinessId(createdBiz.confluxBusinessId) === true);

  // 5. Business Retrieval by ID and Slug
  const fetchedBySlug = await businessService.getBusinessBySlug(createdBiz.slug);
  assert('Retrieves newly created business by slug', fetchedBySlug !== null && fetchedBySlug.id === createdBiz.id);

  const fetchedById = await businessService.getBusinessById(createdBiz.confluxBusinessId);
  assert('Retrieves business by Conflux Business ID', fetchedById !== null && fetchedById.name === 'Kalyani Modern Diagnostics');

  // 6. Publishing Status Toggle
  const publishedBiz = await businessService.setPublishStatus(createdBiz.id, 'PUBLISHED');
  assert('Updates business publishing status to PUBLISHED', publishedBiz.status === 'PUBLISHED');
  assert('Sets isIndexable to true when published', publishedBiz.isIndexable === true);

  // 7. Search & Discovery Filtering
  const allSearchResults = await businessService.searchBusinesses();
  assert('Search returns published businesses', allSearchResults.length >= 4);

  const nadiaResults = await businessService.searchBusinesses({ district: 'nadia' });
  assert('Filters businesses strictly by district (Nadia)', nadiaResults.every(r => r.business.location.district === 'nadia'));

  const agroResults = await businessService.searchBusinesses({ category: 'agriculture-farming' });
  assert('Filters businesses by category (Agro)', agroResults.length >= 1 && agroResults[0].business.categoryId === 'agriculture-farming');

  const verifiedOnlyResults = await businessService.searchBusinesses({ verifiedOnly: true });
  assert('Filters businesses with verifiedOnly = true (SUPPORTED status only)', verifiedOnlyResults.every(r => r.business.verificationStatus === 'SUPPORTED'));

  const bookingResults = await businessService.searchBusinesses({ requiredAction: 'BOOKING' });
  assert('Filters businesses supporting specific machine capability (BOOKING)', bookingResults.every(r => r.business.capabilities.some(c => c.actionType === 'BOOKING' && c.isSupported)));

  // 8. Explainable Organic Ranking Scoring
  const rankedItem = nadiaResults[0];
  assert('Produces explainable organic rank score between 0 and 100', rankedItem.rankingExplanation.score >= 0 && rankedItem.rankingExplanation.score <= 100);
  assert('Includes transparent reason codes in ranking explanation', Array.isArray(rankedItem.rankingExplanation.reasonCodes) && rankedItem.rankingExplanation.reasonCodes.length > 0);

  // 9. Conflux Verify Engine Integration
  const verifiedRanaghat = await businessService.verifyBusinessClaim(
    ranaghatAgro.id,
    'Ranaghat Agro Processing Ltd is registered under the FSSAI with an active food business operator license in Nadia district'
  );
  assert('Verification engine links claim evaluation to business entity', verifiedRanaghat.verificationStatus === 'SUPPORTED');
  assert('Verification attaches statutory confidence score >= 80%', verifiedRanaghat.confidenceScore >= 80);
  assert('Verification updates lastVerifiedAt timestamp', verifiedRanaghat.lastVerifiedAt !== undefined);

  // 10. Connect Telemetry Logger
  await connectService.logEvent({
    businessId: ranaghatAgro.id,
    eventType: 'BUSINESS_VIEW',
    channel: 'HUMAN_WEB'
  });
  assert('Logs BUSINESS_VIEW telemetry event without throwing errors', true);

  await connectService.logEvent({
    businessId: ranaghatAgro.id,
    eventType: 'AGENT_API_QUERY',
    channel: 'AI_AGENT_REST_API'
  });
  assert('Logs AGENT_API_QUERY telemetry event for AI agents', true);

  // 11. Cleanup test business
  await businessService.deleteBusiness(createdBiz.id);
  const deletedCheck = await businessService.getBusinessById(createdBiz.id);
  assert('Deletes business cleanly from Business Graph', deletedCheck === null);

  console.log('\n======================================================================');
  console.log(`PHASE 1 BUSINESS GRAPH TEST SUMMARY: ${passCount} / ${totalChecks} TESTS PASSED`);
  console.log('======================================================================\n');

  if (passCount === totalChecks) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase1Tests();
