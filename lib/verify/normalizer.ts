// Entity & Claim Normalizer and Claim-Type Rules for Conflux Verify

import type { ClaimType, ClaimTypeEvidenceRule } from '../../types/verify.ts';

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const normalizeEntityName = (name: string): string => {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(pvt|ltd|private|limited|inc|corp|corporation|llp|llc)\b/gi, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .trim();
};

export const normalizeClaimText = (claim: string): string => {
  return claim
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .toLowerCase();
};

// Deterministic simple hash for query deduplication and caching
export const generateClaimHash = (entityName: string, claimText: string): string => {
  const normEntity = normalizeEntityName(entityName).toLowerCase();
  const normClaim = normalizeClaimText(claimText);
  const combined = `${normEntity}::${normClaim}`;
  
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `vh_${Math.abs(hash).toString(36)}`;
};

export const determineClaimType = (claimText: string): ClaimType => {
  const lower = claimText.toLowerCase();

  if (lower.includes('iso') || lower.includes('certified') || lower.includes('certification') || lower.includes('accredited') || lower.includes('fssai') || lower.includes('bis') || lower.includes('ce mark')) {
    return 'CERTIFICATION';
  }
  if (lower.includes('active company') || lower.includes('legal entity') || lower.includes('struck off') || lower.includes('mca') || lower.includes('cin') || lower.includes('llpin')) {
    return 'LEGAL_EXISTENCE';
  }
  if (lower.includes('registered') || lower.includes('gstin') || lower.includes('msme') || lower.includes('trademark') || lower.includes('patent') || lower.includes('incorporation')) {
    return 'REGISTRATION';
  }
  if (lower.includes('authorized') || lower.includes('authorised') || lower.includes('dealer') || lower.includes('distributor') || lower.includes('partner') || lower.includes('channel partner')) {
    return 'AUTHORIZATION_PARTNERSHIP';
  }
  if (lower.includes('manufacturer') || lower.includes('factory') || lower.includes('plant') || lower.includes('capacity') || lower.includes('foundry') || lower.includes('fabrication') || lower.includes('production line')) {
    return 'MANUFACTURING_CAPABILITY';
  }
  if (lower.includes('founded') || lower.includes('established') || lower.includes('since 19') || lower.includes('since 20') || lower.includes('history') || lower.includes('acquired')) {
    return 'HISTORICAL_RECORD';
  }
  if (lower.includes('founder') || lower.includes('ceo') || lower.includes('director') || lower.includes('board') || lower.includes('leadership') || lower.includes('cto') || lower.includes('founded by')) {
    return 'LEADERSHIP_GOVERNANCE';
  }
  if (lower.includes('revenue') || lower.includes('turnover') || lower.includes('profit') || lower.includes('funding') || lower.includes('valuation') || lower.includes('cr') || lower.includes('crore')) {
    return 'FINANCIAL_METRIC';
  }
  if (lower.includes('grade') || lower.includes('tolerance') || lower.includes('micron') || lower.includes('tensile') || lower.includes('standard') || lower.includes('composition') || lower.includes('benchmark') || lower.includes('first contentful paint') || lower.includes('fcp')) {
    return 'PRODUCT_SPECIFICATION';
  }
  return 'GENERAL_FACT';
};

export const CLAIM_TYPE_RULES: Record<ClaimType, ClaimTypeEvidenceRule> = {
  LEGAL_EXISTENCE: {
    claimType: 'LEGAL_EXISTENCE',
    description: 'Statutory registration, legal incorporation status, and active operational standing.',
    primaryAuthoritativeSources: ['MCA (Ministry of Corporate Affairs)', 'State Registrar of Companies', 'Official Court/Gazette'],
    acceptableSourceTiers: ['TIER_1_PRIMARY_AUTHORITATIVE'],
    minimumIndependenceThreshold: 1,
    requiresTemporalCheck: true,
    contradictionHandling: 'STRICT_PRIMARY_OVERRIDE'
  },
  REGISTRATION: {
    claimType: 'REGISTRATION',
    description: 'Specific statutory identifier (GSTIN, MSME, Trademark, Import-Export Code).',
    primaryAuthoritativeSources: ['GSTN Registry', 'MSME Udyam Database', 'IP India Trademark Registry'],
    acceptableSourceTiers: ['TIER_1_PRIMARY_AUTHORITATIVE', 'TIER_2_FIRST_PARTY'],
    minimumIndependenceThreshold: 1,
    requiresTemporalCheck: true,
    contradictionHandling: 'STRICT_PRIMARY_OVERRIDE'
  },
  CERTIFICATION: {
    claimType: 'CERTIFICATION',
    description: 'Formal quality or compliance accreditation (ISO, BIS, FSSAI, NABL).',
    primaryAuthoritativeSources: ['IAF CertSearch', 'BIS Portal', 'FSSAI FoSCoS Registry', 'Accredited Registrar Database'],
    acceptableSourceTiers: ['TIER_1_PRIMARY_AUTHORITATIVE', 'TIER_3_INDEPENDENT_HIGH_QUALITY'],
    minimumIndependenceThreshold: 1,
    requiresTemporalCheck: true,
    contradictionHandling: 'OUTDATED_ON_LAPSE'
  },
  AUTHORIZATION_PARTNERSHIP: {
    claimType: 'AUTHORIZATION_PARTNERSHIP',
    description: 'Authorized dealership, tier-1 distributor status, or technology partnership.',
    primaryAuthoritativeSources: ['Principal Brand Official Partner Directory', 'Written Distribution Agreement', 'Regulatory Disclosure'],
    acceptableSourceTiers: ['TIER_2_FIRST_PARTY', 'TIER_1_PRIMARY_AUTHORITATIVE', 'TIER_3_INDEPENDENT_HIGH_QUALITY'],
    minimumIndependenceThreshold: 2,
    requiresTemporalCheck: true,
    contradictionHandling: 'DISPUTED_ON_CONFLICT'
  },
  MANUFACTURING_CAPABILITY: {
    claimType: 'MANUFACTURING_CAPABILITY',
    description: 'Physical equipment, production tonnage, factory location, or fabrication processes.',
    primaryAuthoritativeSources: ['Audited Environmental/Pollution Control Board Filings', 'Industrial Park Allotment', 'First-Party Engineering Audit'],
    acceptableSourceTiers: ['TIER_1_PRIMARY_AUTHORITATIVE', 'TIER_2_FIRST_PARTY', 'TIER_3_INDEPENDENT_HIGH_QUALITY'],
    minimumIndependenceThreshold: 2,
    requiresTemporalCheck: false,
    contradictionHandling: 'DISPUTED_ON_CONFLICT'
  },
  PRODUCT_SPECIFICATION: {
    claimType: 'PRODUCT_SPECIFICATION',
    description: 'Material grades, dimensional tolerances, test reports, or chemical composition.',
    primaryAuthoritativeSources: ['NABL Accredited Test Certificates', 'Manufacturer Data Sheet', 'BIS Conformance Report'],
    acceptableSourceTiers: ['TIER_1_PRIMARY_AUTHORITATIVE', 'TIER_2_FIRST_PARTY', 'TIER_3_INDEPENDENT_HIGH_QUALITY'],
    minimumIndependenceThreshold: 1,
    requiresTemporalCheck: false,
    contradictionHandling: 'STRICT_PRIMARY_OVERRIDE'
  },
  HISTORICAL_RECORD: {
    claimType: 'HISTORICAL_RECORD',
    description: 'Year of foundation, legacy lineage, historical acquisitions, or founding milestones.',
    primaryAuthoritativeSources: ['Initial Certificate of Incorporation', 'Historical Gazette', 'Established Archival Journalism'],
    acceptableSourceTiers: ['TIER_1_PRIMARY_AUTHORITATIVE', 'TIER_3_INDEPENDENT_HIGH_QUALITY', 'TIER_2_FIRST_PARTY'],
    minimumIndependenceThreshold: 2,
    requiresTemporalCheck: true,
    contradictionHandling: 'DISPUTED_ON_CONFLICT'
  },
  LEADERSHIP_GOVERNANCE: {
    claimType: 'LEADERSHIP_GOVERNANCE',
    description: 'Founders, managing directors, designated partners, or board members.',
    primaryAuthoritativeSources: ['MCA Form DIR-12 Records', 'Official Annual Filing', 'Official Company Governance Page'],
    acceptableSourceTiers: ['TIER_1_PRIMARY_AUTHORITATIVE', 'TIER_2_FIRST_PARTY'],
    minimumIndependenceThreshold: 1,
    requiresTemporalCheck: true,
    contradictionHandling: 'STRICT_PRIMARY_OVERRIDE'
  },
  FINANCIAL_METRIC: {
    claimType: 'FINANCIAL_METRIC',
    description: 'Annual turnover, capital expenditure, audited revenue, or funding rounds.',
    primaryAuthoritativeSources: ['MCA Audited Balance Sheet Filings (MGT-7/AOC-4)', 'SEBI Filings', 'Recognized Financial Press'],
    acceptableSourceTiers: ['TIER_1_PRIMARY_AUTHORITATIVE', 'TIER_3_INDEPENDENT_HIGH_QUALITY'],
    minimumIndependenceThreshold: 2,
    requiresTemporalCheck: true,
    contradictionHandling: 'DISPUTED_ON_CONFLICT'
  },
  GENERAL_FACT: {
    claimType: 'GENERAL_FACT',
    description: 'General descriptive or operational statement regarding a business entity.',
    primaryAuthoritativeSources: ['Official Business Publications', 'Verified Direct Documentation', 'Trade Records'],
    acceptableSourceTiers: ['TIER_1_PRIMARY_AUTHORITATIVE', 'TIER_2_FIRST_PARTY', 'TIER_3_INDEPENDENT_HIGH_QUALITY'],
    minimumIndependenceThreshold: 2,
    requiresTemporalCheck: false,
    contradictionHandling: 'DISPUTED_ON_CONFLICT'
  }
};
