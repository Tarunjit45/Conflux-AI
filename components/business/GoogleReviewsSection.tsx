// Conflux Platform — Google Customer Reviews Section
// Compliant with Google Maps Platform Terms of Service, Display & Attribution Policies.
// Explicitly separated from Conflux Internal Contributions & Trust Scores. Zero Fabrication.

import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, ShieldCheck, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import type { ConfluxBusiness } from '../../types/business.ts';
import type { GoogleReviewsData } from '../../types/googleReviews.ts';
import { googleReviewsService } from '../../lib/googleReviewsService.ts';

interface GoogleReviewsSectionProps {
  business: ConfluxBusiness;
}

export const GoogleReviewsSection: React.FC<GoogleReviewsSectionProps> = ({ business }) => {
  const [reviewsData, setReviewsData] = useState<GoogleReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    googleReviewsService.getGoogleReviews(business)
      .then(data => {
        if (isMounted) {
          setReviewsData(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Fail-open: Never break profile render
          const fallback = {
            status: 'NOT_CONFIGURED' as const,
            googleMapsUrl: googleReviewsService.resolveGoogleMapsUrl(business),
            attribution: {
              provider: 'Google' as const,
              attributionText: 'Google Customer Reviews',
              poweredByGoogleText: 'Powered by Google',
              termsNotice: 'Google customer reviews are retrieved via official Google Places API and remain the property of Google.'
            },
            message: 'Unable to reach Google Places API. You can view ratings directly on Google Maps.'
          };
          setReviewsData(fallback);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [business.id, business.slug, business.contact?.googleMapsUrl, business.googlePlaceId]);

  const hasReviews = reviewsData?.status === 'AVAILABLE' && (reviewsData?.rating !== undefined || (reviewsData?.reviews && reviewsData.reviews.length > 0));
  const googleMapsUrl = reviewsData?.googleMapsUrl || googleReviewsService.resolveGoogleMapsUrl(business);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
      {/* ── HEADER & OFFICIAL GOOGLE BRANDING ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Official Google G Icon */}
            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center p-1 shadow-xs">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Google Customer Reviews
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              External &bull; Google Maps Platform
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Public reviews and star ratings published by Google Maps users for {business.name}.
          </p>
        </div>

        {/* View on Google Button (Always available where link exists) */}
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all border border-slate-200 shrink-0 cursor-pointer min-h-[40px]"
          >
            <span>View on Google</span>
            <ExternalLink size={13} className="text-slate-500" />
          </a>
        )}
      </div>

      {/* ── LOADING SKELETON ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-8 text-center space-y-2">
          <div className="inline-block animate-spin text-slate-400">
            <RefreshCw size={18} />
          </div>
          <p className="text-xs text-slate-400 font-medium">Connecting to Google Places API...</p>
        </div>
      ) : hasReviews ? (
        /* ── CASE 1: REVIEWS AVAILABLE ─────────────────────────────────── */
        <div className="space-y-6">
          {/* Overall Rating Banner */}
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {reviewsData?.rating?.toFixed(1) || '—'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={(reviewsData?.rating || 0) >= star ? 'currentColor' : 'none'}
                      className={(reviewsData?.rating || 0) >= star ? 'text-amber-500' : 'text-slate-300'}
                    />
                  ))}
                </div>
                <div className="text-xs font-bold text-slate-700">
                  {reviewsData?.userRatingsTotal
                    ? `Based on ${reviewsData.userRatingsTotal.toLocaleString()} Google reviews`
                    : 'Official Google star rating'}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Official Google Place Data
              </span>
            </div>
          </div>

          {/* Permitted Reviews Grid (Up to 5 returned by Google) */}
          {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recent Reviews on Google
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviewsData.reviews.map((rev, index) => (
                  <div
                    key={`${rev.time}-${index}`}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 text-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {rev.profilePhotoUrl ? (
                            <img
                              src={rev.profilePhotoUrl}
                              alt={rev.authorName}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {rev.authorName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 truncate">
                            {rev.authorUrl ? (
                              <a
                                href={rev.authorUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-slate-900 hover:text-blue-600 truncate block hover:underline"
                              >
                                {rev.authorName}
                              </a>
                            ) : (
                              <span className="font-bold text-slate-900 truncate block">
                                {rev.authorName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                          {Array.from({ length: Math.min(5, Math.max(1, rev.rating)) }).map((_, i) => (
                            <Star key={i} size={11} fill="currentColor" />
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      {rev.text ? (
                        <p className="text-slate-700 leading-relaxed line-clamp-4">
                          &ldquo;{rev.text}&rdquo;
                        </p>
                      ) : (
                        <p className="text-slate-400 italic text-[11px]">
                          Rated {rev.rating} stars on Google without written review.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60 font-medium">
                      <span>{rev.relativeTimeDescription}</span>
                      <span className="text-slate-400">via Google</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : reviewsData?.status === 'PLACE_LINKED' ? (
        /* ── CASE 2: GOOGLE MAPS LINKED BUT API KEY PENDING / OFFLINE ────── */
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <h4 className="text-sm font-bold text-slate-900">
                  Google Maps Listing Linked
                </h4>
              </div>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                This business has a verified Google Maps listing. Official Google Places API live review synchronization connects when the Google Cloud API key is configured.
              </p>
            </div>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm shrink-0 min-h-[40px]"
              >
                <span>Read Reviews on Google Maps</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      ) : (
        /* ── CASE 3: NO GOOGLE PROFILE LINKED YET ────────────────────────── */
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <div className="text-sm font-bold text-slate-800">
            No Google Reviews currently linked
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Conflux never fabricates third-party reviews. When this business links their Google Business Profile or Google Maps listing, official customer reviews will be displayed here.
          </p>
          {googleMapsUrl && (
            <div className="pt-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Search for {business.name} on Google Maps</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── MANDATORY GOOGLE ATTRIBUTION & TERMS NOTICE ───────────────── */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-medium">
        <span>
          Powered by <strong>Google Maps Platform</strong> &bull; All review content &copy; Google and respective authors.
        </span>
        <span className="italic">
          Conflux AI strictly maintains separate trust verification and does not compute aggregate scores from external reviews.
        </span>
      </div>
    </div>
  );
};
