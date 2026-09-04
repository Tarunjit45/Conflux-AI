// Conflux Platform — Permanent Business Media & Photo Persistence Test Suite
// Verifies multi-layer permanent retention across database payload, permanent media registry,
// entity hydration, fallback storefront synthesis, and admin dashboard workflows.

import { businessService, getPermanentMediaRegistry, getPermanentBusinessMedia, savePermanentBusinessMedia } from '../lib/businessService.ts';
import { enrichmentService } from '../lib/enrichmentService.ts';

console.log('======================================================================');
console.log('    CONFLUX PLATFORM — PERMANENT BUSINESS MEDIA TEST SUITE            ');
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

async function runPermanentMediaTests() {
  businessService.clearGraphStore();

  // ── TEST 1: Permanent Media Registry Functions ──────────────────────
  console.log('--- Suite 1: Permanent Media Registry Storage ---');

  const testMediaItem = {
    id: 'med_test_perm_01',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
    mediaType: 'IMAGE',
    provenance: 'BUSINESS_PROVIDED',
    status: 'ACTIVE',
    caption: 'Test Gym Storefront',
    sortOrder: 1,
    dateAdded: '2026-09-04'
  };

  savePermanentBusinessMedia(
    ['biz_perm_100', 'CFX-IN-WB-NAD-000100', 'test-gym-store'],
    [testMediaItem],
    testMediaItem.url
  );

  const byId = getPermanentBusinessMedia('biz_perm_100');
  assert(
    'Retrieves permanently stored media by ID',
    byId !== null && byId.media.length === 1 && byId.media[0].url === testMediaItem.url
  );

  const byCfxId = getPermanentBusinessMedia('CFX-IN-WB-NAD-000100');
  assert(
    'Retrieves permanently stored media by Conflux Business ID',
    byCfxId !== null && byCfxId.media.length === 1 && byCfxId.media[0].id === 'med_test_perm_01'
  );

  const bySlug = getPermanentBusinessMedia('test-gym-store');
  assert(
    'Retrieves permanently stored media by Slug',
    bySlug !== null && bySlug.storefrontPhotoUrl === testMediaItem.url
  );

  const byUpperSlug = getPermanentBusinessMedia('TEST-GYM-STORE');
  assert(
    'Retrieves permanently stored media case-insensitively',
    byUpperSlug !== null && byUpperSlug.media.length === 1
  );

  // ── TEST 2: Update Business with Image Persists Permanently ─────────
  console.log('\n--- Suite 2: updateBusiness Permanent Persistence ---');

  const sampleBiz = await businessService.createBusiness({
    name: 'Royal Fitness Store',
    businessType: 'LOCAL_BUSINESS',
    categoryId: 'retail-trade',
    description: 'Premier fitness equipment and supplements in Ranaghat',
    district: 'nadia',
    city: 'ranaghat',
    fullAddress: 'Main Market Road, Ranaghat, Nadia, 741201'
  });

  const photoUrl = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f';
  const newMedia = [
    {
      id: `med_${sampleBiz.id}_01`,
      url: photoUrl,
      mediaType: 'IMAGE',
      sourceUrl: photoUrl,
      sourceName: 'Storefront Entrance Photo',
      attribution: 'Provided by owner',
      dateAdded: '2026-09-04',
      provenance: 'BUSINESS_PROVIDED',
      status: 'ACTIVE',
      caption: 'Royal Fitness Store — Frontage & Reception',
      sortOrder: 1
    }
  ];

  const updatedBiz = await businessService.updateBusiness(sampleBiz.id, {
    storefrontPhotoUrl: photoUrl,
    media: newMedia
  });

  assert(
    'updateBusiness returns updated storefrontPhotoUrl',
    updatedBiz.storefrontPhotoUrl === photoUrl
  );

  assert(
    'updateBusiness returns updated media array with image',
    updatedBiz.media.length === 1 && updatedBiz.media[0].url === photoUrl
  );

  const fetchedById = await businessService.getBusinessById(sampleBiz.id);
  assert(
    'getBusinessById retrieves permanent image',
    fetchedById !== null &&
    fetchedById.storefrontPhotoUrl === photoUrl &&
    fetchedById.media.length === 1 &&
    fetchedById.media[0].url === photoUrl
  );

  const fetchedBySlug = await businessService.getBusinessBySlug(sampleBiz.slug);
  assert(
    'getBusinessBySlug retrieves permanent image',
    fetchedBySlug !== null &&
    fetchedBySlug.storefrontPhotoUrl === photoUrl &&
    fetchedBySlug.media.length === 1
  );

  // ── TEST 3: Hydration from Supabase Row with verification_breakdown ─
  console.log('\n--- Suite 3: Database Row Hydration with Packed Media ---');

  // Simulate a Supabase row where media column is absent, but verification_breakdown has media
  const rawDbRow = {
    id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
    conflux_business_id: 'CFX-IN-WB-NAD-000999',
    slug: 'apex-nutrition-hub',
    name: 'Apex Nutrition Hub',
    business_type: 'LOCAL_BUSINESS',
    category_id: 'retail-trade',
    storefront_photo_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
    description: 'High performance sports nutrition hub.',
    status: 'PUBLISHED',
    claim_status: 'UNCLAIMED_PUBLIC',
    verification_status: 'SUPPORTED',
    verification_level: 'STATUTORY_VERIFIED',
    confidence_score: 95.0,
    verification_breakdown: {
      identityVerified: true,
      media: [
        {
          id: 'med_apex_01',
          url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
          mediaType: 'IMAGE',
          provenance: 'BUSINESS_PROVIDED',
          status: 'ACTIVE',
          caption: 'Apex Nutrition Hub Frontage'
        }
      ]
    },
    location: {
      id: 'loc_apex_01',
      district: 'nadia',
      city: 'ranaghat',
      full_address: 'College Street, Ranaghat, 741201'
    },
    capabilities: []
  };

  const mappedBiz = businessService['mapSupabaseRowToBusiness'](rawDbRow);
  assert(
    'mapSupabaseRowToBusiness extracts media from verification_breakdown',
    mappedBiz.media.length === 1 && mappedBiz.media[0].url === rawDbRow.storefront_photo_url
  );

  assert(
    'mapSupabaseRowToBusiness resolves effective storefrontPhotoUrl',
    mappedBiz.storefrontPhotoUrl === rawDbRow.storefront_photo_url
  );

  // ── TEST 4: Fallback Storefront Synthesis when media array is empty ───
  console.log('\n--- Suite 4: Fallback Synthesis from storefront_photo_url ---');

  const rawRowNoMedia = {
    id: 'a1b2c3d4-0000-0000-0000-000000000001',
    conflux_business_id: 'CFX-IN-WB-NAD-000888',
    slug: 'delta-wellness-center',
    name: 'Delta Wellness Center',
    business_type: 'LOCAL_BUSINESS',
    category_id: 'health-services',
    storefront_photo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    description: 'Holistic wellness center.',
    status: 'PUBLISHED',
    claim_status: 'UNCLAIMED_PUBLIC',
    verification_status: 'UNVERIFIED',
    location: { full_address: 'Main Road' },
    capabilities: []
  };

  const synthesizedBiz = businessService['mapSupabaseRowToBusiness'](rawRowNoMedia);
  assert(
    'Synthesizes active business photo when storefront_photo_url exists but media array is empty',
    synthesizedBiz.media.length === 1 &&
    synthesizedBiz.media[0].url === rawRowNoMedia.storefront_photo_url &&
    synthesizedBiz.media[0].provenance === 'BUSINESS_PROVIDED' &&
    synthesizedBiz.media[0].mediaType === 'IMAGE'
  );

  // ── TEST 5: A2Z Supplements Media Permanent Retention ───────────────
  console.log('\n--- Suite 5: A2Z Supplements Media Permanent Retention ---');

  const a2zRow = {
    id: 'e6a51e32-e20b-4830-b743-f8337cce2f2b',
    conflux_business_id: 'CFX-IN-WB-NAD-000001',
    slug: 'a2z-supplements',
    name: 'A2Z Supplements',
    storefront_photo_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
    description: 'Authentic sports nutrition and supplements in Birnagar',
    status: 'PUBLISHED',
    claim_status: 'UNCLAIMED_PUBLIC',
    verification_status: 'UNVERIFIED',
    location: { city: 'Birnagar', district: 'nadia' },
    capabilities: []
  };

  const a2zBiz = businessService['mapSupabaseRowToBusiness'](a2zRow);
  assert(
    'A2Z Supplements preserves genuine storefront photo permanently',
    a2zBiz.media.length === 1 && a2zBiz.media[0].url === a2zRow.storefront_photo_url
  );

  assert(
    'A2Z Supplements has valid BUSINESS_PROVIDED provenance',
    a2zBiz.media[0].provenance === 'BUSINESS_PROVIDED'
  );

  // ── TEST 6: Admin Auto-Enrich preserves Admin Added Media ────────────
  console.log('\n--- Suite 6: Admin Added Media is Never Overwritten ---');

  const adminPhoto = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61';
  const customAdminMedia = [
    {
      id: 'med_admin_custom_01',
      url: adminPhoto,
      mediaType: 'IMAGE',
      provenance: 'ADMIN_ADDED',
      status: 'ACTIVE',
      caption: 'Owner verified shelf stock',
      sortOrder: 1
    }
  ];

  await businessService.updateBusiness(a2zBiz.id, {
    media: customAdminMedia,
    storefrontPhotoUrl: adminPhoto
  });

  const reFetchedA2Z = await businessService.getBusinessById(a2zBiz.id);
  assert(
    'Admin-added photo persists and is returned on subsequent fetch',
    reFetchedA2Z !== null &&
    reFetchedA2Z.media.length === 1 &&
    reFetchedA2Z.media[0].url === adminPhoto &&
    reFetchedA2Z.media[0].provenance === 'ADMIN_ADDED'
  );

  console.log('\n======================================================');
  console.log(`PERMANENT MEDIA TEST SUMMARY: ${passCount} / ${totalChecks} TESTS PASSED`);
  console.log('======================================================\n');

  if (passCount !== totalChecks) {
    process.exit(1);
  }
}

runPermanentMediaTests().catch(err => {
  console.error('Test suite uncaught exception:', err);
  process.exit(1);
});
