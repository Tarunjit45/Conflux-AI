// Conflux Platform — Machine / AI Agent Single Business Entity & Verification Dossier API

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { businessService } from '../../lib/businessService.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const { id, slug } = req.query;
  const targetId = (id || slug || '').toString().toLowerCase().trim();

  if (!targetId) {
    return res.status(400).json({ success: false, error: 'Missing business id or slug parameter.' });
  }

  const allBusinesses = await businessService.getAllBusinesses();
  const biz = allBusinesses.find(b =>
    b.id.toLowerCase() === targetId ||
    b.confluxBusinessId.toLowerCase() === targetId ||
    b.slug.toLowerCase() === targetId
  );

  if (!biz) {
    return res.status(404).json({ success: false, error: `Business "${targetId}" not found in Conflux Graph.` });
  }

  const profileUrl = `https://confluxai.in/business/india/west-bengal/${biz.location.district}/${biz.location.city}/${biz.slug}`;

  // JSON-LD Representation
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': profileUrl,
    'identifier': biz.confluxBusinessId,
    'name': biz.name,
    'legalName': biz.legalName || biz.name,
    'description': biz.description,
    'url': biz.contact.websiteUrl || profileUrl,
    'telephone': biz.contact.phone || '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': biz.location.fullAddress,
      'addressLocality': biz.location.city,
      'addressRegion': biz.location.district,
      'addressCountry': 'IN',
      'postalCode': biz.location.postalCode || ''
    },
    'geo': biz.location.latitude && biz.location.longitude ? {
      '@type': 'GeoCoordinates',
      'latitude': biz.location.latitude,
      'longitude': biz.location.longitude
    } : undefined,
    'openingHoursSpecification': (biz.operatingHours || []).filter(h => !h.isClosed).map(h => ({
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][h.dayOfWeek],
      'opens': h.opensAt,
      'closes': h.closesAt
    }))
  };

  return res.status(200).json({
    success: true,
    meta: {
      conflux_business_id: biz.confluxBusinessId,
      canonical_url: profileUrl,
      graph_node_type: 'CONFLUX_VERIFIED_LOCAL_BUSINESS',
      last_synced_at: new Date().toISOString()
    },
    data: {
      conflux_business_id: biz.confluxBusinessId,
      slug: biz.slug,
      name: biz.name,
      legal_name: biz.legalName || biz.name,
      business_type: biz.businessType,
      category: {
        id: biz.categoryId,
        name: biz.categoryName || biz.categoryId,
        subcategories: biz.subcategoryIds || []
      },
      services: biz.services || [],
      landmark: biz.landmark || null,
      description: biz.description,
      short_summary: biz.shortSummary,
      publishing_status: biz.status,
      claim_status: biz.claimStatus,
      trust_dossier: {
        verification_status: biz.verificationStatus,
        verification_level: biz.verificationLevel,
        confidence_score: biz.confidenceScore,
        primary_registrar: biz.primaryRegistrar || 'Primary Statutory Registry Docket',
        evidence_summary: biz.evidenceSummary,
        last_verified_at: biz.lastVerifiedAt || null,
        verification_breakdown: biz.verificationBreakdown || null
      },
      location: biz.location,
      contact: biz.contact,
      operating_hours: biz.operatingHours,
      supported_capabilities: (biz.capabilities || []).map(c => ({
        action: c.actionType,
        is_supported: c.isSupported,
        target: c.phoneTarget || c.endpointUrl || null,
        status: c.verificationStatus
      })),
      json_ld: jsonLd
    }
  });
}
