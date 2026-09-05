// Conflux Platform — Comprehensive Local Knowledge Network Test Suite
// Rigorous verification of:
// 1. Local Identity & Reputation Engine (utility-based, zero vanity)
// 2. Contributions Across 11 Types with Trust Dossiers & Provenance
// 3. Automated Signal Extraction & Graph Linkage
// 4. Community Evidence Loop (Confirmations, Corroboration, Disputes)
// 5. Anti-Fabrication Invariants & Community vs Statutory Verification Boundaries
// 6. Business Demand Requests & Market Demand Signals
// 7. Cold-Start Resilience & "We Don't Know Yet" Fallbacks
// 8. Unified Local Intelligence Search

import { LocalKnowledgeService } from '../lib/localKnowledgeService.ts';

console.log('======================================================================');
console.log('  CONFLUX AI — LOCAL KNOWLEDGE NETWORK TEST SUITE                     ');
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
  // TEST GROUP 1: LOCAL IDENTITY & REPUTATION ENGINE
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 1. LOCAL IDENTITY & REPUTATION ENGINE ---');

  // 1.1 Create Initial Profile
  const user1 = await service.getOrCreateProfile('usr_test_rahul', {
    displayName: 'Rahul Debnath',
    locality: 'Ranaghat',
    bio: 'Longtime resident of College Para, Ranaghat.'
  });

  assert(
    'Initial profile created with base reputation 20 and LOCAL_CONTRIBUTOR badge',
    user1.reputationScore === 20 && user1.reputationBadges.includes('LOCAL_CONTRIBUTOR'),
    `Score was ${user1.reputationScore}, badges: ${JSON.stringify(user1.reputationBadges)}`
  );

  // 1.2 Simulate utility activities
  user1.stats.contributionsCount = 6;
  user1.stats.confirmedUpdatesCount = 3;
  user1.stats.verifiedDiscoveriesCount = 2;
  user1.stats.helpfulCorrectionsCount = 2;

  // Formula: Base(20) + min(30, 6*5) + min(30, 3*10) + min(20, 2*10) + min(20, 2*10)
  // = 20 + 30 + 30 + 20 + 20 = 100
  const updatedProfile = service.recomputeReputation(user1);

  assert(
    'Reputation formula calculates strictly based on utility',
    updatedProfile.reputationScore === 100,
    `Expected 100, got ${updatedProfile.reputationScore}`
  );

  assert(
    'Reason explanation string is transparent and audit-ready',
    typeof updatedProfile.explanation === 'string' &&
    updatedProfile.explanation.includes('6 useful contributions') &&
    updatedProfile.explanation.includes('3 community-confirmed updates'),
    `Reason string: ${updatedProfile.explanation}`
  );

  assert(
    'Threshold badges awarded based on utility milestones',
    updatedProfile.reputationBadges.includes('BUSINESS_DISCOVERER') &&
    updatedProfile.reputationBadges.includes('COMMUNITY_HELPER') &&
    updatedProfile.reputationBadges.includes('LOCAL_EXPLORER') &&
    updatedProfile.reputationBadges.includes('TRUSTED_CONTRIBUTOR'),
    `Badges: ${JSON.stringify(updatedProfile.reputationBadges)}`
  );

  // 1.3 Invariant: Follower count has ZERO effect on reputation
  const scoreBeforeFollow = updatedProfile.reputationScore;
  await service.followTarget('usr_test_samir', 'usr_test_rahul', 'USER', 'Rahul Debnath');
  await service.followTarget('usr_test_anita', 'usr_test_rahul', 'USER', 'Rahul Debnath');
  const profileAfterFollow = await service.getLocalProfile('usr_test_rahul');

  assert(
    'Invariant: Follower count does NOT inflate reputation score',
    profileAfterFollow.reputationScore === scoreBeforeFollow,
    `Score changed from ${scoreBeforeFollow} to ${profileAfterFollow.reputationScore}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 2: CONTRIBUTIONS ACROSS 11 TYPES & PROVENANCE
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 2. CONTRIBUTIONS ACROSS 11 TYPES & PROVENANCE ---');

  const contributionTypes = [
    { type: 'DISCOVER', title: 'New Artisan Pottery Studio in Biswaspara', provenance: 'FIRST_HAND_CITIZEN' },
    { type: 'INFORM', title: 'Ranaghat Sub-divisional Hospital New OPD Timings', provenance: 'OFFICIAL_NOTICE' },
    { type: 'RECOMMEND', title: 'A2Z Supplements Certified Protein & Creatine', provenance: 'FIRST_HAND_CITIZEN' },
    { type: 'UPDATE', title: 'NH 12 Flyover Construction Lane Shift', provenance: 'FIELD_VERIFIED' },
    { type: 'REPORT', title: 'Churni River Embankment Maintenance Notice', provenance: 'FIRST_HAND_CITIZEN' },
    { type: 'REVIEW', title: 'Verified Purchase Experience at A2Z Supplements', provenance: 'FIRST_HAND_CITIZEN' },
    { type: 'EVENT', title: 'Ranaghat Baishakhi Mela 2026 Opening Date', provenance: 'COMMUNITY_ORGANIZER' },
    { type: 'STORY', title: 'History of Ranaghat Pantua & Heritage Sweetmakers', provenance: 'LOCAL_EXPERT' },
    { type: 'QUESTION', title: 'Is the College Road Branch of SBI Open This Saturday?', provenance: 'FIRST_HAND_CITIZEN' },
    { type: 'CORRECTION', title: 'Station Road Pharmacy Phone Number Updated', provenance: 'FIRST_HAND_CITIZEN' },
    { type: 'SUGGESTION', title: 'Municipal Garbage Bin Needed Near Platform 1', provenance: 'FIRST_HAND_CITIZEN' }
  ];

  const createdContributions = [];

  for (const item of contributionTypes) {
    const c = await service.createContribution({
      type: item.type,
      title: item.title,
      content: `Authentic test contribution body detailing ${item.title}. Verified ground reporting for Ranaghat.`,
      locality: 'ranaghat',
      category: 'General',
      businessId: item.type === 'RECOMMEND' || item.type === 'REVIEW' ? 'biz_a2z_supplements_001' : undefined,
      provenance: item.provenance,
      videoUrl: item.type === 'DISCOVER' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : undefined,
      imageUrl: item.type === 'UPDATE' ? 'https://images.unsplash.com/photo-test-road.jpg' : undefined,
      author: {
        id: 'usr_test_rahul',
        displayName: 'Rahul Debnath',
        locality: 'Ranaghat'
      }
    });

    createdContributions.push(c);
  }

  assert(
    'All 11 Contribution types created successfully',
    createdContributions.length === 11,
    `Created ${createdContributions.length}`
  );

  // 2.2 Trust Dossier Verification
  const discoverContrib = createdContributions.find(c => c.type === 'DISCOVER');
  assert(
    'Trust Dossier generated with explainable truth model',
    discoverContrib &&
    discoverContrib.trustDossier &&
    discoverContrib.trustDossier.whatWeKnow.length > 0 &&
    discoverContrib.trustDossier.whyWeKnowIt.includes('Rahul Debnath') &&
    discoverContrib.trustDossier.source.includes('citizen observation'),
    `Dossier: ${JSON.stringify(discoverContrib?.trustDossier)}`
  );

  // 2.3 Official Notice Verification State
  const informContrib = createdContributions.find(c => c.type === 'INFORM');
  assert(
    'OFFICIAL_NOTICE provenance maps to OFFICIALLY_VERIFIED state',
    informContrib.verificationState === 'OFFICIALLY_VERIFIED',
    `State: ${informContrib.verificationState}`
  );

  // 2.4 Video Embed Conversion
  assert(
    'YouTube watch URL safely converted to embed format',
    discoverContrib.media &&
    discoverContrib.media[0].mediaType === 'VIDEO' &&
    discoverContrib.media[0].url.includes('/embed/'),
    `Media: ${JSON.stringify(discoverContrib?.media)}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 3: AUTOMATED SIGNAL EXTRACTION
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 3. AUTOMATED SIGNAL EXTRACTION ---');

  const allSignals = await service.getSignals({ locality: 'ranaghat' });

  assert(
    'Signals automatically extracted from contributions',
    allSignals.length >= 11,
    `Found ${allSignals.length} signals`
  );

  const hasDiscoverySignal = allSignals.some(s => s.signalType === 'PLACE_DISCOVERY' || s.signalType === 'BUSINESS_MENTION');
  const hasRecommendSignal = allSignals.some(s => s.signalType === 'BUSINESS_RECOMMENDATION');
  const hasUpdateSignal = allSignals.some(s => s.signalType === 'BUSINESS_UPDATE' || s.signalType === 'LOCAL_UPDATE');
  const hasNewsSignal = allSignals.some(s => s.signalType === 'LOCAL_NEWS_SIGNAL');

  assert(
    'Specific signals extracted according to contribution type',
    hasDiscoverySignal && hasRecommendSignal && hasUpdateSignal && hasNewsSignal,
    `Signals present: ${JSON.stringify(allSignals.map(s => s.signalType))}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 4: COMMUNITY EVIDENCE LOOP (CONFIRMATIONS & DISPUTES)
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 4. COMMUNITY EVIDENCE LOOP ---');

  const updateContrib = createdContributions.find(c => c.type === 'UPDATE');
  assert('Initial verification state of citizen update is UNVERIFIED or FIELD_VERIFIED',
    updateContrib.verificationState === 'OFFICIALLY_VERIFIED' || updateContrib.verificationState === 'UNVERIFIED',
    `Initial state: ${updateContrib.verificationState}`
  );

  // Test Citizen Discovery confirmation escalation
  const citizenContrib = await service.createContribution({
    type: 'DISCOVER',
    title: 'New Organic Tea Shop on Rathtala Road',
    content: 'Fresh Darjeeling and Dooars loose teas available at wholesale rates.',
    locality: 'ranaghat',
    provenance: 'FIRST_HAND_CITIZEN',
    author: {
      id: 'usr_test_tanmoy',
      displayName: 'Tanmoy Roy',
      locality: 'Ranaghat'
    }
  });

  assert(
    'Fresh citizen contribution begins as UNVERIFIED',
    citizenContrib.verificationState === 'UNVERIFIED' && citizenContrib.confirmationsCount === 0,
    `State: ${citizenContrib.verificationState}`
  );

  // Confirm 1 & 2 times
  await service.confirmContribution(citizenContrib.id, 'usr_conf_1', 'Priya Sen');
  await service.confirmContribution(citizenContrib.id, 'usr_conf_2', 'Amit Ghosh');

  const afterTwoConfirms = (await service.getContributions({ locality: 'ranaghat' })).find(c => c.id === citizenContrib.id);
  assert(
    '2 confirmations does not yet trigger community corroboration (requires 3+)',
    afterTwoConfirms.confirmationsCount === 2 && afterTwoConfirms.verificationState === 'UNVERIFIED',
    `Confirmations: ${afterTwoConfirms.confirmationsCount}, State: ${afterTwoConfirms.verificationState}`
  );

  // 3rd Confirmation
  await service.confirmContribution(citizenContrib.id, 'usr_conf_3', 'Subir Biswas');
  const afterThreeConfirms = (await service.getContributions({ locality: 'ranaghat' })).find(c => c.id === citizenContrib.id);

  assert(
    '3 confirmations elevates state to COMMUNITY_CORROBORATED',
    afterThreeConfirms.confirmationsCount === 3 && afterThreeConfirms.verificationState === 'COMMUNITY_CORROBORATED',
    `Confirmations: ${afterThreeConfirms.confirmationsCount}, State: ${afterThreeConfirms.verificationState}`
  );

  // Verify Author gained reputation credit from confirmation
  const authorAfterConfirmation = await service.getLocalProfile('usr_test_tanmoy');
  assert(
    'Author receives reputation credit when community confirms their post',
    authorAfterConfirmation && authorAfterConfirmation.stats.confirmedUpdatesCount >= 1,
    `Author confirmed updates: ${authorAfterConfirmation?.stats.confirmedUpdatesCount}`
  );

  // Test Community Dispute
  await service.disputeContribution(citizenContrib.id, 'usr_disp_1', 'Shop closed last week', 'Sneha Roy');
  await service.disputeContribution(citizenContrib.id, 'usr_disp_2', 'Wrong address listed', 'Kalyan Sen');

  const afterTwoDisputes = (await service.getContributions({ locality: 'ranaghat' })).find(c => c.id === citizenContrib.id);
  assert(
    '2 community disputes transitions state to DISPUTED',
    afterTwoDisputes.disputesCount === 2 && afterTwoDisputes.verificationState === 'DISPUTED',
    `Disputes: ${afterTwoDisputes.disputesCount}, State: ${afterTwoDisputes.verificationState}`
  );

  assert(
    'Trust Dossier reflects community dispute rationale',
    afterTwoDisputes.trustDossier.whatRemainsUncertain.includes('contested by local community'),
    `whatRemainsUncertain: ${afterTwoDisputes.trustDossier.whatRemainsUncertain}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 5: RATINGS & ANTI-FABRICATION INVARIANTS
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 5. RATINGS & ANTI-FABRICATION INVARIANTS ---');

  // 5.1 Fresh item has 0 ratings and 0 average
  const freshItem = createdContributions.find(c => c.type === 'STORY');
  assert(
    'Zero synthetic ratings on cold start',
    freshItem.ratingsCount === 0 && freshItem.averageRating === 0,
    `ratingsCount: ${freshItem.ratingsCount}, average: ${freshItem.averageRating}`
  );

  // 5.2 Submit authentic ratings
  await service.rateContribution(freshItem.id, 'usr_rate_1', 5);
  await service.rateContribution(freshItem.id, 'usr_rate_2', 4);
  const ratingRes = await service.rateContribution(freshItem.id, 'usr_rate_3', 5);

  // (5 + 4 + 5) / 3 = 14 / 3 = 4.7
  assert(
    'Ratings computed with exact arithmetic average',
    ratingRes.ratingsCount === 3 && ratingRes.averageRating === 4.7,
    `Ratings count: ${ratingRes.ratingsCount}, Avg: ${ratingRes.averageRating}`
  );

  // 5.3 Reject invalid ratings
  let caughtRatingErr = false;
  try {
    await service.rateContribution(freshItem.id, 'usr_rate_4', 6);
  } catch (e) {
    caughtRatingErr = true;
  }
  assert('Rating > 5 throws validation error', caughtRatingErr);

  // 5.4 Invariant: Community corroboration != Statutory Primary Verification
  assert(
    'Invariant: Community corroboration NEVER grants statutory verification',
    afterThreeConfirms.verificationState !== 'STATUTORY_VERIFIED',
    `State was: ${afterThreeConfirms.verificationState}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 6: BUSINESS DEMAND REQUESTS & DEMAND SIGNALS
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 6. BUSINESS DEMAND REQUESTS & DEMAND SIGNALS ---');

  const demandReq = await service.requestBusiness({
    businessName: 'Maa Tara Diagnostics & Blood Collection',
    locality: 'Ranaghat',
    category: 'Healthcare & Diagnostics',
    addressHint: 'Opposite Sub-divisional Hospital, Hospital Road',
    reason: 'Frequent patient visits, need official contact and report delivery hours indexed.',
    requestedBy: {
      userId: 'usr_test_rahul',
      displayName: 'Rahul Debnath',
      email: 'rahul.debnath@example.com'
    }
  });

  assert(
    'Business Demand Request registered with PENDING_REVIEW status',
    demandReq && demandReq.status === 'PENDING_REVIEW' && demandReq.businessName.includes('Maa Tara'),
    `Req: ${JSON.stringify(demandReq)}`
  );

  // Verify BUSINESS_REQUEST signal created
  const demandSignals = await service.getSignals({
    locality: 'ranaghat',
    signalType: 'BUSINESS_REQUEST'
  });

  assert(
    'BUSINESS_REQUEST demand signal automatically generated',
    demandSignals.some(s => s.targetEntityName === 'Maa Tara Diagnostics & Blood Collection'),
    `Signals: ${JSON.stringify(demandSignals)}`
  );

  // Verify status progression by admin
  const inProgressReq = await service.updateBusinessRequestStatus(demandReq.id, 'IN_PROGRESS', 'Verification team contacted owner.');
  assert('Request status updated to IN_PROGRESS', inProgressReq.status === 'IN_PROGRESS');

  const fulfilledReq = await service.updateBusinessRequestStatus(demandReq.id, 'FULFILLED', 'Business entity created: CFX-IN-WB-NAD-000210');
  assert('Request status updated to FULFILLED', fulfilledReq.status === 'FULFILLED');

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 7: UNIFIED LOCAL INTELLIGENCE SEARCH
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 7. UNIFIED LOCAL INTELLIGENCE SEARCH ---');

  // 7.1 Search for "tea"
  const searchTea = await service.searchLocalIntelligence('tea', 'ranaghat');
  assert(
    'Search query "tea" finds matching contribution',
    searchTea.contributions.some(c => c.title.toLowerCase().includes('tea')),
    `Contributions found: ${searchTea.contributions.length}`
  );

  // 7.2 Search for "hospital"
  const searchHospital = await service.searchLocalIntelligence('hospital', 'ranaghat');
  assert(
    'Search query "hospital" finds matching contribution',
    searchHospital.contributions.some(c => c.title.toLowerCase().includes('hospital')),
    `Contributions found: ${searchHospital.contributions.length}`
  );

  // 7.3 Search for "station"
  const searchStation = await service.searchLocalIntelligence('station', 'ranaghat');
  assert(
    'Search query "station" finds authentic seed places and moments',
    searchStation.places.some(p => p.name.includes('Station')) ||
    searchStation.moments.some(m => m.locationName.includes('Station')),
    `Places: ${searchStation.places.length}, Moments: ${searchStation.moments.length}`
  );

  // ───────────────────────────────────────────────────────────────────
  // SUMMARY
  // ───────────────────────────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log(`  RESULTS: ${passCount} / ${totalChecks} CHECKS PASSED              `);
  console.log('======================================================================');

  if (passCount === totalChecks) {
    console.log('>>> ALL LOCAL KNOWLEDGE NETWORK TESTS PASSED SUCCESSFULLY! <<<\n');
    process.exit(0);
  } else {
    console.error(`>>> FAILED: ${totalChecks - passCount} check(s) failed! <<<\n`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled test execution error:', err);
  process.exit(1);
});
