// Conflux Platform — Machine / AI Agent Graph Discovery API (GET /api/v1/graph/businesses/search)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INITIAL_SEED_BUSINESSES } from '../../lib/businessService.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers for AI Agents & Remote Consumers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use GET.' });
  }

  const {
    q,
    district,
    city,
    category,
    service,
    verified_only,
    open_now,
    required_action
  } = req.query;

  try {
    let list = INITIAL_SEED_BUSINESSES.filter(b => b.status === 'PUBLISHED');

    if (q && typeof q === 'string') {
      const queryStr = q.toLowerCase().trim();
      list = list.filter(b => {
        const servicesStr = (b.services || []).join(' ').toLowerCase();
        const landmarkStr = (b.landmark || '').toLowerCase();
        return (
          b.name.toLowerCase().includes(queryStr) ||
          b.description.toLowerCase().includes(queryStr) ||
          b.categoryId.toLowerCase().includes(queryStr) ||
          (b.categoryName && b.categoryName.toLowerCase().includes(queryStr)) ||
          b.location.city.toLowerCase().includes(queryStr) ||
          b.location.district.toLowerCase().includes(queryStr) ||
          landmarkStr.includes(queryStr) ||
          servicesStr.includes(queryStr) ||
          b.confluxBusinessId.toLowerCase().includes(queryStr)
        );
      });
    }

    if (district && typeof district === 'string') {
      list = list.filter(b => b.location.district.toLowerCase() === district.toLowerCase().trim());
    }

    if (city && typeof city === 'string') {
      list = list.filter(b => b.location.city.toLowerCase() === city.toLowerCase().trim());
    }

    if (category && typeof category === 'string') {
      const catStr = category.toLowerCase().trim();
      list = list.filter(b =>
        b.categoryId.toLowerCase().includes(catStr) ||
        (b.categoryName && b.categoryName.toLowerCase().includes(catStr))
      );
    }

    if (service && typeof service === 'string') {
      const svcStr = service.toLowerCase().trim();
      list = list.filter(b => b.services && b.services.some(s => s.toLowerCase().includes(svcStr)));
    }

    if (verified_only === 'true' || verified_only === '1') {
      list = list.filter(b => b.verificationStatus === 'SUPPORTED');
    }

    if (required_action && typeof required_action === 'string') {
      const action = required_action.toUpperCase();
      list = list.filter(b => b.capabilities.some(c => c.actionType === action && c.isSupported));
    }

    // Format agent-friendly structured response
    const agentFormatted = list.map(b => ({
      conflux_business_id: b.confluxBusinessId,
      name: b.name,
      legal_name: b.legalName,
      slug: b.slug,
      canonical_url: `https://confluxai.in/business/india/west-bengal/${b.location.district}/${b.location.city}/${b.slug}`,
      category: {
        id: b.categoryId,
        name: b.categoryName || b.categoryId
      },
      services_and_capabilities: b.services || [],
      claim_status: b.claimStatus || 'UNCLAIMED_PUBLIC',
      location: {
        district: b.location.district,
        city: b.location.city,
        landmark: b.landmark,
        full_address: b.location.fullAddress,
        coordinates: {
          latitude: b.location.latitude,
          longitude: b.location.longitude
        }
      },
      trust: {
        status: b.verificationStatus,
        verification_level: b.verificationLevel,
        confidence_score: b.confidenceScore,
        primary_registrar: b.primaryRegistrar,
        evidence_summary: b.evidenceSummary,
        verification_breakdown: b.verificationBreakdown,
        last_verified_at: b.lastVerifiedAt
      },
      supported_actions: b.capabilities
        .filter(c => c.isSupported)
        .map(c => ({
          action: c.actionType,
          target: c.phoneTarget || c.endpointUrl,
          endpoint_url: c.endpointUrl
        }))
    }));

    return res.status(200).json({
      success: true,
      query_intent: {
        query: q || null,
        district: district || null,
        city: city || null,
        category: category || null,
        service: service || null,
        verified_only: verified_only === 'true'
      },
      total_matches: agentFormatted.length,
      ranking_methodology: 'CONFLUX_EXPLAINABLE_STATUTORY_TRUST_V1',
      data: agentFormatted
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Internal Business Graph error.',
      details: error.message
    });
  }
}
