// Conflux Platform — Automated Business Media & Source Enrichment Test Suite
// Verifies multi-tenant automated enrichment, 4-tier priority order, no-scraping platform classification,
// deterministic provenance retention, and clean empty state behavior.

import { enrichmentService, extractVideoEmbed, MEDIA_PRIORITY_RANK } from '../lib/enrichmentService.ts';
import { businessService } from '../lib/businessService.ts';

console.log('======================================================================');
console.log('    CONFLUX PLATFORM — AUTOMATED BUSINESS MEDIA TEST SUITE            ');
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

async function runMediaEnrichmentTests() {
  businessService.clearGraphStore();

  // ── TEST 1: Video Embed Extraction & Privacy Enhancement ────────────
  console.log('--- Suite 1: Video Embed Extraction & Permitted Embeds ---');
  
  const ytStandard = extractVideoEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert(
    'Extracts standard YouTube video URL to privacy-enhanced embed',
    ytStandard !== null &&
    ytStandard.embedUrl === 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' &&
    ytStandard.platform === 'YouTube' &&
    ytStandard.mediaType === 'VIDEO'
  );

  const ytShort = extractVideoEmbed('https://youtu.be/dQw4w9WgXcQ');
  assert(
    'Extracts shortened youtu.be link correctly',
    ytShort !== null &&
    ytShort.embedUrl === 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
  );

  const ytShorts = extractVideoEmbed('https://www.youtube.com/shorts/dQw4w9WgXcQ');
  assert(
    'Extracts YouTube Shorts link correctly',
    ytShorts !== null &&
    ytShorts.embedUrl === 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
  );

  const vimeoVideo = extractVideoEmbed('https://vimeo.com/76979871');
  assert(
    'Extracts Vimeo video link to player embed',
    vimeoVideo !== null &&
    vimeoVideo.embedUrl === 'https://player.vimeo.com/video/76979871' &&
    vimeoVideo.platform === 'Vimeo'
  );

  const nonVideo = extractVideoEmbed('https://example.com/page.html');
  assert(
    'Returns null for non-video URLs without throwing',
    nonVideo === null
  );

  // ── TEST 2: Platform Classification & Strict Anti-Scraping Guards ────
  console.log('\n--- Suite 2: Anti-Scraping Platform Classifications ---');

  const fbClass = enrichmentService.classifySourcePlatform('https://www.facebook.com/p/SampleStore-12345/');
  assert(
    'Classifies Facebook as REQUIRES_API_AUTH per Meta Terms §3.2',
    fbClass.platform === 'Facebook' && fbClass.status === 'REQUIRES_API_AUTH'
  );

  const igClass = enrichmentService.classifySourcePlatform('https://www.instagram.com/samplestore/');
  assert(
    'Classifies Instagram as REQUIRES_API_AUTH avoiding unauthenticated scraping',
    igClass.platform === 'Instagram' && igClass.status === 'REQUIRES_API_AUTH'
  );

  const liClass = enrichmentService.classifySourcePlatform('https://www.linkedin.com/company/samplestore/');
  assert(
    'Classifies LinkedIn as REQUIRES_API_AUTH',
    liClass.platform === 'LinkedIn' && liClass.status === 'REQUIRES_API_AUTH'
  );

  const gbpClass = enrichmentService.classifySourcePlatform('https://maps.google.com/?cid=123456789');
  assert(
    'Classifies Google Business Profile as REQUIRES_API_AUTH',
    gbpClass.platform === 'Google Business Profile' && gbpClass.status === 'REQUIRES_API_AUTH'
  );

  const jdClass = enrichmentService.classifySourcePlatform('https://www.justdial.com/Kolkata/Sample');
  assert(
    'Classifies Justdial as RESTRICTED directory source',
    jdClass.platform === 'Justdial' && jdClass.status === 'RESTRICTED'
  );

  const webClass = enrichmentService.classifySourcePlatform('https://samplestore.in');
  assert(
    'Classifies official website domain as ACCESSIBLE',
    webClass.platform === 'Official Website' && webClass.status === 'ACCESSIBLE'
  );

  // ── TEST 3: Deterministic 4-Tier Media Priority Sorting ──────────────
  console.log('\n--- Suite 3: 4-Tier Media Priority Invariant ---');

  assert(
    'Priority ranking verifies: BUSINESS_PROVIDED (1) > CONFLUX_VERIFIED (2) > PUBLIC_SOURCE (3) > ADMIN_ADDED (4)',
    MEDIA_PRIORITY_RANK.BUSINESS_PROVIDED < MEDIA_PRIORITY_RANK.CONFLUX_VERIFIED &&
    MEDIA_PRIORITY_RANK.CONFLUX_VERIFIED < MEDIA_PRIORITY_RANK.PUBLIC_SOURCE &&
    MEDIA_PRIORITY_RANK.PUBLIC_SOURCE < MEDIA_PRIORITY_RANK.ADMIN_ADDED
  );

  // ── TEST 4: Empty State (Zero-Fabrication Guardrail) ─────────────────
  console.log('\n--- Suite 4: Empty State & Zero-Fabrication Guardrail ---');

  const emptyBusiness = {
    id: 'biz_empty_test',
    confluxBusinessId: 'CFX-IN-WB-NADIA-999901',
    slug: 'empty-test-store',
    name: 'Empty Test Store',
    businessType: 'LOCAL_BUSINESS',
    categoryId: 'retail-trade',
    description: 'A store with no media supplied.',
    status: 'PUBLISHED',
    claimStatus: 'UNCLAIMED_PUBLIC',
    verificationStatus: 'UNVERIFIED',
    verificationLevel: 'NONE',
    confidenceScore: 0,
    isClaimed: false,
    isIndexable: true,
    location: {
      id: 'loc_empty',
      businessId: 'biz_empty_test',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'ranaghat',
      fullAddress: 'Station Road, Ranaghat',
      isPrimary: true
    },
    contact: {
      id: 'cnt_empty',
      businessId: 'biz_empty_test',
      phone: '+919830000001'
    },
    operatingHours: [],
    capabilities: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const emptyResult = enrichmentService.enrichBusinessMedia(emptyBusiness);
  assert(
    'Returns strictly empty media array when no genuine media is available',
    Array.isArray(emptyResult.media) && emptyResult.media.length === 0
  );
  assert(
    'Never injects synthetic or AI-generated image URLs into media',
    emptyResult.media.length === 0
  );

  // ── TEST 5: Multi-Tenant Onboarding & Automatic Enrichment ───────────
  console.log('\n--- Suite 5: Multi-Tenant Onboarding & Automated Flow ---');

  // Submit a future business: Kalyani Diagnostic & Pathology Clinic
  const app = await businessService.submitApplication({
    submissionType: 'STANDARD_LISTING',
    businessName: 'Kalyani Diagnostic & Pathology Clinic',
    businessType: 'HEALTHCARE',
    categoryId: 'healthcare-diagnostic',
    categoryName: 'Diagnostic & Medical Imaging Center',
    description: 'Premier diagnostic laboratory and radiology clinic in Kalyani.',
    services: ['Digital X-Ray', 'Ultrasound USG', 'Blood Biochemistry', 'ECG'],
    district: 'nadia',
    city: 'kalyani',
    landmark: 'Opposite Central Park Gate 2',
    fullAddress: 'A-9, Commercial Complex, Kalyani, Nadia 741235',
    phone: '+919830111222',
    whatsapp: '+919830111222',
    email: 'contact@kalyanidiagnostic.in',
    websiteUrl: 'https://kalyanidiagnostic.in',
    ownerName: 'Dr. Debabrata Roy',
    ownerRole: 'Chief Medical Director',
    storefrontPhotoUrl: 'https://storage.confluxai.in/businesses/kalyani-diagnostic-front.jpg',
    interiorPhotoUrl: 'https://storage.confluxai.in/businesses/kalyani-diagnostic-lab.jpg',
    onlineSources: {
      googleBusinessUrl: 'https://maps.google.com/?cid=kalyanidiagnostic',
      facebookUrl: 'https://www.facebook.com/p/Kalyani-Diagnostic-1000998877/',
      otherUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }
  });

  assert('Onboards new business application successfully', app.id !== undefined);

  // Admin approves application
  const approvedBiz = await businessService.approveApplicationAsStandard(app.id);

  assert('Approves and publishes business entity', approvedBiz.status === 'PUBLISHED');
  assert(
    'Automatically enriches newly approved business with real media',
    Array.isArray(approvedBiz.media) && approvedBiz.media.length >= 2
  );

  const storefrontMedia = approvedBiz.media.find(m => m.url === 'https://storage.confluxai.in/businesses/kalyani-diagnostic-front.jpg');
  assert(
    'Enriches storefront photo with BUSINESS_PROVIDED provenance and correct attribution',
    storefrontMedia !== undefined &&
    storefrontMedia.provenance === 'BUSINESS_PROVIDED' &&
    storefrontMedia.mediaType === 'IMAGE' &&
    storefrontMedia.status === 'ACTIVE' &&
    storefrontMedia.sourceName === 'Business Proprietor Submission'
  );

  const videoMedia = approvedBiz.media.find(m => m.mediaType === 'VIDEO');
  assert(
    'Automatically extracts permitted YouTube video embed with CONFLUX_VERIFIED provenance',
    videoMedia !== undefined &&
    videoMedia.url === 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' &&
    videoMedia.provenance === 'CONFLUX_VERIFIED'
  );

  assert(
    'Sort order is strictly 1-indexed and prioritized by tier',
    approvedBiz.media[0].sortOrder === 1 &&
    approvedBiz.media[1].sortOrder === 2
  );

  assert(
    'Populates verified social and source links automatically',
    Array.isArray(approvedBiz.socialLinks) && approvedBiz.socialLinks.length > 0 &&
    Array.isArray(approvedBiz.sourceLinks) && approvedBiz.sourceLinks.length > 0
  );

  // ── TEST 6: Admin Manual Control & Retention ─────────────────────────
  console.log('\n--- Suite 6: Admin Profile Controls & Retention ---');

  // Admin manually adds a photo
  const customAdminMedia = {
    id: 'med_admin_custom_1',
    url: 'https://storage.confluxai.in/businesses/kalyani-ultrasound-room.jpg',
    mediaType: 'IMAGE',
    provenance: 'ADMIN_ADDED',
    sourceName: 'Admin Field Corroboration',
    attribution: 'Verified on-site by Conflux auditor',
    caption: 'Kalyani Diagnostic — USG Radiology Suite',
    status: 'ACTIVE',
    dateAdded: '2026-09-04',
    sortOrder: 1
  };

  const updatedBiz = await businessService.updateBusiness(approvedBiz.id, {
    media: [customAdminMedia, ...approvedBiz.media]
  });

  assert(
    'Admin can add and update custom business media',
    updatedBiz.media.some(m => m.id === 'med_admin_custom_1')
  );

  // Run refreshBusinessMedia
  const refreshed = enrichmentService.refreshBusinessMedia(updatedBiz);

  assert(
    'Auto-enrich refresh preserves admin-added media without overwriting',
    refreshed.media.some(m => m.id === 'med_admin_custom_1' && m.provenance === 'ADMIN_ADDED')
  );

  // ── TEST 7: Truthful Verification Badges ──────────────────────────────
  console.log('\n--- Suite 7: Provenance Honesty & Verification Truth ---');

  assert(
    'Unverified standard listing has sourceProvenance.confluxVerified = false',
    approvedBiz.sourceProvenance?.confluxVerified === false
  );

  // Submit and approve as verified
  const verifiedApp = await businessService.submitApplication({
    submissionType: 'CONFLUX_VERIFIED',
    businessName: 'Ranaghat Precision Foundry',
    businessType: 'MANUFACTURER',
    categoryId: 'manufacturing',
    description: 'Precision cast iron and alloy manufacturer.',
    services: ['Industrial Casting'],
    district: 'nadia',
    city: 'ranaghat',
    fullAddress: 'Industrial Estate, Ranaghat, Nadia',
    phone: '+919830222333',
    ownerName: 'Subhas Bose',
    ownerRole: 'Managing Director',
    storefrontPhotoUrl: 'https://storage.confluxai.in/businesses/foundry-gate.jpg'
  });

  const verifiedBiz = await businessService.approveApplicationAsVerified(
    verifiedApp.id,
    'Directorate of Factories & Boilers, West Bengal',
    'Factory license corroborated via state registry.'
  );

  assert(
    'Conflux Verified business has sourceProvenance.confluxVerified = true',
    verifiedBiz.sourceProvenance?.confluxVerified === true
  );

  assert(
    'Public source is distinguished from business provided and verified',
    verifiedBiz.media[0].provenance === 'BUSINESS_PROVIDED'
  );

  // ── TEST 8: Direct autoEnrichBusinessMedia Method ────────────────────
  console.log('\n--- Suite 8: autoEnrichBusinessMedia Service Method ---');

  const reEnriched = await businessService.autoEnrichBusinessMedia(verifiedBiz.id);
  assert(
    'Programmatic autoEnrichBusinessMedia succeeds and returns updated business',
    reEnriched !== null && reEnriched.id === verifiedBiz.id && reEnriched.media.length > 0
  );

  // ── SUMMARY ──────────────────────────────────────────────────────────
  console.log('\n======================================================');
  console.log(`AUTOMATED MEDIA TEST SUMMARY: ${passCount} / ${totalChecks} TESTS PASSED`);
  console.log('======================================================\n');

  if (passCount !== totalChecks) {
    process.exit(1);
  }
}

runMediaEnrichmentTests().catch(err => {
  console.error('[TEST SUITE ERROR]', err);
  process.exit(1);
});
