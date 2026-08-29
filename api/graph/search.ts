// Conflux Platform — Machine / AI Agent Graph Discovery API (GET /api/v1/graph/businesses/search)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { businessService } from '../../lib/businessService.ts';

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
    const allBusinesses = await businessService.getAllBusinesses();
    let list = allBusinesses.filter(b => b.status === 'PUBLISHED');

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
      const cat = category.toLowerCase().trim();
      list = list.filter(b =>
        b.categoryId.toLowerCase().includes(cat) ||
        (b.categoryName && b.categoryName.toLowerCase().includes(cat))
      );
    }

    if (service && typeof service === 'string') {
      const svc = service.toLowerCase().trim();
      list = list.filter(b => b.services && b.services.some(s => s.toLowerCase().includes(svc)));
    }

    if (verified_only === 'true' || verified_only === '1') {
      list = list.filter(b => b.verificationStatus === 'SUPPORTED');
    }

    if (open_now === 'true' || open_now === '1') {
      list = list.filter(b => businessService.isBusinessOpenNow(b.operatingHours));
    }

    if (required_action && typeof required_action === 'string') {
      const action = required_action.toUpperCase();
      list = list.filter(b =>
        b.capabilities.some(c => c.actionType === action && c.isSupported)
      );
    }

    // Format structured machine responses
    const formattedData = list.map(b => {
      const isVerified = b.verificationStatus === 'SUPPORTED';
      const rank = businessService.calculateOrganicRank(b, {
        query: typeof q === 'string' ? q : undefined,
        district: typeof district === 'string' ? district : undefined,
        city: typeof city === 'string' ? city : undefined,
        category: typeof category === 'string' ? category : undefined
      });

      return {
        conflux_business_id: b.confluxBusinessId,
        slug: b.slug,
        name: b.name,
        legal_name: b.legalName || b.name,
        category: {
          id: b.categoryId,
          name: b.categoryName || b.categoryId
        },
        services: b.services || [],
        landmark: b.landmark || null,
        location: {
          district: b.location.district,
          city: b.location.city,
          address: b.location.fullAddress,
          coordinates: {
            latitude: b.location.latitude || null,
            longitude: b.location.longitude || null
          }
        },
        contact: {
          phone: b.contact.phone || null,
          whatsapp: b.contact.whatsapp || null,
          website: b.contact.websiteUrl || null,
          booking_url: b.contact.bookingUrl || null
        },
        verification: {
          status: b.verificationStatus,
          confidence_score: b.confidenceScore,
          primary_registrar: b.primaryRegistrar || 'Primary Statutory Registry Docket',
          evidence_summary: b.evidenceSummary || 'Statutory verification docket record.',
          last_verified_at: b.lastVerifiedAt || null
        },
        supported_capabilities: b.capabilities
          .filter(c => c.isSupported)
          .map(c => ({
            action: c.actionType,
            target: c.phoneTarget || c.endpointUrl || null
          })),
        organic_ranking: {
          score: rank.score,
          reason_codes: rank.reasonCodes
        },
        canonical_profile_url: `https://confluxai.in/business/india/west-bengal/${b.location.district}/${b.location.city}/${b.slug}`
      };
    });

    // Sort by rank score descending
    formattedData.sort((a, b) => b.organic_ranking.score - a.organic_ranking.score);

    return res.status(200).json({
      success: true,
      meta: {
        total_results: formattedData.length,
        graph_node_type: 'CONFLUX_VERIFIED_LOCAL_BUSINESS',
        api_version: 'v1'
      },
      query_intent: {
        query: q || null,
        district: district || null,
        city: city || null,
        category: category || null,
        service: service || null,
        verified_only: verified_only === 'true',
        open_now: open_now === 'true'
      },
      ranking_methodology: 'CONFLUX_EXPLAINABLE_DETERMINISTIC_ORGANIC_RANKING_V1',
      data: formattedData
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to query Conflux Business Graph.',
      details: err.message
    });
  }
}
