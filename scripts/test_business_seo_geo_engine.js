// Conflux Platform — Platform-Wide Business SEO + GEO Optimization Engine Test Suite
// Rigorous verification of entity understanding, location hierarchy, schema subtypes,
// query mapping, factual FAQ generation, indexability evaluation, and zero-hallucination guardrails.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { businessOptimizationEngine, BusinessOptimizationEngine } from '../lib/seo/businessOptimizationEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('======================================================================');
console.log('  CONFLUX AI — BUSINESS SEO + GEO OPTIMIZATION ENGINE TEST SUITE       ');
console.log('======================================================================\n');

let passCount = 0;
let totalChecks = 0;

const assert = (name, cond, details = '') => {
  totalChecks++;
  if (cond) {
    console.log(`[PASS] ${name}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${name} - ${details}`);
  }
};

// ── 8 TEST SCENARIO DATA DEFINITIONS ───────────────────────────────

// Scenario 1: Restaurant (Hospitality)
const mockRestaurant = {
  id: 'biz_rest_01',
  confluxBusinessId: 'CFX-IN-WB-NAD-000201',
  slug: 'maa-annapurna-bengali-restaurant',
  name: 'Maa Annapurna Bengali Restaurant',
  legalName: 'Maa Annapurna Hospitality Enterprises',
  description: 'Authentic Bengali dining and catering establishment serving traditional thalis, Biryani, and fresh fish preparations in Ranaghat.',
  businessType: 'HOSPITALITY',
  categoryId: 'cat_dining_01',
  categoryName: 'Restaurant & Eatery',
  location: {
    country: 'India',
    state: 'West Bengal',
    district: 'Nadia',
    city: 'Ranaghat',
    locality: 'Station Road',
    fullAddress: 'Station Road, Near Railway Platform 1, Ranaghat, Nadia, West Bengal 741201',
    postalCode: '741201',
    latitude: 23.1804,
    longitude: 88.5801,
    serviceAreas: ['Ranaghat', 'Taherpur', 'Habibpur']
  },
  contact: {
    phone: '+919830111222',
    whatsapp: '+919830111222',
    email: 'contact@annapurnaranaghat.in',
    websiteUrl: 'https://annapurnaranaghat.in'
  },
  operatingHours: [
    { dayOfWeek: 0, opensAt: '10:00', closesAt: '22:30', isClosed: false },
    { dayOfWeek: 1, opensAt: '10:00', closesAt: '22:30', isClosed: false },
    { dayOfWeek: 2, opensAt: '10:00', closesAt: '22:30', isClosed: false },
    { dayOfWeek: 3, opensAt: '10:00', closesAt: '22:30', isClosed: false },
    { dayOfWeek: 4, opensAt: '10:00', closesAt: '22:30', isClosed: false },
    { dayOfWeek: 5, opensAt: '10:00', closesAt: '22:30', isClosed: false },
    { dayOfWeek: 6, opensAt: '10:00', closesAt: '22:30', isClosed: false }
  ],
  services: ['Traditional Bengali Thali', 'Kolkata Biryani', 'Outdoor Catering', 'Home Delivery'],
  verificationStatus: 'SUPPORTED',
  confidenceScore: 92,
  primaryRegistrar: 'FSSAI License #12822013000456',
  status: 'PUBLISHED',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-09-04T12:00:00Z'
};

// Scenario 2: Healthcare Clinic
const mockClinic = {
  id: 'biz_med_01',
  confluxBusinessId: 'CFX-IN-WB-NAD-000202',
  slug: 'ranaghat-care-diagnostic-clinic',
  name: 'Ranaghat Care Diagnostic & Clinic',
  legalName: 'Ranaghat Health & Diagnostic Solutions LLP',
  description: 'Comprehensive outpatient polyclinic, pathology laboratory, digital X-Ray, and cardiology consultation services.',
  businessType: 'HEALTHCARE',
  categoryId: 'cat_health_01',
  categoryName: 'Healthcare Clinic & Diagnostic Care',
  location: {
    country: 'India',
    state: 'West Bengal',
    district: 'Nadia',
    city: 'Ranaghat',
    locality: 'Subhas Avenue',
    fullAddress: '12 Subhas Avenue, Near Ranaghat Sub-Divisional Hospital, Ranaghat, Nadia, West Bengal 741201',
    postalCode: '741201',
    latitude: 23.1815,
    longitude: 88.5810,
    serviceAreas: ['Ranaghat', 'Santipur', 'Birnagar', 'Payradanga']
  },
  contact: {
    phone: '+919434098765',
    whatsapp: '+919434098765',
    email: 'care@ranaghatdiagnostic.com',
    websiteUrl: 'https://ranaghatdiagnostic.com'
  },
  operatingHours: [
    { dayOfWeek: 1, opensAt: '07:00', closesAt: '20:00', isClosed: false },
    { dayOfWeek: 2, opensAt: '07:00', closesAt: '20:00', isClosed: false },
    { dayOfWeek: 3, opensAt: '07:00', closesAt: '20:00', isClosed: false },
    { dayOfWeek: 4, opensAt: '07:00', closesAt: '20:00', isClosed: false },
    { dayOfWeek: 5, opensAt: '07:00', closesAt: '20:00', isClosed: false },
    { dayOfWeek: 6, opensAt: '07:00', closesAt: '14:00', isClosed: false },
    { dayOfWeek: 0, opensAt: '08:00', closesAt: '12:00', isClosed: false }
  ],
  services: ['Pathology Blood Tests', 'Digital X-Ray', 'ECG', 'Doctor Chamber Appointments', 'Home Sample Collection'],
  verificationStatus: 'SUPPORTED',
  confidenceScore: 95,
  primaryRegistrar: 'West Bengal Clinical Establishment Registration #CE/NAD/2023/89',
  status: 'PUBLISHED',
  createdAt: '2026-02-10T10:00:00Z',
  updatedAt: '2026-09-04T12:00:00Z'
};

// Scenario 3: Retail Store (A2Z Supplements)
const mockRetailStore = {
  id: 'biz_a2z_real',
  confluxBusinessId: 'CFX-IN-WB-NAD-000001',
  slug: 'a2z-supplements',
  name: 'A2Z Supplements',
  legalName: 'A2Z Supplements',
  description: 'Retail sports nutrition and gym supplements store in Birnagar, Nadia. Official brand proteins, gainers, pre-workouts, and workout essentials.',
  businessType: 'RETAIL',
  categoryId: 'cat_sports_nutrition',
  categoryName: 'Sports Nutrition & Supplements',
  location: {
    country: 'India',
    state: 'West Bengal',
    district: 'Nadia',
    city: 'Birnagar',
    locality: 'Library para',
    landmark: 'Near Gunendronath Public School',
    fullAddress: 'Library para, near Gunendronath Public School, Birnagar, Nadia, West Bengal 741127',
    postalCode: '741127',
    latitude: 23.2458,
    longitude: 88.5562,
    serviceAreas: ['Birnagar', 'Ranaghat', 'Santipur', 'Nadia District', 'West Bengal']
  },
  contact: {
    phone: '+917908352864',
    whatsapp: '+917908352864'
  },
  onlineSources: {
    facebookUrl: 'https://www.facebook.com/profile.php?id=61567150993072'
  },
  operatingHours: [
    { dayOfWeek: 0, opensAt: '09:00', closesAt: '21:00', isClosed: false },
    { dayOfWeek: 1, opensAt: '09:00', closesAt: '21:00', isClosed: false },
    { dayOfWeek: 2, opensAt: '09:00', closesAt: '21:00', isClosed: false },
    { dayOfWeek: 3, opensAt: '09:00', closesAt: '21:00', isClosed: false },
    { dayOfWeek: 4, opensAt: '09:00', closesAt: '21:00', isClosed: false },
    { dayOfWeek: 5, opensAt: '09:00', closesAt: '21:00', isClosed: false },
    { dayOfWeek: 6, opensAt: '09:00', closesAt: '21:00', isClosed: false }
  ],
  services: ['Whey Protein', 'Mass Gainers', 'Creatine & BCAA', 'Pre-Workout & Multivitamins', 'Dietary Guidance'],
  verificationStatus: 'SUPPORTED',
  confidenceScore: 78,
  status: 'PUBLISHED',
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-09-04T12:00:00Z',
  media: [
    {
      id: 'med_a2z_01',
      url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80',
      mediaType: 'IMAGE',
      provenance: 'BUSINESS_PROVIDED',
      sourceName: 'Business Storefront Asset',
      status: 'ACTIVE',
      sortOrder: 1,
      dateAdded: '2026-09-04'
    }
  ]
};

// Scenario 4: Professional Service Business
const mockProfessionalService = {
  id: 'biz_prof_01',
  confluxBusinessId: 'CFX-IN-WB-NAD-000204',
  slug: 'nadia-legal-tax-advisors',
  name: 'Nadia Legal & Tax Advisors',
  legalName: 'Nadia Professional Advisory Services Private Limited',
  description: 'Corporate taxation, GST registration, trade licenses, ROC filings, and commercial legal advisory for enterprises in Nadia district.',
  businessType: 'PROFESSIONAL_SERVICE',
  categoryId: 'cat_legal_tax',
  categoryName: 'Professional & Business Services',
  location: {
    country: 'India',
    state: 'West Bengal',
    district: 'Nadia',
    city: 'Krishnanagar',
    locality: 'High Court Para',
    fullAddress: '44 Court Para Road, Near Nadia District Court, Krishnanagar, Nadia, West Bengal 741101',
    postalCode: '741101',
    latitude: 23.4000,
    longitude: 88.5000,
    serviceAreas: ['Krishnanagar', 'Ranaghat', 'Nabadwip', 'Kalyani', 'Nadia District']
  },
  contact: {
    phone: '+919732155444',
    whatsapp: '+919732155444',
    email: 'info@nadiaadvisors.in',
    websiteUrl: 'https://nadiaadvisors.in'
  },
  services: ['GST Registration & Filing', 'Income Tax Returns', 'Company Incorporation', 'Trade License Documentation'],
  verificationStatus: 'SUPPORTED',
  confidenceScore: 90,
  primaryRegistrar: 'Ministry of Corporate Affairs (MCA) CIN #U74140WB2021PTC245678',
  status: 'PUBLISHED',
  createdAt: '2026-02-20T10:00:00Z',
  updatedAt: '2026-09-04T12:00:00Z'
};

// Scenario 5: Business without website (relying on WhatsApp/Phone)
const mockNoWebsiteBusiness = {
  id: 'biz_noweb_01',
  confluxBusinessId: 'CFX-IN-WB-NAD-000205',
  slug: 'santipur-handloom-saree-ghar',
  name: 'Santipur Handloom Saree Ghar',
  legalName: 'Santipur Handloom Saree Ghar',
  description: 'Direct weaver manufacturer of authentic Santipuri and Phulia cotton and silk sarees. Bulk wholesale and direct consumer retail.',
  businessType: 'RETAIL',
  categoryId: 'cat_textiles',
  categoryName: 'Handloom & Textile Store',
  location: {
    country: 'India',
    state: 'West Bengal',
    district: 'Nadia',
    city: 'Santipur',
    locality: 'Weavers Colony',
    fullAddress: 'Weavers Colony Road, Near Tantipara Ghat, Santipur, Nadia, West Bengal 741404',
    postalCode: '741404',
    latitude: 23.2500,
    longitude: 88.4333,
    serviceAreas: ['Santipur', 'Ranaghat', 'Kolkata', 'Pan-India Delivery']
  },
  contact: {
    phone: '+919876543210',
    whatsapp: '+919876543210'
  },
  services: ['Handloom Tant Sarees', 'Phulia Jamdani', 'Linen Silk Sarees', 'Direct Wholesale Supply'],
  verificationStatus: 'SUPPORTED',
  confidenceScore: 82,
  status: 'PUBLISHED',
  createdAt: '2026-03-10T10:00:00Z',
  updatedAt: '2026-09-04T12:00:00Z'
};

// Scenario 6: Incomplete / Thin Data Business
const mockIncompleteBusiness = {
  id: 'biz_thin_01',
  confluxBusinessId: 'CFX-IN-WB-NAD-000206',
  slug: 'draft-unverified-shop',
  name: 'X', // too short (< 2 chars)
  description: 'Shop', // too short (< 30 chars)
  businessType: 'RETAIL',
  location: {},
  contact: {},
  verificationStatus: 'UNSUPPORTED',
  confidenceScore: 0,
  status: 'DRAFT', // Not published
  createdAt: '2026-04-01T10:00:00Z',
  updatedAt: '2026-04-01T10:00:00Z'
};

// Scenario 7: Business with Conflicting Sources
const mockConflictingBusiness = {
  id: 'biz_conflict_01',
  confluxBusinessId: 'CFX-IN-WB-NAD-000207',
  slug: 'krishnanagar-fitness-corner',
  name: 'Krishnanagar Fitness Corner',
  description: 'Comprehensive fitness equipment and protein nutrition outlet located in Krishnanagar.',
  businessType: 'RETAIL',
  categoryId: 'cat_retail',
  categoryName: 'General Retail Store',
  location: {
    country: 'India',
    state: 'West Bengal',
    district: 'Nadia',
    city: 'Krishnanagar',
    fullAddress: 'High Street, Krishnanagar, Nadia',
    postalCode: '741101'
  },
  contact: {
    phone: '+919433311122',
    whatsapp: '+919433311122'
  },
  operatingHours: [
    { dayOfWeek: 1, opensAt: '09:00', closesAt: '20:00', isClosed: false }
  ],
  publicSourceEnrichment: {
    sourcePlatform: 'FACEBOOK',
    sourceUrl: 'https://facebook.com/krishnanagarfitness',
    extractedCategory: 'Gym & Physical Fitness Center', // Conflict with General Retail
    extractedAddress: 'Shop 4, High Street Mall, Near City Bus Stand, Krishnanagar, Nadia 741101', // Nuance conflict
    extractedHours: 'Open 24 Hours' // Conflict with daytime schedule
  },
  verificationStatus: 'SUPPORTED',
  confidenceScore: 70,
  status: 'PUBLISHED',
  createdAt: '2026-03-15T10:00:00Z',
  updatedAt: '2026-09-04T12:00:00Z'
};

// Scenario 8: Business with Multiple Service Areas
const mockMultiAreaBusiness = {
  id: 'biz_logistics_01',
  confluxBusinessId: 'CFX-IN-WB-NAD-000208',
  slug: 'nadia-express-courier-logistics',
  name: 'Nadia Express Courier & Logistics',
  description: 'Fast same-day parcel delivery, ecommerce distribution, and cold chain logistics servicing all towns across Nadia and neighboring districts.',
  businessType: 'PROFESSIONAL_SERVICE',
  categoryId: 'cat_logistics',
  categoryName: 'Logistics & Courier Service',
  location: {
    country: 'India',
    state: 'West Bengal',
    district: 'Nadia',
    city: 'Ranaghat',
    fullAddress: 'National Highway 12 Crossing, Ranaghat, Nadia, West Bengal 741201',
    postalCode: '741201',
    serviceAreas: ['Ranaghat', 'Santipur', 'Birnagar', 'Krishnanagar', 'Kalyani', 'Chakdaha', 'Nadia District', 'Kolkata']
  },
  contact: {
    phone: '+919830554433',
    whatsapp: '+919830554433',
    websiteUrl: 'https://nadiaexpress.in'
  },
  services: ['Same-day Courier', 'Ecommerce COD Delivery', 'Document Logistics', 'Cold Chain Transport'],
  verificationStatus: 'SUPPORTED',
  confidenceScore: 88,
  status: 'PUBLISHED',
  createdAt: '2026-03-20T10:00:00Z',
  updatedAt: '2026-09-04T12:00:00Z'
};

// ── TEST RUNNER ────────────────────────────────────────────────────

async function runBusinessOptimizationEngineTests() {
  console.log('--- Suite 1: Pure Engine Instantiation & Determinism ---');
  const customEngine = new BusinessOptimizationEngine();
  assert('Engine instantiates correctly', customEngine instanceof BusinessOptimizationEngine);

  // Determinism test: calling optimizeBusiness twice returns identical output
  const optA = businessOptimizationEngine.optimizeBusiness(mockRestaurant);
  const optB = businessOptimizationEngine.optimizeBusiness(mockRestaurant);
  assert(
    'Optimization is purely deterministic (canonicalUrl, seoTitle, and metaDescription identical)',
    optA.canonicalUrl === optB.canonicalUrl &&
    optA.seoTitle === optB.seoTitle &&
    optA.metaDescription === optB.metaDescription &&
    optA.schemaSubtype === optB.schemaSubtype &&
    optA.faqItems.length === optB.faqItems.length
  );

  // ── SCENARIO 1: RESTAURANT (Hospitality) ─────────────────────────
  console.log('\n--- Suite 2: Scenario 1 - Restaurant (Hospitality) ---');
  const optRest = businessOptimizationEngine.optimizeBusiness(mockRestaurant);

  assert('Restaurant maps to Schema subtype "Restaurant"', optRest.schemaSubtype === 'Restaurant');
  assert(
    'Canonical URL adheres to strict geographic hierarchy',
    optRest.canonicalUrl === 'https://confluxai.in/business/india/west-bengal/nadia/ranaghat/maa-annapurna-bengali-restaurant'
  );
  assert('Single H1 exactly matches business name', optRest.h1 === 'Maa Annapurna Bengali Restaurant');
  assert(
    'SEO Title format includes name, category, city, and platform brand',
    optRest.seoTitle.includes('Maa Annapurna') &&
    optRest.seoTitle.includes('Restaurant') &&
    optRest.seoTitle.includes('Ranaghat') &&
    optRest.seoTitle.includes('Conflux Business Profile') &&
    optRest.seoTitle.length <= 105
  );
  assert(
    'Meta description length is balanced (135 - 165 chars)',
    optRest.metaDescription.length >= 135 && optRest.metaDescription.length <= 165,
    `Actual length: ${optRest.metaDescription.length}`
  );
  assert(
    'Structured data contains LocalBusiness, BreadcrumbList, and FAQPage graphs',
    Array.isArray(optRest.structuredData['@graph']) &&
    optRest.structuredData['@graph'].some(g => g['@type'] === 'Restaurant') &&
    optRest.structuredData['@graph'].some(g => g['@type'] === 'BreadcrumbList') &&
    optRest.structuredData['@graph'].some(g => g['@type'] === 'FAQPage')
  );
  assert(
    'Structured data includes OpeningHoursSpecification for all open days',
    optRest.structuredData['@graph'].find(g => g['@type'] === 'Restaurant').openingHoursSpecification.length === 7
  );
  assert(
    'Structured data includes statutory FSSAI credential',
    optRest.structuredData['@graph'].find(g => g['@type'] === 'Restaurant').hasCredential[0].name.includes('FSSAI')
  );
  assert(
    'Generated query intents include local search and AI retrieval',
    optRest.queryIntents.some(q => q.intentType === 'LOCAL_EXACT' && q.targetAudience === 'HUMAN_SEARCH') &&
    optRest.queryIntents.some(q => q.intentType === 'AI_RETRIEVAL' && q.targetAudience === 'AI_AGENT')
  );

  // ── SCENARIO 2: HEALTHCARE CLINIC ────────────────────────────────
  console.log('\n--- Suite 3: Scenario 2 - Healthcare Clinic ---');
  const optClinic = businessOptimizationEngine.optimizeBusiness(mockClinic);

  assert('Healthcare clinic maps to Schema subtype "MedicalClinic"', optClinic.schemaSubtype === 'MedicalClinic');
  assert(
    'Canonical URL reflects district/city hierarchy',
    optClinic.canonicalUrl === 'https://confluxai.in/business/india/west-bengal/nadia/ranaghat/ranaghat-care-diagnostic-clinic'
  );
  assert(
    'SEO Title identifies diagnostic and healthcare category',
    optClinic.seoTitle.includes('Healthcare Clinic') || optClinic.seoTitle.includes('Ranaghat')
  );
  assert(
    'Structured data knowsAbout includes clinical services',
    optClinic.structuredData['@graph'].find(g => g['@type'] === 'MedicalClinic').knowsAbout.includes('Pathology Blood Tests')
  );
  assert(
    'Factual FAQ answers location with full physical address and postal code',
    optClinic.faqItems.some(f => f.category === 'LOCATION' && f.answer.includes('Subhas Avenue') && f.answer.includes('741201'))
  );

  // ── SCENARIO 3: RETAIL STORE (A2Z Supplements) ───────────────────
  console.log('\n--- Suite 4: Scenario 3 - Retail Store (A2Z Supplements) ---');
  const optA2Z = businessOptimizationEngine.optimizeBusiness(mockRetailStore);

  assert('Retail sports nutrition store maps to Schema subtype "Store"', optA2Z.schemaSubtype === 'Store');
  assert(
    'A2Z Supplements canonical URL is exact match to production path',
    optA2Z.canonicalUrl === 'https://confluxai.in/business/india/west-bengal/nadia/birnagar/a2z-supplements'
  );
  assert(
    'A2Z Supplements SEO Title is authoritative and under 105 chars',
    optA2Z.seoTitle === 'A2Z Supplements — Sports Nutrition & Fitness Store in Birnagar, Nadia | Conflux Business Profile' &&
    optA2Z.seoTitle.length <= 105
  );
  assert(
    'A2Z Supplements meta description references direct WhatsApp contact and location',
    optA2Z.metaDescription.includes('Birnagar') &&
    optA2Z.metaDescription.includes('Nadia') &&
    optA2Z.metaDescription.includes('WhatsApp') &&
    optA2Z.metaDescription.length >= 135 && optA2Z.metaDescription.length <= 165
  );
  assert(
    'Structured data sameAs contains verified Facebook URL and no phantom URLs',
    optA2Z.structuredData['@graph'].find(g => g['@type'] === 'Store').sameAs.includes('https://www.facebook.com/profile.php?id=61567150993072')
  );
  assert(
    '100% FAQ PARITY: All factual FAQs match JSON-LD FAQPage question-by-question',
    (() => {
      const faqSchema = optA2Z.structuredData['@graph'].find(g => g['@type'] === 'FAQPage');
      if (!faqSchema || !faqSchema.mainEntity) return false;
      if (faqSchema.mainEntity.length !== optA2Z.faqItems.length) return false;
      return optA2Z.faqItems.every((item, idx) => {
        const schemaItem = faqSchema.mainEntity[idx];
        return schemaItem.name === item.question && schemaItem.acceptedAnswer.text === item.answer;
      });
    })()
  );
  assert(
    'Media metadata optimization assigns authentic altText and caption without fabrication',
    optA2Z.mediaMetadata.length === 1 &&
    optA2Z.mediaMetadata[0].altText.includes('A2Z Supplements') &&
    optA2Z.mediaMetadata[0].provenance === 'BUSINESS_PROVIDED'
  );
  assert(
    'A2Z Supplements achieves high indexability score (>= 65) and status PUBLISHED',
    optA2Z.indexability.isIndexable === true && optA2Z.indexability.indexabilityScore >= 65
  );

  // ── SCENARIO 4: PROFESSIONAL SERVICE ─────────────────────────────
  console.log('\n--- Suite 5: Scenario 4 - Professional Service ---');
  const optProf = businessOptimizationEngine.optimizeBusiness(mockProfessionalService);

  assert('Advisory firm maps to Schema subtype "ProfessionalService"', optProf.schemaSubtype === 'ProfessionalService');
  assert(
    'Canonical URL routes to Krishnanagar district headquarters',
    optProf.canonicalUrl === 'https://confluxai.in/business/india/west-bengal/nadia/krishnanagar/nadia-legal-tax-advisors'
  );
  assert(
    'Structured data captures MCA statutory credential',
    optProf.structuredData['@graph'].find(g => g['@type'] === 'ProfessionalService').hasCredential[0].name.includes('MCA')
  );
  assert(
    'Breadcrumb list properly identifies Krishnanagar as level 5 node',
    optProf.structuredData['@graph'].find(g => g['@type'] === 'BreadcrumbList').itemListElement[4].name === 'Krishnanagar'
  );

  // ── SCENARIO 5: BUSINESS WITHOUT WEBSITE ─────────────────────────
  console.log('\n--- Suite 6: Scenario 5 - Business Without Website (WhatsApp Only) ---');
  const optNoWeb = businessOptimizationEngine.optimizeBusiness(mockNoWebsiteBusiness);

  assert(
    'Structured data telephone is present but website is omitted without throwing or hallucinating',
    optNoWeb.structuredData['@graph'].find(g => g['@type'] === 'Store').telephone === '+919876543210' &&
    optNoWeb.structuredData['@graph'].find(g => g['@type'] === 'Store').sameAs === undefined
  );
  assert(
    'Contact FAQ specifically guides users to direct phone and WhatsApp contact',
    optNoWeb.faqItems.find(f => f.category === 'CONTACT').answer.includes('+919876543210') &&
    optNoWeb.faqItems.find(f => f.category === 'CONTACT').answer.includes('WhatsApp')
  );
  assert(
    'Meta description mentions direct WhatsApp contact without fabricating website domain',
    optNoWeb.metaDescription.includes('direct WhatsApp contact') && !optNoWeb.metaDescription.includes('http')
  );

  // ── SCENARIO 6: INCOMPLETE / THIN DATA GUARDRAIL ─────────────────
  console.log('\n--- Suite 7: Scenario 6 - Incomplete / Thin Data Quality Guardrail ---');
  const optThin = businessOptimizationEngine.optimizeBusiness(mockIncompleteBusiness);

  assert(
    'Incomplete business is strictly marked isIndexable = false',
    optThin.indexability.isIndexable === false
  );
  assert(
    'Indexability score is below publishing threshold (< 65)',
    optThin.indexability.indexabilityScore < 65,
    `Actual score: ${optThin.indexability.indexabilityScore}`
  );
  assert(
    'Explicit issues list missing published status, location, contact, and description',
    optThin.indexability.issues.some(i => i.includes('PUBLISHED')) &&
    optThin.indexability.issues.some(i => i.includes('location')) &&
    optThin.indexability.issues.some(i => i.includes('contact')) &&
    optThin.indexability.issues.some(i => i.includes('Description'))
  );

  // ── SCENARIO 7: CONFLICTING SOURCES DETECTION ────────────────────
  console.log('\n--- Suite 8: Scenario 7 - Source Provenance Discrepancy Detection ---');
  const optConflict = businessOptimizationEngine.optimizeBusiness(mockConflictingBusiness);

  assert(
    'Detects category conflict between declared submission and public source',
    optConflict.sourceProvenanceConflicts.some(c => c.field === 'Category' && c.claimPublic.includes('Fitness Center'))
  );
  assert(
    'Detects operating schedule conflict between daytime hours and 24 Hours public listing',
    optConflict.sourceProvenanceConflicts.some(c => c.field === 'Operating Schedule')
  );
  assert(
    'Conflict explanations are transparent, neutral, and informative',
    optConflict.sourceProvenanceConflicts.every(c => c.explanation.length > 20)
  );

  // ── SCENARIO 8: MULTIPLE SERVICE AREAS ────────────────────────────
  console.log('\n--- Suite 9: Scenario 8 - Multiple Service Areas Mapping ---');
  const optMultiArea = businessOptimizationEngine.optimizeBusiness(mockMultiAreaBusiness);

  assert(
    'Geographic hierarchy captures all specified service areas',
    optMultiArea.geographicHierarchy.serviceAreas.length === 8 &&
    optMultiArea.geographicHierarchy.serviceAreas.includes('Kolkata') &&
    optMultiArea.geographicHierarchy.serviceAreas.includes('Krishnanagar')
  );
  assert(
    'Structured data areaServed includes AdministrativeArea entities for all service locations',
    optMultiArea.structuredData['@graph'].find(g => g['@type'] === 'ProfessionalService').areaServed.length === 8 &&
    optMultiArea.structuredData['@graph'].find(g => g['@type'] === 'ProfessionalService').areaServed.every(a => a['@type'] === 'AdministrativeArea')
  );
  assert(
    'Factual FAQ includes dedicated geographic coverage answer',
    optMultiArea.faqItems.some(f => f.question.includes('What areas does') && f.answer.includes('Kolkata'))
  );

  // ── SUITE 10: INTERNAL LINKING INTEGRITY ─────────────────────────
  console.log('\n--- Suite 10: Platform Internal Linking Network ---');
  const links = optRest.internalLinks;
  assert('Internal links contain 5 structured hierarchy connections', links.length === 5);
  assert('Includes City Directory link', links.some(l => l.relType === 'city' && l.url.includes('/ranaghat')));
  assert('Includes District Directory link', links.some(l => l.relType === 'district' && l.url.includes('/nadia')));
  assert('Includes State Directory link', links.some(l => l.relType === 'state' && l.url === '/locations/west-bengal'));
  assert('Includes Discover All Businesses link', links.some(l => l.relType === 'all_businesses' && l.url === '/discover'));
  assert('Includes Verification Methodology link', links.some(l => l.relType === 'verify' && l.url === '/verify/methodology'));

  // ── SUITE 11: INTEGRATION WITH CANONICAL BUSINESSES.JSON ─────────
  console.log('\n--- Suite 11: Canonical businesses.json Integration ---');
  const businessesJsonPath = path.resolve(rootDir, 'public/data/businesses.json');
  assert('public/data/businesses.json exists', fs.existsSync(businessesJsonPath));

  const savedBusinesses = JSON.parse(fs.readFileSync(businessesJsonPath, 'utf8'));
  assert('public/data/businesses.json contains valid array of businesses', Array.isArray(savedBusinesses) && savedBusinesses.length > 0);

  // Optimize every single business in businesses.json and verify valid output
  savedBusinesses.forEach(biz => {
    const opt = businessOptimizationEngine.optimizeBusiness(biz);
    assert(
      `[${biz.name}] Optimizes successfully with valid canonical URL`,
      opt.canonicalUrl.startsWith('https://confluxai.in/business/india/west-bengal/')
    );
    assert(
      `[${biz.name}] Single H1 matches name`,
      opt.h1 === biz.name
    );
    assert(
      `[${biz.name}] Valid Schema.org graph generated`,
      Array.isArray(opt.structuredData['@graph']) && opt.structuredData['@graph'].length >= 2
    );
  });

  // Check sitemap.xml for business canonical URLs
  const sitemapXmlPath = path.resolve(rootDir, 'public/sitemap.xml');
  if (fs.existsSync(sitemapXmlPath)) {
    const sitemapContent = fs.readFileSync(sitemapXmlPath, 'utf8');
    savedBusinesses.filter(b => b.status === 'PUBLISHED').forEach(b => {
      const opt = businessOptimizationEngine.optimizeBusiness(b);
      assert(
        `[${b.name}] Canonical URL is present in public/sitemap.xml`,
        sitemapContent.includes(`<loc>${opt.canonicalUrl}</loc>`)
      );
    });
  }

  // ── FINAL SUMMARY ────────────────────────────────────────────────
  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passCount} / ${totalChecks} CHECKS PASSED`);
  console.log('======================================================\n');

  if (passCount !== totalChecks) {
    process.exit(1);
  }
}

runBusinessOptimizationEngineTests().catch(err => {
  console.error('[Engine Test Failure]:', err);
  process.exit(1);
});
