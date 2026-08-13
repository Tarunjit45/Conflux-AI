import { LocationEvent } from '../types/location';

const STORAGE_KEY = 'conflux_location_analytics_events';

export const trackLocationEvent = (
  eventName: LocationEvent['eventName'],
  locationSlug: string
) => {
  const event: LocationEvent = {
    eventName,
    locationSlug,
    timestamp: new Date().toISOString()
  };

  // Log cleanly to browser console in development/production
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const events: LocationEvent[] = existing ? JSON.parse(existing) : [];
      events.push(event);
      // Keep last 200 events locally
      if (events.length > 200) events.shift();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      
      console.log(`[Location Analytics] Event tracked:`, event);
    } catch (e) {
      console.warn('[Location Analytics] Storage warning:', e);
    }
  }
};

export const getLocationEventStats = (): Record<string, Record<string, number>> => {
  if (typeof window === 'undefined') return {};
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const events: LocationEvent[] = existing ? JSON.parse(existing) : [];
    
    const stats: Record<string, Record<string, number>> = {};
    events.forEach(ev => {
      if (!stats[ev.locationSlug]) stats[ev.locationSlug] = {};
      stats[ev.locationSlug][ev.eventName] = (stats[ev.locationSlug][ev.eventName] || 0) + 1;
    });
    return stats;
  } catch (e) {
    return {};
  }
};
