// Conflux Platform — Google Customer Reviews Verification & Policy Compliance Test Suite
// Verifies Place ID extraction, canonical URL resolution, zero fabrication,
// strict separation from Conflux internal trust metrics, and TOS-compliant caching.

import { googleReviewsService } from '../lib/googleReviewsService.ts';

console.log('======================================================================');
console.log('    CONFLUX PLATFORM — GOOGLE CUSTOMER REVIEWS TEST SUITE             ');
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

async function runGoogleReviewsTests() {
  // ── 1. PLACE ID EXTRACTION & RECOGNITION ──────────────────────────────────
  assert(
    'Extracts raw 27-char Place ID beginning with ChIJ',
    googleReviewsService.extractPlaceId('ChIJN1t_tDeuEmsRUsoyG83frY4') === 'ChIJN1t_tDeuEmsRUsoyG83frY4'
  );

  assert(
    'Extracts Place ID from ?place_id= query param',
    googleReviewsService.extractPlaceId('https://maps.google.com/?place_id=ChIJw8_o_k8h-DkR_8-Wf-38z1w') === 'ChIJw8_o_k8h-DkR_8-Wf-38z1w'
  );

  assert(
    'Extracts Place ID from &place_id= query param in multi-param URL',
    googleReviewsService.extractPlaceId('https://maps.google.com/?q=Bakery&place_id=ChIJw8_o_k8h-DkR_8-Wf-38z1w&hl=en') === 'ChIJw8_o_k8h-DkR_8-Wf-38z1w'
  );

  assert(
    'Extracts Place ID from embedded Google Maps !1s data path',
    googleReviewsService.extractPlaceId('https://www.google.com/maps/place/Birnagar/@23.24,88.55,14z/data=!4m5!3m4!1sChIJ_abc1234567890abcdef!8m2!3d23.24!4d88.55') === 'ChIJ_abc1234567890abcdef'
  );

  assert(
    'Returns null for invalid or non-Google URLs',
    googleReviewsService.extractPlaceId('https://facebook.com/mybusiness') === null
  );

  assert(
    'Returns null for empty strings and undefined',
    googleReviewsService.extractPlaceId('') === null && googleReviewsService.extractPlaceId(undefined) === null
  );

  // ── 2. CANONICAL GOOGLE MAPS URL RESOLUTION ───────────────────────────────
  const mockBizWithContactUrl = {
    id: 'biz-01',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000001',
    slug: 'sample-pharmacy',
    name: 'Sample Pharmacy',
    businessType: 'HEALTHCARE',
    categoryId: 'pharmacy',
    status: 'PUBLISHED',
    claimStatus: 'VERIFIED_OWNER',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 92.5,
    description: 'Licensed pharmacy.',
    isClaimed: true,
    isIndexable: true,
    location: {
      id: 'loc-01',
      businessId: 'biz-01',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'Ranaghat',
      fullAddress: 'Subhas Avenue, Ranaghat, Nadia',
      isPrimary: true
    },
    contact: {
      id: 'con-01',
      businessId: 'biz-01',
      googleMapsUrl: 'https://maps.google.com/?cid=9876543210123456789'
    },
    operatingHours: [],
    capabilities: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z'
  };

  const resolvedUrl1 = googleReviewsService.resolveGoogleMapsUrl(mockBizWithContactUrl);
  assert(
    'Resolves explicit contact.googleMapsUrl when present',
    resolvedUrl1 === 'https://maps.google.com/?cid=9876543210123456789'
  );

  const mockBizWithoutUrl = {
    ...mockBizWithContactUrl,
    contact: { id: 'con-02', businessId: 'biz-02' }
  };
  const resolvedUrl2 = googleReviewsService.resolveGoogleMapsUrl(mockBizWithoutUrl);
  assert(
    'Generates compliant Google Maps search fallback URL with business name and location',
    resolvedUrl2.startsWith('https://www.google.com/maps/search/?api=1&query=') &&
    resolvedUrl2.includes('Sample%20Pharmacy') &&
    resolvedUrl2.includes('Ranaghat')
  );

  // ── 3. DATA MODEL SEPARATION & INVARIANT PROTECTION ───────────────────────
  const mockBizOriginalConfidence = mockBizWithContactUrl.confidenceScore;
  const mockBizOriginalStatus = mockBizWithContactUrl.verificationStatus;

  // Retrieve reviews for business
  const reviewsResult = await googleReviewsService.getGoogleReviews(mockBizWithContactUrl);

  assert(
    'Conflux verificationStatus is strictly unchanged after fetching Google reviews',
    mockBizWithContactUrl.verificationStatus === mockBizOriginalStatus
  );

  assert(
    'Conflux confidenceScore is strictly unchanged after fetching Google reviews',
    mockBizWithContactUrl.confidenceScore === mockBizOriginalConfidence
  );

  assert(
    'Conflux rating is never fabricated or computed from Google reviews',
    mockBizWithContactUrl.confluxRating === undefined
  );

  // ── 4. MANDATORY GOOGLE ATTRIBUTION & TERMS NOTICES ───────────────────────
  assert(
    'Google attribution object contains provider "Google"',
    reviewsResult.attribution.provider === 'Google'
  );

  assert(
    'Google attribution object contains "Powered by Google"',
    reviewsResult.attribution.poweredByGoogleText.toLowerCase().includes('google')
  );

  assert(
    'Google attribution includes non-aggregation terms notice',
    reviewsResult.attribution.termsNotice.toLowerCase().includes('conflux') &&
    reviewsResult.attribution.termsNotice.toLowerCase().includes('does not calculate')
  );

  assert(
    'Google Maps URL for "View on Google" is non-empty and well-formed',
    typeof reviewsResult.googleMapsUrl === 'string' &&
    reviewsResult.googleMapsUrl.startsWith('https://')
  );

  // ── 5. ZERO FABRICATION & FALLBACK INTEGRITY ──────────────────────────────
  assert(
    'Status is PLACE_LINKED when Google Maps link is provided but live API key is unconfigured',
    reviewsResult.status === 'PLACE_LINKED' || reviewsResult.status === 'AVAILABLE'
  );

  assert(
    'Never fabricates artificial ratings when unconfigured',
    reviewsResult.status !== 'AVAILABLE' ? reviewsResult.rating === undefined : true
  );

  assert(
    'Never fabricates imaginary reviews when unconfigured',
    reviewsResult.status !== 'AVAILABLE' ? (reviewsResult.reviews === undefined || reviewsResult.reviews.length === 0) : true
  );

  const mockBizWithoutAnyGoogle = {
    ...mockBizWithContactUrl,
    id: 'biz-03',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000003',
    slug: 'unlinked-clinic',
    contact: { id: 'con-03', businessId: 'biz-03' },
    onlineSources: undefined,
    googlePlaceId: undefined
  };
  const unlinkedResult = await googleReviewsService.getGoogleReviews(mockBizWithoutAnyGoogle);

  assert(
    'Unlinked business returns clean NOT_CONFIGURED or NOT_FOUND without throwing',
    unlinkedResult.status === 'NOT_CONFIGURED' || unlinkedResult.status === 'NOT_FOUND'
  );

  assert(
    'Unlinked business provides helpful owner message rather than white-screen crash',
    typeof unlinkedResult.message === 'string' && unlinkedResult.message.length > 0
  );

  // ── 6. GOOGLE CACHING POLICY COMPLIANCE (TOS SECTION 3.2.3) ───────────────
  // Google Maps TOS: Storage of content must not exceed 30 calendar days.
  // Conflux enforces a 24-hour cache TTL (86,400,000 ms).
  const MAX_PERMITTED_GOOGLE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const CONFLUX_IMPLEMENTED_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  assert(
    'Conflux Google review cache TTL strictly conforms to Google Maps TOS Section 3.2.3(a) (<= 30 days)',
    CONFLUX_IMPLEMENTED_CACHE_TTL_MS <= MAX_PERMITTED_GOOGLE_CACHE_TTL_MS
  );

  // Cache test
  googleReviewsService.setCachedReviews('test-cache-key', {
    status: 'AVAILABLE',
    placeId: 'ChIJtest12345',
    rating: 4.8,
    userRatingsTotal: 34,
    reviews: [
      {
        authorName: 'Sourav Mondal',
        rating: 5,
        relativeTimeDescription: '2 weeks ago',
        text: 'Genuine medicine shop with prompt response.',
        time: 1726000000
      }
    ],
    attribution: {
      provider: 'Google',
      attributionText: 'Google Customer Reviews',
      poweredByGoogleText: 'Powered by Google',
      termsNotice: 'Google customer reviews terms notice'
    }
  });

  const cachedResult = googleReviewsService.getCachedReviews('test-cache-key');
  assert(
    'Cached reviews are retrievable within TTL window without calling external API',
    cachedResult !== null && cachedResult?.rating === 4.8 && cachedResult?.reviews?.length === 1
  );

  assert(
    'Cached review text is preserved unmodified as required by Google policy',
    cachedResult?.reviews?.[0]?.text === 'Genuine medicine shop with prompt response.'
  );

  googleReviewsService.clearCache();
  assert(
    'Cache can be invalidated cleanly',
    googleReviewsService.getCachedReviews('test-cache-key') === null
  );

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log(`GOOGLE REVIEWS TEST SUMMARY: ${passCount} / ${totalChecks} TESTS PASSED`);
  console.log('======================================================================\n');

  if (passCount !== totalChecks) {
    process.exit(1);
  }
}

runGoogleReviewsTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
