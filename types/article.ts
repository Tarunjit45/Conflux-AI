export type ContentLanguage = 'bn' | 'en' | 'bn-IN';

export type ArticleStatus = 'IDEA' | 'PLANNED' | 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export type SearchIntent = 
  | 'Business Growth'
  | 'Website Creation'
  | 'Lead Generation'
  | 'WhatsApp Automation'
  | 'Local SEO'
  | 'Customer Retention'
  | 'Process Automation';

export interface AuthorProfile {
  name: string;
  role: string;
  bio: string;
  avatarUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface ArticleSource {
  title: string;
  url: string;
  publisher?: string;
}

export interface ArticleFAQ {
  question: string;
  answer: string;
}

export type PrimarySearchIntent = 'informational' | 'commercial' | 'transactional' | 'local';

export interface ArticleSEOData {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  districts?: string[];
  localities?: string[];
  topics?: string[];
  primaryIntent?: PrimarySearchIntent;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  relatedServices?: string[];
}

export interface GSCOpportunityItem {
  id: string;
  query: string;
  pageSlug: string;
  district?: string;
  topic?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  classification: 'OPPORTUNITY_A' | 'OPPORTUNITY_B' | 'OPPORTUNITY_C' | 'OPPORTUNITY_D';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MONITORING';
  lastUpdated: string;
  nextAction: string;
}

export interface ArticleKnowledgeObject {
  id: string;
  title: string;
  slug: string;
  language: ContentLanguage;
  content: string; // Written manually by user
  excerpt: string;
  
  // Author & Timestamps
  author: AuthorProfile | string;
  publishedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  
  // Knowledge Graph Relationships
  locationIds: string[];         // e.g. ['loc-bagula', 'dist-nadia']
  districtIds: string[];         // e.g. ['dist-nadia']
  districts?: string[];          // e.g. ['bankura', 'nadia', 'statewide']
  localities?: string[];         // e.g. ['Mukutmanipur', 'Jhilimili']
  localityIds: string[];         // e.g. ['loc-bagula']
  businessCategoryIds: string[]; // e.g. ['retail-clothing']
  category?: string;             // e.g. 'Tourism', 'Agro-Business', 'AI Automation'
  topics?: string[];             // e.g. ['Homestays', 'Boating', 'Handicrafts', 'WhatsApp Booking']
  tags?: string[];               // e.g. ['Mukutmanipur', 'Jhilimili']
  industryIds: string[];         // e.g. ['Retail', 'Textile']
  problemIds: string[];          // e.g. ['low-visibility']
  digitalNeedIds: string[];      // e.g. ['whatsapp-catalog', 'google-visibility']
  serviceIds: string[];          // e.g. ['whatsapp-automation', 'website-development']
  relatedServices?: string[];    // e.g. ['whatsapp-automation', 'website-development', 'seo-geo']
  
  // Search & Editorial Metadata
  primaryIntent?: PrimarySearchIntent;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: SearchIntent;
  targetAudience?: string;
  relatedArticleIds?: string[];
  relatedLocationIds?: string[];
  
  // FAQs & Sources
  faq: ArticleFAQ[];
  sources: ArticleSource[];
  
  // Technical & SEO Specs
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  status: ArticleStatus;
  reactions?: number;
}

export interface LocalBusinessLead {
  id: string;
  businessName: string;
  locationSlug: string;
  locationName: string;
  businessCategoryId: string;
  businessCategoryName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  relationshipStatus: 'PROSPECT' | 'CONTACTED' | 'CONSULTATION' | 'CLIENT' | 'INACTIVE';
  potentialServices: string[];
  linkedArticleSlugs: string[];
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditorialPlanItem {
  id: string;
  title: string;
  locationSlug: string;
  locationName: string;
  businessCategoryId: string;
  problem: string;
  targetService: string;
  language: ContentLanguage;
  searchIntent: SearchIntent;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: ArticleStatus;
  targetPublishDate?: string;
}
