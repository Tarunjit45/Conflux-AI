export type LocationStatus = 'DATA_ONLY' | 'DRAFT' | 'PUBLISHED';
export type LocationType = 'state' | 'district' | 'subdivision' | 'city' | 'town' | 'municipality' | 'block' | 'industrial_area';

export interface LocationBreadcrumb {
  name: string;
  url: string;
}

export interface IndustryUseCase {
  title: string;
  description: string;
  impact: string;
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
  status: LocationStatus;
  priority: number; // 1 (Highest) to 5
  tier: 1 | 2 | 3 | 4;
  
  // Geographic / Administrative Metadata
  hqName?: string;
  division?: string;
  subdivisions?: string[];
  majorIndustries?: string[];
  businessTypes?: string[];
  keyCommercialHubs?: string[];
  nearbyLocationSlugs?: string[];

  // SEO & Content Metadata (Populated for Tier 1 & Tier 2 PUBLISHED items)
  metaTitle?: string;
  metaDescription?: string;
  h1Title?: string;
  summary?: string;
  localBusinessContext?: string;
  automationOpportunities?: string[];
  useCases?: IndustryUseCase[];
  faqs?: { question: string; answer: string }[];
}

export interface LocationEvent {
  eventName: 'page_view' | 'whatsapp_click' | 'contact_click' | 'consultation_click';
  locationSlug: string;
  timestamp: string;
}
