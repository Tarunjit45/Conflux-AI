// Conflux Verify — Automated Boundary & Data Model Test Suite

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { slugify, normalizeEntityName, normalizeClaimText, generateClaimHash, determineClaimType } from '../lib/verify/normalizer.ts';
import { verifyCache } from '../lib/verify/cache.ts';
import { verificationService } from '../lib/verify/verificationService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('======================================================');
console.log('   CONFLUX VERIFY — DATA MODEL & BOUNDARY TEST SUITE  ');
console.log('======================================================\n');

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

async function runTests() {
  // 1. Slugify & Normalization
  assert('Slugify handles complex strings with punctuation', slugify('ABC Manufacturing & Co., Pvt. Ltd.') === 'abc-manufacturing-co-pvt-ltd');
  assert('Entity normalizer strips corporate suffixes and punctuation', normalizeEntityName('ABC Manufacturing Pvt Ltd') === 'ABC Manufacturing');
  assert('Claim text normalizer standardizes whitespace and case', normalizeClaimText('  Has   ISO 9001:2015   Certification!  ') === 'has iso 90012015 certification');

  // 2. Deterministic Hash Generation
  const hash1 = generateClaimHash('ABC Manufacturing', 'Has ISO 9001 certification');
  const hash2 = generateClaimHash('abc manufacturing', 'has iso 9001 certification');
  assert('Deterministic claim hash matches regardless of casing or extra spaces', hash1 === hash2);

  // 3. Claim Type Classification
  assert('Identifies CERTIFICATION claim type', determineClaimType('Certified under ISO 9001:2015') === 'CERTIFICATION');
  assert('Identifies AUTHORIZATION_PARTNERSHIP claim type', determineClaimType('Is an authorized distributor of XYZ') === 'AUTHORIZATION_PARTNERSHIP');
  assert('Identifies REGISTRATION claim type', determineClaimType('Registered under MSME Udyam and GSTIN') === 'REGISTRATION');
  assert('Identifies MANUFACTURING_CAPABILITY claim type', determineClaimType('Operates a foundry manufacturing plant') === 'MANUFACTURING_CAPABILITY');
  assert('Identifies LEGAL_EXISTENCE claim type', determineClaimType('Is an active legal entity under MCA') === 'LEGAL_EXISTENCE');
  assert('Identifies HISTORICAL_RECORD claim type', determineClaimType('Founded in Howrah since 1920') === 'HISTORICAL_RECORD');

  // 4. Input Validation
  let validationErrorThrown = false;
  try {
    await verificationService.verifyClaim({ entityName: 'A', claimText: 'Valid claim text here' });
  } catch (e) {
    validationErrorThrown = true;
  }
  assert('Rejects entity name shorter than 2 characters', validationErrorThrown);

  // 5. Benchmark Verification Execution (Tata Steel Limited - Primary MCA Registrar)
  const cfxResult = await verificationService.verifyClaim({
    entityName: 'Tata Steel Limited',
    claimText: 'Tata Steel Limited is an active public company incorporated under the Ministry of Corporate Affairs with CIN L27100MH1907PLC002604'
  });
  assert('Benchmark Tata Steel claim returns SUPPORTED status', cfxResult.status === 'SUPPORTED');
  assert('Benchmark Tata Steel has confidence >= 80', cfxResult.confidence >= 80);
  assert('Benchmark Tata Steel contains authoritative supporting evidence', cfxResult.supportingEvidence.length > 0);
  assert('Benchmark Tata Steel is marked as indexable', cfxResult.isIndexable === true);

  // 6. Cache Check
  const cfxCached = await verificationService.verifyClaim({
    entityName: 'Tata Steel Limited',
    claimText: 'Tata Steel Limited is an active public company incorporated under the Ministry of Corporate Affairs with CIN L27100MH1907PLC002604'
  });
  assert('Repeated claim request returns cacheHit = true without re-evaluating', cfxCached.cacheHit === true);

  // 7. Unverified / Arbitrary Claim Safety
  const unverifiedResult = await verificationService.verifyClaim({
    entityName: 'Unknown Enterprise X',
    claimText: 'Operates 50 offshore research labs in Kolkata'
  });
  assert('Uncorroborated claim returns INSUFFICIENT_EVIDENCE status', unverifiedResult.status === 'INSUFFICIENT_EVIDENCE');
  assert('Uncorroborated claim is strictly marked isIndexable = false', unverifiedResult.isIndexable === false);
  assert('Uncorroborated claim contains explicit limitation notes', unverifiedResult.limitations.length > 0);

  // 8. Golden Test Set Specification Validation
  const goldenPath = path.resolve(rootDir, 'docs/verify/golden_test_set.json');
  assert('Golden test set file exists in docs/verify/golden_test_set.json', fs.existsSync(goldenPath));

  if (fs.existsSync(goldenPath)) {
    const goldenSet = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
    assert('Golden test set contains exactly 50 curated real-world claims', goldenSet.length === 50);

    const categories = [
      'CLEARLY_SUPPORTED',
      'CLEARLY_CONTRADICTED',
      'INSUFFICIENT_EVIDENCE',
      'OUTDATED_RECORD',
      'DISPUTED_RECORD',
      'FIRST_PARTY_ONLY',
      'SYNDICATED_COPYCATS',
      'CONFLICTING_SOURCES',
      'AMBIGUOUS_ENTITIES',
      'HISTORICAL_RECORD'
    ];

    const allCategoriesCovered = categories.every(cat => goldenSet.filter(g => g.category === cat).length === 5);
    assert('All 10 evaluation categories contain exactly 5 test cases each', allCategoriesCovered);

    const allValidFields = goldenSet.every(g => 
      g.id && g.entityName && g.claimText && g.claimType && g.expectedStatus && 
      Array.isArray(g.expectedPrimarySourceTiers) && g.humanAssessmentRationale && Array.isArray(g.keyLimitations)
    );
    assert('100% of golden test cases contain complete human assessment rationale, limitations, and source tier expectations', allValidFields);
  }

  console.log('\n======================================================');
  console.log(`VERIFY BOUNDARY TEST SUMMARY: ${passCount} / ${totalChecks} TESTS PASSED`);
  console.log('======================================================\n');

  if (passCount === totalChecks) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
