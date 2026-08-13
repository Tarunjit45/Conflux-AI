import { LocationEvent } from '../types/location';

const STORAGE_KEY = 'conflux_location_analytics_events';

export interface ExtendedAnalyticsEvent extends LocationEvent {
  industryId?: string;
  problemId?: string;
  articleSlug?: string;
}

export interface AnalyticsSummaryItem {
  locationSlug: string;
  locationName: string;
  views: number;
  enquiries: number;
  clients: number;
  topIndustry?: string;
  topProblem?: string;
}

export const trackLocationEvent = (
  eventName: LocationEvent['eventName'] | 'client_conversion',
  locationSlug: string,
  industryId?: string,
  problemId?: string,
  articleSlug?: string
) => {
  const event: ExtendedAnalyticsEvent = {
    eventName: eventName as any,
    locationSlug,
    industryId,
    problemId,
    articleSlug,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const events: ExtendedAnalyticsEvent[] = existing ? JSON.parse(existing) : [];
      events.push(event);
      if (events.length > 500) events.shift();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn('[Location Analytics] Storage warning:', e);
    }
  }
};

export const getLocationEventStats = (): Record<string, Record<string, number>> => {
  if (typeof window === 'undefined') return {};
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const events: ExtendedAnalyticsEvent[] = existing ? JSON.parse(existing) : [];
    
    const stats: Record<string, Record<string, number>> = {};
    events.forEach(ev => {
      const loc = ev.locationSlug || 'general';
      if (!stats[loc]) stats[loc] = {};
      stats[loc][ev.eventName] = (stats[loc][ev.eventName] || 0) + 1;
    });
    return stats;
  } catch (e) {
    return {};
  }
};

export const getAnalyticsSummaryByLocation = (): Record<string, { views: number; enquiries: number; clients: number }> => {
  if (typeof window === 'undefined') return {};
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const events: ExtendedAnalyticsEvent[] = existing ? JSON.parse(existing) : [];

    const summary: Record<string, { views: number; enquiries: number; clients: number }> = {};
    
    events.forEach(ev => {
      const loc = ev.locationSlug || 'loc-bagula';
      if (!summary[loc]) summary[loc] = { views: 0, enquiries: 0, clients: 0 };

      if (ev.eventName === 'page_view') {
        summary[loc].views += 1;
      } else if (ev.eventName === 'whatsapp_click' || ev.eventName === 'contact_click' || ev.eventName === 'consultation_click') {
        summary[loc].enquiries += 1;
      } else if (ev.eventName === 'client_conversion') {
        summary[loc].clients += 1;
      }
    });

    return summary;
  } catch (e) {
    return {};
  }
};
