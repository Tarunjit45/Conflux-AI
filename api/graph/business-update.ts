// Conflux Platform — Machine / AI Agent & Admin Business Entity Update API
// Bypasses PostgreSQL Row-Level Security using service role key when available,
// committing storefront photos, media assets, and entity changes permanently to Supabase.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTION_SUPABASE_URL, PRODUCTION_SUPABASE_ANON_KEY, normalizeSupabaseUrl } from '../../lib/supabase.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { id, updates } = body || {};

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing or invalid business id.' });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'Missing updates object.' });
    }

    const rawEnvUrl =
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      PRODUCTION_SUPABASE_URL;

    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      PRODUCTION_SUPABASE_ANON_KEY;

    const supabase = createClient(normalizeSupabaseUrl(rawEnvUrl), key);

    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name) payload.name = updates.name;
    if (updates.legalName !== undefined) payload.legal_name = updates.legalName;
    if (updates.businessType) payload.business_type = updates.businessType;
    if (updates.categoryId) payload.category_id = updates.categoryId;
    if (updates.categoryName) payload.category_name = updates.categoryName;
    if (updates.services) payload.services = updates.services;
    if (updates.landmark !== undefined) payload.landmark = updates.landmark;
    if (updates.description) payload.description = updates.description;
    if (updates.shortSummary !== undefined) payload.short_summary = updates.shortSummary;
    if (updates.status) {
      payload.status = updates.status;
      payload.is_indexable = updates.status === 'PUBLISHED';
    }
    if (updates.claimStatus) payload.claim_status = updates.claimStatus;
    if (updates.verificationStatus) payload.verification_status = updates.verificationStatus;
    if (updates.verificationLevel) payload.verification_level = updates.verificationLevel;
    if (updates.confidenceScore !== undefined) payload.confidence_score = updates.confidenceScore;
    if (updates.primaryRegistrar) payload.primary_registrar = updates.primaryRegistrar;
    if (updates.evidenceSummary) payload.evidence_summary = updates.evidenceSummary;
    if (updates.lastVerifiedAt) payload.last_verified_at = updates.lastVerifiedAt;

    const primaryImage = updates.storefrontPhotoUrl || (updates.media?.find((m: any) => m.mediaType === 'IMAGE' && m.status !== 'INACTIVE')?.url);
    if (primaryImage) {
      payload.storefront_photo_url = primaryImage;
    }

    // Pack media & links into verification_breakdown JSONB
    payload.verification_breakdown = {
      ...(updates.verificationBreakdown || {}),
      ...(updates.media ? { media: updates.media } : {}),
      ...(updates.socialLinks ? { socialLinks: updates.socialLinks } : {}),
      ...(updates.sourceLinks ? { sourceLinks: updates.sourceLinks } : {})
    };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    let updateQuery = supabase.from('businesses').update(payload);
    if (isUuid) {
      updateQuery = updateQuery.eq('id', id);
    } else {
      updateQuery = updateQuery.or(`conflux_business_id.eq.${id},slug.eq.${id}`);
    }

    const { data, error } = await updateQuery.select();
    if (error) {
      console.warn('[business-update] Supabase update warning:', error.message);
    }

    return res.status(200).json({
      success: true,
      id,
      updated_rows: data?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while updating business entity.'
    });
  }
}
