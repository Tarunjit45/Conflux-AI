// Evidence and Provenance Verification Models

export type EvidenceLevel = 
  | 'E1' // Primary Official Source (gov.in, nic.in, gazette, official institution)
  | 'E2' // First-hand ConfluxAI verification (field observation / direct team check)
  | 'E3' // Direct business / contact confirmation (owner interview, verified WhatsApp)
  | 'E4' // Reliable secondary source (established news, accredited trade directories)
  | 'E5' // Community / user submission (flagged as pending verification)
  | 'E6'; // Unverified / Estimated (must display disclaimer)

export type EditorialWorkflowState = 
  | 'DRAFT'
  | 'RESEARCH'
  | 'FACT_CHECK'
  | 'EDITOR_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'NEEDS_UPDATE'
  | 'ARCHIVED';

export interface SourceRecord {
  id: string;
  url: string;
  title: string;
  publisher?: string;
  sourceType: 'GOVERNMENT' | 'OFFICIAL_BUSINESS' | 'ACADEMIC' | 'NEWS' | 'FIELD_OBSERVATION';
  reliabilityLevel: 'HIGH' | 'MEDIUM' | 'UNVERIFIED';
  accessedAt: string;
  notes?: string;
}

export interface EvidenceRecord {
  id: string;
  entityType: 'business' | 'article' | 'locality' | 'price' | 'timing';
  entityId: string;
  claimText: string;
  evidenceLevel: EvidenceLevel;
  sourceId?: string;
  verifiedBy: string;
  verifiedAt: string;
  notes?: string;
  isVerificationRequired?: boolean;
}

export interface EditorialReadinessScore {
  score: number; // 0 - 100
  isApprovedForPublishing: boolean;
  breakdown: {
    originalityAndUtility: number; // Max 35
    factualAccuracyAndSourcing: number; // Max 30
    intentSatisfaction: number; // Max 15
    entityAndLocalityMapping: number; // Max 10
    technicalSeoAndSchema: number; // Max 10
  };
  missingRequirements: string[];
}
