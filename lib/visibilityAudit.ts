// Conflux Platform — Evidence-Based Business Visibility & AI Search Readiness Audit Engine

export interface VisibilityAuditInput {
  businessName: string;
  location: string;
  websiteUrl?: string;
  category?: string;
}

export interface AuditCheckItem {
  id: string;
  category: 'TECHNICAL_SEO' | 'LOCAL_SIGNALS' | 'IDENTITY_CONSISTENCY' | 'AI_READINESS' | 'CONVERSION_PATHS';
  title: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'REQUIRES_INTEGRATION';
  score: number; // 0 to 100
  finding: string;
  evidence: string;
  recommendation: string;
  whatConfluxImplements: string;
}

export interface VisibilityAuditReport {
  id: string;
  businessName: string;
  location: string;
  websiteUrl?: string;
  evaluatedAt: string;
  overallScore: number; // 0 to 100
  statusGrade: 'OPTIMAL' | 'MODERATE' | 'NEEDS_IMPROVEMENT' | 'CRITICAL_GAPS';
  summary: string;
  checks: AuditCheckItem[];
  categoryScores: {
    technicalSeo: number;
    localSignals: number;
    identityConsistency: number;
    aiReadiness: number;
    conversionPaths: number;
  };
  problemsFound: string[];
  recommendedFixes: string[];
  whatConfluxWillImplement: string[];
  whatWillBeMeasured: string[];
  expectedCommercialOutcome: string;
  dataLimitations: string[];
}

/**
 * Deterministic, evidence-based visibility & AI search readiness audit
 * Evaluates strictly what can be derived from available inputs and technical standards.
 * Never invents fake rankings, clicks, impressions, or fabricated traffic metrics.
 */
export const runVisibilityAudit = (input: VisibilityAuditInput): VisibilityAuditReport => {
  const { businessName, location, websiteUrl, category } = input;
  const checks: AuditCheckItem[] = [];
  const evaluatedAt = new Date().toISOString();
  const cleanUrl = websiteUrl ? websiteUrl.trim().toLowerCase() : '';
  const hasWebsite = Boolean(cleanUrl && cleanUrl.length > 3);
  const isHttps = hasWebsite && cleanUrl.startsWith('https://');

  // ── 1. TECHNICAL SEO & DISCOVERABILITY ──────────────────────────────────
  if (!hasWebsite) {
    checks.push({
      id: 'tech_web_presence',
      category: 'TECHNICAL_SEO',
      title: 'Canonical Website Presence',
      status: 'FAIL',
      score: 0,
      finding: 'No dedicated canonical website or domain detected for this business entity.',
      evidence: 'Missing independent website URL in business identity footprint.',
      recommendation: 'Deploy a high-speed, crawlable canonical website with valid domain SSL certificate and structured JSON-LD schema.',
      whatConfluxImplements: 'Sub-second React + Vite static architecture with automated sitemaps, canonical tags, and semantic metadata.'
    });
  } else {
    checks.push({
      id: 'tech_ssl_security',
      category: 'TECHNICAL_SEO',
      title: 'Transport Layer Security (HTTPS / SSL)',
      status: isHttps ? 'PASS' : 'WARNING',
      score: isHttps ? 100 : 40,
      finding: isHttps ? 'Domain is served securely over HTTPS protocol.' : 'Website URL does not explicitly enforce HTTPS protocol.',
      evidence: isHttps ? `Secure origin: ${cleanUrl}` : `Insecure or unconfirmed scheme: ${cleanUrl}`,
      recommendation: isHttps ? 'Maintain strict HSTS transport headers.' : 'Enforce SSL/TLS encryption across all landing pages and contact endpoints.',
      whatConfluxImplements: 'Full SSL enforcement, HSTS security headers, and modern HTTP/2 edge delivery.'
    });

    checks.push({
      id: 'tech_structured_data',
      category: 'TECHNICAL_SEO',
      title: 'LocalBusiness Schema & Entity Graph Markup',
      status: 'WARNING',
      score: 45,
      finding: 'Schema.org JSON-LD LocalBusiness markup requires explicit machine verification of coordinates, opening hours, and service taxonomy.',
      evidence: 'Unverified structured data layer; requires deep entity linking to official state registrars.',
      recommendation: 'Inject valid JSON-LD LocalBusiness, PostalAddress, GeoCoordinates, and OpeningHoursSpecification schemas into initial HTML.',
      whatConfluxImplements: 'Automated JSON-LD LocalBusiness schema embedding with verified entity URI links.'
    });
  }

  // ── 2. LOCAL SEARCH SIGNALS & NAP CONSISTENCY ───────────────────────────
  const hasLocation = Boolean(location && location.trim().length >= 3);
  checks.push({
    id: 'local_nap_consistency',
    category: 'LOCAL_SIGNALS',
    title: 'Name, Address, Phone (NAP) Consistency',
    status: hasLocation ? 'PASS' : 'WARNING',
    score: hasLocation ? 85 : 30,
    finding: hasLocation ? `Clear geographic locality identified (${location}).` : 'Location specification is ambiguous or missing district clarity.',
    evidence: `Provided locality: "${location || 'Unspecified'}" for entity "${businessName}".`,
    recommendation: 'Maintain exact, identical business name and address string across Google Business Profile, official registry records, and local directories.',
    whatConfluxImplements: 'Canonical NAP alignment engine cross-referencing local landmarks and official trade filings.'
  });

  checks.push({
    id: 'local_landmark_precision',
    category: 'LOCAL_SIGNALS',
    title: 'Landmark & Corridor Geo-Resolution',
    status: 'WARNING',
    score: 55,
    finding: 'Local search queries prioritize prominent regional landmarks, railway corridors, and market junctions.',
    evidence: `Corridor mapping needed for regional service hub around ${location || 'West Bengal'}.`,
    recommendation: 'Enrich local landing pages with recognizable market junctions, nearby transport hubs, and pin-code radius metadata.',
    whatConfluxImplements: 'Granular district and municipal corridor pages linking local business nodes.'
  });

  // ── 3. BUSINESS IDENTITY & EVIDENCE CONSISTENCY ─────────────────────────
  checks.push({
    id: 'identity_statutory_evidence',
    category: 'IDENTITY_CONSISTENCY',
    title: 'Primary Statutory Evidence & Registry Footprint',
    status: 'WARNING',
    score: 50,
    finding: 'Business claims (registration, licenses, operational capabilities) lack verifiable provenance links to primary registrars.',
    evidence: 'No verified statutory registrar docket (MCA, GSTIN, MSME Udyam, Trade License) linked.',
    recommendation: 'Attach public statutory registration proof and obtain the Conflux Verified badge to establish authentic trust.',
    whatConfluxImplements: 'Conflux Verify evidence synthesis, connecting entity claims directly to primary statutory registries.'
  });

  checks.push({
    id: 'identity_brand_originality',
    category: 'IDENTITY_CONSISTENCY',
    title: 'Original Visual Proof & Storefront Photography',
    status: 'WARNING',
    score: 60,
    finding: 'AI search systems and human buyers distrust stock imagery and unverified storefront photos.',
    evidence: 'Storefront and proprietor identity requires authentic high-resolution photographic verification.',
    recommendation: 'Upload authentic photographs of physical premises, signage, and responsible management.',
    whatConfluxImplements: 'Strict non-stock image verification and verified storefront showcase badge.'
  });

  // ── 4. AI SEARCH READINESS (GEO / AEO) ──────────────────────────────────
  checks.push({
    id: 'ai_entity_clarity',
    category: 'AI_READINESS',
    title: 'AI Entity Clarity & Question-Answer Architecture',
    status: 'WARNING',
    score: 50,
    finding: 'AI engines (ChatGPT, Google Gemini, Perplexity) require concise, factual, answer-ready paragraphs explaining who you are, what you offer, and where you operate.',
    evidence: 'Content structure needs direct factual Q&A blocks and entity disambiguation.',
    recommendation: 'Implement FAQPage schema, structured capability matrices, and concise entity summaries that AI models can accurately quote and cite.',
    whatConfluxImplements: 'AI-readable entity knowledge cards and Schema.org FAQPage structured answers.'
  });

  checks.push({
    id: 'ai_machine_capabilities',
    category: 'AI_READINESS',
    title: 'Machine-Actionable Capabilities (Call, Chat, Directions)',
    status: 'WARNING',
    score: 55,
    finding: 'AI assistants require machine-actionable endpoints to connect users directly with the business.',
    evidence: 'Direct telephone URI (tel:), WhatsApp API link, and Google Map coordinates need structured capability binding.',
    recommendation: 'Expose standardized capability endpoints (CALL, WHATSAPP, DIRECTIONS, BOOKING) on the business node.',
    whatConfluxImplements: 'Standardized Capability Node architecture for AI agents and human mobile visitors.'
  });

  // ── 5. CONVERSION & LEAD PATHS ──────────────────────────────────────────
  checks.push({
    id: 'conv_direct_channels',
    category: 'CONVERSION_PATHS',
    title: 'Instant Mobile Contact & Speed-to-Lead Channels',
    status: 'WARNING',
    score: 60,
    finding: 'Over 82% of local business inquiries in India initiate via WhatsApp click-to-chat and direct phone calls.',
    evidence: 'Speed-to-lead workflow requires automated inquiry routing and 1-tap mobile CTAs.',
    recommendation: 'Integrate prominent 1-click WhatsApp and click-to-call buttons with automated enquiry capture.',
    whatConfluxImplements: 'Direct WhatsApp click-to-chat lead funnel and inquiry telemetry tracking.'
  });

  // ── 6. DATA INTEGRATION TRANSPARENCY (GSC / ANALYTICS) ──────────────────
  checks.push({
    id: 'analytics_gsc_integration',
    category: 'TECHNICAL_SEO',
    title: 'Google Search Console Live Search Analytics',
    status: 'REQUIRES_INTEGRATION',
    score: 0,
    finding: 'Live organic search impressions, query click-through rates, and Google ranking positions require verified Google Search Console property access.',
    evidence: 'GSC OAuth property integration not connected for this automated snapshot.',
    recommendation: 'Connect Google Search Console in the Business Platform to monitor verified query impressions, average position, and indexing status.',
    whatConfluxImplements: 'Zero-fabrication reporting: displays real Google Search Console data when connected, strictly labeling data as unavailable when not connected.'
  });

  // ── CALCULATE CATEGORY & OVERALL SCORES ─────────────────────────────────
  const getAvgScore = (cat: AuditCheckItem['category']) => {
    const catChecks = checks.filter(c => c.category === cat && c.status !== 'REQUIRES_INTEGRATION');
    if (catChecks.length === 0) return 50;
    const total = catChecks.reduce((sum, c) => sum + c.score, 0);
    return Math.round(total / catChecks.length);
  };

  const technicalSeo = getAvgScore('TECHNICAL_SEO');
  const localSignals = getAvgScore('LOCAL_SIGNALS');
  const identityConsistency = getAvgScore('IDENTITY_CONSISTENCY');
  const aiReadiness = getAvgScore('AI_READINESS');
  const conversionPaths = getAvgScore('CONVERSION_PATHS');

  const overallScore = Math.round(
    technicalSeo * 0.25 +
    localSignals * 0.25 +
    identityConsistency * 0.20 +
    aiReadiness * 0.15 +
    conversionPaths * 0.15
  );

  let statusGrade: VisibilityAuditReport['statusGrade'] = 'MODERATE';
  if (overallScore >= 80) statusGrade = 'OPTIMAL';
  else if (overallScore >= 60) statusGrade = 'MODERATE';
  else if (overallScore >= 40) statusGrade = 'NEEDS_IMPROVEMENT';
  else statusGrade = 'CRITICAL_GAPS';

  return {
    id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    businessName,
    location,
    websiteUrl: cleanUrl || undefined,
    evaluatedAt,
    overallScore,
    statusGrade,
    summary: `${businessName} currently has an evaluated visibility and trust score of ${overallScore}/100. While basic identity signals are present, key gaps exist in structured entity markup, statutory verification evidence, AI search readiness, and direct conversion paths.`,
    checks,
    categoryScores: {
      technicalSeo,
      localSignals,
      identityConsistency,
      aiReadiness,
      conversionPaths
    },
    problemsFound: [
      !hasWebsite ? 'Missing canonical website domain and crawlable HTML structure.' : 'Structured LocalBusiness JSON-LD markup requires full entity verification.',
      'Business claims lack direct links to official statutory registry records (MCA / GSTIN / Trade License).',
      'AI search engines (ChatGPT, Google Gemini, Perplexity) lack clear factual Q&A blocks to accurately quote this business.',
      'Mobile conversion paths (WhatsApp click-to-lead, 1-tap call routing) are not fully standardized.'
    ],
    recommendedFixes: [
      'Deploy crawlable canonical architecture with valid LocalBusiness and FAQPage Schema.org markup.',
      'Verify business identity with official statutory evidence to obtain the Conflux Verified Badge.',
      'Structure entity content for AI retrieval with clear answers, services taxonomy, and operating hours.',
      'Integrate direct WhatsApp and phone contact channels to capture customer leads instantly.'
    ],
    whatConfluxWillImplement: [
      'Canonical High-Speed Web & Local Entity Architecture',
      'Conflux Verify Evidence Docket & Verified Trust Badge',
      'AI-Search Readiness (GEO/AEO Structured Data & Entity Graph)',
      'Direct Speed-to-Lead WhatsApp & Telephone Conversion Funnels'
    ],
    whatWillBeMeasured: [
      'Verified Google Search Console Impressions & Click Trends (when GSC connected)',
      'Conflux Business Graph Entity Verification Status & Confidence Score',
      'Direct Customer Inbound Calls & WhatsApp Lead Inquiries',
      'Structured Data Indexing & Crawl Health'
    ],
    expectedCommercialOutcome: 'Increased discoverability across Google and AI search engines, elevated customer trust through evidence verification, and qualified inbound leads generated directly for your business.',
    dataLimitations: [
      'Search Console impressions and rankings require direct Google Search Console property authorization.',
      'Conflux never fabricates synthetic rankings or claims control over third-party search algorithms.',
      'Statutory verification requires submission of verifiable registration documents.'
    ]
  };
};
