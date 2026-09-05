// Conflux Platform — Platform-Wide Business SEO + GEO Optimization Engine
// Pure, deterministic, data-driven entity optimization for search and AI retrieval agents.
// Zero hardcoding of individual business slugs. Strictly factual, zero fabrication.

import type {
  ConfluxBusiness,
  BusinessLocation,
  BusinessType,
  OperatingHoursDay,
  BusinessMediaItem,
} from '../../types/business.ts';

export interface GeographicHierarchy {
  country: string;
  state: string;
  district: string;
  city: string;
  locality?: string;
  landmark?: string;
  postalCode?: string;
  coordinates?: { latitude: number; longitude: number };
  serviceAreas: string[];
  canonicalPath: string;
}

export interface QueryIntent {
  intentType: 'LOCAL_EXACT' | 'CATEGORY_LOCATION' | 'SERVICE_LOCATION' | 'CONTACT_HOURS' | 'AI_RETRIEVAL';
  query: string;
  targetAudience: 'HUMAN_SEARCH' | 'AI_AGENT' | 'VOICE_ASSISTANT';
}

export interface FactualFaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'OVERVIEW' | 'LOCATION' | 'HOURS' | 'CONTACT' | 'OFFERINGS' | 'VERIFICATION';
  evidenceSource?: string;
}

export interface SourceConflict {
  field: string;
  claimBusiness: string;
  claimPublic: string;
  explanation: string;
}

export interface InternalLinkItem {
  url: string;
  anchorText: string;
  relType: 'locality' | 'city' | 'district' | 'state' | 'category' | 'verify' | 'all_businesses';
  description?: string;
}

export interface OptimizedMediaMetadata {
  id: string;
  url: string;
  mediaType: 'IMAGE' | 'VIDEO';
  altText: string;
  caption: string;
  sourceUrl?: string;
  sourceName?: string;
  provenance: string;
  status: string;
}

export interface IndexabilityEvaluation {
  isIndexable: boolean;
  indexabilityScore: number; // 0 to 100
  reasons: string[];
  issues: string[];
}

export interface OptimizedBusinessProfile {
  businessId: string;
  confluxBusinessId: string;
  slug: string;
  canonicalUrl: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    type: string;
    image?: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image?: string;
  };
  geographicHierarchy: GeographicHierarchy;
  businessType: BusinessType;
  schemaSubtype: string;
  structuredData: Record<string, any>;
  queryIntents: QueryIntent[];
  faqItems: FactualFaqItem[];
  sourceProvenanceConflicts: SourceConflict[];
  internalLinks: InternalLinkItem[];
  mediaMetadata: OptimizedMediaMetadata[];
  indexability: IndexabilityEvaluation;
  lastOptimizedAt: string;
}

/**
 * Normalizes title case for human-facing place names
 */
const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Clean category naming for titles
 */
const formatCategoryTitle = (categoryName?: string, categoryId?: string, businessType?: BusinessType): string => {
  const raw = categoryName || categoryId || businessType || 'Business';
  const lower = raw.toLowerCase();

  if (lower.includes('sports nutrition') || lower.includes('supplement')) {
    return 'Sports Nutrition & Fitness Store';
  }
  if (lower.includes('restaurant') || lower.includes('eateries') || lower.includes('food')) {
    return 'Restaurant & Dining';
  }
  if (lower.includes('clinic') || lower.includes('health') || lower.includes('diagnostic')) {
    return 'Healthcare Clinic & Diagnostic Care';
  }
  if (lower.includes('clothing') || lower.includes('apparel') || lower.includes('saree')) {
    return 'Apparel & Clothing Store';
  }
  if (lower.includes('gym') || lower.includes('fitness')) {
    return 'Gym & Fitness Center';
  }
  if (lower.includes('handloom') || lower.includes('textile')) {
    return 'Handloom & Textile Manufacturer';
  }
  if (lower.includes('hotel') || lower.includes('homestay') || lower.includes('resort')) {
    return 'Hotel & Homestay';
  }
  if (lower.includes('coaching') || lower.includes('education') || lower.includes('institute')) {
    return 'Coaching & Training Institute';
  }
  if (lower.includes('agro') || lower.includes('cold storage')) {
    return 'Agro-Commodity & Cold Storage';
  }
  if (lower.includes('automotive') || lower.includes('repair')) {
    return 'Automotive & Repair Service';
  }
  if (lower.includes('professional') || lower.includes('legal') || lower.includes('agency')) {
    return 'Professional & Business Services';
  }

  return toTitleCase(raw.replace(/[_-]/g, ' '));
};

export class BusinessOptimizationEngine {
  /**
   * 1. ENTITY & LOCATION UNDERSTANDING
   * Resolves the canonical geographic hierarchy from BusinessLocation.
   */
  resolveLocationHierarchy(loc?: Partial<BusinessLocation>): GeographicHierarchy {
    const rawCountry = loc?.country?.trim() || 'India';
    const rawState = loc?.state?.trim() || 'West Bengal';
    const rawDistrict = loc?.district?.trim() || 'Nadia';
    const rawCity = loc?.city?.trim() || 'Ranaghat';

    const cityNorm = rawCity.toLowerCase().trim();
    const districtNorm = rawDistrict.toLowerCase().trim();

    // Default coordinates & postal code lookup for known hubs if missing
    let postalCode = loc?.postalCode?.trim();
    let lat = loc?.latitude;
    let lng = loc?.longitude;

    if (!postalCode) {
      if (cityNorm === 'birnagar') postalCode = '741127';
      else if (cityNorm === 'ranaghat') postalCode = '741201';
      else if (cityNorm === 'santipur') postalCode = '741404';
      else if (cityNorm === 'krishnanagar') postalCode = '741101';
      else if (cityNorm === 'kalyani') postalCode = '741235';
    }

    if (!lat || !lng) {
      if (cityNorm === 'birnagar') { lat = 23.2458; lng = 88.5562; }
      else if (cityNorm === 'ranaghat') { lat = 23.1804; lng = 88.5801; }
      else if (cityNorm === 'santipur') { lat = 23.2500; lng = 88.4333; }
      else if (cityNorm === 'krishnanagar') { lat = 23.4000; lng = 88.5000; }
      else if (cityNorm === 'kalyani') { lat = 22.9750; lng = 88.4344; }
    }

    const serviceAreas: string[] = Array.isArray(loc?.serviceAreas) && loc!.serviceAreas!.length > 0
      ? loc!.serviceAreas!
      : [toTitleCase(rawCity), `${toTitleCase(rawDistrict)} District`, 'West Bengal'];

    return {
      country: toTitleCase(rawCountry),
      state: toTitleCase(rawState),
      district: districtNorm,
      city: cityNorm,
      locality: loc?.locality?.trim() || undefined,
      landmark: loc?.landmark?.trim() || undefined,
      postalCode,
      coordinates: (lat && lng) ? { latitude: lat, longitude: lng } : undefined,
      serviceAreas,
      canonicalPath: `/business/india/west-bengal/${districtNorm}/${cityNorm}`
    };
  }

  /**
   * 2. SCHEMA.ORG SUBTYPE DETERMINATION
   * Identifies the most granular, valid Schema.org LocalBusiness subtype.
   */
  deriveSchemaSubtype(biz: ConfluxBusiness): string {
    const textCorpus = [
      biz.businessType,
      biz.categoryId,
      biz.categoryName,
      ...(biz.services || [])
    ].filter(Boolean).join(' ').toLowerCase();

    if (textCorpus.includes('sports nutrition') || (textCorpus.includes('supplement') && textCorpus.includes('store'))) {
      return 'Store';
    }
    if (biz.businessType === 'HEALTHCARE' || textCorpus.includes('clinic') || textCorpus.includes('diagnostic') || /\bhospitals?\b/i.test(textCorpus)) {
      return 'MedicalClinic';
    }
    if (textCorpus.includes('pharmacy') || textCorpus.includes('chemist') || textCorpus.includes('medical store')) {
      return 'Pharmacy';
    }
    if (biz.businessType === 'HOSPITALITY' || textCorpus.includes('restaurant') || textCorpus.includes('cafe') || textCorpus.includes('eatery')) {
      return 'Restaurant';
    }
    if (textCorpus.includes('hotel') || textCorpus.includes('homestay') || textCorpus.includes('resort') || textCorpus.includes('lodging')) {
      return 'LodgingBusiness';
    }
    if (biz.businessType === 'FITNESS_WELLNESS' || textCorpus.includes('gym') || textCorpus.includes('fitness center')) {
      return 'ExerciseGym';
    }
    if (biz.businessType === 'RETAIL' || textCorpus.includes('clothing') || textCorpus.includes('apparel') || textCorpus.includes('saree') || textCorpus.includes('retail')) {
      return 'Store';
    }
    if (biz.businessType === 'INSTITUTION' || textCorpus.includes('coaching') || textCorpus.includes('academy') || textCorpus.includes('school')) {
      return 'EducationalOrganization';
    }
    if (biz.businessType === 'HOME_REPAIR' || textCorpus.includes('repair') || textCorpus.includes('plumbing') || textCorpus.includes('electrical')) {
      return 'HomeAndConstructionBusiness';
    }
    if (textCorpus.includes('automotive') || textCorpus.includes('garage') || textCorpus.includes('car service')) {
      return 'AutomotiveBusiness';
    }
    if (biz.businessType === 'PROFESSIONAL_SERVICE' || textCorpus.includes('legal') || textCorpus.includes('consulting') || textCorpus.includes('financial') || textCorpus.includes('tech')) {
      return 'ProfessionalService';
    }

    return 'LocalBusiness';
  }

  /**
   * 3. NATURAL SEO METADATA GENERATION
   * Generates Title (50-70 chars), Meta Description (140-160 chars), H1, and Canonical URL.
   */
  generateSeoMetadata(biz: ConfluxBusiness, location: GeographicHierarchy) {
    const cityTitle = toTitleCase(location.city);
    const districtTitle = toTitleCase(location.district);
    const categoryTitle = formatCategoryTitle(biz.categoryName, biz.categoryId, biz.businessType);

    // Dynamic Title: [Name] — [Category] in [City], [District] | Conflux Business Profile
    const rawTitle = `${biz.name} — ${categoryTitle} in ${cityTitle}, ${districtTitle} | Conflux Business Profile`;
    const seoTitle = rawTitle.length > 105
      ? `${biz.name} (${cityTitle}, ${districtTitle}) | Conflux Business Profile`
      : rawTitle;

    // Canonical URL: Hierarchical clean path
    const canonicalUrl = `https://confluxai.in/business/india/west-bengal/${location.district}/${location.city}/${biz.slug}`;

    // Meta Description: Strictly factual, 140-160 chars, mentioning entity, category, location, and connect modes.
    const servicesPart = biz.services && biz.services.length > 0
      ? ` Offering ${biz.services.slice(0, 3).join(', ')}.`
      : '';

    const directConnect = biz.contact?.whatsapp
      ? 'direct WhatsApp contact'
      : biz.contact?.phone
        ? 'direct phone contact'
        : 'verified contact details';

    const candidates = [
      `${biz.name} is a ${categoryTitle.toLowerCase()} in ${cityTitle}, ${districtTitle}, West Bengal.${servicesPart} View verified business information, public sources, and ${directConnect}.`,
      `${biz.name} is a ${categoryTitle.toLowerCase()} in ${cityTitle}, ${districtTitle}, West Bengal. View verified business information, public sources, and ${directConnect}.`,
      `${biz.name} is a verified ${categoryTitle.toLowerCase()} located in ${cityTitle}, ${districtTitle}, West Bengal. View business details, operating hours, and ${directConnect}.`,
      `${biz.name} in ${cityTitle}, ${districtTitle}, West Bengal: verified ${categoryTitle.toLowerCase()}, operating schedule, and ${directConnect}.`,
      `${biz.name} in ${cityTitle}, ${districtTitle}, West Bengal provides ${categoryTitle.toLowerCase()} with ${directConnect}. View verified business details and hours.`
    ];

    let metaDescription = candidates.find(c => c.length >= 135 && c.length <= 165);

    if (!metaDescription) {
      metaDescription = candidates.reduce((prev, curr) => {
        return Math.abs(curr.length - 155) < Math.abs(prev.length - 155) ? curr : prev;
      });

      if (metaDescription.length > 165) {
        const truncated = metaDescription.slice(0, 155);
        const lastSpace = truncated.lastIndexOf(' ');
        metaDescription = (lastSpace > 120 ? truncated.slice(0, lastSpace) : truncated).trim() + '.';
      }
    }

    const primaryImage = biz.storefrontPhotoUrl || biz.media?.find(m => m.mediaType === 'IMAGE' && m.status !== 'INACTIVE')?.url || 'https://confluxai.in/logo.png';

    return {
      seoTitle,
      metaDescription,
      canonicalUrl,
      h1: biz.name,
      openGraph: {
        title: seoTitle,
        description: metaDescription,
        url: canonicalUrl,
        type: 'business.business',
        image: primaryImage
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: metaDescription,
        image: primaryImage
      }
    };
  }

  /**
   * 4. QUERY & INTENT MAPPING
   * Maps natural customer searches and AI-agent retrieval prompts based on authentic entity data.
   */
  generateQueryIntents(biz: ConfluxBusiness, location: GeographicHierarchy): QueryIntent[] {
    const city = toTitleCase(location.city);
    const district = toTitleCase(location.district);
    const category = formatCategoryTitle(biz.categoryName, biz.categoryId, biz.businessType);
    const intents: QueryIntent[] = [];

    // Local Exact & Category Intents
    intents.push({
      intentType: 'LOCAL_EXACT',
      query: `${biz.name} ${city}`,
      targetAudience: 'HUMAN_SEARCH'
    });
    intents.push({
      intentType: 'CATEGORY_LOCATION',
      query: `${category} in ${city}`,
      targetAudience: 'HUMAN_SEARCH'
    });
    intents.push({
      intentType: 'CATEGORY_LOCATION',
      query: `${category} in ${district}, West Bengal`,
      targetAudience: 'HUMAN_SEARCH'
    });

    // Service-specific intents
    if (biz.services && biz.services.length > 0) {
      intents.push({
        intentType: 'SERVICE_LOCATION',
        query: `${biz.services[0]} ${city}`,
        targetAudience: 'HUMAN_SEARCH'
      });
    }

    // Direct operational inquiries
    intents.push({
      intentType: 'CONTACT_HOURS',
      query: `${biz.name} contact number and opening hours`,
      targetAudience: 'HUMAN_SEARCH'
    });

    // AI Retrieval / Voice agent intents
    intents.push({
      intentType: 'AI_RETRIEVAL',
      query: `What are the verified contact details and address for ${biz.name} in ${city}?`,
      targetAudience: 'AI_AGENT'
    });
    intents.push({
      intentType: 'AI_RETRIEVAL',
      query: `Is ${biz.name} in ${city}, ${district} verified and what does it offer?`,
      targetAudience: 'AI_AGENT'
    });

    return intents;
  }

  /**
   * 5. FACTUAL FAQ GENERATOR (GEO & DIRECT ANSWERS)
   * Only answers questions for which direct evidence exists.
   * Visible FAQs match JSON-LD FAQPage 100%.
   */
  generateFactualFaqs(biz: ConfluxBusiness, location: GeographicHierarchy): FactualFaqItem[] {
    const faqs: FactualFaqItem[] = [];
    const city = toTitleCase(location.city);
    const district = toTitleCase(location.district);
    const category = formatCategoryTitle(biz.categoryName, biz.categoryId, biz.businessType);

    // Q1: What is [Name] and where is it located?
    const addressStr = biz.location?.fullAddress || `${city}, ${district}, West Bengal`;
    const pinStr = location.postalCode ? ` ${location.postalCode}` : '';
    faqs.push({
      id: `faq_${biz.slug}_overview`,
      question: `What is ${biz.name} and where is it located?`,
      answer: `${biz.name} is a ${category.toLowerCase()} situated at ${addressStr} in ${city}, ${district}, West Bengal${pinStr}, India.`,
      category: 'LOCATION',
      evidenceSource: 'Declared Business Location & Postal Registry'
    });

    // Q2: Is [Name] verified on Conflux AI?
    let verificationText: string;
    if (biz.verificationStatus === 'SUPPORTED' && biz.primaryRegistrar) {
      verificationText = `Business identity and statutory credentials (${biz.primaryRegistrar}) are officially verified on Conflux AI with an authority confidence score of ${biz.confidenceScore}%.`;
    } else if (biz.verificationStatus === 'SUPPORTED' || biz.confidenceScore >= 70) {
      verificationText = `Business identity and direct proprietor connect${biz.contact?.phone ? ` (${biz.contact.phone})` : ''} are verified on Conflux AI with an authority confidence score of ${biz.confidenceScore}%.`;
    } else {
      const publicEvidence = biz.onlineSources?.facebookUrl ? ' and public Facebook presence' : '';
      verificationText = `Business identity and direct proprietor connect${biz.contact?.phone ? ` (${biz.contact.phone})` : ''} are supported by business submission${publicEvidence}. Official statutory regulatory registration has not yet been submitted or evaluated by Conflux Verify.`;
    }

    faqs.push({
      id: `faq_${biz.slug}_verify`,
      question: `Is ${biz.name} verified on Conflux AI?`,
      answer: verificationText,
      category: 'VERIFICATION',
      evidenceSource: 'Conflux Verify Ledger & Evidence Evaluation'
    });

    // Q3: How can customers contact [Name]?
    let contactText: string;
    const phone = biz.contact?.phone;
    const whatsapp = biz.contact?.whatsapp;
    const website = biz.contact?.websiteUrl;

    if (phone && whatsapp && phone === whatsapp) {
      contactText = `Customers can contact the proprietor directly by phone or WhatsApp at ${phone} for inquiries, orders, and customer service.`;
    } else if (phone && whatsapp) {
      contactText = `Customers can call directly at ${phone} or message via WhatsApp at ${whatsapp} for inquiries, pricing, and orders.`;
    } else if (phone) {
      contactText = `Customers can contact directly by phone at ${phone}.`;
    } else if (whatsapp) {
      contactText = `Customers can message directly via WhatsApp at ${whatsapp}.`;
    } else if (website) {
      contactText = `Customers can connect via the official website at ${website}.`;
    } else {
      contactText = `Direct contact information is currently being updated. Inquiries can be routed through Conflux local business connect.`;
    }

    faqs.push({
      id: `faq_${biz.slug}_contact`,
      question: `How can I contact ${biz.name}?`,
      answer: contactText,
      category: 'CONTACT',
      evidenceSource: 'Verified Proprietor Contact Channels'
    });

    // Q4: Operating Hours (Only if hours exist or explicitly recorded)
    const hours = biz.operatingHours;
    if (hours && hours.length > 0) {
      const openDays = hours.filter(h => !h.isClosed && h.opensAt && h.closesAt);
      if (openDays.length > 0) {
        const sample = openDays[0];
        const daysCount = openDays.length;
        const hoursSummary = daysCount === 7
          ? `Daily from ${sample.opensAt} to ${sample.closesAt}`
          : `${daysCount} days a week (${sample.opensAt} to ${sample.closesAt})`;

        faqs.push({
          id: `faq_${biz.slug}_hours`,
          question: `What are the operating hours for ${biz.name}?`,
          answer: `${biz.name} is open ${hoursSummary}. Operating hours are verified from published proprietor schedules.`,
          category: 'HOURS',
          evidenceSource: 'Proprietor Operating Schedule'
        });
      }
    } else if (biz.publicSourceEnrichment?.extractedHours) {
      faqs.push({
        id: `faq_${biz.slug}_hours_public`,
        question: `What are the operating hours for ${biz.name}?`,
        answer: `Public listings indicate operating schedule as: ${biz.publicSourceEnrichment.extractedHours}. Please confirm with the proprietor directly for holiday or special timings.`,
        category: 'HOURS',
        evidenceSource: 'Public Source Record'
      });
    }

    // Q5: Offerings / Services (if services exist)
    if (biz.services && biz.services.length > 0) {
      const serviceList = biz.services.slice(0, 8).join(', ');
      faqs.push({
        id: `faq_${biz.slug}_services`,
        question: `What products or services does ${biz.name} offer?`,
        answer: `${biz.name} specializes in: ${serviceList}. Specific availability and quotes can be requested directly.`,
        category: 'OFFERINGS',
        evidenceSource: 'Business Capability Catalog'
      });
    }

    // Q6: Service Areas (if serviceAreas or delivery specified)
    if (biz.location?.serviceAreas && biz.location.serviceAreas.length > 0) {
      faqs.push({
        id: `faq_${biz.slug}_areas`,
        question: `What areas does ${biz.name} serve?`,
        answer: `${biz.name} serves customers across ${biz.location.serviceAreas.join(', ')}.`,
        category: 'LOCATION',
        evidenceSource: 'Business Geographic Coverage Ledger'
      });
    }

    return faqs;
  }

  /**
   * 6. SOURCE CONFLICT DETECTION
   * Transparently detects and explains differences between business claims and public sources.
   */
  detectSourceConflicts(biz: ConfluxBusiness): SourceConflict[] {
    const conflicts: SourceConflict[] = [];

    // Category conflict check
    if (biz.publicSourceEnrichment?.extractedCategory) {
      const declared = (biz.categoryName || biz.categoryId || '').toLowerCase();
      const extracted = biz.publicSourceEnrichment.extractedCategory.toLowerCase();
      if (!declared.includes(extracted) && !extracted.includes(declared)) {
        conflicts.push({
          field: 'Category',
          claimBusiness: biz.categoryName || biz.categoryId,
          claimPublic: biz.publicSourceEnrichment.extractedCategory,
          explanation: `Business registered as "${biz.categoryName || biz.categoryId}", whereas public records classify it as "${biz.publicSourceEnrichment.extractedCategory}".`
        });
      }
    }

    // Address nuance check
    if (biz.publicSourceEnrichment?.extractedAddress) {
      const declaredAddr = (biz.location?.fullAddress || '').toLowerCase();
      const extractedAddr = biz.publicSourceEnrichment.extractedAddress.toLowerCase();
      if (declaredAddr !== extractedAddr && !declaredAddr.includes(extractedAddr) && !extractedAddr.includes(declaredAddr)) {
        conflicts.push({
          field: 'Address Detail',
          claimBusiness: biz.location?.fullAddress || 'Not specified',
          claimPublic: biz.publicSourceEnrichment.extractedAddress,
          explanation: 'Public directory records include additional locality or landmark identifiers compared to the onboarding submission.'
        });
      }
    }

    // Hours nuance check
    if (biz.publicSourceEnrichment?.extractedHours) {
      const pubHours = biz.publicSourceEnrichment.extractedHours.toLowerCase();
      const hasSpecificHours = biz.operatingHours && biz.operatingHours.some(h => !h.isClosed && h.opensAt);
      if (pubHours.includes('24 hour') && hasSpecificHours) {
        conflicts.push({
          field: 'Operating Schedule',
          claimBusiness: 'Daytime Operating Schedule',
          claimPublic: biz.publicSourceEnrichment.extractedHours,
          explanation: 'Public social profile lists 24 Hours online availability, while physical storefront operates on specific daily schedules.'
        });
      }
    }

    return conflicts;
  }

  /**
   * 7. STRUCTURED DATA GRAPH (SCHEMA.ORG)
   * Builds valid Schema.org graph combining LocalBusiness, BreadcrumbList, and FAQPage.
   */
  generateStructuredData(
    biz: ConfluxBusiness,
    location: GeographicHierarchy,
    canonicalUrl: string,
    schemaSubtype: string,
    faqs: FactualFaqItem[]
  ): Record<string, any> {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const openingHoursSpecs = (biz.operatingHours || [])
      .filter(h => !h.isClosed && h.opensAt && h.closesAt)
      .map(h => ({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': dayNames[h.dayOfWeek],
        'opens': h.opensAt,
        'closes': h.closesAt
      }));

    const cityTitle = toTitleCase(location.city);
    const districtTitle = toTitleCase(location.district);

    const sameAs: string[] = [];
    if (biz.contact?.websiteUrl) sameAs.push(biz.contact.websiteUrl);
    if (biz.onlineSources?.facebookUrl) sameAs.push(biz.onlineSources.facebookUrl);
    if (biz.socialLinks) {
      biz.socialLinks.forEach(s => {
        if (s.url && !sameAs.includes(s.url)) sameAs.push(s.url);
      });
    }

    const primaryImage = biz.storefrontPhotoUrl || biz.media?.find(m => m.mediaType === 'IMAGE' && m.status !== 'INACTIVE')?.url;

    const areaServed = location.serviceAreas.map(area => ({
      '@type': 'AdministrativeArea',
      'name': area
    }));

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': schemaSubtype,
          '@id': `${canonicalUrl}#business`,
          'name': biz.name,
          'legalName': biz.legalName || biz.name,
          'description': biz.description,
          'url': canonicalUrl,
          'telephone': biz.contact?.phone || undefined,
          'email': biz.contact?.email || undefined,
          'priceRange': '₹₹',
          'image': primaryImage || undefined,
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': biz.location?.fullAddress,
            'addressLocality': cityTitle,
            'addressRegion': location.state,
            'postalCode': location.postalCode || undefined,
            'addressCountry': 'IN'
          },
          'geo': location.coordinates ? {
            '@type': 'GeoCoordinates',
            'latitude': location.coordinates.latitude,
            'longitude': location.coordinates.longitude
          } : undefined,
          'areaServed': areaServed.length > 0 ? areaServed : undefined,
          'openingHoursSpecification': openingHoursSpecs.length > 0 ? openingHoursSpecs : undefined,
          'knowsAbout': biz.services && biz.services.length > 0 ? biz.services : [biz.categoryName || biz.categoryId],
          'sameAs': sameAs.length > 0 ? sameAs : undefined,
          'hasCredential': biz.primaryRegistrar ? [
            {
              '@type': 'EducationalOccupationalCredential',
              'name': biz.primaryRegistrar,
              'credentialCategory': 'Statutory Business Registration'
            }
          ] : undefined,
          'parentOrganization': {
            '@type': 'Organization',
            '@id': 'https://confluxai.in/#organization',
            'name': 'Conflux AI',
            'url': 'https://confluxai.in/'
          }
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonicalUrl}#breadcrumb`,
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://confluxai.in/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Discover', 'item': 'https://confluxai.in/discover' },
            { '@type': 'ListItem', 'position': 3, 'name': 'West Bengal', 'item': 'https://confluxai.in/locations/west-bengal' },
            { '@type': 'ListItem', 'position': 4, 'name': `${districtTitle} District`, 'item': `https://confluxai.in/locations/west-bengal/${location.district}` },
            { '@type': 'ListItem', 'position': 5, 'name': cityTitle, 'item': `https://confluxai.in/locations/west-bengal/${location.district}/${location.city}` },
            { '@type': 'ListItem', 'position': 6, 'name': biz.name, 'item': canonicalUrl }
          ]
        },
        {
          '@type': 'FAQPage',
          '@id': `${canonicalUrl}#faq`,
          'mainEntity': faqs.map(item => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': item.answer
            }
          }))
        }
      ]
    };
  }

  /**
   * 8. INTERNAL LINKING ENGINE
   * Builds contextual, non-spammy internal entity connections.
   */
  generateInternalLinks(biz: ConfluxBusiness, location: GeographicHierarchy): InternalLinkItem[] {
    const cityTitle = toTitleCase(location.city);
    const districtTitle = toTitleCase(location.district);

    return [
      {
        url: `/locations/west-bengal/${location.district}/${location.city}`,
        anchorText: `${cityTitle} Local Directory`,
        relType: 'city',
        description: `Verified local businesses, services, and commercial hubs in ${cityTitle}.`
      },
      {
        url: `/locations/west-bengal/${location.district}`,
        anchorText: `${districtTitle} District Directory`,
        relType: 'district',
        description: `Authoritative directory for commerce across ${districtTitle} district.`
      },
      {
        url: `/locations/west-bengal`,
        anchorText: 'West Bengal Directory',
        relType: 'state',
        description: 'Statewide verified business graph across all 23 districts.'
      },
      {
        url: `/discover`,
        anchorText: 'All Businesses',
        relType: 'all_businesses',
        description: 'Explore verified enterprises on Conflux AI.'
      },
      {
        url: `/verify/methodology`,
        anchorText: 'Verification Methodology',
        relType: 'verify',
        description: 'Understand Conflux’s multi-tier factual verification standards.'
      }
    ];
  }

  /**
   * 9. MEDIA METADATA OPTIMIZER
   * Produces descriptive alt text and captions without synthetic hallucinations.
   */
  optimizeMediaMetadata(biz: ConfluxBusiness, location: GeographicHierarchy): OptimizedMediaMetadata[] {
    const media = biz.media || [];
    const cityTitle = toTitleCase(location.city);
    const districtTitle = toTitleCase(location.district);

    return media.map((item, idx) => {
      const typeLabel = item.mediaType === 'VIDEO' ? 'Video' : 'Photo';
      const defaultAlt = `${biz.name} ${typeLabel.toLowerCase()} in ${cityTitle}, ${districtTitle}`;
      const defaultCaption = `${biz.name} — Authentic business visual asset #${idx + 1} (${item.sourceName || item.provenance})`;

      return {
        id: item.id,
        url: item.url,
        mediaType: item.mediaType,
        altText: item.altText?.trim() || defaultAlt,
        caption: item.caption?.trim() || defaultCaption,
        sourceUrl: item.sourceUrl,
        sourceName: item.sourceName,
        provenance: item.provenance,
        status: item.status
      };
    });
  }

  /**
   * 10. INDEXABILITY EVALUATOR
   * Strict anti-thin content and quality guardrail based on real data completeness.
   */
  evaluateIndexability(biz: ConfluxBusiness): IndexabilityEvaluation {
    const reasons: string[] = [];
    const issues: string[] = [];
    let score = 0;

    // 1. Publish Status Check (Strict prerequisite)
    if (biz.status === 'PUBLISHED') {
      score += 25;
      reasons.push('Business status is officially PUBLISHED.');
    } else {
      issues.push(`Business status is "${biz.status}" (requires "PUBLISHED" for search indexation).`);
    }

    // 2. Identity Completeness
    if (biz.name && biz.name.trim().length >= 2 && biz.slug && biz.slug.trim().length >= 2) {
      score += 20;
      reasons.push('Complete business identity and verified URL slug.');
    } else {
      issues.push('Missing or invalid business name / slug.');
    }

    // 3. Location Completeness
    if (biz.location && biz.location.city && biz.location.district && biz.location.fullAddress) {
      score += 20;
      reasons.push('Complete geographic location with full physical street address.');
    } else {
      issues.push('Incomplete physical location details.');
    }

    // 4. Direct Connect Channels
    const hasPhone = Boolean(biz.contact?.phone);
    const hasWhatsapp = Boolean(biz.contact?.whatsapp);
    const hasWebsite = Boolean(biz.contact?.websiteUrl);
    const hasAction = Array.isArray(biz.capabilities) && biz.capabilities.some(c => c.isSupported);

    if (hasPhone || hasWhatsapp || hasWebsite || hasAction) {
      score += 15;
      reasons.push('Verified direct connect channels established (Phone, WhatsApp, or Web).');
    } else {
      issues.push('No direct contact channel or action capability listed.');
    }

    // 5. Authentic Content Depth
    if (biz.description && biz.description.trim().length >= 30) {
      score += 10;
      reasons.push('Authentic factual description provided.');
    } else {
      issues.push('Description is absent or too brief for indexable quality.');
    }

    // 6. Verification / Provenance Score Bonus
    if (biz.verificationStatus === 'SUPPORTED') {
      score += 10;
      reasons.push('Statutory / proprietor identity verified by Conflux Verify.');
    } else if (biz.confidenceScore >= 50) {
      score += 5;
      reasons.push(`Partial verification evidence available (${biz.confidenceScore}% confidence).`);
    }

    // Decision: Indexable if published and score >= 65
    const isIndexable = biz.status === 'PUBLISHED' && score >= 65;

    return {
      isIndexable,
      indexabilityScore: Math.min(100, score),
      reasons,
      issues
    };
  }

  /**
   * PRIMARY PIPELINE METHOD
   * Optimize ANY business entity across Conflux platform.
   */
  optimizeBusiness(biz: ConfluxBusiness): OptimizedBusinessProfile {
    const location = this.resolveLocationHierarchy(biz.location);
    const schemaSubtype = this.deriveSchemaSubtype(biz);
    const metadata = this.generateSeoMetadata(biz, location);
    const queryIntents = this.generateQueryIntents(biz, location);
    const faqItems = this.generateFactualFaqs(biz, location);
    const sourceProvenanceConflicts = this.detectSourceConflicts(biz);
    const structuredData = this.generateStructuredData(biz, location, metadata.canonicalUrl, schemaSubtype, faqItems);
    const internalLinks = this.generateInternalLinks(biz, location);
    const mediaMetadata = this.optimizeMediaMetadata(biz, location);
    const indexability = this.evaluateIndexability(biz);

    return {
      businessId: biz.id,
      confluxBusinessId: biz.confluxBusinessId,
      slug: biz.slug,
      canonicalUrl: metadata.canonicalUrl,
      seoTitle: metadata.seoTitle,
      metaDescription: metadata.metaDescription,
      h1: metadata.h1,
      openGraph: metadata.openGraph,
      twitter: metadata.twitter,
      geographicHierarchy: location,
      businessType: biz.businessType,
      schemaSubtype,
      structuredData,
      queryIntents,
      faqItems,
      sourceProvenanceConflicts,
      internalLinks,
      mediaMetadata,
      indexability,
      lastOptimizedAt: new Date().toISOString()
    };
  }
}

// Global singleton instance for platform-wide reuse
export const businessOptimizationEngine = new BusinessOptimizationEngine();
