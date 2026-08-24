export type LocationStatus = 'DATA_ONLY' | 'DRAFT' | 'PUBLISHED';
export type LocationType = 
  | 'state' 
  | 'district' 
  | 'subdivision' 
  | 'city' 
  | 'town' 
  | 'municipality' 
  | 'block' 
  | 'gram_panchayat' 
  | 'village' 
  | 'industrial_area' 
  | 'commercial_junction';

export interface LocationBreadcrumb {
  name: string;
  url: string;
}

export interface IndustryUseCase {
  title: string;
  description: string;
  impact: string;
}

export interface OpportunityScore {
  commercialActivityScore: number; // 1 to 10
  businessDensityScore: number;    // 1 to 10
  digitalDemandScore: number;      // 1 to 10
  confluxFitScore: number;         // 1 to 10
  overallScore: number;            // Computed average (1 to 10)
  isEstimated: boolean;
}

export interface LocationItem {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  type: LocationType;
  parentSlug?: string;
  stateSlug: string;
  districtSlug?: string;
  subdivisionName?: string;
  blockName?: string;
  gramPanchayatName?: string;
  status: LocationStatus;
  priority: number; // 1 (Highest) to 5
  tier: 1 | 2 | 3 | 4;
  
  // Geographic & Administrative Metadata
  hqName?: string;
  division?: string;
  subdivisions?: string[];
  majorIndustries?: string[];
  businessTypes?: string[];
  keyCommercialHubs?: string[];
  nearbyLocationSlugs?: string[];

  // Opportunity & Scoring Metadata
  opportunityScore?: OpportunityScore;
  lastResearched?: string;
  sourceOfData?: string;

  // SEO & Content Metadata (Populated for PUBLISHED items)
  metaTitle?: string;
  metaDescription?: string;
  h1Title?: string;
  summary?: string;
  localBusinessContext?: string;
  automationOpportunities?: string[];
  useCases?: IndustryUseCase[];
  faqs?: { question: string; answer: string }[];

  // Evidence-Backed Verified Entity Grounding
  verifiedEntities?: VerifiedLocationEntity[];
}

export type EntityVerificationCategory = 
  | 'REGISTERED_BUSINESS'
  | 'GI_HERITAGE_CLUSTER'
  | 'STATUTORY_INSTITUTION';

export interface VerifiedLocationEntity {
  id: string;
  name: string;
  entityType: EntityVerificationCategory;
  statutoryIdentifier?: string;
  registrarName: string;
  registrarUrl: string;
  claimSummary: string;
  verificationStatus: 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'OUTDATED';
  sourceTier: 'TIER_1_PRIMARY_AUTHORITATIVE' | 'TIER_2_FIRST_PARTY' | 'TIER_3_INDEPENDENT_HIGH_QUALITY';
  validThrough?: string;
  benchmarkCaseId?: string;
  locationRelevance: string;
  relatedArticleSlug?: string;
  relatedGuideSlug?: string;
  verifyQueryUrl: string;
}

export interface BusinessCategoryTaxonomy {
  id: string;
  name: string;
  description: string;
  typicalNeeds: string[];
  exampleUseCases: {
    title: string;
    description: string;
    servicesUsed: string[];
  }[];
}

export interface DigitalNeedTaxonomy {
  id: string;
  name: string;
  category: 'Foundation' | 'Visibility' | 'Engagement' | 'Automation' | 'Advanced AI';
  description: string;
  implementationTime: string;
}

export interface LocationBusinessMapping {
  id: string;
  locationSlug: string;
  locationName: string;
  businessCategoryId: string;
  businessCategoryName: string;
  primaryDigitalNeedIds: string[];
  confluxServices: string[];
  specificProblem: string;
  solutionDescription: string;
  status: LocationStatus;
}

export interface LocationEvent {
  eventName: 'page_view' | 'whatsapp_click' | 'contact_click' | 'consultation_click';
  locationSlug: string;
  timestamp: string;
}
