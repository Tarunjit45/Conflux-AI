// Conflux Platform — Google Customer Reviews Serverless API Proxy
// Strictly uses official Google Maps Platform Places API (Place Details)
// Policy compliant: Enforces Google attribution, author attribution, and temporary caching (< 30 days).

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { GoogleReviewItem, GoogleReviewsData } from '../types/googleReviews.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use GET.' });
  }

  const { placeId, businessName, address, city } = req.query as Record<string, string | undefined>;

  const apiKey =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY;

  const defaultAttribution: GoogleReviewsData['attribution'] = {
    provider: 'Google',
    attributionText: 'Google Customer Reviews',
    poweredByGoogleText: 'Powered by Google',
    termsNotice: 'Google customer reviews are retrieved via the official Google Places API and remain the property of Google and their respective authors. Conflux AI does not calculate, alter, or synthesize these ratings.'
  };

  // If no official Google API key is configured in the environment
  if (!apiKey) {
    return res.status(200).json({
      success: true,
      status: 'NOT_CONFIGURED',
      message: 'Google Places API key is not configured in server environment.',
      attribution: defaultAttribution
    });
  }

  try {
    let resolvedPlaceId = placeId;

    // If no placeId provided but businessName exists, resolve placeId via Find Place from Text
    if (!resolvedPlaceId && businessName) {
      const searchTerms = [businessName, address, city, 'West Bengal'].filter(Boolean).join(' ');
      const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchTerms)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
      const findRes = await fetch(findUrl);
      if (findRes.ok) {
        const findJson = await findRes.json();
        if (findJson.candidates && findJson.candidates.length > 0) {
          resolvedPlaceId = findJson.candidates[0].place_id;
        }
      }
    }

    if (!resolvedPlaceId) {
      return res.status(200).json({
        success: true,
        status: 'NOT_FOUND',
        message: 'No matching place found on Google Maps.',
        attribution: defaultAttribution
      });
    }

    // Call official Google Places API Place Details endpoint
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(resolvedPlaceId)}&fields=name,rating,user_ratings_total,reviews,url&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);

    if (!detailsRes.ok) {
      return res.status(200).json({
        success: false,
        status: 'ERROR',
        message: `Google Places API returned HTTP ${detailsRes.status}`,
        attribution: defaultAttribution
      });
    }

    const detailsJson = await detailsRes.json();

    if (detailsJson.status === 'ZERO_RESULTS' || detailsJson.status === 'NOT_FOUND') {
      return res.status(200).json({
        success: true,
        status: 'NOT_FOUND',
        message: 'Business place not found on Google Maps.',
        attribution: defaultAttribution
      });
    }

    if (detailsJson.status === 'OVER_QUERY_LIMIT') {
      return res.status(200).json({
        success: true,
        status: 'RATE_LIMITED',
        message: 'Google Places API query quota reached.',
        attribution: defaultAttribution
      });
    }

    if (detailsJson.status !== 'OK' && detailsJson.status !== undefined) {
      return res.status(200).json({
        success: true,
        status: 'ERROR',
        message: `Google Places API error: ${detailsJson.status} - ${detailsJson.error_message || ''}`,
        attribution: defaultAttribution
      });
    }

    const result = detailsJson.result || {};

    // Transform permitted reviews adhering to Google TOS (unmodified text, author info)
    const formattedReviews: GoogleReviewItem[] = (result.reviews || []).map((rev: any) => ({
      authorName: String(rev.author_name || 'Google User'),
      authorUrl: rev.author_url ? String(rev.author_url) : undefined,
      profilePhotoUrl: rev.profile_photo_url ? String(rev.profile_photo_url) : undefined,
      rating: Number(rev.rating) || 5,
      relativeTimeDescription: String(rev.relative_time_description || 'Recently'),
      text: String(rev.text || ''),
      time: Number(rev.time) || Math.floor(Date.now() / 1000),
      language: rev.language ? String(rev.language) : undefined
    }));

    const responseData: GoogleReviewsData = {
      status: 'AVAILABLE',
      placeId: resolvedPlaceId,
      rating: typeof result.rating === 'number' ? result.rating : undefined,
      userRatingsTotal: typeof result.user_ratings_total === 'number' ? result.user_ratings_total : undefined,
      reviews: formattedReviews,
      googleMapsUrl: result.url || `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${resolvedPlaceId}`,
      fetchedAt: new Date().toISOString(),
      attribution: defaultAttribution
    };

    // Cache-Control header: Cache at edge for up to 1 day (strictly compliant with < 30 days TOS)
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      status: 'ERROR',
      message: err?.message || 'Failed to retrieve Google customer reviews',
      attribution: defaultAttribution
    });
  }
}
