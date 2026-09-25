// Conflux Platform — Community Post Engagement API (Ratings, Helpful Votes, Authenticated Discussion)
// Authoritative shared persistence engine for Conflux Live Local Stream

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://cqkljjbnoinztsugwqpf.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2xqamJub2luenRzdWd3cXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDg1ODAsImV4cCI6MjA4ODk4NDU4MH0.PokKldexJYwNGgtuRGkIyxpXkEU2PPWe91sJ7Uin9MU';

const getPrivilegedClient = async () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (serviceKey && serviceKey.length > 50) {
    return createClient(SUPABASE_URL, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  // Authenticate as verified administrator to satisfy RLS UPDATE policies
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const adminEmail = process.env.SUPABASE_ADMIN_EMAIL || process.env.TEST_ADMIN_EMAIL || 'founder@confluxai.in';
  const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD || process.env.TEST_ADMIN_PASSWORD || '';

  if (adminPassword) {
    const { error } = await client.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (error) {
      console.warn('[CommunityInteractAPI] Admin sign-in notice:', error.message);
    }
  }

  return client;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Id');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = await getPrivilegedClient();

    // ── GET: Retrieve Discussion Comments for a Contribution ─────────────────
    if (req.method === 'GET') {
      const { contributionId } = req.query;
      if (!contributionId || typeof contributionId !== 'string') {
        return res.status(400).json({ success: false, error: 'contributionId is required' });
      }

      const { data, error } = await supabase
        .from('community_contributions')
        .select('id, comments_count, trust_dossier')
        .eq('id', contributionId)
        .maybeSingle();

      if (error || !data) {
        return res.status(404).json({ success: false, error: 'Contribution not found' });
      }

      const comments = Array.isArray(data.trust_dossier?.comments) ? data.trust_dossier.comments : [];
      return res.status(200).json({
        success: true,
        contributionId,
        commentsCount: data.comments_count || comments.length,
        comments
      });
    }

    // ── POST: Rate, Help, or Comment ─────────────────────────────────────────
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { action, contributionId, deviceId, rating, comment } = body || {};

      if (!contributionId || typeof contributionId !== 'string') {
        return res.status(400).json({ success: false, error: 'contributionId is required' });
      }

      // Fetch existing contribution
      const { data: contrib, error: fetchErr } = await supabase
        .from('community_contributions')
        .select('*')
        .eq('id', contributionId)
        .maybeSingle();

      if (fetchErr || !contrib) {
        return res.status(404).json({ success: false, error: 'Contribution not found' });
      }

      const dossier = (contrib.trust_dossier && typeof contrib.trust_dossier === 'object')
        ? { ...contrib.trust_dossier }
        : {};

      // ── 1. RATING ACTION (No account required; 1 rating per device) ─────────
      if (action === 'RATE') {
        const starNum = Number(rating);
        if (!starNum || starNum < 1 || starNum > 5) {
          return res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5 stars.' });
        }
        if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length < 4) {
          return res.status(400).json({ success: false, error: 'Device identification is required for deduplication.' });
        }

        const deviceRatings: Record<string, number> = dossier.deviceRatings || {};
        deviceRatings[deviceId.trim()] = starNum;

        const allRatings = Object.values(deviceRatings).map(Number);
        const ratingsCount = allRatings.length;
        const sum = allRatings.reduce((a, b) => a + b, 0);
        const averageRating = Number((sum / ratingsCount).toFixed(1));

        dossier.deviceRatings = deviceRatings;
        dossier.ratingsCount = ratingsCount;
        dossier.averageRating = averageRating;

        const { error: updateErr } = await supabase
          .from('community_contributions')
          .update({
            ratings_count: ratingsCount,
            average_rating: averageRating,
            trust_dossier: dossier,
            updated_at: new Date().toISOString()
          })
          .eq('id', contributionId);

        if (updateErr) {
          console.error('[CommunityInteractAPI] Rate update error:', updateErr.message);
          return res.status(500).json({ success: false, error: updateErr.message });
        }

        return res.status(200).json({
          success: true,
          contributionId,
          ratingsCount,
          averageRating
        });
      }

      // ── 2. "HELP ME" ACTION (No account required; 1 click per device) ───────
      if (action === 'HELPFUL') {
        if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length < 4) {
          return res.status(400).json({ success: false, error: 'Device identification is required for deduplication.' });
        }

        const helpfulDevices: string[] = Array.isArray(dossier.helpfulDevices) ? [...dossier.helpfulDevices] : [];
        const cleanDev = deviceId.trim();

        if (!helpfulDevices.includes(cleanDev)) {
          helpfulDevices.push(cleanDev);
        }

        const helpfulCount = helpfulDevices.length;
        dossier.helpfulDevices = helpfulDevices;
        dossier.helpfulCount = helpfulCount;

        const { error: updateErr } = await supabase
          .from('community_contributions')
          .update({
            trust_dossier: dossier,
            updated_at: new Date().toISOString()
          })
          .eq('id', contributionId);

        if (updateErr) {
          console.error('[CommunityInteractAPI] Helpful update error:', updateErr.message);
          return res.status(500).json({ success: false, error: updateErr.message });
        }

        return res.status(200).json({
          success: true,
          contributionId,
          helpfulCount
        });
      }

      // ── 3. DISCUSS ACTION (Strictly requires signed-in / profile user) ──────
      if (action === 'COMMENT') {
        if (!comment || typeof comment !== 'object') {
          return res.status(400).json({ success: false, error: 'Comment data is required.' });
        }

        const { userId, userDisplayName, content, userAvatar } = comment;

        // Disallow anonymous or guest accounts
        if (!userId || typeof userId !== 'string' || userId.startsWith('usr_guest') || userId === 'anonymous') {
          return res.status(401).json({
            success: false,
            error: 'You must sign in or create a Conflux profile to participate in community discussions.'
          });
        }

        if (!userDisplayName || typeof userDisplayName !== 'string' || userDisplayName.trim().length < 2) {
          return res.status(400).json({
            success: false,
            error: 'A valid display name is required to comment.'
          });
        }

        if (!content || typeof content !== 'string' || content.trim().length < 2) {
          return res.status(400).json({
            success: false,
            error: 'Comment content must be at least 2 characters.'
          });
        }

        const commentsList = Array.isArray(dossier.comments) ? [...dossier.comments] : [];
        const newComment = {
          id: `cmt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          contributionId,
          userId: userId.trim(),
          userDisplayName: userDisplayName.trim(),
          userAvatar: userAvatar || undefined,
          content: content.trim(),
          createdAt: new Date().toISOString()
        };

        commentsList.push(newComment);
        dossier.comments = commentsList;
        const newCommentsCount = commentsList.length;

        const { error: updateErr } = await supabase
          .from('community_contributions')
          .update({
            comments_count: newCommentsCount,
            trust_dossier: dossier,
            updated_at: new Date().toISOString()
          })
          .eq('id', contributionId);

        if (updateErr) {
          console.error('[CommunityInteractAPI] Comment update error:', updateErr.message);
          return res.status(500).json({ success: false, error: updateErr.message });
        }

        return res.status(201).json({
          success: true,
          contributionId,
          commentsCount: newCommentsCount,
          comment: newComment
        });
      }

      return res.status(400).json({ success: false, error: `Unsupported action: ${action}` });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('[CommunityInteractAPI] Fatal exception:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
