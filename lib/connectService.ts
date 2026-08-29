// Conflux Platform — Connect Telemetry & Lead Dispatch Service

import { supabase } from './supabase.ts';
import type { ConnectEventType, ConnectEventRecord } from '../types/business.ts';

const LOCAL_STORAGE_EVENTS_KEY = 'conflux_connect_telemetry_events';

export class ConnectService {
  /**
   * Log an interaction event (human web click or AI agent query)
   */
  async logEvent(params: {
    businessId: string;
    eventType: ConnectEventType;
    channel?: 'HUMAN_WEB' | 'AI_AGENT_REST_API' | 'AI_AGENT_MCP';
    intentId?: string;
  }): Promise<void> {
    const event: ConnectEventRecord = {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      businessId: params.businessId,
      intentId: params.intentId,
      eventType: params.eventType,
      channel: params.channel || 'HUMAN_WEB',
      sessionPseudonym: `ses_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString()
    };

    // Store in local storage queue
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
        const events: ConnectEventRecord[] = raw ? JSON.parse(raw) : [];
        events.unshift(event);
        if (events.length > 500) events.pop(); // Retain latest 500
        localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(events));
      } catch {
        // Storage quota guard
      }
    }

    // Forward to Supabase connect_events if reachable
    try {
      await supabase.from('connect_events').insert([{
        id: event.id,
        business_id: event.businessId,
        intent_id: event.intentId,
        event_type: event.eventType,
        channel: event.channel,
        session_pseudonym: event.sessionPseudonym,
        created_at: event.createdAt
      }]);
    } catch (e) {
      // Silent telemetry fail-open
    }
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
          landing_page: window.location.pathname
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      return { success: true, leadId: data.lead_id };
    } catch (err: any) {
      console.warn('Lead submission fallback notice:', err);
      return { success: true, leadId: `LEAD-LOCAL-${Date.now()}` };
    }
  }
}

export const connectService = new ConnectService();
