// Conflux Platform — Business Graph Service Layer (Remote Supabase PostgreSQL Engine with Production Validation)

import { supabase, isSupabaseConfigured, assertSupabaseConfigured } from './supabase.ts';
import type {
  ConfluxBusiness,
  BusinessSearchParams,
  BusinessSearchResult,
  BusinessPublishStatus,
  BusinessClaimStatus,
  RankingExplanation,
  BusinessSubmissionApplication,
  SubmissionStatus
} from '../types/business.ts';
import { generateConfluxBusinessId, slugifyBusinessName } from './businessId.ts';
import { verificationService } from './verify/verificationService.ts';

// Test/Development Memory Cache
let memoryStore: ConfluxBusiness[] = [];
let memoryApplications: BusinessSubmissionApplication[] = [];

const isValidUuid = (str: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class BusinessService {
  /**
   * Clear in-memory store (for test suites)
   */
  clearGraphStore() {
    memoryStore = [];
    memoryApplications = [];
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

    // 2. Location & Landmark Match (25 pts)
    if (params?.district && biz.location.district.toLowerCase() === params.district.toLowerCase()) {
      score += 15;
      reasonCodes.push('DISTRICT_CORRIDOR_MATCH');
    }
    if (params?.city && biz.location.city.toLowerCase() === params.city.toLowerCase()) {
      score += 10;
      reasonCodes.push('EXACT_CITY_LOCALITY_MATCH');
    }

    // 3. Category & Service Intent Match (20 pts)
    if (params?.category && (biz.categoryId.toLowerCase().includes(params.category.toLowerCase()) || biz.categoryName?.toLowerCase().includes(params.category.toLowerCase()))) {
      score += 15;
      reasonCodes.push('CATEGORY_INTENT_MATCH');
    }
    if (params?.query && biz.services && biz.services.some(s => s.toLowerCase().includes(params.query!.toLowerCase()))) {
      score += 10;
      reasonCodes.push('EXACT_SERVICE_CAPABILITY_MATCH');
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

    // 6. Direct Contact Completeness
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
   * Search and filter businesses in the Business Graph with natural intent matching
   */
  async searchBusinesses(params: BusinessSearchParams = {}): Promise<BusinessSearchResult[]> {
    let list: ConfluxBusiness[] = [];

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('businesses')
          .select('*, location:business_locations(*), capabilities:business_capabilities(*)')
          .eq('status', 'PUBLISHED');

        if (params.verifiedOnly) {
          query = query.eq('verification_status', 'SUPPORTED');
        }

        const { data, error } = await query;
        if (error) {
          throw new Error(`[SUPABASE_QUERY_ERROR] Failed to query businesses from Supabase: ${error.message}`);
        }

        if (data) {
          list = data.map(row => this.mapSupabaseRowToBusiness(row));
        }
      } catch (err: any) {
        console.warn('[BusinessService.searchBusinesses] Database query error, using memory store:', err?.message || err);
      }
    }

    // Merge in-memory published records that are not already in list
    const existingIds = new Set(list.map(b => b.id).concat(list.map(b => b.confluxBusinessId)));
    memoryStore.filter(b => b.status === 'PUBLISHED').forEach(mb => {
      if (!existingIds.has(mb.id) && !existingIds.has(mb.confluxBusinessId)) {
        list.push(mb);
      }
    });

    // Apply Client-Side & Natural Language Ranking Filters
    if (params.query) {
      const rawQ = params.query.toLowerCase().trim();
      const tokens = rawQ
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 1 && !['in', 'at', 'near', 'the', 'for', 'of', 'and', 'best', 'top', 'open'].includes(t));

      list = list.filter(b => {
        const servicesString = (b.services || []).join(' ').toLowerCase();
        const landmarkString = (b.landmark || '').toLowerCase();
        const haystack = `${b.name} ${b.legalName || ''} ${b.description} ${b.categoryId} ${b.categoryName || ''} ${b.location.city} ${b.location.district} ${landmarkString} ${servicesString} ${b.confluxBusinessId}`.toLowerCase();
        
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

    if (params.service) {
      const svc = params.service.toLowerCase().trim();
      list = list.filter(b => b.services && b.services.some(s => s.toLowerCase().includes(svc)));
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
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*, location:business_locations(*), capabilities:business_capabilities(*)')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`[SUPABASE_QUERY_ERROR] Failed to fetch businesses: ${error.message}`);
        }
        return (data || []).map(row => this.mapSupabaseRowToBusiness(row));
      } catch (err: any) {
        console.error('[BusinessService.getAllBusinesses] Database error:', err);
        throw err;
      }
    }
    return memoryStore;
  }

  /**
   * Get single business by Conflux ID or slug
   */
  async getBusinessById(id: string): Promise<ConfluxBusiness | null> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('businesses')
          .select('*, location:business_locations(*), capabilities:business_capabilities(*)');

        if (isValidUuid(id)) {
          query = query.or(`id.eq.${id},conflux_business_id.eq.${id},slug.eq.${id}`);
        } else {
          query = query.or(`conflux_business_id.eq.${id},slug.eq.${id}`);
        }

        const { data, error } = await query.maybeSingle();

        if (data) {
          return this.mapSupabaseRowToBusiness(data);
        }
      } catch (err: any) {
        console.warn('[BusinessService.getBusinessById] Database query warning:', err?.message || err);
      }
    }
    const match = memoryStore.find(b => b.id === id || b.confluxBusinessId === id || b.slug === id);
    return match || null;
  }

  /**
   * Get single business by slug
   */
  async getBusinessBySlug(slug: string): Promise<ConfluxBusiness | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*, location:business_locations(*), capabilities:business_capabilities(*)')
          .eq('slug', slug.toLowerCase())
          .maybeSingle();

        if (data) {
          return this.mapSupabaseRowToBusiness(data);
        }
      } catch (err: any) {
        console.warn('[BusinessService.getBusinessBySlug] Database query warning:', err?.message || err);
      }
    }
    const match = memoryStore.find(b => b.slug.toLowerCase() === slug.toLowerCase());
    return match || null;
  }

  /**
   * Create a new business node (Default: DRAFT + UNVERIFIED)
   */
  async createBusiness(input: {
    name: string;
    legalName?: string;
    businessType: ConfluxBusiness['businessType'];
    categoryId: string;
    categoryName?: string;
    services?: string[];
    landmark?: string;
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
    storefrontPhotoUrl?: string;
    logoUrl?: string;
    ownerPhotoUrl?: string;
  }): Promise<ConfluxBusiness> {
    const allBusinesses = await this.getAllBusinesses();
    const sequenceNumber = allBusinesses.length + 1;

    const confluxBusinessId = generateConfluxBusinessId({
      district: input.district,
      sequenceNumber
    });

    const slug = slugifyBusinessName(input.name);
    const newId = generateUuid();
    const locId = generateUuid();
    const cntId = generateUuid();

    const newBiz: ConfluxBusiness = {
      id: newId,
      confluxBusinessId,
      slug,
      name: input.name,
      legalName: input.legalName,
      businessType: input.businessType,
      categoryId: input.categoryId,
      categoryName: input.categoryName,
      services: input.services || [],
      landmark: input.landmark,
      storefrontPhotoUrl: input.storefrontPhotoUrl,
      logoUrl: input.logoUrl,
      ownerPhotoUrl: input.ownerPhotoUrl,
      description: input.description,
      shortSummary: input.shortSummary || input.description.slice(0, 120),
      status: 'DRAFT',
      claimStatus: 'UNCLAIMED_PUBLIC',
      verificationStatus: 'UNVERIFIED',
      verificationLevel: 'NONE',
      confidenceScore: 0.0,
      isClaimed: false,
      isIndexable: false,
      location: {
        id: locId,
        businessId: newId,
        country: 'India',
        state: 'West Bengal',
        district: input.district,
        city: input.city,
        landmark: input.landmark,
        fullAddress: input.fullAddress,
        isPrimary: true
      },
      contact: {
        id: cntId,
        businessId: newId,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email,
        websiteUrl: input.websiteUrl,
        bookingUrl: input.bookingUrl
      },
      operatingHours: [
        { dayOfWeek: 1, opensAt: '09:00', closesAt: '19:00', isClosed: false },
        { dayOfWeek: 2, opensAt: '09:00', closesAt: '19:00', isClosed: false },
        { dayOfWeek: 3, opensAt: '09:00', closesAt: '19:00', isClosed: false },
        { dayOfWeek: 4, opensAt: '09:00', closesAt: '19:00', isClosed: false },
        { dayOfWeek: 5, opensAt: '09:00', closesAt: '19:00', isClosed: false },
        { dayOfWeek: 6, opensAt: '09:00', closesAt: '17:00', isClosed: false },
        { dayOfWeek: 0, isClosed: true }
      ],
      capabilities: [
        ...(input.phone ? [{ id: generateUuid(), businessId: newId, actionType: 'CALL' as const, isSupported: true, phoneTarget: input.phone, verificationStatus: 'UNVERIFIED' as const }] : []),
        ...(input.whatsapp ? [{ id: generateUuid(), businessId: newId, actionType: 'WHATSAPP' as const, isSupported: true, phoneTarget: input.whatsapp, verificationStatus: 'UNVERIFIED' as const }] : []),
        ...(input.bookingUrl ? [{ id: generateUuid(), businessId: newId, actionType: 'BOOKING' as const, isSupported: true, endpointUrl: input.bookingUrl, verificationStatus: 'UNVERIFIED' as const }] : [])
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { error: bizError } = await supabase.from('businesses').insert([{
          id: newBiz.id,
          conflux_business_id: newBiz.confluxBusinessId,
          slug: newBiz.slug,
          name: newBiz.name,
          legal_name: newBiz.legalName,
          business_type: newBiz.businessType,
          category_id: newBiz.categoryId,
          category_name: newBiz.categoryName,
          services: newBiz.services,
          landmark: newBiz.landmark,
          storefront_photo_url: newBiz.storefrontPhotoUrl,
          description: newBiz.description,
          short_summary: newBiz.shortSummary,
          status: newBiz.status,
          claim_status: newBiz.claimStatus,
          verification_status: newBiz.verificationStatus,
          verification_level: newBiz.verificationLevel,
          confidence_score: newBiz.confidenceScore,
          created_at: newBiz.createdAt,
          updated_at: newBiz.updatedAt
        }]);
        if (bizError) throw bizError;

        await supabase.from('business_locations').insert([{
          id: newBiz.location.id,
          business_id: newBiz.id,
          country: newBiz.location.country,
          state: newBiz.location.state,
          district: newBiz.location.district,
          city: newBiz.location.city,
          landmark: newBiz.location.landmark,
          full_address: newBiz.location.fullAddress,
          is_primary: true
        }]);

        if (newBiz.capabilities.length > 0) {
          await supabase.from('business_capabilities').insert(
            newBiz.capabilities.map(c => ({
              id: c.id,
              business_id: newBiz.id,
              action_type: c.actionType,
              is_supported: c.isSupported,
              phone_target: c.phoneTarget,
              endpoint_url: c.endpointUrl,
              verification_status: c.verificationStatus
            }))
          );
        }
      } catch (err: any) {
        console.warn('[BusinessService.createBusiness] Database insert skipped or failed (falling back to memory store):', err?.message || err);
      }
    }

    memoryStore.unshift(newBiz);
    return newBiz;
  }

  /**
   * Update an existing business node
   */
  async updateBusiness(id: string, updates: Partial<ConfluxBusiness>): Promise<ConfluxBusiness> {
    if (isSupabaseConfigured()) {
      try {
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
        if (updates.verificationBreakdown) payload.verification_breakdown = updates.verificationBreakdown;
        if (updates.lastVerifiedAt) payload.last_verified_at = updates.lastVerifiedAt;

        let updateQuery = supabase.from('businesses').update(payload);
        if (isValidUuid(id)) {
          updateQuery = updateQuery.eq('id', id);
        } else {
          updateQuery = updateQuery.or(`conflux_business_id.eq.${id},slug.eq.${id}`);
        }
        const { error } = await updateQuery;
        if (error) throw error;
      } catch (err: any) {
        console.error('[BusinessService.updateBusiness] Database error:', err);
        throw err;
      }
    }

    const idx = memoryStore.findIndex(b => b.id === id);
    if (idx !== -1) {
      memoryStore[idx] = { ...memoryStore[idx], ...updates, updatedAt: new Date().toISOString() };
      return memoryStore[idx];
    }

    const fetched = await this.getBusinessById(id);
    if (!fetched) throw new Error(`Business with ID ${id} not found.`);
    return { ...fetched, ...updates };
  }

  /**
   * Submit an ownership claim for a publicly documented entity
   */
  async claimBusiness(
    businessId: string,
    ownerInfo: {
      ownerName: string;
      ownerEmail: string;
      ownerPhone: string;
      statutoryProofText: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const biz = await this.getBusinessById(businessId);
    if (!biz) {
      throw new Error('Business entity not found.');
    }

    await this.updateBusiness(biz.id, {
      claimStatus: 'CLAIM_PENDING',
      evidenceSummary: `Ownership claim by ${ownerInfo.ownerName}: ${ownerInfo.statutoryProofText}`
    });

    // Run verification on the claim statement
    await verificationService.verifyClaim({
      entityName: biz.name,
      claimText: `${biz.name} ownership claim by ${ownerInfo.ownerName}: ${ownerInfo.statutoryProofText}`,
      sourceUrls: [biz.contact.websiteUrl || 'https://mca.gov.in']
    });

    return {
      success: true,
      message: 'Claim request submitted successfully. Our verification team will review your statutory credentials.'
    };
  }

  /**
   * Approve an owner claim after statutory review
   */
  async approveClaim(businessId: string): Promise<ConfluxBusiness> {
    return this.updateBusiness(businessId, {
      claimStatus: 'VERIFIED_OWNER',
      isClaimed: true
    });
  }

  /**
   * Reject an owner claim after statutory review
   */
  async rejectClaim(businessId: string, rejectionReason?: string): Promise<ConfluxBusiness> {
    return this.updateBusiness(businessId, {
      claimStatus: 'UNCLAIMED_PUBLIC',
      isClaimed: false
    });
  }

  /**
   * Suspend a business entity from public visibility
   */
  async suspendBusiness(businessId: string): Promise<ConfluxBusiness> {
    return this.updateBusiness(businessId, {
      status: 'SUSPENDED',
      isIndexable: false
    });
  }

  /**
   * Transition publication status
   */
  async setPublishStatus(id: string, status: BusinessPublishStatus): Promise<ConfluxBusiness> {
    return this.updateBusiness(id, {
      status,
      isIndexable: status === 'PUBLISHED'
    });
  }

  /**
   * Link and execute Conflux Verify evaluation for a business entity
   */
  async verifyBusinessClaim(businessId: string, claimStatement: string): Promise<ConfluxBusiness> {
    const biz = await this.getBusinessById(businessId);
    if (!biz) {
      throw new Error(`Business ${businessId} not found.`);
    }

    const result = await verificationService.verifyClaim({
      entityName: biz.name,
      claimText: claimStatement,
      sourceUrls: [biz.contact.websiteUrl || 'https://mca.gov.in']
    });

    const confidenceScore = result.confidence || (result.status === 'SUPPORTED' ? 90.0 : 40.0);
    const verificationLevel = result.status === 'SUPPORTED' ? 'STATUTORY_VERIFIED' : 'NONE';
    const primaryRegistrarName = result.supportingEvidence?.[0]?.source?.publisher || result.supportingEvidence?.[0]?.source?.title || 'Primary Statutory Registry Docket';

    return this.updateBusiness(biz.id, {
      verificationStatus: result.status,
      verificationLevel,
      confidenceScore,
      primaryRegistrar: primaryRegistrarName,
      evidenceSummary: result.explanation,
      verificationBreakdown: {
        identityVerified: result.status === 'SUPPORTED',
        locationVerified: result.status === 'SUPPORTED',
        statutoryLicenseVerified: result.status === 'SUPPORTED',
        capabilitiesVerified: true,
        contactVerified: true,
        primaryRegistrarName,
        verificationMethodologyUrl: '/verify/methodology'
      },
      lastVerifiedAt: new Date().toISOString()
    });
  }

  /**
   * Delete a business node
   */
  async deleteBusiness(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        let deleteQuery = supabase.from('businesses').delete();
        if (isValidUuid(id)) {
          deleteQuery = deleteQuery.or(`id.eq.${id},conflux_business_id.eq.${id}`);
        } else {
          deleteQuery = deleteQuery.eq('conflux_business_id', id);
        }
        const { error } = await deleteQuery;
        if (error) throw error;
        return true;
      } catch (err: any) {
        console.error('[BusinessService.deleteBusiness] Database error:', err);
        throw err;
      }
    }
    const initialLen = memoryStore.length;
    memoryStore = memoryStore.filter(b => b.id !== id && b.confluxBusinessId !== id);
    return memoryStore.length !== initialLen;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // APPLICATION SUBMISSION & AUDIT METHODS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Submit a new business listing or Conflux Verified application
   */
  async submitApplication(
    input: Omit<BusinessSubmissionApplication, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'confluxBusinessId'>
  ): Promise<BusinessSubmissionApplication> {
    if (!input.businessName || input.businessName.trim().length < 2) {
      throw new Error('Business name is required (minimum 2 characters).');
    }
    if (!input.description || input.description.trim().length < 5) {
      throw new Error('Brief business description is required (minimum 5 characters).');
    }
    if (!input.fullAddress || input.fullAddress.trim().length < 3) {
      throw new Error('Business location or address is required.');
    }
    if (!input.phone || input.phone.trim().length < 6) {
      throw new Error('Valid business contact phone is required.');
    }
    if (!input.ownerName || input.ownerName.trim().length < 2) {
      throw new Error('Representative or owner name is required.');
    }

    const allApps = await this.getAllApplications();
    const appId = `APP-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}${Math.floor(10 + Math.random() * 90)}`;
    const allBusinesses = await this.getAllBusinesses();
    const confluxBusinessId = generateConfluxBusinessId({
      district: input.district || 'nadia',
      sequenceNumber: allBusinesses.length + allApps.length + Math.floor(Math.random() * 1000) + 1
    });

    const safeEmail = (input.email && input.email.trim()) ? input.email.trim() : 'contact@onboarding.confluxai.in';
    const safePhone = input.phone.trim();
    const safeOwnerPhone = (input.ownerPhone && input.ownerPhone.trim()) ? input.ownerPhone.trim() : safePhone;

    const newApp: BusinessSubmissionApplication = {
      ...input,
      id: appId,
      confluxBusinessId,
      status: 'SUBMITTED',
      evidenceStatus: input.evidenceStatus || 'PENDING_REVIEW',
      confluxPlan: input.confluxPlan || 'FREE',
      paymentStatus: input.paymentStatus || 'NOT_APPLICABLE',
      email: safeEmail,
      phone: safePhone,
      ownerPhone: safeOwnerPhone,
      ownerEmail: (input.ownerEmail && input.ownerEmail.trim()) ? input.ownerEmail.trim() : safeEmail,
      services: input.services || [],
      privateEvidence: input.privateEvidence || [],
      declarationConfirmed: input.declarationConfirmed ?? true,
      noStockImagesConfirmed: input.noStockImagesConfirmed ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        // Serialize onlineSources & serviceInterestRequests into admin_notes for database persistence
        const metadataNote = JSON.stringify({
          onlineSources: newApp.onlineSources,
          serviceInterestRequests: newApp.serviceInterestRequests,
          hasWebsite: newApp.hasWebsite,
          evidenceStatus: newApp.evidenceStatus,
          confluxPlan: newApp.confluxPlan,
          paymentStatus: newApp.paymentStatus
        });

        const { error: appError } = await supabase.from('business_applications').insert([{
          id: newApp.id,
          conflux_business_id: newApp.confluxBusinessId,
          submission_type: newApp.submissionType,
          business_name: newApp.businessName,
          legal_name: newApp.legalName,
          business_type: newApp.businessType,
          category_id: newApp.categoryId,
          category_name: newApp.categoryName,
          description: newApp.description,
          district: newApp.district,
          city: newApp.city,
          landmark: newApp.landmark,
          full_address: newApp.fullAddress,
          phone: newApp.phone,
          whatsapp: newApp.whatsapp || newApp.phone,
          email: newApp.email,
          website_url: newApp.websiteUrl,
          booking_url: newApp.bookingUrl,
          owner_name: newApp.ownerName,
          owner_role: newApp.ownerRole,
          storefront_photo_url: newApp.storefrontPhotoUrl,
          status: newApp.status,
          admin_notes: metadataNote,
          created_at: newApp.createdAt,
          updated_at: newApp.updatedAt
        }]);
        if (appError) throw appError;

        // Isolate Private Evidence Documents into dedicated private table with strict RLS
        if (newApp.privateEvidence && newApp.privateEvidence.length > 0) {
          await supabase.from('private_evidence_documents').insert(
            newApp.privateEvidence.map(doc => ({
              application_id: newApp.id,
              document_type: doc.documentType,
              document_name: doc.documentName,
              document_number: doc.documentNumber,
              document_file_url: doc.documentFileUrl || 'https://secure-vault.confluxai.in/private/docket.pdf',
              is_private: true
            }))
          );
        }
      } catch (err: any) {
        console.error('[BusinessService.submitApplication] Database error:', err);
        throw err;
      }
    }

    memoryApplications.unshift(newApp);
    return newApp;
  }

  /**
   * Retrieve all submitted applications for admin review
   */
  async getAllApplications(): Promise<BusinessSubmissionApplication[]> {
    let list: BusinessSubmissionApplication[] = [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('business_applications')
          .select('*, private_evidence:private_evidence_documents(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          list = data.map(row => {
            let meta: any = {};
            try {
              if (row.admin_notes && (row.admin_notes.startsWith('{') || row.admin_notes.startsWith('['))) {
                meta = JSON.parse(row.admin_notes);
              }
            } catch (e) {}

            return {
              id: row.id,
              confluxBusinessId: row.conflux_business_id,
              submissionType: row.submission_type,
              businessName: row.business_name,
              legalName: row.legal_name,
              businessType: row.business_type,
              categoryId: row.category_id,
              categoryName: row.category_name,
              description: row.description,
              district: row.district,
              city: row.city,
              landmark: row.landmark,
              fullAddress: row.full_address,
              phone: row.phone,
              whatsapp: row.whatsapp,
              email: row.email,
              websiteUrl: row.website_url,
              hasWebsite: meta.hasWebsite ?? Boolean(row.website_url),
              bookingUrl: row.booking_url,
              ownerName: row.owner_name,
              ownerRole: row.owner_role,
              ownerPhone: row.phone,
              ownerEmail: row.email,
              onlineSources: meta.onlineSources,
              serviceInterestRequests: meta.serviceInterestRequests,
              evidenceStatus: meta.evidenceStatus || 'PENDING_REVIEW',
              detectedConflicts: meta.detectedConflicts || [],
              confluxPlan: meta.confluxPlan || 'FREE',
              paymentStatus: meta.paymentStatus || 'NOT_APPLICABLE',
              storefrontPhotoUrl: row.storefront_photo_url,
              logoUrl: row.logo_url,
              ownerPhotoUrl: row.owner_photo_url,
              status: row.status,
              adminNotes: row.admin_notes,
              changesRequestedMessage: row.changes_requested_message,
              privateEvidence: (row.private_evidence || []).map((d: any) => ({
                documentType: d.document_type,
                documentName: d.document_name,
                documentNumber: d.document_number,
                documentFileUrl: d.document_file_url,
                isPrivate: true
              })),
              declarationConfirmed: true,
              noStockImagesConfirmed: true,
              services: [],
              createdAt: row.created_at,
              updatedAt: row.updated_at
            };
          });
        }
      } catch (err: any) {
        console.error('[BusinessService.getAllApplications] Database error:', err);
      }
    }

    // Merge in-memory applications that are not already in list
    const existingIds = new Set(list.map(a => a.id).concat(list.map(a => a.confluxBusinessId)));
    memoryApplications.forEach(ma => {
      if (!existingIds.has(ma.id) && !existingIds.has(ma.confluxBusinessId)) {
        list.push(ma);
      }
    });

    return list;
  }

  /**
   * Admin: Permanently delete an application and its associated private evidence
   */
  async deleteApplication(appId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('private_evidence_documents').delete().eq('application_id', appId);
        const { error } = await supabase.from('business_applications').delete().eq('id', appId);
        if (error) {
          console.error('[BusinessService.deleteApplication] Database error:', error);
        }
      } catch (err) {
        console.error('[BusinessService.deleteApplication] Exception:', err);
      }
    }
    memoryApplications = memoryApplications.filter(a => a.id !== appId);
    return true;
  }

  /**
   * Admin: Approve application as Standard Listing
   */
  async approveApplicationAsStandard(appId: string): Promise<ConfluxBusiness> {
    const apps = await this.getAllApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);

    if (isSupabaseConfigured()) {
      await supabase.from('business_applications').update({
        status: 'APPROVED',
        updated_at: new Date().toISOString()
      }).eq('id', appId);
    }
    app.status = 'APPROVED';
    app.updatedAt = new Date().toISOString();

    const created = await this.createBusiness({
      name: app.businessName,
      legalName: app.legalName,
      businessType: app.businessType,
      categoryId: app.categoryId,
      categoryName: app.categoryName,
      description: app.description,
      district: app.district,
      city: app.city,
      landmark: app.landmark,
      services: app.services,
      fullAddress: app.fullAddress,
      phone: app.phone,
      whatsapp: app.whatsapp,
      email: app.email,
      websiteUrl: app.websiteUrl,
      bookingUrl: app.bookingUrl,
      storefrontPhotoUrl: app.storefrontPhotoUrl,
      logoUrl: app.logoUrl,
      ownerPhotoUrl: app.ownerPhotoUrl
    });

    return this.updateBusiness(created.id, {
      status: 'PUBLISHED',
      claimStatus: 'VERIFIED_OWNER',
      verificationStatus: 'UNVERIFIED',
      verificationLevel: 'BASIC',
      isIndexable: true,
      isClaimed: true,
      evidenceSummary: 'Standard business listing submitted by authorized proprietor.'
    });
  }

  /**
   * Admin: Approve application as Conflux Verified
   */
  async approveApplicationAsVerified(
    appId: string,
    primaryRegistrar?: string,
    evidenceSummary?: string
  ): Promise<ConfluxBusiness> {
    const apps = await this.getAllApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);

    if (isSupabaseConfigured()) {
      await supabase.from('business_applications').update({
        status: 'VERIFIED',
        updated_at: new Date().toISOString()
      }).eq('id', appId);
    }
    app.status = 'VERIFIED';
    app.updatedAt = new Date().toISOString();

    const created = await this.createBusiness({
      name: app.businessName,
      legalName: app.legalName,
      businessType: app.businessType,
      categoryId: app.categoryId,
      categoryName: app.categoryName,
      description: app.description,
      district: app.district,
      city: app.city,
      landmark: app.landmark,
      services: app.services,
      fullAddress: app.fullAddress,
      phone: app.phone,
      whatsapp: app.whatsapp,
      email: app.email,
      websiteUrl: app.websiteUrl,
      bookingUrl: app.bookingUrl,
      storefrontPhotoUrl: app.storefrontPhotoUrl,
      logoUrl: app.logoUrl,
      ownerPhotoUrl: app.ownerPhotoUrl
    });

    const registrar = primaryRegistrar || 'Primary Statutory Regulatory Docket';
    const evidence = evidenceSummary || `Statutory registration verified against official dockets for ${app.businessName}.`;

    return this.updateBusiness(created.id, {
      status: 'PUBLISHED',
      claimStatus: 'VERIFIED_OWNER',
      verificationStatus: 'SUPPORTED',
      verificationLevel: 'STATUTORY_VERIFIED',
      confidenceScore: 92.0,
      primaryRegistrar: registrar,
      evidenceSummary: evidence,
      isIndexable: true,
      isClaimed: true,
      lastVerifiedAt: new Date().toISOString(),
      verificationBreakdown: {
        identityVerified: true,
        locationVerified: true,
        statutoryLicenseVerified: true,
        capabilitiesVerified: true,
        contactVerified: true,
        primaryRegistrarName: registrar,
        verificationMethodologyUrl: '/verify/methodology'
      }
    });
  }

  /**
   * Admin: Request changes on an application
   */
  async requestApplicationChanges(appId: string, message: string): Promise<BusinessSubmissionApplication> {
    if (isSupabaseConfigured()) {
      await supabase.from('business_applications').update({
        status: 'CHANGES_REQUESTED',
        changes_requested_message: message,
        updated_at: new Date().toISOString()
      }).eq('id', appId);
    }
    const apps = await this.getAllApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);
    app.status = 'CHANGES_REQUESTED';
    app.changesRequestedMessage = message;
    app.updatedAt = new Date().toISOString();
    return app;
  }

  /**
   * Admin: Mark application as Insufficient Evidence
   */
  async markApplicationInsufficientEvidence(appId: string, notes: string): Promise<BusinessSubmissionApplication> {
    const apps = await this.getAllApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);
    
    app.evidenceStatus = 'INSUFFICIENT_EVIDENCE';
    app.adminNotes = notes;
    app.updatedAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      await supabase.from('business_applications').update({
        admin_notes: notes,
        updated_at: app.updatedAt
      }).eq('id', appId);
    }
    return app;
  }

  /**
   * Admin: Update evidence status and detected conflicts
   */
  async updateApplicationEvidenceStatus(
    appId: string,
    evidenceStatus: BusinessSubmissionApplication['evidenceStatus'],
    conflicts: string[] = []
  ): Promise<BusinessSubmissionApplication> {
    const apps = await this.getAllApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);

    app.evidenceStatus = evidenceStatus;
    app.detectedConflicts = conflicts;
    app.updatedAt = new Date().toISOString();
    return app;
  }

  /**
   * Admin: Update commercial service plan & payment status (Strictly separated from verification!)
   */
  async updateApplicationCommercialPlan(
    appId: string,
    plan: BusinessSubmissionApplication['confluxPlan'],
    paymentStatus: BusinessSubmissionApplication['paymentStatus']
  ): Promise<BusinessSubmissionApplication> {
    const apps = await this.getAllApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);

    app.confluxPlan = plan;
    app.paymentStatus = paymentStatus;
    app.updatedAt = new Date().toISOString();
    return app;
  }

  /**
   * Admin: Reject an application
   */
  async rejectApplication(appId: string, reason: string): Promise<BusinessSubmissionApplication> {
    if (isSupabaseConfigured()) {
      await supabase.from('business_applications').update({
        status: 'REJECTED',
        admin_notes: reason,
        updated_at: new Date().toISOString()
      }).eq('id', appId);
    }
    const apps = await this.getAllApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);
    app.status = 'REJECTED';
    app.adminNotes = reason;
    app.updatedAt = new Date().toISOString();
    return app;
  }

  /**
   * Helper to map Supabase database row to ConfluxBusiness entity model
   */
  private mapSupabaseRowToBusiness(row: any): ConfluxBusiness {
    const loc = Array.isArray(row.location) ? row.location[0] : row.location;
    const caps = Array.isArray(row.capabilities) ? row.capabilities : [];

    return {
      id: row.id,
      confluxBusinessId: row.conflux_business_id,
      slug: row.slug,
      name: row.name,
      legalName: row.legal_name,
      businessType: row.business_type,
      categoryId: row.category_id,
      categoryName: row.category_name,
      subcategoryIds: row.subcategory_ids || [],
      services: row.services || [],
      landmark: row.landmark,
      storefrontPhotoUrl: row.storefront_photo_url,
      description: row.description,
      shortSummary: row.short_summary,
      status: row.status,
      claimStatus: row.claim_status,
      verificationStatus: row.verification_status,
      verificationLevel: row.verification_level,
      confidenceScore: Number(row.confidence_score) || 0.0,
      primaryRegistrar: row.primary_registrar,
      evidenceSummary: row.evidence_summary,
      verificationBreakdown: row.verification_breakdown,
      lastVerifiedAt: row.last_verified_at,
      isClaimed: row.is_claimed,
      isIndexable: row.is_indexable,
      location: {
        id: loc?.id || `loc_${row.id}`,
        businessId: row.id,
        country: loc?.country || 'India',
        state: loc?.state || 'West Bengal',
        district: loc?.district || 'nadia',
        city: loc?.city || 'ranaghat',
        locality: loc?.locality,
        landmark: loc?.landmark || row.landmark,
        postalCode: loc?.postal_code,
        fullAddress: loc?.full_address || 'Address on file',
        latitude: loc?.latitude ? Number(loc.latitude) : undefined,
        longitude: loc?.longitude ? Number(loc.longitude) : undefined,
        isPrimary: true
      },
      contact: {
        id: `cnt_${row.id}`,
        businessId: row.id,
        phone: caps.find((c: any) => c.action_type === 'CALL')?.phone_target,
        whatsapp: caps.find((c: any) => c.action_type === 'WHATSAPP')?.phone_target,
        websiteUrl: caps.find((c: any) => c.action_type === 'WEBSITE')?.endpoint_url,
        bookingUrl: caps.find((c: any) => c.action_type === 'BOOKING')?.endpoint_url
      },
      operatingHours: [
        { dayOfWeek: 1, opensAt: '09:00', closesAt: '19:00', isClosed: false },
        { dayOfWeek: 2, opensAt: '09:00', closesAt: '19:00', isClosed: false },
        { dayOfWeek: 3, opensAt: '09:00', closesAt: '19:00', isClosed: false },
        { dayOfWeek: 4, opensAt: '09:00', closesAt: '19:00', isClosed: false },
        { dayOfWeek: 5, opensAt: '09:00', closesAt: '19:00', isClosed: false },
        { dayOfWeek: 6, opensAt: '09:00', closesAt: '17:00', isClosed: false },
        { dayOfWeek: 0, isClosed: true }
      ],
      capabilities: caps.map((c: any) => ({
        id: c.id,
        businessId: row.id,
        actionType: c.action_type,
        isSupported: c.is_supported,
        phoneTarget: c.phone_target,
        endpointUrl: c.endpoint_url,
        verificationStatus: c.verification_status
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export const businessService = new BusinessService();
