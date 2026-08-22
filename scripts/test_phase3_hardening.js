// Conflux Verify — Phase 3.5 Production-Hardening Regression Test Suite

import { sanitizeSourceTier } from '../lib/verify/realityRetriever.ts';
import { verificationService } from '../lib/verify/verificationService.ts';
import { resolveMcaRecord } from '../lib/verify/registrars/mcaRegistrar.ts';
import { resolveRegistrationRecord } from '../lib/verify/registrars/gstinUdyamRegistrar.ts';
import { resolveCertificationRecord } from '../lib/verify/registrars/iafIsoRegistrar.ts';

console.log('======================================================================');
console.log('        CONFLUX VERIFY — PHASE 3.5 PRODUCTION HARDENING TESTS         ');
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

async function runHardeningTests() {
  // Test 1: First-party source domain (confluxai.in) is NEVER allowed to become Tier-1
  const sanitizedTier1 = sanitizeSourceTier('https://confluxai.in/verify', 'TIER_1_PRIMARY_AUTHORITATIVE');
  assert('Conflux /verify URL is strictly demoted from Tier-1 to TIER_2_FIRST_PARTY', sanitizedTier1 === 'TIER_2_FIRST_PARTY');

  const sanitizedTier2 = sanitizeSourceTier('https://confluxai.in/about', 'TIER_1_PRIMARY_AUTHORITATIVE');
  assert('Conflux /about URL is strictly demoted from Tier-1 to TIER_2_FIRST_PARTY', sanitizedTier2 === 'TIER_2_FIRST_PARTY');

  // Test 2: External authoritative registry maintains Tier-1 standing
  const sanitizedExt = sanitizeSourceTier('https://www.mca.gov.in/mcafoportal', 'TIER_1_PRIMARY_AUTHORITATIVE');
  assert('External registry (mca.gov.in) retains TIER_1_PRIMARY_AUTHORITATIVE standing', sanitizedExt === 'TIER_1_PRIMARY_AUTHORITATIVE');

  // Test 3: Absence ≠ Contradiction. Record not found with exhaustive search produces INSUFFICIENT_EVIDENCE, not CONTRADICTED
  const absenceRes = await verificationService.verifyClaim({
    entityName: 'Bagula Precision Hand Tools',
    claimText: 'Bagula Precision Hand Tools produces the highest tensile strength clamps in Eastern India',
    forceFresh: true
  });
  assert('Record absence in registry produces INSUFFICIENT_EVIDENCE (NOT CONTRADICTED)', absenceRes.status === 'INSUFFICIENT_EVIDENCE');
  assert('Record absence has retrievalOutcome = RECORD_NOT_FOUND', absenceRes.retrievalOutcome === 'RECORD_NOT_FOUND');
  assert('Record absence is strictly marked isIndexable = false', absenceRes.isIndexable === false);

  // Test 4: Ambiguous entity safety guardrail. Generic name with 40+ matches never becomes false SUPPORTED
  const ambiguousRes = await verificationService.verifyClaim({
    entityName: 'Apex Technologies',
    claimText: 'Apex Technologies is a registered MSME unit based in Salt Lake Sector V, Kolkata',
    forceFresh: true
  });
  assert('Ambiguous generic entity produces PARTIALLY_SUPPORTED with disambiguation limitation', ambiguousRes.status === 'PARTIALLY_SUPPORTED');
  assert('Ambiguous entity includes explicit disambiguation warning in limitations', ambiguousRes.limitations.some(l => l.toLowerCase().includes('disambiguation') || l.toLowerCase().includes('matching')));

  // Test 5: Authoritative Contradiction (Statutory Struck Off / Revoked status)
  const strikeOffRes = await verificationService.verifyClaim({
    entityName: 'Falcon Logistics Pvt Ltd',
    claimText: 'Falcon Logistics Pvt Ltd is an active operating company registered with the Registrar of Companies',
    forceFresh: true
  });
  assert('Explicit statutory strike-off produces CONTRADICTED status', strikeOffRes.status === 'CONTRADICTED');
  assert('Contradiction result identifies primary registrar dockets', strikeOffRes.contradictingEvidence.length > 0);

  // Test 6: Stale / Expired evidence produces OUTDATED (temporal correctness)
  const outdatedRes = await verificationService.verifyClaim({
    entityName: 'Metro Cold Storage Asansol',
    claimText: 'Metro Cold Storage Asansol holds valid ISO 22000:2018 Food Safety Management System certification',
    forceFresh: true
  });
  assert('Expired certificate produces OUTDATED status (NOT SUPPORTED)', outdatedRes.status === 'OUTDATED');
  assert('Outdated result notes lapse of active operational validity', outdatedRes.limitations.some(l => l.toLowerCase().includes('lapsed') || l.toLowerCase().includes('expired') || l.toLowerCase().includes('past compliance')));

  // Test 7: Syndicated Copycat Collapse
  const syndicatedRes = await verificationService.verifyClaim({
    entityName: 'NeoClean Water Technologies',
    claimText: 'NeoClean Water Technologies was named the fastest growing clean-tech startup in Eastern India in 2025',
    forceFresh: true
  });
  assert('Syndicated PR press release collapses to single origin', syndicatedRes.sourceQualityBreakdown.independentOriginsCount <= 1);
  assert('Syndicated claim produces PARTIALLY_SUPPORTED with commercial syndication limitation', syndicatedRes.status === 'PARTIALLY_SUPPORTED');

  // Test 8: First-party claims alone never become independent authoritative corroboration
  const firstPartyRes = await verificationService.verifyClaim({
    entityName: 'Nadia Jute Mill Machinery',
    claimText: 'Nadia Jute Mill Machinery designs spinning frames that reduce power consumption by exactly 22%',
    forceFresh: true
  });
  assert('First-party assertion without 3rd party lab produces PARTIALLY_SUPPORTED', firstPartyRes.status === 'PARTIALLY_SUPPORTED');
  assert('Confidence for first-party alone is capped at <= 65%', firstPartyRes.confidence <= 65);

  // Test 9: Disputed / Conflicting claims across dockets
  const disputedRes = await verificationService.verifyClaim({
    entityName: 'Eastern Coal Transport Services',
    claimText: 'Eastern Coal Transport Services possesses an accident-free safety record across Raniganj coalfields from 2021 to 2025',
    forceFresh: true
  });
  assert('Conflicting first-party vs statutory safety dockets produce DISPUTED status', disputedRes.status === 'DISPUTED');

  // Test 10: Input validation and rejection
  let errorCaught = false;
  try {
    await verificationService.verifyClaim({ entityName: 'X', claimText: 'Valid claim text' });
  } catch {
    errorCaught = true;
  }
  assert('Rejects underspecified entity query shorter than 2 characters', errorCaught);

  console.log('\n======================================================================');
  console.log(`HARDENING TEST SUMMARY: ${passCount} / ${totalChecks} TESTS PASSED`);
  console.log('======================================================================\n');

  if (passCount === totalChecks) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runHardeningTests();
