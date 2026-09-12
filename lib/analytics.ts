/**
 * Conflux AI — Google Analytics 4 (GA4) Integration
 * Property: confluxai.in
 * Measurement ID: G-4T4BL0LKQ5
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-4T4BL0LKQ5';

/**
 * Deterministically records a page_view event in Google Analytics 4 for SPA route transitions
 */
export const trackPageView = (title: string, url?: string, path?: string): void => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: title,
        page_location: url || window.location.href,
        page_path: path || (window.location.pathname + window.location.search + window.location.hash)
      });
    }
  } catch (err) {
    // Fail-safe: GA4 tracking must never interrupt application execution
    console.warn('[GA4 Analytics] trackPageView notice:', err);
  }
};

/**
 * Dispatches custom GA4 interaction events (e.g. click-to-call, WhatsApp routing, lead submissions)
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}): void => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (err) {
    // Fail-safe: GA4 tracking must never interrupt application execution
    console.warn('[GA4 Analytics] trackEvent notice:', err);
  }
};

/**
 * Canonical logEvent alias delegating to trackEvent for backwards-compatibility
 */
export const logEvent = (eventName: string, params: Record<string, any> = {}): void => {
  trackEvent(eventName, params);
};

export default {
  trackPageView,
  trackEvent,
  logEvent
};
