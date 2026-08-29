// Conflux Platform — Business Graph Service Layer (Local Market Domination & Real Entity Foundation)

import { supabase } from './supabase.ts';
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

const LOCAL_STORAGE_BUSINESSES_KEY = 'conflux_business_graph_entities';

// Production Business Graph starts completely clean with ZERO fake/seed/demo businesses.
export const INITIAL_SEED_BUSINESSES: ConfluxBusiness[] = [];

export class BusinessService {
  private memoryCache: ConfluxBusiness[] | null = null;

  private getLocalStore(): ConfluxBusiness[] {
    if (typeof localStorage === 'undefined') {
      if (!this.memoryCache) {
        this.memoryCache = [];
      }
      return this.memoryCache;
    }

    const raw = localStorage.getItem(LOCAL_STORAGE_BUSINESSES_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Fallback on parse error
    }
    return [];
  }

  private setLocalStore(data: ConfluxBusiness[]) {
    this.memoryCache = data;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_BUSINESSES_KEY, JSON.stringify(data));
    }
  }

  /**
   * Reset local storage store to empty production state
   */
  clearGraphStore() {
    this.setLocalStore([]);
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
    let list = this.getLocalStore();

    // Only published businesses for general search
    list = list.filter(b => b.status === 'PUBLISHED');

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
    return this.getLocalStore();
  }

  /**
   * Get single business by Conflux ID or slug
   */
  async getBusinessById(id: string): Promise<ConfluxBusiness | null> {
    const list = this.getLocalStore();
    const match = list.find(b => b.id === id || b.confluxBusinessId === id || b.slug === id);
    return match || null;
  }

  /**
   * Get single business by slug
   */
  async getBusinessBySlug(slug: string): Promise<ConfluxBusiness | null> {
    const list = this.getLocalStore();
    const match = list.find(b => b.slug.toLowerCase() === slug.toLowerCase());
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
  }): Promise<ConfluxBusiness> {
    const list = this.getLocalStore();
    const sequenceNumber = list.length + 1;

    const confluxBusinessId = generateConfluxBusinessId({
      district: input.district,
      sequenceNumber
    });

    const slug = slugifyBusinessName(input.name);
    const newId = `biz_cfx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

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
        id: `loc_${Date.now()}`,
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
        id: `cnt_${Date.now()}`,
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
        ...(input.phone ? [{ id: `cap_${Date.now()}_1`, businessId: newId, actionType: 'CALL' as const, isSupported: true, phoneTarget: input.phone, verificationStatus: 'UNVERIFIED' as const }] : []),
        ...(input.whatsapp ? [{ id: `cap_${Date.now()}_2`, businessId: newId, actionType: 'WHATSAPP' as const, isSupported: true, phoneTarget: input.whatsapp, verificationStatus: 'UNVERIFIED' as const }] : []),
        ...(input.bookingUrl ? [{ id: `cap_${Date.now()}_3`, businessId: newId, actionType: 'BOOKING' as const, isSupported: true, endpointUrl: input.bookingUrl, verificationStatus: 'UNVERIFIED' as const }] : [])
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.unshift(newBiz);
    this.setLocalStore(list);
    return newBiz;
  }

  /**
   * Update an existing business node
   */
  async updateBusiness(id: string, updates: Partial<ConfluxBusiness>): Promise<ConfluxBusiness> {
    const list = this.getLocalStore();
    const idx = list.findIndex(b => b.id === id);
    if (idx === -1) {
      throw new Error(`Business with ID ${id} not found.`);
    }

    const updated = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    list[idx] = updated;
    this.setLocalStore(list);
    return updated;
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
    const list = this.getLocalStore();
    const idx = list.findIndex(b => b.id === businessId || b.confluxBusinessId === businessId);
    if (idx === -1) {
      throw new Error('Business entity not found.');
    }

    list[idx].claimStatus = 'CLAIM_PENDING';
    list[idx].updatedAt = new Date().toISOString();
    this.setLocalStore(list);

    // Run verification on the claim statement
    await verificationService.verifyClaim({
      entityName: list[idx].name,
      claimText: `${list[idx].name} ownership claim by ${ownerInfo.ownerName}: ${ownerInfo.statutoryProofText}`,
      sourceUrls: [list[idx].contact.websiteUrl || 'https://mca.gov.in']
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
      sourceUrls: [
        biz.contact.websiteUrl || 'https://mca.gov.in'
      ]
    });

    const confidenceScore = result.confidence || (result.status === 'SUPPORTED' ? 90.0 : 40.0);
    const verificationLevel = result.status === 'SUPPORTED' ? 'STATUTORY_VERIFIED' : 'NONE';

    return this.updateBusiness(biz.id, {
      verificationStatus: result.status,
      verificationLevel,
      confidenceScore,
      primaryRegistrar: result.findings?.[0]?.sourceName || 'Primary Statutory Registry Docket',
      evidenceSummary: result.explanation,
      verificationBreakdown: {
        identityVerified: result.status === 'SUPPORTED',
        locationVerified: result.status === 'SUPPORTED',
        statutoryLicenseVerified: result.status === 'SUPPORTED',
        capabilitiesVerified: true,
        contactVerified: true,
        primaryRegistrarName: result.findings?.[0]?.sourceName || 'Statutory Docket',
        verificationMethodologyUrl: '/verify/methodology'
      },
      lastVerifiedAt: new Date().toISOString()
    });
  }

  /**
   * Delete a business node
   */
  async deleteBusiness(id: string): Promise<boolean> {
    const list = this.getLocalStore();
    const filtered = list.filter(b => b.id !== id && b.confluxBusinessId !== id);
    if (filtered.length !== list.length) {
      this.setLocalStore(filtered);
      return true;
    }
    return false;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // APPLICATION SUBMISSION & AUDIT METHODS
  // ══════════════════════════════════════════════════════════════════════════

  private getApplicationsStore(): BusinessSubmissionApplication[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('conflux_business_applications');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // Storage quota guard
      }
    }
    return (this as any)._memoryApplications || [];
  }

  private setApplicationsStore(apps: BusinessSubmissionApplication[]) {
    (this as any)._memoryApplications = apps;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('conflux_business_applications', JSON.stringify(apps));
      } catch {
        // Storage quota guard
      }
    }
  }

  /**
   * Submit a new business listing or Conflux Verified application
   */
  async submitApplication(
    input: Omit<BusinessSubmissionApplication, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'confluxBusinessId'>
  ): Promise<BusinessSubmissionApplication> {
    // 1. Strict Validation
    if (!input.businessName || input.businessName.trim().length < 2) {
      throw new Error('Business name is required (minimum 2 characters).');
    }
    if (!input.description || input.description.trim().length < 10) {
      throw new Error('Description is required (minimum 10 characters).');
    }
    if (!input.fullAddress || input.fullAddress.trim().length < 5) {
      throw new Error('Complete physical address is required.');
    }
    if (!input.phone || input.phone.trim().length < 8) {
      throw new Error('Valid business contact phone is required.');
    }
    if (!input.email || !input.email.includes('@')) {
      throw new Error('Valid contact email is required.');
    }
    if (!input.ownerName || input.ownerName.trim().length < 2) {
      throw new Error('Responsible person/owner name is required.');
    }
    if (!input.declarationConfirmed) {
      throw new Error('You must confirm the ownership and accuracy declaration.');
    }
    if (!input.noStockImagesConfirmed) {
      throw new Error('You must confirm that photographs are genuine and not stock images.');
    }

    const apps = this.getApplicationsStore();
    const appId = `APP-2026-${String(apps.length + 1).padStart(4, '0')}`;
    const allBusinesses = await this.getAllBusinesses();
    const confluxBusinessId = generateConfluxBusinessId({
      district: input.district,
      sequenceNumber: allBusinesses.length + apps.length + 1
    });

    const newApp: BusinessSubmissionApplication = {
      ...input,
      id: appId,
      confluxBusinessId,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    apps.unshift(newApp);
    this.setApplicationsStore(apps);
    return newApp;
  }

  /**
   * Retrieve all submitted applications for admin review
   */
  async getAllApplications(): Promise<BusinessSubmissionApplication[]> {
    return this.getApplicationsStore();
  }

  /**
   * Retrieve single application by ID
   */
  async getApplicationById(appId: string): Promise<BusinessSubmissionApplication | null> {
    const apps = this.getApplicationsStore();
    return apps.find(a => a.id === appId) || null;
  }

  /**
   * Admin: Approve application as Standard Listing
   */
  async approveApplicationAsStandard(appId: string): Promise<ConfluxBusiness> {
    const apps = this.getApplicationsStore();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);

    app.status = 'APPROVED';
    app.updatedAt = new Date().toISOString();
    this.setApplicationsStore(apps);

    // Create published business entity in the graph
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
      storefrontPhotoUrl: app.storefrontPhotoUrl
    });

    // Publish immediately with owner-claimed standing
    return this.updateBusiness(created.id, {
      status: 'PUBLISHED',
      claimStatus: 'VERIFIED_OWNER',
      verificationStatus: 'UNVERIFIED',
      verificationLevel: 'BASIC',
      isIndexable: true,
      isClaimed: true,
      evidenceSummary: 'Standard business listing submitted by authorized proprietor. Pending statutory evidence review.'
    });
  }

  /**
   * Admin: Approve application as Conflux Verified (after statutory evidence corroboration)
   */
  async approveApplicationAsVerified(
    appId: string,
    primaryRegistrar?: string,
    evidenceSummary?: string
  ): Promise<ConfluxBusiness> {
    const apps = this.getApplicationsStore();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);

    app.status = 'VERIFIED';
    app.updatedAt = new Date().toISOString();
    this.setApplicationsStore(apps);

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
      storefrontPhotoUrl: app.storefrontPhotoUrl
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
    const apps = this.getApplicationsStore();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);

    app.status = 'CHANGES_REQUESTED';
    app.changesRequestedMessage = message;
    app.updatedAt = new Date().toISOString();
    this.setApplicationsStore(apps);
    return app;
  }

  /**
   * Admin: Reject an application
   */
  async rejectApplication(appId: string, reason: string): Promise<BusinessSubmissionApplication> {
    const apps = this.getApplicationsStore();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error(`Application ${appId} not found.`);

    app.status = 'REJECTED';
    app.adminNotes = reason;
    app.updatedAt = new Date().toISOString();
    this.setApplicationsStore(apps);
    return app;
  }
}

export const businessService = new BusinessService();
