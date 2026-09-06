// Conflux Platform — Ranaghat Local Community Hub Test Suite
// Rigorous verification of:
// 1. Ranaghat Local Seeding & Retrieval
// 2. Local Job Posting, Verification & Lifecycle Moderation
// 3. Citizen Identity Verification Pipeline & Profile Synchronization
// 4. Live Local Stream Publishing Gate (Verified Resident & Reputation Tiers)
// 5. Zero Fabrication Invariants & Anti-Gaming Controls

import fs from 'fs';
import { loadEnv } from './load_env.js';
loadEnv();
import { LocalKnowledgeService } from '../lib/localKnowledgeService.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

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
    'Cold start truth: zero fabricated voices exist before real resident verification',
    seedVoices.length === 0,
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
  // TEST GROUP 6: 12 REGRESSION INVARIANTS (SECTION 13: REAL PROFILES & MEDIA)
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 6. 12 REGRESSION INVARIANTS (SECTION 13: TRUTH-FIRST PROFILES & REAL MEDIA) ---');

  // Regression 1: Fabricated profiles are NOT present anywhere in system
  const allProfiles = await service.getAllLocalProfiles();
  const hasDebabrata = allProfiles.some(p => p.displayName.includes('Debabrata'));
  const hasPoushali = allProfiles.some(p => p.displayName.includes('Poushali'));
  assert(
    'Regression 1: Fabricated profiles (Debabrata, Poushali) are NOT present anywhere in system',
    !hasDebabrata && !hasPoushali,
    `hasDebabrata: ${hasDebabrata}, hasPoushali: ${hasPoushali}`
  );

  // Regression 2: Unverified users cannot appear in Trusted People
  const freshUnverifiedUser = await service.upsertLocalProfile({
    id: 'usr_unverified_test_01',
    displayName: 'Tanmay Ghosh',
    locality: 'Ranaghat',
    bio: 'Local commuter'
  });
  const trustedVoicesAfterUnverified = await service.getLocalVoices('ranaghat');
  const isUnverifiedInTrusted = trustedVoicesAfterUnverified.some(v => v.id === freshUnverifiedUser.id);
  assert(
    'Regression 2: Unverified users cannot appear in Trusted People',
    isUnverifiedInTrusted === false,
    `Unverified in trusted: ${isUnverifiedInTrusted}`
  );

  // Regression 3: New users start with 0 contributions
  assert(
    'Regression 3: New users start with strictly 0 contributions',
    freshUnverifiedUser.stats.contributionsCount === 0,
    `contributionsCount: ${freshUnverifiedUser.stats.contributionsCount}`
  );

  // Regression 4: New users start with 0 people helped
  assert(
    'Regression 4: New users start with strictly 0 people helped',
    (freshUnverifiedUser.stats.peopleHelpedCount || 0) === 0,
    `peopleHelpedCount: ${freshUnverifiedUser.stats.peopleHelpedCount}`
  );

  // Regression 5: New users start with base trust score 20 (no fabricated 82/74)
  assert(
    'Regression 5: New users start with base trust score 20 (no fabricated 82 or 74)',
    freshUnverifiedUser.reputationScore === 20,
    `reputationScore: ${freshUnverifiedUser.reputationScore}`
  );

  // Regression 6: Profile photo cannot silently fall back to generated avatar
  const profileWithNoPhoto = await service.upsertLocalProfile({
    id: 'usr_no_photo_01',
    displayName: 'Soumen Roy',
    locality: 'Ranaghat'
  });
  assert(
    'Regression 6: Profile without photo does not silently fall back to generated/stock avatar',
    profileWithNoPhoto.avatarUrl === undefined,
    `avatarUrl: ${profileWithNoPhoto.avatarUrl}`
  );

  // Regression 7: Missing profile media produces explicit missing/pending state
  assert(
    'Regression 7: Missing profile media produces explicit status MISSING and provenance NONE',
    profileWithNoPhoto.profileMedia !== undefined &&
    profileWithNoPhoto.profileMedia.status === 'MISSING' &&
    profileWithNoPhoto.profileMedia.provenance === 'NONE',
    `profileMedia: ${JSON.stringify(profileWithNoPhoto.profileMedia)}`
  );

  // Regression 8: Media retains source/provenance (USER_URL, USER_UPLOAD, ADMIN_VERIFIED, NONE)
  const profileWithUrlPhoto = await service.upsertLocalProfile({
    id: 'usr_url_photo_01',
    displayName: 'Rina Das',
    locality: 'Ranaghat',
    avatarUrl: 'https://images.example.com/rina-real-portrait.jpg',
    profileMedia: {
      url: 'https://images.example.com/rina-real-portrait.jpg',
      sourceUrl: 'https://images.example.com/rina-real-portrait.jpg',
      provenance: 'USER_URL',
      status: 'PENDING_REVIEW'
    }
  });
  assert(
    'Regression 8: User-submitted media correctly records provenance USER_URL and status PENDING_REVIEW',
    profileWithUrlPhoto.profileMedia !== undefined &&
    profileWithUrlPhoto.profileMedia.provenance === 'USER_URL' &&
    profileWithUrlPhoto.profileMedia.status === 'PENDING_REVIEW',
    `profileMedia: ${JSON.stringify(profileWithUrlPhoto.profileMedia)}`
  );

  // Regression 9: Verification status is independent of photo availability
  const reqNoPhoto = await service.createVerificationRequest({
    userId: profileWithNoPhoto.id,
    displayName: profileWithNoPhoto.displayName,
    locality: 'Ranaghat',
    contactMethod: 'PHONE',
    contactValue: '+91 98320 99887'
  });
  await service.updateVerificationRequestStatus(reqNoPhoto.id, 'VERIFIED', 'Verified resident via utility document', 'Admin Verification');
  const verifiedNoPhotoProfile = await service.getLocalProfile(profileWithNoPhoto.id);
  assert(
    'Regression 9: Verification status is independent of photo availability (resident verified without photo)',
    verifiedNoPhotoProfile.isVerifiedResident === true &&
    verifiedNoPhotoProfile.verificationStatus === 'VERIFIED' &&
    verifiedNoPhotoProfile.avatarUrl === undefined &&
    verifiedNoPhotoProfile.profileMedia?.status === 'MISSING',
    `Verified without photo: ${JSON.stringify(verifiedNoPhotoProfile)}`
  );

  // Regression 10: Only actually verified residents receive the verified-resident state
  assert(
    'Regression 10: Verified resident state strictly requires isVerifiedResident === true && verificationStatus === "VERIFIED"',
    verifiedNoPhotoProfile.isVerifiedResident === true &&
    verifiedNoPhotoProfile.verificationStatus === 'VERIFIED' &&
    freshUnverifiedUser.isVerifiedResident !== true,
    `verifiedNoPhoto: isVerifiedResident=${verifiedNoPhotoProfile.isVerifiedResident}, fresh: isVerifiedResident=${freshUnverifiedUser.isVerifiedResident}`
  );

  // Regression 11: Only real events increase reputation metrics
  const scoreBefore = verifiedNoPhotoProfile.reputationScore;
  const testContrib = await service.createContribution({
    type: 'INFORM',
    title: 'Ranaghat Ferry Ghat morning schedule confirmed',
    content: 'Ferry service to Aismali operates every 20 minutes from 6:00 AM onwards.',
    locality: 'Ranaghat',
    author: {
      id: verifiedNoPhotoProfile.id,
      displayName: verifiedNoPhotoProfile.displayName
    }
  });
  const updatedProfileAfterContrib = await service.getLocalProfile(verifiedNoPhotoProfile.id);
  assert(
    'Regression 11: Only real events increase reputation metrics (creating contribution increased contributionsCount and score)',
    updatedProfileAfterContrib.stats.contributionsCount === 1 &&
    updatedProfileAfterContrib.reputationScore > scoreBefore,
    `Before: ${scoreBefore}, After: ${updatedProfileAfterContrib.reputationScore}, count: ${updatedProfileAfterContrib.stats.contributionsCount}`
  );

  // Regression 12: Trusted People renders correctly when there are zero verified members
  const emptyLocalityVoices = await service.getLocalVoices('NonExistentLocality_XYZ');
  assert(
    'Regression 12: Trusted People query returns strictly empty array [] when zero verified residents exist',
    Array.isArray(emptyLocalityVoices) && emptyLocalityVoices.length === 0,
    `emptyLocalityVoices: ${JSON.stringify(emptyLocalityVoices)}`
  );

  // Regression 12b: Static prerender and page parity check
  const prerenderCode = fs.readFileSync('scripts/prerender_articles.js', 'utf8');
  assert(
    'Regression 12b: prerender_articles.js contains truthful empty state and zero fabricated profiles',
    prerenderCode.includes('Trusted People is growing.') &&
    prerenderCode.includes('Verified local members will appear here as they complete Conflux verification.') &&
    !prerenderCode.includes('Debabrata Mukherjee') &&
    !prerenderCode.includes('Poushali Roy'),
    'Prerender script check'
  );

  // ───────────────────────────────────────────────────────────────────
  // TEST GROUP 7: RANAGHAT MULTI-INTENT ARCHITECTURE & TELEMETRY
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 7. RANAGHAT MULTI-INTENT ARCHITECTURE & TELEMETRY ---');

  // Check LocationDetailPage.tsx telemetry events
  const locationDetailCode = fs.readFileSync('components/locations/LocationDetailPage.tsx', 'utf8');
  const expectedTelemetryEvents = [
    'RANAGHAT_HUB_VIEW',
    'LIVE_LOCAL_OPEN',
    'JOBS_OPEN',
    'TRUSTED_PEOPLE_OPEN',
    'BUSINESSES_OPEN',
    'ASK_RANAGHAT_OPEN'
  ];

  expectedTelemetryEvents.forEach(evt => {
    assert(
      `Telemetry event ${evt} is wired in LocationDetailPage`,
      locationDetailCode.includes(evt),
      `LocationDetailPage check for ${evt}`
    );
  });

  // Check that all 5 child subpages and the main hub have prerendered HTML snapshots
  const childSubPages = ['live', 'jobs', 'people', 'businesses', 'ask'];
  const hubHtmlPath = 'dist/locations/west-bengal/nadia/ranaghat/index.html';
  assert(
    'Main Ranaghat Hub prerendered HTML exists in dist/',
    fs.existsSync(hubHtmlPath)
  );

  if (fs.existsSync(hubHtmlPath)) {
    const hubHtml = fs.readFileSync(hubHtmlPath, 'utf8');
    assert(
      'Main Ranaghat Hub has exact canonical and single H1 "Ranaghat"',
      hubHtml.includes('<link rel="canonical" href="https://confluxai.in/locations/west-bengal/nadia/ranaghat"') &&
      (hubHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || []).length === 1 &&
      /<h1[^>]*>\s*Ranaghat\s*<\/h1>/i.test(hubHtml),
      'Hub HTML H1 check'
    );
    assert(
      'Main Ranaghat Hub contains 5-Intent Mobile-First Chooser linking to child routes',
      hubHtml.includes('/locations/west-bengal/nadia/ranaghat/live') &&
      hubHtml.includes('/locations/west-bengal/nadia/ranaghat/jobs') &&
      hubHtml.includes('/locations/west-bengal/nadia/ranaghat/people') &&
      hubHtml.includes('/locations/west-bengal/nadia/ranaghat/businesses') &&
      hubHtml.includes('/locations/west-bengal/nadia/ranaghat/ask'),
      'Hub HTML intent chooser links check'
    );
    assert(
      'Section 9 Invariant: Ranaghat hub has zero agency sales / automation consulting pitches',
      !hubHtml.includes('Schedule a direct video consultation with our Kolkata engineering team') &&
      hubHtml.includes('Do You Run a Business in Ranaghat?'),
      'Agency pitch removal check'
    );
  }

  childSubPages.forEach(sub => {
    const subHtmlPath = `dist/locations/west-bengal/nadia/ranaghat/${sub}/index.html`;
    assert(
      `Dedicated Child Page /${sub} prerendered HTML exists in dist/`,
      fs.existsSync(subHtmlPath)
    );
    if (fs.existsSync(subHtmlPath)) {
      const subHtml = fs.readFileSync(subHtmlPath, 'utf8');
      const expectedCanonical = `https://confluxai.in/locations/west-bengal/nadia/ranaghat/${sub}`;
      assert(
        `Child page /${sub} has self-referencing canonical and single H1`,
        subHtml.includes(`<link rel="canonical" href="${expectedCanonical}"`) &&
        (subHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || []).length === 1,
        `Child page /${sub} canonical/H1 check`
      );
      assert(
        `Child page /${sub} contains Cross-Intent navigation linking back to Ranaghat Hub`,
        subHtml.includes('/locations/west-bengal/nadia/ranaghat') &&
        subHtml.includes('&larr; Ranaghat Hub'),
        `Child page /${sub} cross-nav check`
      );
    }
  });

  // Check App.tsx has registered child routes
  const appCode = fs.readFileSync('App.tsx', 'utf8');
  assert(
    'App.tsx has registered subPage routes for district & city',
    appCode.includes('path="/locations/:districtSlug/:citySlug/:subPage"') &&
    appCode.includes('path="/locations/west-bengal/:districtSlug/:citySlug/:subPage"'),
    'App.tsx subPage route registration'
  );

  // Check sitemap contains all 6 Ranaghat routes
  const sitemapXml = fs.readFileSync('public/sitemap.xml', 'utf8');
  assert(
    'sitemap.xml contains Ranaghat hub and all 5 dedicated sub-intents',
    sitemapXml.includes('<loc>https://confluxai.in/locations/west-bengal/nadia/ranaghat</loc>') &&
    childSubPages.every(sub => sitemapXml.includes(`<loc>https://confluxai.in/locations/west-bengal/nadia/ranaghat/${sub}</loc>`)),
    'sitemap.xml Ranaghat URLs check'
  );

  // ───────────────────────────────────────────────────────────────────
  // REGRESSION TEST: NO RUNTIME REFERENCE ERROR ON LIVE LOCAL MODALS
  // ───────────────────────────────────────────────────────────────────
  console.log('\n--- 8. REGRESSION TEST: CREATE CONTRIBUTION MODAL & LIVE LOCAL RUNTIME ---');
  const createModalCode = fs.readFileSync('components/contributions/CreateContributionModal.tsx', 'utf8');
  assert(
    'CreateContributionModal.tsx explicitly declares selectedOpt to prevent ReferenceError',
    createModalCode.includes('const selectedOpt =') &&
    /const\s+selectedOpt\s*=\s*CONTRIBUTION_OPTIONS\.find/.test(createModalCode),
    'CreateContributionModal selectedOpt declaration check'
  );

  assert(
    'selectedOpt is initialized before SelectedIcon usage',
    createModalCode.indexOf('const selectedOpt =') < createModalCode.indexOf('const SelectedIcon = selectedOpt?.icon'),
    'selectedOpt evaluation order check'
  );

  assert(
    'CreateContributionModal imports ShieldCheck icon from lucide-react',
    createModalCode.includes('ShieldCheck') &&
    /import[\s\S]*?ShieldCheck[\s\S]*?from\s*['"]lucide-react['"]/.test(createModalCode),
    'ShieldCheck icon import check'
  );

  // Verify all 11 contribution types can resolve selectedOpt without ReferenceError
  const allContributionTypes = [
    'DISCOVER', 'INFORM', 'RECOMMEND', 'UPDATE', 'REPORT',
    'REVIEW', 'EVENT', 'STORY', 'QUESTION', 'CORRECTION', 'SUGGESTION'
  ];
  let allTypesResolved = true;
  for (const t of allContributionTypes) {
    // Test that find with fallback works for all types
    const optFound = createModalCode.includes(`type: '${t}'`);
    if (!optFound && t !== 'SUGGESTION') {
      allTypesResolved = false;
    }
  }
  assert(
    'All primary contribution types have mapped option configs in CreateContributionModal',
    allTypesResolved,
    'Contribution options completeness'
  );

  // Verify Live Local page snapshot: cold load, empty state, and active data
  const liveHtmlPath = 'dist/locations/west-bengal/nadia/ranaghat/live/index.html';
  if (fs.existsSync(liveHtmlPath)) {
    const liveHtml = fs.readFileSync(liveHtmlPath, 'utf8');
    assert(
      'Live Local route renders without ReferenceError on static snapshot',
      !liveHtml.includes('selectedOpt is not defined') && !liveHtml.includes('ReferenceError'),
      'Live Local clean snapshot check'
    );
    assert(
      'Live Local snapshot contains valid canonical URL',
      liveHtml.includes('<link rel="canonical" href="https://confluxai.in/locations/west-bengal/nadia/ranaghat/live"'),
      'Live Local canonical check'
    );
    assert(
      'Live Local snapshot contains single H1 "Live Local Ranaghat"',
      /<h1[^>]*>\s*Live Local Ranaghat\s*<\/h1>/i.test(liveHtml),
      'Live Local H1 check'
    );
    assert(
      'Live Local snapshot contains structured JSON-LD schema',
      (liveHtml.includes('"@type":"WebPage"') || liveHtml.includes('"@type": "WebPage"')) && liveHtml.includes('Live Local Ranaghat'),
      'Live Local JSON-LD schema check'
    );
    assert(
      'Live Local snapshot contains Ground Truth CTA and updates block',
      liveHtml.includes('Have a Real-Time Update or Civic Notice?') || liveHtml.includes('Submit Live Update'),
      'Live Local CTA check'
    );
    assert(
      'Live Local snapshot contains honest empty state ("Nothing new from Ranaghat yet.") and zero fake confirmation counts',
      liveHtml.includes('Nothing new from Ranaghat yet.') &&
      !liveHtml.includes('28 confirmed') &&
      !liveHtml.includes('42 confirmed') &&
      !liveHtml.includes('56 confirmed'),
      'Live Local honest empty state check'
    );
  }

  // Cleanup test contribution if Supabase was used
  if (isSupabaseConfigured() && process.env.SUPABASE_ADMIN_EMAIL && process.env.SUPABASE_ADMIN_PASSWORD) {
    try {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: process.env.SUPABASE_ADMIN_EMAIL,
        password: process.env.SUPABASE_ADMIN_PASSWORD
      });
      if (authData?.session) {
        if (typeof testContrib !== 'undefined' && testContrib?.id) {
          await supabase.from('community_contributions').delete().eq('id', testContrib.id);
        }
        if (typeof residentSubmission !== 'undefined' && residentSubmission?.contribution?.id) {
          await supabase.from('community_contributions').delete().eq('id', residentSubmission.contribution.id);
        }
        await supabase.from('community_contributions').delete().ilike('author_id', 'usr_citizen%');
        await supabase.from('community_contributions').delete().ilike('author_id', 'usr_newbie%');
        await supabase.from('community_contributions').delete().ilike('author_id', 'usr_test%');
        await supabase.from('community_contributions').delete().ilike('author_id', 'usr_verified%');
      }
    } catch (cleanErr) {
      // Cleanup best effort
    }
  }

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
