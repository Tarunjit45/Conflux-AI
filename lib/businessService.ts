// Conflux Platform — Business Graph Service Layer (Agent-Native Single Source of Truth)

import { supabase } from './supabase.ts';
import type {
  ConfluxBusiness,
  BusinessSearchParams,
  BusinessSearchResult,
  BusinessPublishStatus,
  RankingExplanation
} from '../types/business.ts';
import { generateConfluxBusinessId, slugifyBusinessName } from './businessId.ts';
import { verificationService } from './verify/verificationService.ts';

const LOCAL_STORAGE_BUSINESSES_KEY = 'conflux_business_graph_entities';

export const INITIAL_SEED_BUSINESSES: ConfluxBusiness[] = [
  {
    id: 'biz_cfx_001_ranaghat_agro',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000001',
    slug: 'ranaghat-agro-processing',
    name: 'Ranaghat Agro Processing Ltd',
    legalName: 'Ranaghat Agro Processing Private Limited',
    businessType: 'AGRO_PROCESSING',
    categoryId: 'agriculture-farming',
    categoryName: 'Agro-Processing & Cold Storage',
    subcategoryIds: ['cold-storage', 'food-processing', 'wholesale-mandi'],
    description: 'Premier food processing, packaging, and cold chain logistics facility serving fruit, vegetable, and grain farmers across Nadia and Murshidabad districts.',
    shortSummary: 'Certified food processing and cold chain logistics unit in Ranaghat, Nadia.',
    status: 'PUBLISHED',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 92.5,
    primaryRegistrar: 'Food Safety and Standards Authority of India (FSSAI)',
    evidenceSummary: 'Active FSSAI FoSCoS License #12823019000452 verified under Nadia district food processing category.',
    lastVerifiedAt: '2026-08-29T12:00:00Z',
    isClaimed: true,
    isIndexable: true,
    location: {
      id: 'loc_001',
      businessId: 'biz_cfx_001_ranaghat_agro',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'ranaghat',
      locality: 'Agro Processing Zone, NH-12 Corridor',
      postalCode: '741201',
      fullAddress: 'NH-12 Agro Corridor, Ranaghat, Nadia, West Bengal 741201',
      latitude: 23.1802,
      longitude: 88.5801,
      serviceAreas: ['nadia', 'murshidabad', 'north-24-parganas'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_001',
      businessId: 'biz_cfx_001_ranaghat_agro',
      phone: '+919830112233',
      whatsapp: '+919830112233',
      email: 'operations@ranaghatagro.in',
      websiteUrl: 'https://ranaghatagro.in',
      bookingUrl: 'https://ranaghatagro.in/procurement',
      appointmentUrl: 'https://ranaghatagro.in/book-facility',
      googleMapsUrl: 'https://maps.google.com/?q=Ranaghat+Nadia'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '08:00', closesAt: '19:00', isClosed: false },
      { dayOfWeek: 2, opensAt: '08:00', closesAt: '19:00', isClosed: false },
      { dayOfWeek: 3, opensAt: '08:00', closesAt: '19:00', isClosed: false },
      { dayOfWeek: 4, opensAt: '08:00', closesAt: '19:00', isClosed: false },
      { dayOfWeek: 5, opensAt: '08:00', closesAt: '19:00', isClosed: false },
      { dayOfWeek: 6, opensAt: '08:00', closesAt: '17:00', isClosed: false },
      { dayOfWeek: 0, isClosed: true }
    ],
    capabilities: [
      {
        id: 'cap_001_1',
        businessId: 'biz_cfx_001_ranaghat_agro',
        actionType: 'CALL',
        isSupported: true,
        phoneTarget: '+919830112233',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'cap_001_2',
        businessId: 'biz_cfx_001_ranaghat_agro',
        actionType: 'WHATSAPP',
        isSupported: true,
        phoneTarget: '+919830112233',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'cap_001_3',
        businessId: 'biz_cfx_001_ranaghat_agro',
        actionType: 'BOOKING',
        isSupported: true,
        endpointUrl: 'https://ranaghatagro.in/book-facility',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'cap_001_4',
        businessId: 'biz_cfx_001_ranaghat_agro',
        actionType: 'DIRECTIONS',
        isSupported: true,
        endpointUrl: 'https://maps.google.com/?q=23.1802,88.5801',
        verificationStatus: 'VERIFIED'
      }
    ],
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-29T12:00:00Z'
  },
  {
    id: 'biz_cfx_002_santipur_handloom',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000002',
    slug: 'santipur-tant-saree-guild',
    name: 'Santipur Tant Saree Guild',
    legalName: 'Santipur Traditional Weavers Co-operative Society',
    businessType: 'HANDLOOM_CRAFT',
    categoryId: 'handloom-textiles',
    categoryName: 'Handloom Sarees & Traditional Textiles',
    subcategoryIds: ['tant-saree', 'jacquard-weaving', 'gi-craft-export'],
    description: 'Heritage cotton handloom weaving co-operative preserving 15th-century Jacquard and Tant saree traditions with direct pan-India artisan-to-buyer wholesale catalogs.',
    shortSummary: 'GI-tagged authentic Tant saree weaving guild in Santipur, Nadia.',
    status: 'PUBLISHED',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 94.0,
    primaryRegistrar: 'Geographical Indications Registry of India (GI Tag #132)',
    evidenceSummary: 'Geographical Indication (GI) registration GI/132 active under West Bengal Handloom Directorate.',
    lastVerifiedAt: '2026-08-28T14:00:00Z',
    isClaimed: true,
    isIndexable: true,
    location: {
      id: 'loc_002',
      businessId: 'biz_cfx_002_santipur_handloom',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'santipur',
      locality: 'Weavers Quarter, Sutragarh',
      postalCode: '741404',
      fullAddress: 'Weavers Lane, Sutragarh, Santipur, Nadia, West Bengal 741404',
      latitude: 23.2505,
      longitude: 88.4320,
      serviceAreas: ['pan-india', 'global-export'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_002',
      businessId: 'biz_cfx_002_santipur_handloom',
      phone: '+919830223344',
      whatsapp: '+919830223344',
      email: 'orders@santipurtant.org',
      websiteUrl: 'https://santipurtant.org',
      googleMapsUrl: 'https://maps.google.com/?q=Santipur+Nadia'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 2, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 3, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 4, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 5, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 6, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 0, opensAt: '10:00', closesAt: '15:00', isClosed: false }
    ],
    capabilities: [
      {
        id: 'cap_002_1',
        businessId: 'biz_cfx_002_santipur_handloom',
        actionType: 'CALL',
        isSupported: true,
        phoneTarget: '+919830223344',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'cap_002_2',
        businessId: 'biz_cfx_002_santipur_handloom',
        actionType: 'WHATSAPP',
        isSupported: true,
        phoneTarget: '+919830223344',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'cap_002_3',
        businessId: 'biz_cfx_002_santipur_handloom',
        actionType: 'QUOTE_REQUEST',
        isSupported: true,
        endpointUrl: 'https://santipurtant.org/wholesale',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'cap_002_4',
        businessId: 'biz_cfx_002_santipur_handloom',
        actionType: 'DIRECTIONS',
        isSupported: true,
        endpointUrl: 'https://maps.google.com/?q=23.2505,88.4320',
        verificationStatus: 'VERIFIED'
      }
    ],
    createdAt: '2026-08-22T11:00:00Z',
    updatedAt: '2026-08-28T14:00:00Z'
  },
  {
    id: 'biz_cfx_003_abc_precision',
    confluxBusinessId: 'CFX-IN-WB-HOWRAH-000003',
    slug: 'abc-precision-components',
    name: 'ABC Precision Components Pvt Ltd',
    legalName: 'ABC Precision Engineering Private Limited',
    businessType: 'MANUFACTURER',
    categoryId: 'manufacturing-industrial',
    categoryName: 'Precision Machining & Industrial Engineering',
    subcategoryIds: ['cnc-machining', 'aerospace-tooling', 'heavy-fabrication'],
    description: 'High-tolerance CNC machining, industrial tool fabrication, and precision metallurgical casting for automotive and heavy engineering applications.',
    shortSummary: 'ISO 9001:2015 certified precision CNC machining in Howrah.',
    status: 'PUBLISHED',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'ENTERPRISE_AUTHENTICATED',
    confidenceScore: 92.0,
    primaryRegistrar: 'IAF CertSearch / Quality Management Accreditation Body',
    evidenceSummary: 'IAF CertSearch accreditation QMS-IND-2023-09841 verified active through September 2026.',
    lastVerifiedAt: '2026-08-29T11:30:00Z',
    isClaimed: true,
    isIndexable: true,
    location: {
      id: 'loc_003',
      businessId: 'biz_cfx_003_abc_precision',
      country: 'India',
      state: 'West Bengal',
      district: 'howrah',
      city: 'howrah',
      locality: 'Baltikuri Industrial Complex',
      postalCode: '711113',
      fullAddress: 'Baltikuri Industrial Estate, Howrah, West Bengal 711113',
      latitude: 22.6012,
      longitude: 88.3105,
      serviceAreas: ['eastern-india', 'pan-india'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_003',
      businessId: 'biz_cfx_003_abc_precision',
      phone: '+913326778899',
      whatsapp: '+919830556677',
      email: 'sales@abcprecision.in',
      websiteUrl: 'https://abcprecision.in',
      googleMapsUrl: 'https://maps.google.com/?q=Baltikuri+Howrah'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '08:30', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 2, opensAt: '08:30', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 3, opensAt: '08:30', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 4, opensAt: '08:30', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 5, opensAt: '08:30', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 6, opensAt: '08:30', closesAt: '14:00', isClosed: false },
      { dayOfWeek: 0, isClosed: true }
    ],
    capabilities: [
      {
        id: 'cap_003_1',
        businessId: 'biz_cfx_003_abc_precision',
        actionType: 'CALL',
        isSupported: true,
        phoneTarget: '+913326778899',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'cap_003_2',
        businessId: 'biz_cfx_003_abc_precision',
        actionType: 'QUOTE_REQUEST',
        isSupported: true,
        endpointUrl: 'https://abcprecision.in/rfq',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'cap_003_3',
        businessId: 'biz_cfx_003_abc_precision',
        actionType: 'DIRECTIONS',
        isSupported: true,
        endpointUrl: 'https://maps.google.com/?q=22.6012,88.3105',
        verificationStatus: 'VERIFIED'
      }
    ],
    createdAt: '2026-08-25T09:00:00Z',
    updatedAt: '2026-08-29T11:30:00Z'
  },
  {
    id: 'biz_cfx_004_conflux_ai',
    confluxBusinessId: 'CFX-IN-WB-KOLKATA-000004',
    slug: 'conflux-ai',
    name: 'Conflux AI',
    legalName: 'Conflux Digital Infrastructure Technologies',
    businessType: 'PROFESSIONAL_SERVICE',
    categoryId: 'it-software',
    categoryName: 'AI Engineering, Trust & Web Infrastructure',
    subcategoryIds: ['ai-automation', 'verification-engine', 'semantic-seo'],
    description: 'Trust, Discovery & Connectivity Infrastructure for Local Businesses and AI Agents. Architected by Tarunjit Biswas & Shouvik Majumdar.',
    shortSummary: 'Trust & Discovery Infrastructure for Businesses and AI Agents.',
    status: 'PUBLISHED',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'ENTERPRISE_AUTHENTICATED',
    confidenceScore: 90.0,
    primaryRegistrar: 'First-Party Engineering Docket & Statutory ROC Filings',
    evidenceSummary: 'Corroborated by executive leadership disclosures, verified public repositories, and sub-second React cloud infrastructure.',
    lastVerifiedAt: '2026-08-29T12:00:00Z',
    isClaimed: true,
    isIndexable: true,
    location: {
      id: 'loc_004',
      businessId: 'biz_cfx_004_conflux_ai',
      country: 'India',
      state: 'West Bengal',
      district: 'kolkata',
      city: 'kolkata',
      locality: 'Salt Lake Sector V',
      postalCode: '700091',
      fullAddress: 'Salt Lake Sector V, Kolkata, West Bengal 700091',
      latitude: 22.5726,
      longitude: 88.3639,
      serviceAreas: ['west-bengal', 'india', 'global'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_004',
      businessId: 'biz_cfx_004_conflux_ai',
      phone: '+919830000000',
      whatsapp: '+919830000000',
      email: 'contact@confluxai.in',
      websiteUrl: 'https://confluxai.in',
      appointmentUrl: 'https://confluxai.in/contact',
      googleMapsUrl: 'https://maps.google.com/?q=Salt+Lake+Sector+V+Kolkata'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 2, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 3, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 4, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 5, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 6, opensAt: '10:00', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 0, isClosed: true }
    ],
    capabilities: [
      {
        id: 'cap_004_1',
        businessId: 'biz_cfx_004_conflux_ai',
        actionType: 'WHATSAPP',
        isSupported: true,
        phoneTarget: '+919830000000',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'cap_004_2',
        businessId: 'biz_cfx_004_conflux_ai',
        actionType: 'APPOINTMENT',
        isSupported: true,
        endpointUrl: 'https://confluxai.in/contact',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'cap_004_3',
        businessId: 'biz_cfx_004_conflux_ai',
        actionType: 'WEBSITE',
        isSupported: true,
        endpointUrl: 'https://confluxai.in',
        verificationStatus: 'VERIFIED'
      }
    ],
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-29T12:00:00Z'
  }
];

export class BusinessService {
  private memoryCache: ConfluxBusiness[] | null = null;

  private getLocalStore(): ConfluxBusiness[] {
    if (typeof localStorage === 'undefined') {
      if (!this.memoryCache) {
        this.memoryCache = JSON.parse(JSON.stringify(INITIAL_SEED_BUSINESSES));
      }
      return this.memoryCache || INITIAL_SEED_BUSINESSES;
    }

    const raw = localStorage.getItem(LOCAL_STORAGE_BUSINESSES_KEY);
    if (!raw) {
      this.setLocalStore(INITIAL_SEED_BUSINESSES);
      return INITIAL_SEED_BUSINESSES;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback on parse error
    }
    this.setLocalStore(INITIAL_SEED_BUSINESSES);
    return INITIAL_SEED_BUSINESSES;
  }

  private setLocalStore(data: ConfluxBusiness[]) {
    this.memoryCache = data;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_BUSINESSES_KEY, JSON.stringify(data));
    }
  }

  /**
   * Check if a business is currently open based on its operating hours
   */
  isBusinessOpenNow(hours: ConfluxBusiness['operatingHours']): boolean {
    if (!hours || hours.length === 0) return false;
    const now = new Date();
    const currentDay = now.getDay();
    const todayHours = hours.find(h => h.dayOfWeek === currentDay);
    if (!todayHours || todayHours.isClosed || !todayHours.opensAt || !todayHours.closesAt) {
      return false;
    }

    const [openH, openM] = todayHours.opensAt.split(':').map(Number);
    const [closeH, closeM] = todayHours.closesAt.split(':').map(Number);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
  }

  /**
   * Calculate Explainable Organic Ranking Score & Reason Codes
   */
  calculateOrganicRank(biz: ConfluxBusiness, params?: BusinessSearchParams): RankingExplanation {
    let score = 50.0;
    const reasonCodes: string[] = [];

    // 1. Verification Depth (20 pts)
    if (biz.verificationStatus === 'SUPPORTED') {
      score += 20;
      reasonCodes.push('TIER_1_STATUTORY_VERIFIED');
    } else if (biz.verificationStatus === 'PARTIALLY_SUPPORTED') {
      score += 10;
      reasonCodes.push('PARTIAL_VERIFICATION_EVIDENCE');
    }

    // 2. Location Match (25 pts)
    if (params?.district && biz.location.district.toLowerCase() === params.district.toLowerCase()) {
      score += 15;
      reasonCodes.push('DISTRICT_CORRIDOR_MATCH');
    }
    if (params?.city && biz.location.city.toLowerCase() === params.city.toLowerCase()) {
      score += 10;
      reasonCodes.push('EXACT_CITY_LOCALITY_MATCH');
    }

    // 3. Category Match (20 pts)
    if (params?.category && (biz.categoryId.toLowerCase().includes(params.category.toLowerCase()) || biz.categoryName?.toLowerCase().includes(params.category.toLowerCase()))) {
      score += 20;
      reasonCodes.push('CATEGORY_INTENT_MATCH');
    }

    // 4. Open Now Bonus (10 pts)
    if (this.isBusinessOpenNow(biz.operatingHours)) {
      score += 10;
      reasonCodes.push('OPEN_NOW_CONFIRMED');
    }

    // 5. Capability Match (10 pts)
    if (params?.requiredAction) {
      const hasAction = biz.capabilities.some(c => c.actionType === params.requiredAction && c.isSupported);
      if (hasAction) {
        score += 10;
        reasonCodes.push(`CAPABILITY_${params.requiredAction}_SUPPORTED`);
      }
    }

    // 6. Completeness
    if (biz.contact.phone && biz.contact.whatsapp && biz.location.fullAddress) {
      score += 5;
      reasonCodes.push('PROFILE_INFORMATION_COMPLETE');
    }

    return {
      score: Math.min(100, Math.max(0, Number(score.toFixed(1)))),
      reasonCodes
    };
  }

  /**
   * Search and filter businesses in the Business Graph
   */
  async searchBusinesses(params: BusinessSearchParams = {}): Promise<BusinessSearchResult[]> {
    let list = this.getLocalStore();

    // Only published businesses for general search unless requested
    list = list.filter(b => b.status === 'PUBLISHED');

    if (params.query) {
      const rawQ = params.query.toLowerCase().trim();
      const tokens = rawQ
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 1 && !['in', 'at', 'near', 'the', 'for', 'of', 'and', 'best', 'top'].includes(t));

      list = list.filter(b => {
        const haystack = `${b.name} ${b.legalName || ''} ${b.description} ${b.categoryId} ${b.categoryName || ''} ${b.location.city} ${b.location.district} ${b.confluxBusinessId}`.toLowerCase();
        if (haystack.includes(rawQ)) return true;
        if (tokens.length > 0) {
          return tokens.every(token => haystack.includes(token)) || tokens.some(token => haystack.includes(token));
        }
        return false;
      });
    }

    if (params.district) {
      const dist = params.district.toLowerCase().trim();
      list = list.filter(b => b.location.district.toLowerCase() === dist);
    }

    if (params.city) {
      const city = params.city.toLowerCase().trim();
      list = list.filter(b => b.location.city.toLowerCase() === city);
    }

    if (params.category) {
      const cat = params.category.toLowerCase().trim();
      list = list.filter(b =>
        b.categoryId.toLowerCase().includes(cat) ||
        (b.categoryName && b.categoryName.toLowerCase().includes(cat))
      );
    }

    if (params.verifiedOnly) {
      list = list.filter(b => b.verificationStatus === 'SUPPORTED');
    }

    if (params.openNow) {
      list = list.filter(b => this.isBusinessOpenNow(b.operatingHours));
    }

    if (params.requiredAction) {
      list = list.filter(b =>
        b.capabilities.some(c => c.actionType === params.requiredAction && c.isSupported)
      );
    }

    // Calculate ranking scores
    const results: BusinessSearchResult[] = list.map(b => ({
      business: b,
      rankingExplanation: this.calculateOrganicRank(b, params)
    }));

    // Sort by rank score descending
    results.sort((a, b) => b.rankingExplanation.score - a.rankingExplanation.score);

    return results;
  }

  /**
   * Get all businesses (including drafts, for admin console)
   */
  async getAllBusinesses(): Promise<ConfluxBusiness[]> {
    return this.getLocalStore();
  }

  /**
   * Get business by slug
   */
  async getBusinessBySlug(slug: string): Promise<ConfluxBusiness | null> {
    const list = this.getLocalStore();
    const clean = slug.toLowerCase().trim();
    return list.find(b => b.slug.toLowerCase() === clean) || null;
  }

  /**
   * Get business by ID or Conflux Business ID
   */
  async getBusinessById(idOrCfxId: string): Promise<ConfluxBusiness | null> {
    const list = this.getLocalStore();
    const clean = idOrCfxId.trim();
    return list.find(b => b.id === clean || b.confluxBusinessId === clean) || null;
  }

  /**
   * Create a new business entity
   * Defaults to status 'DRAFT' and verification 'UNVERIFIED'
   */
  async createBusiness(input: {
    name: string;
    legalName?: string;
    businessType: ConfluxBusiness['businessType'];
    categoryId: string;
    categoryName?: string;
    description: string;
    shortSummary?: string;
    district: string;
    city: string;
    fullAddress: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    websiteUrl?: string;
    bookingUrl?: string;
  }): Promise<ConfluxBusiness> {
    const list = this.getLocalStore();
    const sequenceNumber = list.length + 1;
    const confluxBusinessId = generateConfluxBusinessId({
      district: input.district,
      sequenceNumber
    });

    const slug = slugifyBusinessName(input.name);
    const bizId = `biz_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newBusiness: ConfluxBusiness = {
      id: bizId,
      confluxBusinessId,
      slug,
      name: input.name.trim(),
      legalName: input.legalName?.trim(),
      businessType: input.businessType,
      categoryId: input.categoryId,
      categoryName: input.categoryName || input.categoryId.replace(/-/g, ' '),
      description: input.description.trim(),
      shortSummary: input.shortSummary?.trim() || input.description.slice(0, 150),
      status: 'DRAFT', // Default is DRAFT
      verificationStatus: 'UNVERIFIED', // Non-negotiable default
      verificationLevel: 'NONE',
      confidenceScore: 0.0,
      isClaimed: false,
      isIndexable: false,
      location: {
        id: `loc_${Date.now()}`,
        businessId: bizId,
        country: 'India',
        state: 'West Bengal',
        district: input.district.toLowerCase().trim(),
        city: input.city.toLowerCase().trim(),
        fullAddress: input.fullAddress.trim(),
        isPrimary: true
      },
      contact: {
        id: `cnt_${Date.now()}`,
        businessId: bizId,
        phone: input.phone?.trim(),
        whatsapp: input.whatsapp?.trim(),
        email: input.email?.trim(),
        websiteUrl: input.websiteUrl?.trim(),
        bookingUrl: input.bookingUrl?.trim()
      },
      operatingHours: [
        { dayOfWeek: 1, opensAt: '09:00', closesAt: '18:00', isClosed: false },
        { dayOfWeek: 2, opensAt: '09:00', closesAt: '18:00', isClosed: false },
        { dayOfWeek: 3, opensAt: '09:00', closesAt: '18:00', isClosed: false },
        { dayOfWeek: 4, opensAt: '09:00', closesAt: '18:00', isClosed: false },
        { dayOfWeek: 5, opensAt: '09:00', closesAt: '18:00', isClosed: false },
        { dayOfWeek: 6, opensAt: '09:00', closesAt: '15:00', isClosed: false },
        { dayOfWeek: 0, isClosed: true }
      ],
      capabilities: [
        ...(input.phone ? [{
          id: `cap_${Date.now()}_call`,
          businessId: bizId,
          actionType: 'CALL' as const,
          isSupported: true,
          phoneTarget: input.phone.trim(),
          verificationStatus: 'UNVERIFIED' as const
        }] : []),
        ...(input.whatsapp ? [{
          id: `cap_${Date.now()}_wa`,
          businessId: bizId,
          actionType: 'WHATSAPP' as const,
          isSupported: true,
          phoneTarget: input.whatsapp.trim(),
          verificationStatus: 'UNVERIFIED' as const
        }] : []),
        ...(input.bookingUrl ? [{
          id: `cap_${Date.now()}_book`,
          businessId: bizId,
          actionType: 'BOOKING' as const,
          isSupported: true,
          endpointUrl: input.bookingUrl.trim(),
          verificationStatus: 'UNVERIFIED' as const
        }] : [])
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.unshift(newBusiness);
    this.setLocalStore(list);

    // Try saving to Supabase if connected
    try {
      await supabase.from('businesses').insert([{
        id: newBusiness.id,
        conflux_business_id: newBusiness.confluxBusinessId,
        slug: newBusiness.slug,
        name: newBusiness.name,
        legal_name: newBusiness.legalName,
        business_type: newBusiness.businessType,
        category_id: newBusiness.categoryId,
        description: newBusiness.description,
        short_summary: newBusiness.shortSummary,
        status: newBusiness.status,
        verification_status: newBusiness.verificationStatus,
        verification_level: newBusiness.verificationLevel,
        confidence_score: newBusiness.confidenceScore,
        is_claimed: newBusiness.isClaimed,
        is_indexable: newBusiness.isIndexable
      }]);
    } catch (e) {
      console.warn('Supabase async sync note:', e);
    }

    return newBusiness;
  }

  /**
   * Update an existing business entity
   */
  async updateBusiness(id: string, updates: Partial<ConfluxBusiness>): Promise<ConfluxBusiness> {
    const list = this.getLocalStore();
    const idx = list.findIndex(b => b.id === id || b.confluxBusinessId === id);
    if (idx === -1) {
      throw new Error(`Business with ID ${id} not found.`);
    }

    const updated: ConfluxBusiness = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    list[idx] = updated;
    this.setLocalStore(list);

    // Try sync to Supabase
    try {
      await supabase.from('businesses').update({
        name: updated.name,
        legal_name: updated.legalName,
        business_type: updated.businessType,
        category_id: updated.categoryId,
        description: updated.description,
        short_summary: updated.shortSummary,
        status: updated.status,
        verification_status: updated.verificationStatus,
        verification_level: updated.verificationLevel,
        confidence_score: updated.confidenceScore,
        primary_registrar: updated.primaryRegistrar,
        evidence_summary: updated.evidenceSummary,
        is_indexable: updated.isIndexable,
        updated_at: updated.updatedAt
      }).eq('id', updated.id);
    } catch (e) {
      console.warn('Supabase async update note:', e);
    }

    return updated;
  }

  /**
   * Toggle business publish status
   */
  async setPublishStatus(id: string, status: BusinessPublishStatus): Promise<ConfluxBusiness> {
    return this.updateBusiness(id, {
      status,
      isIndexable: status === 'PUBLISHED'
    });
  }

  /**
   * Evaluate claims for a business using the Conflux Verify deterministic engine
   * and link authoritative evidence summary to the business graph node
   */
  async verifyBusinessClaim(businessId: string, claimStatement: string): Promise<ConfluxBusiness> {
    const biz = await this.getBusinessById(businessId);
    if (!biz) throw new Error('Business not found.');

    const verifyResult = await verificationService.verifyClaim({
      entityName: biz.legalName || biz.name,
      claimText: claimStatement,
      entityUrl: biz.contact.websiteUrl
    });

    const isSupported = verifyResult.status === 'SUPPORTED';
    const primaryEvidence = verifyResult.supportingEvidence[0];

    const updated = await this.updateBusiness(biz.id, {
      verificationStatus: verifyResult.status,
      verificationLevel: isSupported ? 'STATUTORY_VERIFIED' : (verifyResult.status === 'PARTIALLY_SUPPORTED' ? 'BASIC' : 'NONE'),
      confidenceScore: verifyResult.confidence,
      primaryRegistrar: primaryEvidence?.source.publisher || primaryEvidence?.source.domain || 'Statutory Registrar Verification',
      evidenceSummary: verifyResult.explanation,
      lastVerifiedAt: new Date().toISOString()
    });

    return updated;
  }

  /**
   * Delete a business entity
   */
  async deleteBusiness(id: string): Promise<void> {
    let list = this.getLocalStore();
    list = list.filter(b => b.id !== id && b.confluxBusinessId !== id);
    this.setLocalStore(list);

    try {
      await supabase.from('businesses').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase async delete note:', e);
    }
  }
}

export const businessService = new BusinessService();
