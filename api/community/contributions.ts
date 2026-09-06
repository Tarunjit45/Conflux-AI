// Conflux Platform — Production Community Contributions & Feed API
// Authoritative shared persistence engine for Conflux Local Knowledge & Community Stream

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTION_SUPABASE_URL, PRODUCTION_SUPABASE_ANON_KEY, normalizeSupabaseUrl } from '../../lib/supabase.ts';

const getSupabaseClient = () => {
  const rawEnvUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    PRODUCTION_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    PRODUCTION_SUPABASE_ANON_KEY;

  return createClient(normalizeSupabaseUrl(rawEnvUrl), key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();

  // ── GET: Query Community Feed ──────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { locality, status = 'PUBLISHED', type, businessId, placeId, authorId, limit = 50 } = req.query;

      let query = supabase
        .from('community_contributions')
        .select('*')
        .order('created_at', { ascending: false });

      if (locality && typeof locality === 'string' && locality.trim()) {
        query = query.ilike('locality', locality.toLowerCase().trim());
      }

      if (status && typeof status === 'string' && status !== 'ALL') {
        query = query.eq('status', status);
      }

      if (type && typeof type === 'string') {
        query = query.eq('type', type);
      }

      if (businessId && typeof businessId === 'string') {
        query = query.eq('business_id', businessId);
      }

      if (placeId && typeof placeId === 'string') {
        query = query.eq('place_id', placeId);
      }

      if (authorId && typeof authorId === 'string') {
        query = query.eq('author_id', authorId);
      }

      const numLimit = Math.min(Number(limit) || 50, 100);
      query = query.limit(numLimit);

      const { data, error } = await query;

      if (error) {
        console.error('[API community/contributions] Query error:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({
        success: true,
        count: data?.length || 0,
        contributions: data || []
      });
    } catch (err: any) {
      console.error('[API community/contributions] GET exception:', err);
      return res.status(500).json({ success: false, error: 'Internal server error fetching community feed.' });
    }
  }

  // ── POST: Create Community Contribution ────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const {
        id,
        type,
        title,
        content,
        locality,
        author,
        businessRef,
        placeRef,
        eventRef,
        media,
        externalPostUrl,
        category,
        provenance,
        status: requestedStatus
      } = body || {};

      // Server-side validation
      if (!title || typeof title !== 'string' || title.trim().length < 3) {
        return res.status(400).json({ success: false, error: 'Contribution title must be at least 3 characters.' });
      }
      if (!content || typeof content !== 'string' || content.trim().length < 10) {
        return res.status(400).json({ success: false, error: 'Contribution content must be at least 10 characters.' });
      }
      if (!locality || typeof locality !== 'string' || locality.trim().length < 2) {
        return res.status(400).json({ success: false, error: 'Locality is required.' });
      }
      if (!author || !author.id || !author.displayName) {
        return res.status(400).json({ success: false, error: 'Author identification is required.' });
      }

      const contributionId = id || `cnt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const localityNorm = locality.toLowerCase().trim();
      const now = new Date().toISOString();

      // Check author standing for moderation gate
      // Direct publishing is permitted for verified residents, or when explicitly approved by admin.
      let finalStatus = requestedStatus || 'PENDING_MODERATION';
      if (author.isVerifiedResident === true || author.badge === 'TRUSTED_CONTRIBUTOR' || (author.reputationScore && author.reputationScore >= 75)) {
        finalStatus = 'PUBLISHED';
      }

      const row = {
        id: contributionId,
        type: type || 'UPDATE',
        title: title.trim(),
        content: content.trim(),
        locality: localityNorm,
        author_id: author.id,
        author_display_name: author.displayName.trim(),
        author_avatar_url: author.avatarUrl || null,
        author_locality: author.locality || localityNorm,
        author_badge: author.badge || 'LOCAL_CONTRIBUTOR',
        business_id: businessRef?.id || null,
        business_name: businessRef?.name || null,
        business_slug: businessRef?.slug || null,
        business_category: businessRef?.category || null,
        place_id: placeRef?.id || null,
        place_name: placeRef?.name || null,
        place_category: placeRef?.category || null,
        event_ref: eventRef || null,
        media: Array.isArray(media) ? media : [],
        external_post_url: externalPostUrl ? String(externalPostUrl).trim() : null,
        category: category ? String(category).trim() : 'General Local',
        provenance: provenance || 'FIRST_HAND_CITIZEN',
        source_name: provenance === 'OFFICIAL_NOTICE' ? 'Official public authority communication' : `Direct citizen observation by ${author.displayName}`,
        source_url: externalPostUrl || null,
        verification_state: provenance === 'OFFICIAL_NOTICE' || provenance === 'FIELD_VERIFIED' ? 'OFFICIALLY_VERIFIED' : 'UNVERIFIED',
        trust_dossier: {
          whatWeKnow: title.trim(),
          whyWeKnowIt: `Contributed as ${type || 'UPDATE'} by ${author.displayName} (${localityNorm}).`,
          source: provenance === 'OFFICIAL_NOTICE' ? 'Official notice' : `Observation by ${author.displayName}`,
          lastCheckedDate: now.split('T')[0],
          whatCommunitySays: 'Initial contribution recorded on Conflux network.',
          whatRemainsUncertain: provenance === 'OFFICIAL_NOTICE' ? 'None reported.' : 'Community corroboration is ongoing.'
        },
        confirmations_count: 0,
        disputes_count: 0,
        ratings_count: 0,
        average_rating: 0,
        comments_count: 0,
        status: finalStatus,
        created_at: now,
        updated_at: now,
        last_checked_at: now
      };

      const { data, error } = await supabase
        .from('community_contributions')
        .insert([row])
        .select()
        .single();

      if (error) {
        console.error('[API community/contributions] Insert error:', error);
        return res.status(500).json({ success: false, error: "We couldn't publish this right now. Please try again." });
      }

      return res.status(201).json({
        success: true,
        contribution: data || row,
        queuedForModeration: finalStatus === 'PENDING_MODERATION'
      });
    } catch (err: any) {
      console.error('[API community/contributions] POST exception:', err);
      return res.status(500).json({ success: false, error: "We couldn't publish this right now. Please try again." });
    }
  }

  // ── PATCH: Moderate Contribution Status ────────────────────────────────────
  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, status, verificationState } = body || {};

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Contribution id is required.' });
      }

      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (verificationState) updates.verification_state = verificationState;

      const { data, error } = await supabase
        .from('community_contributions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, contribution: data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Internal error updating contribution.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
