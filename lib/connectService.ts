// Conflux Platform — Connect Telemetry & Measurement Service

import { supabase } from './supabase.ts';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ConnectEventType, ConnectEventRecord } from '../types/business.ts';
import { businessService } from './businessService.ts';

const LOCAL_STORAGE_EVENTS_KEY = 'conflux_connect_telemetry_events';

export interface MeasurementReport {
  timestamp: string;
  businessesOnboarded: {
    total: number;
    draft: number;
    published: number;
    suspended: number;
  };
  verifiedBusinesses: {
    totalVerified: number;
    supported: number;
    partiallySupported: number;
    unverified: number;
  };
  discoverySearches: {
    total: number;
    recentIntents: string[];
    avgConfidence: number;
    topMatches: Array<{
      businessName: string;
      confidence: number;
      verificationLevel: string;
    }>;
  };
  businessViews: {
    total: number;
  };
  connectActions: {
    total: number;
    breakdown: {
      whatsapp: number;
      phone: number;
      website: number;
      directions: number;
      booking: number;
      leads: number;
      views: number;
    };
    recentEvents: ConnectEventRecord[];
  };
  trustIndex: {
    score: number;
    verifiedPercentage: number;
    averageConfidence: number;
    sourceBreakdown: Record<string, number>;
  };
}

export interface BusinessActivityReport {
  businessId: string;
  businessName: string;
  totalViews: number;
  totalContactActions: number;
  whatsappClicks: number;
  phoneClicks: number;
  websiteClicks: number;
  directionsClicks: number;
  bookingClicks: number;
  leadSubmissions: number;
  leads: any[];
  recentEvents: ConnectEventRecord[];
  lastActivityAt?: string;
}

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export class ConnectService {
  private memoryEvents: ConnectEventRecord[] = [];

  constructor() {
    this.logEvent = this.logEvent.bind(this);
    this.recordConnectAction = this.recordConnectAction.bind(this);
  }

  /**
   * Primary canonical telemetry logging API.
   * Records an interaction or discovery event (human web click, business view, or AI agent query).
   * Fail-safe: Always catches internally, guarantees safe non-blocking execution.
   */
  async logEvent(params: {
    businessId?: string;
    eventType: ConnectEventType;
    channel?: 'WHATSAPP' | 'PHONE' | 'WEBSITE' | 'DIRECTIONS' | 'BOOKING' | 'HUMAN_WEB' | 'AI_AGENT_REST_API' | 'AI_AGENT_MCP';
    intentId?: string;
  }): Promise<ConnectEventRecord> {
    try {
      if (!params || !params.eventType) {
        console.warn('[ConnectService.logEvent] Missing event parameters');
        return {
          id: `evt_invalid_${Date.now()}`,
          businessId: params?.businessId || '',
          intentId: params?.intentId,
          eventType: params?.eventType || ('BUSINESS_VIEW' as ConnectEventType),
          channel: (params?.channel as any) || 'HUMAN_WEB',
          createdAt: new Date().toISOString()
        };
      }

      return await this.recordConnectAction(
        params.businessId || '',
        params.eventType,
        (params.channel as any) || 'HUMAN_WEB',
        params.intentId
      );
    } catch (err) {
      console.warn('[ConnectService.logEvent] Telemetry capture notice (fail-open):', err);
      return {
        id: `evt_fallback_${Date.now()}`,
        businessId: params?.businessId || '',
        intentId: params?.intentId,
        eventType: params?.eventType || ('BUSINESS_VIEW' as ConnectEventType),
        channel: (params?.channel as any) || 'HUMAN_WEB',
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Records a user intent to connect with a business
   * Writes simultaneously to Supabase connect_telemetry_events and fallback memory
   */
  async recordConnectAction(
    businessId: string,
    eventType: ConnectEventType,
    channel: 'WHATSAPP' | 'PHONE' | 'WEBSITE' | 'DIRECTIONS' | 'BOOKING' | 'HUMAN_WEB' = 'HUMAN_WEB',
    intentId?: string
  ): Promise<ConnectEventRecord> {
    try {
      const event: ConnectEventRecord = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        businessId: businessId || '',
        intentId,
        eventType,
        channel: channel || 'HUMAN_WEB',
        sessionPseudonym: this.getOrCreateSessionPseudonym(),
        createdAt: new Date().toISOString()
      };

      // Store in memory
      this.memoryEvents.unshift(event);
      if (this.memoryEvents.length > 500) {
        this.memoryEvents = this.memoryEvents.slice(0, 500);
      }

      // Store in local storage queue (fail-safe)
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
          const events: ConnectEventRecord[] = raw ? JSON.parse(raw) : [];
          events.unshift(event);
          if (events.length > 500) events.pop();
          localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(events));
        } catch {
          // Storage quota / security guard
        }
      }

      // Attempt persistent write in Supabase
      this.persistEventToDatabase(event);

      return event;
    } catch (err) {
      console.warn('[ConnectService.recordConnectAction] Fail-open notice:', err);
      return {
        id: `evt_${Date.now()}`,
        businessId: businessId || '',
        intentId,
        eventType,
        channel: channel || 'HUMAN_WEB',
        createdAt: new Date().toISOString()
      };
    }
  }

  private async persistEventToDatabase(event: ConnectEventRecord) {
    try {
      await supabase.from('connect_telemetry_events').insert([{
        business_id: isUuid(event.businessId) ? event.businessId : null,
        intent_id: event.intentId || null,
        event_type: event.eventType,
        channel: event.channel,
        session_pseudonym: event.sessionPseudonym,
        created_at: event.createdAt
      }]);
    } catch (e) {
      // Silent telemetry fail-open
    }
  }

  private getOrCreateSessionPseudonym(): string {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return `ses_${Math.random().toString(36).substring(2, 10)}`;
      }
      let pseudonym = sessionStorage.getItem('conflux_session_pseudonym');
      if (!pseudonym) {
        pseudonym = `ses_${Math.random().toString(36).substring(2, 10)}`;
        sessionStorage.setItem('conflux_session_pseudonym', pseudonym);
      }
      return pseudonym;
    } catch {
      return `ses_${Math.random().toString(36).substring(2, 10)}`;
    }
  }

  /**
   * Retrieve all recorded telemetry events directly from Supabase (falling back to memory)
   */
  async fetchTelemetryEvents(businessId?: string, client?: SupabaseClient): Promise<ConnectEventRecord[]> {
    const db = client || supabase;
    try {
      let query = db
        .from('connect_telemetry_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          businessId: row.business_id || '',
          intentId: row.intent_id,
          eventType: row.event_type as ConnectEventType,
          channel: row.channel,
          sessionPseudonym: row.session_pseudonym,
          createdAt: row.created_at
        }));
      }
    } catch (err) {
      console.warn('[ConnectService.fetchTelemetryEvents] Database query notice, using local cache:', err);
    }

    // Fallback to local memory / storage
    const local = this.getRecordedEvents();
    if (businessId) {
      return local.filter(e => e.businessId === businessId);
    }
    return local;
  }

  /**
   * Retrieve all recorded telemetry events from local storage/memory
   */
  getRecordedEvents(): ConnectEventRecord[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
        if (raw) {
          const events: ConnectEventRecord[] = JSON.parse(raw);
          if (Array.isArray(events)) {
            return events;
          }
        }
      } catch {
        // Ignore storage parse error
      }
    }
    return this.memoryEvents;
  }

  /**
   * Retrieve leads for a specific business (enforced by RLS: owner or admin)
   */
  async getLeadsForBusiness(businessId: string, client?: SupabaseClient): Promise<any[]> {
    const db = client || supabase;
    try {
      const { data, error } = await db
        .from('leads')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ConnectService.getLeadsForBusiness] Error:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('[ConnectService.getLeadsForBusiness] Unexpected failure:', err);
      return [];
    }
  }

  /**
   * Retrieve all platform leads (enforced by RLS: admin only)
   */
  async getAllLeads(client?: SupabaseClient): Promise<any[]> {
    const db = client || supabase;
    try {
      const { data, error } = await db
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ConnectService.getAllLeads] Error:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('[ConnectService.getAllLeads] Unexpected failure:', err);
      return [];
    }
  }

  /**
   * Generate an accurate Business Activity Report for a specific business
   * Answers: "How much customer activity did Conflux generate for this business?"
   */
  async getBusinessActivityReport(businessId: string, businessName: string = 'Business', client?: SupabaseClient): Promise<BusinessActivityReport> {
    const [events, leads] = await Promise.all([
      this.fetchTelemetryEvents(businessId, client),
      this.getLeadsForBusiness(businessId, client)
    ]);

    const viewEvents = events.filter(e => e.eventType === 'BUSINESS_VIEW');
    const callEvents = events.filter(e => e.eventType === 'PHONE_CLICK');
    const waEvents = events.filter(e => e.eventType === 'WHATSAPP_CLICK');
    const webEvents = events.filter(e => e.eventType === 'WEBSITE_CLICK');
    const dirEvents = events.filter(e => e.eventType === 'DIRECTIONS_CLICK');
    const bookEvents = events.filter(e => e.eventType === 'BOOKING_CLICK');
    const leadEvents = events.filter(e => e.eventType === 'LEAD_SUBMITTED');

    const totalContactActions = callEvents.length + waEvents.length + webEvents.length + dirEvents.length + bookEvents.length;
    const lastActivity = events.length > 0 ? events[0].createdAt : (leads.length > 0 ? leads[0].created_at : undefined);

    return {
      businessId,
      businessName,
      totalViews: viewEvents.length,
      totalContactActions,
      whatsappClicks: waEvents.length,
      phoneClicks: callEvents.length,
      websiteClicks: webEvents.length,
      directionsClicks: dirEvents.length,
      bookingClicks: bookEvents.length,
      leadSubmissions: Math.max(leads.length, leadEvents.length),
      leads,
      recentEvents: events.slice(0, 30),
      lastActivityAt: lastActivity
    };
  }

  /**
   * Generate an accurate, real-world Measurement Report from recorded graph data
   */
  async getMeasurementReport(): Promise<MeasurementReport> {
    const [businesses, events, leads] = await Promise.all([
      businessService.getAllBusinesses(),
      this.fetchTelemetryEvents(),
      this.getAllLeads()
    ]);

    const draftCount = businesses.filter(b => b.status === 'DRAFT').length;
    const publishedCount = businesses.filter(b => b.status === 'PUBLISHED').length;
    const suspendedCount = businesses.filter(b => b.status === 'SUSPENDED').length;

    const supportedCount = businesses.filter(b => b.verificationStatus === 'SUPPORTED').length;
    const partialCount = businesses.filter(b => b.verificationStatus === 'PARTIALLY_SUPPORTED').length;
    const unverifiedCount = businesses.filter(b => b.verificationStatus === 'UNVERIFIED').length;

    const searchEvents = events.filter(e => e.eventType === 'DISCOVERY_SEARCH');
    const viewEvents = events.filter(e => e.eventType === 'BUSINESS_VIEW');
    const callEvents = events.filter(e => e.eventType === 'PHONE_CLICK');
    const waEvents = events.filter(e => e.eventType === 'WHATSAPP_CLICK');
    const webEvents = events.filter(e => e.eventType === 'WEBSITE_CLICK');
    const dirEvents = events.filter(e => e.eventType === 'DIRECTIONS_CLICK');
    const bookEvents = events.filter(e => e.eventType === 'BOOKING_CLICK');
    const leadEvents = events.filter(e => e.eventType === 'LEAD_SUBMITTED');

    const totalConnectActions = callEvents.length + waEvents.length + webEvents.length + dirEvents.length + bookEvents.length;

    const recentIntents = searchEvents
      .map(e => e.intentId)
      .filter((intent): intent is string => Boolean(intent))
      .slice(0, 10);

    const totalClaims = businesses.filter(b => b.isClaimed || b.claimStatus === 'CLAIM_PENDING').length;
    const pendingClaimsCount = businesses.filter(b => b.claimStatus === 'CLAIM_PENDING').length;
    const verifiedOwnersCount = businesses.filter(b => b.claimStatus === 'VERIFIED_OWNER').length;

    return {
      timestamp: new Date().toISOString(),
      businessesOnboarded: {
        total: businesses.length,
        draft: draftCount,
        published: publishedCount,
        suspended: suspendedCount
      },
      verifiedBusinesses: {
        totalVerified: supportedCount + partialCount,
        supported: supportedCount,
        partiallySupported: partialCount,
        unverified: unverifiedCount
      },
      discoverySearches: {
        total: searchEvents.length,
        recentIntents
      },
      businessViews: {
        total: viewEvents.length
      },
      connectActions: {
        total: totalConnectActions,
        calls: callEvents.length,
        whatsapp: waEvents.length,
        website: webEvents.length,
        directions: dirEvents.length,
        bookings: bookEvents.length
      },
      leads: {
        total: Math.max(leads.length, leadEvents.length)
      },
      claims: {
        total: totalClaims,
        pending: pendingClaimsCount,
        verifiedOwners: verifiedOwnersCount
      },
      recentEvents: events.slice(0, 20)
    };
  }

  /**
   * Submit an inbound lead directly to a verified business
   */
  async submitLead(input: {
    businessId: string;
    businessName: string;
    name: string;
    email: string;
    phone?: string;
    service: string;
    message?: string;
  }): Promise<{ success: boolean; leadId?: string; error?: string }> {
    try {
      // 1. Log LEAD_SUBMITTED telemetry event
      await this.logEvent({
        businessId: input.businessId,
        eventType: 'LEAD_SUBMITTED',
        channel: 'HUMAN_WEB'
      });

      // 2. Call server-side /api/contact handler for validation, Supabase insert & Resend email notification
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name,
          email: input.email,
          phone: input.phone,
          company: input.businessName,
          goal: input.service,
          message: input.message,
          source: `Conflux Verified Profile (${input.businessName})`,
          landing_page: typeof window !== 'undefined' ? window.location.pathname : '/business'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to deliver inquiry to business.');
      }
      return { success: true, leadId: data.lead_id };
    } catch (err: any) {
      console.error('[ConnectService.submitLead] Lead delivery failed:', err?.message || err);
      return {
        success: false,
        error: err?.message || 'Lead delivery failed. Please contact the business directly via phone or WhatsApp.'
      };
    }
  }
}

export const connectService = new ConnectService();
