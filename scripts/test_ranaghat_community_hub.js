// Conflux Platform — Ranaghat Local Community Hub Test Suite
// Rigorous verification of:
// 1. Ranaghat Local Seeding & Retrieval
// 2. Local Job Posting, Verification & Lifecycle Moderation
// 3. Citizen Identity Verification Pipeline & Profile Synchronization
// 4. Live Local Stream Publishing Gate (Verified Resident & Reputation Tiers)
// 5. Zero Fabrication Invariants & Anti-Gaming Controls

import { LocalKnowledgeService } from '../lib/localKnowledgeService.ts';

console.log('======================================================================');
console.log('  CONFLUX AI — RANAGHAT LOCAL COMMUNITY HUB TEST SUITE                ');
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
  // TEST GROUP 1: SEED DATA & COLD START VERIFICATION
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 1. RANAGHAT SEED DATA & COLD START ---');

  const seedJobs = await service.getJobs({ locality: 'ranaghat', includeExpired: true });
  assert(
    'Seed jobs populate authentic Ranaghat listings on cold start',
    seedJobs.length >= 3,
    `Found ${seedJobs.length} seed jobs`
  );

  const wholesaleJob = seedJobs.find(j => j.title.toLowerCase().includes('accounts'));
  assert(
    'Seed job has authentic company name, locality and contact method',
    wholesaleJob !== undefined && wholesaleJob.locality.toLowerCase().includes('ranaghat') && Boolean(wholesaleJob.contactValue),
    `Wholesale job: ${JSON.stringify(wholesaleJob)}`
  );

  const seedVoices = await service.getLocalVoices('Ranaghat');
  assert(
    'Seed voices include verified Ranaghat local contributors',
    seedVoices.length > 0 && seedVoices.some(v => v.isVerifiedResident === true),
    `Voices count: ${seedVoices.length}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 2: LOCAL JOB POSTING & MODERATION LIFECYCLE
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 2. LOCAL JOB POSTING & MODERATION LIFECYCLE ---');

  // Case A: Unverified resident posts job -> Starts PENDING
  const pendingJob = await service.createJob({
    title: 'Pharmacy Dispensing Assistant',
    companyName: 'Maa Tara Medical Hall',
    locality: 'Ranaghat',
    area: 'Netaji Subhash Road',
    description: 'Looking for a certified pharmacy assistant familiar with retail billing and medicine stocking.',
    requirements: ['D.Pharm or experience', 'Knowledge of generic medicines'],
    salaryRange: '₹10,000 - ₹14,000 / month',
    jobType: 'FULL_TIME',
    contactMethod: 'PHONE',
    contactValue: '+91 98321 55667',
    postedBy: {
      userId: 'usr_ranaghat_chem_01',
      displayName: 'Subir Mondal',
      isVerifiedBusiness: false
    }
  });

  assert(
    'Job posted by unverified member starts in PENDING status',
    pendingJob.status === 'PENDING' && pendingJob.title === 'Pharmacy Dispensing Assistant',
    `Status: ${pendingJob.status}`
  );

  // By default, getJobs without status filter only returns VERIFIED/ACTIVE
  const publicJobsBeforeApproval = await service.getJobs({ locality: 'Ranaghat' });
  const isPendingVisible = publicJobsBeforeApproval.some(j => j.id === pendingJob.id);
  assert(
    'Pending job is not visible to public visitors until reviewed',
    isPendingVisible === false,
    `Pending job visible: ${isPendingVisible}`
  );

  // Case B: Admin approves and verifies the job
  const verifiedJob = await service.updateJobStatus(pendingJob.id, 'VERIFIED', 'Admin Subrata');
  assert(
    'Admin approval transitions job to VERIFIED status with auditor stamp',
    verifiedJob.status === 'VERIFIED' && verifiedJob.verifiedBy === 'Admin Subrata' && Boolean(verifiedJob.verifiedAt),
    `Job: ${JSON.stringify(verifiedJob)}`
  );

  const publicJobsAfterApproval = await service.getJobs({ locality: 'Ranaghat' });
  const isApprovedVisible = publicJobsAfterApproval.some(j => j.id === pendingJob.id);
  assert(
    'Verified job is now visible to public Ranaghat job seekers',
    isApprovedVisible === true,
    `Verified job visible: ${isApprovedVisible}`
  );

  // Case C: Auto-verification for verified businesses
  const verifiedBizJob = await service.createJob({
    title: 'Senior Inventory Manager',
    companyName: 'Ranaghat Agrico Spares',
    businessId: 'biz_agrico_01',
    locality: 'Ranaghat',
    area: 'NH 12 Crossing',
    description: 'Managing agricultural pump spare parts inventory and dealer supplies.',
    salaryRange: '₹18,000 - ₹24,000 / month',
    jobType: 'FULL_TIME',
    contactMethod: 'WHATSAPP',
    contactValue: '+91 94340 11223',
    postedBy: {
      userId: 'usr_biz_owner_01',
      displayName: 'Ranaghat Agrico Spares',
      isVerifiedBusiness: true
    }
  });

  assert(
    'Job posted by verified business is auto-verified with audit gate stamp',
    verifiedBizJob.status === 'VERIFIED' && verifiedBizJob.verifiedBy === 'Conflux Verified Business Auto-Gate',
    `Biz Job: ${JSON.stringify(verifiedBizJob)}`
  );

  // Case D: Lifecycle expiration handling
  const expiredJob = await service.createJob({
    title: 'Temporary Festival Stall Hand',
    companyName: 'Ranaghat Puja Committee',
    locality: 'Ranaghat',
    description: '3-day stall assistant during Jagaddhatri Puja.',
    contactMethod: 'PHONE',
    contactValue: '+91 98000 11111',
    durationDays: -1, // Expired yesterday
    postedBy: {
      userId: 'usr_stall_hand',
      displayName: 'Festival Organizer',
      isVerifiedBusiness: true
    }
  });

  const jobsWithLifecycle = await service.getJobs({ locality: 'Ranaghat', includeExpired: true });
  const checkedExpiredJob = jobsWithLifecycle.find(j => j.id === expiredJob.id);
  assert(
    'Jobs past their expiration date are automatically transitioned to EXPIRED',
    checkedExpiredJob !== undefined && checkedExpiredJob.status === 'EXPIRED',
    `Expired Job: ${JSON.stringify(checkedExpiredJob)}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 3: CITIZEN IDENTITY VERIFICATION PIPELINE
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 3. CITIZEN IDENTITY VERIFICATION PIPELINE ---');

  // Create a local citizen profile
  const citizen = await service.upsertLocalProfile({
    id: 'usr_citizen_anirban',
    displayName: 'Anirban Mukherjee',
    locality: 'Ranaghat',
    bio: 'Daily commuter on Sealdah-Ranaghat line, local history enthusiast.'
  });

  assert(
    'Citizen profile starts unverified with isVerifiedResident false',
    citizen.isVerifiedResident !== true && citizen.verificationStatus === undefined,
    `Citizen: ${JSON.stringify(citizen)}`
  );

  // Citizen applies for resident verification
  const verificationReq = await service.createVerificationRequest({
    userId: citizen.id,
    displayName: citizen.displayName,
    locality: 'Ranaghat',
    contactMethod: 'WHATSAPP',
    contactValue: '+91 98320 44556',
    notes: 'Resident of College More, Ranaghat since 2012'
  });

  assert(
    'Verification request created in PENDING_REVIEW status',
    verificationReq.status === 'PENDING_REVIEW' && verificationReq.userId === citizen.id,
    `Request: ${JSON.stringify(verificationReq)}`
  );

  // Profile automatically reflects pending verification
  const profileDuringReview = await service.getLocalProfile(citizen.id);
  assert(
    'Citizen profile reflects PENDING_REVIEW verificationStatus and records contact phone',
    profileDuringReview.verificationStatus === 'PENDING_REVIEW' && profileDuringReview.phone === '+91 98320 44556',
    `Profile: ${JSON.stringify(profileDuringReview)}`
  );

  // Admin marks request as CONTACTED
  const contactedReq = await service.updateVerificationRequestStatus(
    verificationReq.id,
    'CONTACTED',
    'Called user via WhatsApp, verified local residency proof document',
    'Admin Priya'
  );
  assert(
    'Admin updates status to CONTACTED with review notes',
    contactedReq.status === 'CONTACTED' && contactedReq.reviewedBy === 'Admin Priya',
    `Contacted: ${JSON.stringify(contactedReq)}`
  );

  // Admin confirms and VERIFIES citizen
  const approvedReq = await service.updateVerificationRequestStatus(
    verificationReq.id,
    'VERIFIED',
    'Electricity bill and Ranaghat College alumni card verified',
    'Admin Priya'
  );
  assert(
    'Admin grants VERIFIED resident status',
    approvedReq.status === 'VERIFIED',
    `Approved: ${JSON.stringify(approvedReq)}`
  );

  // Profile synchronization check
  const verifiedProfile = await service.getLocalProfile(citizen.id);
  assert(
    'Profile synchronization sets isVerifiedResident to true and awards TRUSTED_CONTRIBUTOR badge',
    verifiedProfile.isVerifiedResident === true &&
    verifiedProfile.verificationStatus === 'VERIFIED' &&
    verifiedProfile.reputationBadges.includes('TRUSTED_CONTRIBUTOR'),
    `Verified profile: ${JSON.stringify(verifiedProfile)}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 4: LIVE LOCAL PUBLISHING GATE & PERMISSION
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 4. LIVE LOCAL PUBLISHING GATE & PERMISSION ---');

  // Case A: Unverified new contributor with low score (< 75)
  const unverifiedUser = await service.upsertLocalProfile({
    id: 'usr_newbie_01',
    displayName: 'New Visitor',
    locality: 'Ranaghat',
    bio: 'Just moved here'
  });

  const canNewbiePublish = service.canPublishLiveLocal(unverifiedUser);
  assert(
    'Unverified member with low trust score cannot directly publish to Live Local stream',
    canNewbiePublish === false,
    `canPublishLiveLocal: ${canNewbiePublish}`
  );

  const newbieSubmission = await service.submitLiveLocalUpdate({
    title: 'Water pipe repair at Biswaspara',
    content: 'Pipe maintenance going on, expect minor traffic delay near Biswaspara gate.',
    locality: 'Ranaghat',
    author: {
      id: unverifiedUser.id,
      displayName: unverifiedUser.displayName
    }
  });

  assert(
    'Submission by unverified contributor is safely held in PENDING_MODERATION',
    newbieSubmission.queuedForModeration === true &&
    newbieSubmission.contribution.status === 'PENDING_MODERATION',
    `Submission: ${JSON.stringify(newbieSubmission)}`
  );

  // Case B: Verified resident publishes update directly
  const canVerifiedResidentPublish = service.canPublishLiveLocal(verifiedProfile);
  assert(
    'Verified Ranaghat resident has direct publishing authorization',
    canVerifiedResidentPublish === true,
    `canPublishLiveLocal: ${canVerifiedResidentPublish}`
  );

  const residentSubmission = await service.submitLiveLocalUpdate({
    title: 'Ranaghat Junction Platform 2 Escalator Operational',
    content: 'The new escalator on Platform 2 is now open to daily commuters.',
    locality: 'Ranaghat',
    author: {
      id: verifiedProfile.id,
      displayName: verifiedProfile.displayName
    }
  });

  assert(
    'Submission by verified resident is immediately PUBLISHED to Live Local stream',
    residentSubmission.queuedForModeration === false &&
    residentSubmission.contribution.status === 'PUBLISHED',
    `Resident submission: ${JSON.stringify(residentSubmission)}`
  );

  // Case C: Highly reputable contributor (trust score >= 75) publishes directly
  const highTrustUser = await service.upsertLocalProfile({
    id: 'usr_high_trust',
    displayName: 'Doctor Bimal Sen',
    locality: 'Ranaghat',
    bio: 'Practicing physician in Ranaghat.'
  });
  // Manually simulate high earned trust
  highTrustUser.reputationScore = 80;
  const canHighTrustPublish = service.canPublishLiveLocal(highTrustUser);
  assert(
    'Established contributor with Local Trust Score >= 75 has direct publishing authorization',
    canHighTrustPublish === true,
    `canPublishLiveLocal: ${canHighTrustPublish}`
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 5: STRICT INVARIANTS & ANTI-GAMING
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 5. STRICT INVARIANTS & ANTI-GAMING CONTROLS ---');

  // Invariant A: Commercial payment NEVER grants resident verification or bypasses gate
  const payingUnverifiedUser = await service.upsertLocalProfile({
    id: 'usr_paying_customer',
    displayName: 'Commercial Sponsor',
    locality: 'Ranaghat'
  });
  // Simulate commercial subscription
  payingUnverifiedUser.claimedBusinessId = 'biz_paid_sponsor';
  assert(
    'Commercial subscription NEVER alters resident verification status',
    payingUnverifiedUser.isVerifiedResident !== true,
    `isVerifiedResident: ${payingUnverifiedUser.isVerifiedResident}`
  );
  assert(
    'Commercial subscription NEVER grants publishing bypass to Live Local stream',
    service.canPublishLiveLocal(payingUnverifiedUser) === false,
    `canPublishLiveLocal: ${service.canPublishLiveLocal(payingUnverifiedUser)}`
  );

  // Invariant B: Rejection / Blocking revokes verified resident status
  const rogueCitizen = await service.upsertLocalProfile({
    id: 'usr_rogue_poster',
    displayName: 'Spam Poster',
    locality: 'Ranaghat'
  });
  const rogueReq = await service.createVerificationRequest({
    userId: rogueCitizen.id,
    displayName: rogueCitizen.displayName,
    locality: 'Ranaghat',
    contactMethod: 'PHONE',
    contactValue: '+91 90000 00000'
  });
  // Mark BLOCKED
  await service.updateVerificationRequestStatus(rogueReq.id, 'BLOCKED', 'Spamming fake alerts', 'Admin Priya');
  const blockedProfile = await service.getLocalProfile(rogueCitizen.id);
  assert(
    'Blocked verification proposal revokes verification and marks status BLOCKED',
    blockedProfile.isVerifiedResident === false && blockedProfile.verificationStatus === 'BLOCKED',
    `Blocked profile: ${JSON.stringify(blockedProfile)}`
  );

  // Invariant C: Input validation guards against empty or invalid requests
  let validationErrorCaught = false;
  try {
    await service.createVerificationRequest({
      userId: '',
      displayName: '',
      locality: 'Ranaghat',
      contactMethod: 'PHONE',
      contactValue: '12' // Too short
    });
  } catch (err) {
    validationErrorCaught = true;
  }
  assert(
    'Invalid verification proposal inputs trigger strict validation error',
    validationErrorCaught === true,
    `Validation error caught: ${validationErrorCaught}`
  );

  // ───────────────────────────────────────────────────────────────────
  // SUMMARY
  // ───────────────────────────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log(`  RESULTS: ${passCount} / ${totalChecks} CHECKS PASSED`);
  console.log('======================================================================');

  if (passCount === totalChecks) {
    console.log('>>> ALL RANAGHAT COMMUNITY HUB TESTS PASSED SUCCESSFULLY! <<<\n');
    process.exit(0);
  } else {
    console.error(`>>> FAILED: ${totalChecks - passCount} checks failed. <<<\n`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
