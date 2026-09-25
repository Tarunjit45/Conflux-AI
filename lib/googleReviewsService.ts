// Conflux Platform — Google Customer Reviews Service Layer (Official Google Places API Architecture)
// Strictly adheres to Google Maps Platform Terms of Service & Attribution Policies.

import type { ConfluxBusiness } from '../types/business.ts';
import type { GoogleReviewItem, GoogleReviewsData } from '../types/googleReviews.ts';

const CACHE_KEY_PREFIX = 'cfx_google_reviews_';
// Google Maps Platform TOS 3.2.3(a): Caching must not exceed 30 calendar days.
// We enforce a conservative 24-hour cache TTL (86,400,000 ms).
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CachedPayload {
  timestamp: number;
  data: GoogleReviewsData;
}

const memoryReviewsCache = new Map<string, CachedPayload>();

export class GoogleReviewsService {
  /**
   * Extract or detect a Google Place ID from various Google Maps / Search URL patterns or direct strings.
   */
  extractPlaceId(placeIdOrUrl?: string): string | null {
    if (!placeIdOrUrl || typeof placeIdOrUrl !== 'string') return null;
    const trimmed = placeIdOrUrl.trim();
    if (!trimmed) return null;

    // 1. Direct Place ID (typically starts with ChIJ and ~27 characters)
    if (/^ChIJ[A-Za-z0-9_-]{20,35}$/.test(trimmed)) {
      return trimmed;
    }

    // 2. Query param place_id: e.g. ?place_id=ChIJ... or &place_id=ChIJ...
    const placeIdParamMatch = trimmed.match(/[?&]place_id=(ChIJ[A-Za-z0-9_-]+)/);
    if (placeIdParamMatch?.[1]) {
      return placeIdParamMatch[1];
    }

    // 3. Google Maps data parameter embedded place ID: !1s(ChIJ...)
    const dataMatch = trimmed.match(/!1s(ChIJ[A-Za-z0-9_-]+)/);
    if (dataMatch?.[1]) {
      return dataMatch[1];
    }

    return null;
  }

  /**
   * Resolve best canonical Google Maps URL for "View on Google" link.
   */
  resolveGoogleMapsUrl(business: ConfluxBusiness, placeId?: string): string {
    if (business.contact?.googleMapsUrl && business.contact.googleMapsUrl.startsWith('http')) {
      return business.contact.googleMapsUrl;
    }
    if (business.onlineSources?.googleBusinessUrl && business.onlineSources.googleBusinessUrl.startsWith('http')) {
      return business.onlineSources.googleBusinessUrl;
    }
    if (placeId) {
      return `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(placeId)}`;
    }
    const locationStr = [business.location?.locality, business.location?.city, business.location?.district]
      .filter(Boolean)
      .join(' ');
    const query = `${business.name} ${locationStr} West Bengal`.trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  /**
   * Get cached reviews if fresh (TTL <= 24 hours).
   */
  getCachedReviews(cacheKey: string): GoogleReviewsData | null {
    // 1. In-memory check
    const mem = memoryReviewsCache.get(cacheKey);
    if (mem && Date.now() - mem.timestamp < CACHE_TTL_MS) {
      return mem.data;
    }

    // 2. Storage check
    if (typeof sessionStorage !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + cacheKey);
        if (raw) {
          const parsed: CachedPayload = JSON.parse(raw);
          if (parsed && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            memoryReviewsCache.set(cacheKey, parsed);
            return parsed.data;
          }
        }
      } catch {
        // Storage quota / privacy mode guard
      }
    }

    return null;
  }

  /**
   * Set cached reviews with timestamp for TTL enforcement.
   */
  setCachedReviews(cacheKey: string, data: GoogleReviewsData): void {
    const payload: CachedPayload = {
      timestamp: Date.now(),
      data
    };
    memoryReviewsCache.set(cacheKey, payload);

    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(CACHE_KEY_PREFIX + cacheKey, JSON.stringify(payload));
      } catch {
        // Storage quota guard
      }
    }
  }

  /**
   * Primary method: Retrieve Google Reviews for any business listed on Conflux.
   * Never throws, never fabricates ratings, strictly adheres to official Google attribution.
   */
  async getGoogleReviews(business: ConfluxBusiness): Promise<GoogleReviewsData> {
    const cacheKey = business.id || business.slug || business.confluxBusinessId;
    const cached = this.getCachedReviews(cacheKey);
    if (cached) {
      return cached;
    }

    const placeId =
      business.googlePlaceId ||
      this.extractPlaceId(business.contact?.googlePlaceId) ||
      this.extractPlaceId(business.contact?.googleMapsUrl) ||
      this.extractPlaceId(business.onlineSources?.googleBusinessUrl) ||
      undefined;

    const mapsUrl = this.resolveGoogleMapsUrl(business, placeId);
    const hasLinkedGoogleProfile = Boolean(
      placeId ||
      (business.contact?.googleMapsUrl && business.contact.googleMapsUrl.startsWith('http')) ||
      (business.onlineSources?.googleBusinessUrl && business.onlineSources.googleBusinessUrl.startsWith('http'))
    );

    // Default attribution object required by Google Maps Platform guidelines
    const defaultAttribution: GoogleReviewsData['attribution'] = {
      provider: 'Google',
      attributionText: 'Google Customer Reviews',
      poweredByGoogleText: 'Powered by Google',
      termsNotice: 'Google customer reviews are retrieved via the official Google Places API and remain the property of Google and their respective authors. Conflux AI does not calculate, alter, or synthesize these ratings.'
    };

    // Attempt to query the backend serverless proxy endpoint
    try {
      const queryParams = new URLSearchParams();
      if (placeId) queryParams.set('placeId', placeId);
      if (business.name) queryParams.set('businessName', business.name);
      if (business.location?.fullAddress) queryParams.set('address', business.location.fullAddress);
      if (business.location?.city) queryParams.set('city', business.location.city);

      const endpoint = `/api/google-reviews?${queryParams.toString()}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload?.success && payload.data) {
          const liveData: GoogleReviewsData = {
            status: payload.data.status || 'AVAILABLE',
            placeId: payload.data.placeId || placeId,
            rating: typeof payload.data.rating === 'number' ? payload.data.rating : undefined,
            userRatingsTotal: typeof payload.data.userRatingsTotal === 'number' ? payload.data.userRatingsTotal : undefined,
            reviews: Array.isArray(payload.data.reviews) ? payload.data.reviews : [],
            googleMapsUrl: payload.data.googleMapsUrl || mapsUrl,
            fetchedAt: new Date().toISOString(),
            attribution: defaultAttribution,
            message: payload.data.message
          };
          this.setCachedReviews(cacheKey, liveData);
          return liveData;
        } else if (payload?.status === 'NOT_CONFIGURED') {
          const fallbackData: GoogleReviewsData = {
            status: hasLinkedGoogleProfile ? 'PLACE_LINKED' : 'NOT_CONFIGURED',
            placeId,
            googleMapsUrl: mapsUrl,
            attribution: defaultAttribution,
            message: hasLinkedGoogleProfile
              ? 'Google Maps listing linked. Official Google Places API live review feed will sync once Google Cloud API key is configured.'
              : 'Google Places API is not configured yet. Business owner can link their Google Business Profile to display official ratings.'
          };
          this.setCachedReviews(cacheKey, fallbackData);
          return fallbackData;
        }
      }
    } catch {
      // Serverless API offline or local dev without serverless runtime
    }

    // Fallback when API endpoint is unreachable or not yet configured:
    // Strictly zero fabrication: If Google Maps profile is linked, display link with clear status;
    // if no Google profile is linked, display clean empty room fallback.
    const fallbackResult: GoogleReviewsData = {
      status: hasLinkedGoogleProfile ? 'PLACE_LINKED' : 'NOT_CONFIGURED',
      placeId,
      googleMapsUrl: mapsUrl,
      attribution: defaultAttribution,
      message: hasLinkedGoogleProfile
        ? 'Google Maps listing linked. Official Google Places API live review feed will sync once Google Cloud API key is configured.'
        : 'No Google Maps or Business Profile listing has been linked yet for this business.'
    };

    this.setCachedReviews(cacheKey, fallbackResult);
    return fallbackResult;
  }

  /**
   * Clear cache for testing or manual refresh
   */
  clearCache(): void {
    memoryReviewsCache.clear();
    if (typeof sessionStorage !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(CACHE_KEY_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => sessionStorage.removeItem(k));
      } catch {
        // Ignore storage access errors
      }
    }
  }
}

export const googleReviewsService = new GoogleReviewsService();
