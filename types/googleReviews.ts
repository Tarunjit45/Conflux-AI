// Conflux Platform — Google Customer Reviews Types & Policy-Compliant Data Models

/**
 * Individual review item returned by official Google Places API
 * Strictly adheres to Google Maps Platform Terms of Service
 */
export interface GoogleReviewItem {
  authorName: string;
  authorUrl?: string;
  profilePhotoUrl?: string;
  rating: number; // 1 to 5 integer
  relativeTimeDescription: string; // e.g. "a month ago"
  text: string; // Unmodified review text as provided by Google
  time: number; // Unix timestamp in seconds
  language?: string;
}

export type GoogleReviewsStatus =
  | 'AVAILABLE'        // Reviews and rating successfully fetched via official API
  | 'NOT_CONFIGURED'   // Google Places API key not configured yet; fallback active
  | 'PLACE_LINKED'     // Google Maps URL linked by business; direct link available
  | 'NOT_FOUND'        // Place ID or matching location not found on Google Maps
  | 'RATE_LIMITED'     // Google API quota exceeded; fallback active
  | 'ERROR';           // Network or service failure; fail-open fallback active

/**
 * Full Google Customer Reviews payload for a Conflux business entity
 * Explicitly separates external Google data from Conflux Verified evidence and trust scoring.
 */
export interface GoogleReviewsData {
  status: GoogleReviewsStatus;
  placeId?: string;
  rating?: number; // Overall Google average rating (1.0 - 5.0)
  userRatingsTotal?: number; // Total count of Google user ratings
  reviews?: GoogleReviewItem[]; // Up to 5 permitted reviews returned by Google Places API
  googleMapsUrl?: string; // Canonical Google Maps URL for "View on Google"
  fetchedAt?: string; // ISO 8601 timestamp for cache TTL validation (<= 30 days)
  attribution: {
    provider: 'Google';
    attributionText: string;
    poweredByGoogleText: string;
    termsNotice: string;
  };
  message?: string;
}
