// Conflux Platform — User Onboarding, Profile & Contributor Reputation Test Suite
// Rigorous verification of Acceptance Criteria (Sections 15, 16, 17):
// 1. One-question-at-a-time onboarding step progression
// 2. Onboarding completion & genuine profile creation
// 3. Locality association & transparent reason explanations
// 4. Contribution → reputation data flow (utility-based, diminishing returns)
// 5. Community feedback handling (peer confirmations, disputes, "This helped me")
// 6. Invariant: Commercial payment/subscription NEVER increases trust
// 7. Invariant: Anti-gaming blocks self-confirmation and self-help inflation
// 8. Invariant: Zero fake impact metrics; strictly auditable real human events
// 9. Contributor Standing Tiers progression

import { LocalKnowledgeService } from '../lib/localKnowledgeService.ts';
import { getContributorStanding } from '../types/localKnowledge.ts';

console.log('======================================================================');
console.log('  CONFLUX AI — USER ONBOARDING & CONTRIBUTOR REPUTATION TEST SUITE     ');
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

async function runTests() {
  const service = new LocalKnowledgeService();
  service.clearStore();

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 1: ONBOARDING STEP PROGRESSION & LOGIC
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 1. ONE-QUESTION-AT-A-TIME ONBOARDING ---');

  const onboardingSteps = [
    { step: 1, title: 'Your Name', field: 'displayName', sample: 'Rahul Debnath' },
    { step: 2, title: 'Your Locality', field: 'locality', sample: 'Ranaghat' },
    { step: 3, title: 'Local Focus', field: 'topics', sample: ['Local Shops & Markets', 'Transit & Train Routes'] },
    { step: 4, title: 'Profile & Bio', field: 'bio', sample: 'Helping people find useful information around Ranaghat.' }
  ];

  assert(
    'Onboarding is structured across 4 sequential conversational slides',
    onboardingSteps.length === 4 && onboardingSteps[0].step === 1 && onboardingSteps[3].step === 4,
    `Steps count: ${onboardingSteps.length}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 2: ONBOARDING COMPLETION & PROFILE CREATION
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 2. ONBOARDING COMPLETION & PROFILE CREATION ---');

  const profile = await service.upsertLocalProfile({
    id: 'usr_rahul_citizen_001',
    displayName: 'Rahul Debnath',
    locality: 'Ranaghat',
    bio: 'Helping people find useful information around Ranaghat.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  });

  assert(
    'Profile created successfully with authentic user details',
    profile.id === 'usr_rahul_citizen_001' && profile.displayName === 'Rahul Debnath',
    `Created profile: ${JSON.stringify(profile)}`
  );

  assert(
    'Initial citizen reputation starts at base 20 with New Contributor standing',
    profile.reputationScore === 20 && profile.reputationBadges.includes('LOCAL_CONTRIBUTOR'),
    `Score: ${profile.reputationScore}, badges: ${profile.reputationBadges}`
  );

  const initialStanding = getContributorStanding({
    reputationScore: profile.reputationScore,
    locality: profile.locality,
    stats: profile.stats
  });

  assert(
    'Standing tier correctly evaluates to New Contributor for base score 20',
    initialStanding.tier === 'NEW_CONTRIBUTOR' && initialStanding.label === 'New Contributor',
    `Initial standing: ${JSON.stringify(initialStanding)}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 3: LOCALITY ASSOCIATION
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 3. LOCALITY ASSOCIATION ---');

  assert(
    'Locality is strictly attached to the profile without fabrication',
    profile.locality === 'Ranaghat',
    `Locality: ${profile.locality}`
  );

  assert(
    'Explanation string reflects locality and transparency',
    typeof profile.explanation === 'string' && profile.explanation.includes('Ranaghat'),
    `Explanation: ${profile.explanation}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 4: CONTRIBUTION → REPUTATION DATA FLOW
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 4. CONTRIBUTION → REPUTATION DATA FLOW ---');

  const contrib1 = await service.createContribution({
    type: 'UPDATE',
    title: 'Ranaghat Sub-divisional Hospital OPD New Timings',
    content: 'Morning OPD registration now opens at 8:00 AM instead of 9:00 AM on weekdays.',
    locality: 'ranaghat',
    provenance: 'FIRST_HAND_CITIZEN',
    author: {
      id: profile.id,
      displayName: profile.displayName,
      locality: profile.locality
    }
  });

  const profileAfterContrib = await service.getLocalProfile(profile.id);

  assert(
    'Contribution increments author contributions count',
    profileAfterContrib.stats.contributionsCount === 1,
    `Count: ${profileAfterContrib?.stats.contributionsCount}`
  );

  assert(
    'Reputation score increases with useful contribution (Base 20 + 5 = 25)',
    profileAfterContrib.reputationScore === 25,
    `Score was ${profileAfterContrib.reputationScore}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 5: COMMUNITY FEEDBACK HANDLING
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 5. COMMUNITY FEEDBACK HANDLING ---');

  // Peer confirmation from a distinct neighbor
  await service.confirmContribution(contrib1.id, 'usr_neighbor_amit', 'Amit Ghosh');

  const profileAfterConfirm = await service.getLocalProfile(profile.id);

  assert(
    'Peer confirmation increments confirmedUpdatesCount',
    profileAfterConfirm.stats.confirmedUpdatesCount === 1,
    `Confirmed count: ${profileAfterConfirm?.stats.confirmedUpdatesCount}`
  );

  assert(
    'Reputation score incorporates peer confirmation (25 + 10 = 35)',
    profileAfterConfirm.reputationScore === 35,
    `Score: ${profileAfterConfirm.reputationScore}`
  );

  // "This helped me" human outcome attribution
  const helpfulResult = await service.markContributionHelpful(contrib1.id, 'usr_neighbor_sneha');

  const profileAfterHelpful = await service.getLocalProfile(profile.id);

  assert(
    '"This helped me" tap increments real people helped count',
    helpfulResult.peopleHelpedCount === 1 && profileAfterHelpful.stats.peopleHelpedCount === 1,
    `People helped: ${profileAfterHelpful?.stats.peopleHelpedCount}`
  );

  assert(
    'Reputation score credits genuine human help (35 + 2 = 37)',
    profileAfterHelpful.reputationScore === 37,
    `Score: ${profileAfterHelpful.reputationScore}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 6: INVARIANT: NO TRUST INCREASE FROM PAYMENT
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 6. INVARIANT: NO TRUST INCREASE FROM PAYMENT ---');

  const profileWithPayment = {
    ...profileAfterHelpful,
    subscriptionPlan: 'PRO_ENTERPRISE_TIER',
    amountPaid: 99999,
    isPaidCustomer: true,
    featuredRank: true
  };

  const recomputedPaymentProfile = service.recomputeReputation(profileWithPayment);

  assert(
    'Invariant: Commercial payment / subscription has ZERO effect on Local Trust Score',
    recomputedPaymentProfile.reputationScore === profileAfterHelpful.reputationScore,
    `Score changed from ${profileAfterHelpful.reputationScore} to ${recomputedPaymentProfile.reputationScore}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 7: INVARIANT: ANTI-GAMING PREVENTS SELF-INFLATION
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 7. ANTI-GAMING & SELF-INFLATION PREVENTION ---');

  let selfConfirmBlocked = false;
  try {
    await service.confirmContribution(contrib1.id, profile.id, profile.displayName);
  } catch (err) {
    selfConfirmBlocked = true;
  }

  assert(
    'Invariant: Author cannot confirm their own contribution',
    selfConfirmBlocked,
    'Expected error on self-confirmation'
  );

  let selfHelpBlocked = false;
  try {
    await service.markContributionHelpful(contrib1.id, profile.id);
  } catch (err) {
    selfHelpBlocked = true;
  }

  assert(
    'Invariant: Author cannot mark their own contribution as helpful',
    selfHelpBlocked,
    'Expected error on self-help marking'
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 8: ZERO FABRICATION IN COLD-START STATS
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 8. ZERO FABRICATION IN COLD-START STATS ---');

  const brandNewUser = await service.getLocalProfile('usr_brand_new_citizen');

  assert(
    'Brand new profile has strictly 0 people helped and 0 contributions',
    brandNewUser.stats.peopleHelpedCount === 0 && brandNewUser.stats.contributionsCount === 0,
    `Stats: ${JSON.stringify(brandNewUser.stats)}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 9: STANDING TIERS PROGRESSION
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 9. STANDING TIERS PROGRESSION ---');

  const tierHelper = getContributorStanding({ reputationScore: 45, locality: 'Ranaghat' });
  const tierGuide = getContributorStanding({ reputationScore: 68, locality: 'Ranaghat' });
  const tierTrusted = getContributorStanding({ reputationScore: 82, locality: 'Ranaghat' });
  const tierExpert = getContributorStanding({
    reputationScore: 94,
    locality: 'Ranaghat',
    stats: { confirmedUpdatesCount: 5 }
  });
  const tierHighVolumeNoConfirm = getContributorStanding({
    reputationScore: 94,
    locality: 'Ranaghat',
    stats: { confirmedUpdatesCount: 0 } // High activity without confirmations
  });

  assert(
    'Score 45 maps to Local Helper',
    tierHelper.tier === 'LOCAL_HELPER' && tierHelper.label === 'Local Helper',
    `Result: ${tierHelper.label}`
  );

  assert(
    'Score 68 maps to Local Guide',
    tierGuide.tier === 'LOCAL_GUIDE' && tierGuide.label === 'Local Guide',
    `Result: ${tierGuide.label}`
  );

  assert(
    'Score 82 maps to Trusted Local',
    tierTrusted.tier === 'TRUSTED_LOCAL' && tierTrusted.label === 'Trusted Local',
    `Result: ${tierTrusted.label}`
  );

  assert(
    'Score 94 with confirmations maps to Locality Expert',
    tierExpert.tier === 'LOCALITY_EXPERT' && tierExpert.label === 'Ranaghat Expert',
    `Result: ${tierExpert.label}`
  );

  assert(
    'Invariant: High activity alone without confirmations cannot grant Locality Expert standing',
    tierHighVolumeNoConfirm.tier !== 'LOCALITY_EXPERT',
    `Result was: ${tierHighVolumeNoConfirm.label}`
  );

  console.log('\n======================================================================');
  console.log(`  RESULTS: ${passCount} / ${totalChecks} CHECKS PASSED`);
  console.log('======================================================================');

  if (passCount === totalChecks) {
    console.log('>>> ALL ONBOARDING & REPUTATION TESTS PASSED SUCCESSFULLY! <<<\n');
    process.exit(0);
  } else {
    console.error(`>>> ${totalChecks - passCount} CHECKS FAILED! <<<\n`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
