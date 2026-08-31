// Conflux Verify — Core Data Models & Claim-Type-Aware Verification Architecture

export type VerificationStatus =
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'CONTRADICTED'
  | 'UNVERIFIED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'OUTDATED'
  | 'DISPUTED';

export type SourceTier =
  | 'TIER_1_PRIMARY_AUTHORITATIVE'      // Government gazettes, statutory registries, court records, accredited certification registrars
  | 'TIER_2_FIRST_PARTY'                 // Official company domain, audited annual reports, direct leadership filings (Direct claim, not independent)
  | 'TIER_3_INDEPENDENT_HIGH_QUALITY'   // Established investigative journalism, peer-reviewed journals, accredited industry watchdogs
  | 'TIER_4_SECONDARY'                  // Trade directories, aggregators, trade blogs, syndicated press releases
  | 'TIER_5_USER_GENERATED';            // Forums, Reddit, anonymous reviews, community comments

export type ClaimType =
  | 'LEGAL_EXISTENCE'
  | 'REGISTRATION'
  | 'CERTIFICATION'
  | 'AUTHORIZATION_PARTNERSHIP'
  | 'MANUFACTURING_CAPABILITY'
  | 'PRODUCT_SPECIFICATION'
  | 'HISTORICAL_RECORD'
  | 'LEADERSHIP_GOVERNANCE'
  | 'FINANCIAL_METRIC'
  | 'GENERAL_FACT';

export type EvidenceStance = 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL' | 'MENTIONS';
export type EvidenceStrength = 'HIGH' | 'MEDIUM' | 'LOW';
export type SyndicationType = 'ORIGINAL' | 'SYNDICATED' | 'PARAPHRASED' | 'INDEPENDENT_CORROBORATION';

export interface ClaimTypeEvidenceRule {
  claimType: ClaimType;
  description: string;
  primaryAuthoritativeSources: string[];
  acceptableSourceTiers: SourceTier[];
  minimumIndependenceThreshold: number; // Minimum number of non-syndicated independent origins
  requiresTemporalCheck: boolean;
  contradictionHandling: 'STRICT_PRIMARY_OVERRIDE' | 'DISPUTED_ON_CONFLICT' | 'OUTDATED_ON_LAPSE';
}

export interface VerifyEntity {
  id: string;
  slug: string;
  name: string;
  legalName?: string;
  normalizedName: string;
  entityType: 'BUSINESS' | 'INSTITUTION' | 'BRAND' | 'INDIVIDUAL';
  country?: string;
  state?: string;
  jurisdiction?: string;
  officialUrl?: string;
  registrationIdentifier?: string; // CIN / GSTIN / LLPIN / MSME
  canonicalEntityId?: string; // Alias mapping (guaranteed non-self, non-circular)
  createdAt: string;
}

export interface VerifyClaim {
  id: string;
  entityId: string;
  claimText: string;
  claimNormalized: string;
  claimHash: string; // Deterministic SHA-256 (norm_entity || '::' || norm_claim)
  claimType: ClaimType;
  claimCategory?: string;
  createdAt: string;
}

export interface VerifySource {
  id: string;
  canonicalUrl: string; // Enforces source deduplication
  domain: string;
  title: string;
  publisher?: string;
  sourceTier: SourceTier;
  isPrimaryRegistrar?: boolean;
  parentSourceId?: string; // Links syndicated press releases/articles to original origin
  retrievedAt: string;
  publicationDate?: string;
}

export type RetrievalOutcome =
  | 'SUCCESS'
  | 'RECORD_NOT_FOUND'
  | 'SEARCH_TIMEOUT'
  | 'NETWORK_ERROR'
  | 'HTTP_ERROR'
  | 'RATE_LIMITED'
  | 'PARSER_ERROR'
  | 'INCOMPLETE_REGISTRY_RESPONSE'
  | 'SKIPPED';

export interface VerifyEvidence {
  id: string;
  claimId: string;
  sourceId: string;
  source: VerifySource;
  excerpt: string;
  stance: EvidenceStance;
  strength: EvidenceStrength;
  syndicationType: SyndicationType;
  isPrimaryOrigin: boolean;
  derivedFromEvidenceId?: string; // Provenance / copycat derivation
  supersededBy?: string;          // Temporal replacement relationship
  isActive: boolean; // Temporal versioning
  validUntil?: string; // Time-bounded certifications or authorizations
  retrievalOutcome?: RetrievalOutcome; // Explicit outcome state (timeouts/errors never become evidence)
  searchBoundaryComplete?: boolean;   // True ONLY if the registry search boundary was fully exhaustive
  publicationDate?: string;
  lastCheckedAt: string;
  notes?: string;
}

export interface ConfidenceBreakdown {
  score: number; // 0 to 100
  sourceAuthorityWeight: number;    // Weight based on source tiers present
  evidenceRelevanceWeight: number;  // Direct textual correspondence to claim terms
  independenceWeight: number;       // Discounted for syndicated/copycat origins
  temporalValidityWeight: number;   // Recency & active vs expired status
  corroborationBonus: number;       // Multiple distinct origins
  contradictionPenalty: number;     // Deductions for conflicting authoritative records
}

export interface VerificationResult {
  id: string;
  entity: VerifyEntity;
  claim: VerifyClaim;
  status: VerificationStatus;
  retrievalOutcome: RetrievalOutcome; // Explicit retrieval outcome state separate from verification status
  confidence: number; // Operational evidence assessment score (0 to 100)
  confidenceBreakdown?: ConfidenceBreakdown;
  explanation: string;
  limitations: string[];
  findings?: any[];
  supportingEvidence: VerifyEvidence[];
  contradictingEvidence: VerifyEvidence[];
  neutralEvidence: VerifyEvidence[];
  sourceQualityBreakdown: {
    tier1Count: number;
    tier2Count: number;
    tier3Count: number;
    tier4Count: number;
    tier5Count: number;
    independentOriginsCount: number;
  };
  version: number;
  isIndexable: boolean; // Requires high evidence depth, substantive value, and editorial approval
  isEditoriallyApproved: boolean;
  verificationTimestamp: string;
  lastCheckedAt: string;
  cacheHit?: boolean;
}

export interface VerificationHistory {
  id: string;
  verificationId: string;
  claimId: string;
  previousStatus?: VerificationStatus;
  newStatus: VerificationStatus;
  previousConfidence?: number;
  newConfidence: number;
  evidenceCount: number;
  evidenceIdsSnapshot: string[]; // Immutable snapshot of evidence record IDs
  reasonForChange: string;
  changedBy: string;
  changedAt: string;
}

export interface VerifyRequest {
  entityName: string;
  claimText: string;
  entityUrl?: string;
  sourceUrls?: string[];
  forceFresh?: boolean;
}

export interface VerifyResponse {
  success: boolean;
  result?: VerificationResult;
  error?: string;
  durationMs?: number;
}

export interface GoldenTestCase {
  id: string;
  category: 
    | 'CLEARLY_SUPPORTED'
    | 'CLEARLY_CONTRADICTED'
    | 'INSUFFICIENT_EVIDENCE'
    | 'OUTDATED_RECORD'
    | 'DISPUTED_RECORD'
    | 'FIRST_PARTY_ONLY'
    | 'SYNDICATED_COPYCATS'
    | 'CONFLICTING_SOURCES'
    | 'AMBIGUOUS_ENTITIES'
    | 'HISTORICAL_RECORD';
  entityName: string;
  claimText: string;
  claimType: ClaimType;
  expectedStatus: VerificationStatus;
  expectedMinConfidence?: number;
  expectedMaxConfidence?: number;
  expectedPrimarySourceTiers: SourceTier[];
  humanAssessmentRationale: string;
  keyLimitations: string[];
}

export interface GoldenTestEvaluationMetrics {
  totalTestCases: number;
  finalStatusAccuracy: number;          // % of test cases where assigned status matches expected human status
  evidenceRelevanceRate: number;        // % of retrieved excerpts directly addressing claim terms
  evidencePrecisionRate: number;        // Proportion of retrieved evidence that is substantive vs uninformative
  contradictionDetectionRate: number;   // Recall on identifying contradictory records in CLEARLY_CONTRADICTED & DISPUTED
  independentSourceDetectionRate: number; // Accuracy in collapsing syndicated/copycat press releases
  entityResolutionAccuracy: number;     // Accuracy in disambiguating generic entity names vs legal names
  temporalCorrectnessRate: number;      // Accuracy in detecting lapsed/expired certificates & assigning OUTDATED
  falseSupportedRate: number;           // Safety metric: % of untrue/unverified claims incorrectly marked SUPPORTED (Target: < 2%)
  falseContradictedRate: number;        // Safety metric: % of true claims incorrectly marked CONTRADICTED (Target: < 2%)
  p95VerificationLatencyMs: number;     // 95th percentile latency in milliseconds
  estimatedCostPerVerificationUsd: number; // Average retrieval & processing cost per investigation
}
