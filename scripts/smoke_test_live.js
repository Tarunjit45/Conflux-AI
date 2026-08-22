// Conflux AI — Live Production Smoke Test Suite (Phase 3.5 Final Validation)

import { sanitizeSourceTier, executeRealityInvestigation } from '../lib/verify/realityRetriever.ts';
import { verificationService } from '../lib/verify/verificationService.ts';

console.log('======================================================================');
console.log('      CONFLUX AI — LIVE PRODUCTION RELEASE SMOKE TEST SUITE           ');
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

async function runLiveSmokeTests() {
  // 1. Live Production HTTP Checks
  const urlsToTest = [
    'https://confluxai.in',
    'https://confluxai.in/blog',
    'https://confluxai.in/services',
    'https://confluxai.in/locations/west-bengal',
    'https://confluxai.in/sitemap.xml',
    'https://confluxai.in/robots.txt'
  ];

  for (const url of urlsToTest) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ConfluxSmokeTest/1.0' }, signal: AbortSignal.timeout(6000) });
      assert(`Live URL ${url} returns HTTP 200`, res.status === 200, `Got HTTP ${res.status}`);
    } catch (e) {
      assert(`Live URL ${url} is reachable`, false, e.message);
    }
  }

  // 2. Anti-Self-Authority Invariant Check
  const confluxTier = sanitizeSourceTier('https://confluxai.in/verify', 'TIER_1_PRIMARY_AUTHORITATIVE');
  assert('Conflux-owned pages strictly cannot receive Tier-1 authority (reclassified to Tier-2)', confluxTier === 'TIER_2_FIRST_PARTY');

  // 3. Timeout / Failure Safety Invariant (Never becomes CONTRADICTED)
  const timeoutInv = await executeRealityInvestigation({
    caseId: 'SMOKE_TIMEOUT',
    entityName: 'Unreachable Host Enterprise',
    claimText: 'Holds exclusive satellite licensing across all Indian states',
    expectedStatus: 'UNVERIFIED'
  });
  assert('Network timeout or unreached registry never produces CONTRADICTED', timeoutInv.actualStatus !== 'CONTRADICTED');
  assert('Failed/unreached search degrades safely with 0 confidence', timeoutInv.confidence === 0);

  // 4. Record Absence Invariant (RECORD_NOT_FOUND never becomes CONTRADICTED)
  const absenceRes = await verificationService.verifyClaim({
    entityName: 'Bagula Precision Hand Tools',
    claimText: 'Bagula Precision Hand Tools produces the highest tensile strength clamps in Eastern India',
    forceFresh: true
  });
  assert('RECORD_NOT_FOUND with exhaustive search produces INSUFFICIENT_EVIDENCE (NOT CONTRADICTED)', absenceRes.status === 'INSUFFICIENT_EVIDENCE');
  assert('RECORD_NOT_FOUND retrievalOutcome is explicitly RECORD_NOT_FOUND', absenceRes.retrievalOutcome === 'RECORD_NOT_FOUND');

  // 5. Ambiguous Entity Safety Invariant (Never becomes false SUPPORTED)
  const ambRes = await verificationService.verifyClaim({
    entityName: 'Apex Technologies',
    claimText: 'Apex Technologies is a registered MSME unit based in Salt Lake Sector V, Kolkata',
    forceFresh: true
  });
  assert('Ambiguous generic entity produces PARTIALLY_SUPPORTED (NOT SUPPORTED)', ambRes.status === 'PARTIALLY_SUPPORTED');
  assert('Ambiguous entity includes explicit limitation warning', ambRes.limitations.length > 0);

  // 6. Live Reality Verification Pipeline Execution
  const realityCfx = await executeRealityInvestigation({
    caseId: 'SMOKE_CFX',
    entityName: 'Conflux AI',
    claimText: 'Conflux AI is an AI automation and digital solutions agency founded by Tarunjit Biswas and Shouvik Majumdar in Kolkata',
    expectedStatus: 'SUPPORTED'
  });
  assert('Live Conflux AI claim verified against live first-party endpoint', realityCfx.actualStatus === 'SUPPORTED');
  assert('Live Conflux AI source tier is strictly TIER_2_FIRST_PARTY', realityCfx.sourceTier === 'TIER_2_FIRST_PARTY');

  console.log('\n======================================================================');
  console.log(`LIVE SMOKE TEST SUMMARY: ${passCount} / ${totalChecks} TESTS PASSED`);
  console.log('======================================================================\n');

  if (passCount === totalChecks) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runLiveSmokeTests();
