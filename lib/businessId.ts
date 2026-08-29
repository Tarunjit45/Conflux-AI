// Conflux Platform — Deterministic Business ID & Canonical Slug Generator

export interface ConfluxIdParams {
  countryCode?: string; // Default 'IN'
  stateCode?: string;   // Default 'WB'
  district: string;     // e.g. 'nadia' or 'Nadia'
  sequenceNumber: number; // e.g. 1
}

const DISTRICT_CODE_MAP: Record<string, string> = {
  'nadia': 'NADIA',
  'kolkata': 'KOLKATA',
  'north-24-parganas': 'N24PGS',
  'south-24-parganas': 'S24PGS',
  'howrah': 'HOWRAH',
  'hooghly': 'HOOGHLY',
  'purba-bardhaman': 'PBARD',
  'paschim-bardhaman': 'PASBARD',
  'birbhum': 'BIRBHUM',
  'bankura': 'BANKURA',
  'purulia': 'PURULIA',
  'purba-medinipur': 'PMED',
  'paschim-medinipur': 'PASMED',
  'jhargram': 'JHARGRAM',
  'malda': 'MALDA',
  'uttar-dinajpur': 'UDIN',
  'dakshin-dinajpur': 'DDIN',
  'murshidabad': 'MURSHID',
  'darjeeling': 'DARJ',
  'kalimpong': 'KALIMP',
  'jalpaiguri': 'JALPAI',
  'alipurduar': 'ALIPUR',
  'cooch-behar': 'COOCH'
};

/**
 * Generate an immutable, canonical Conflux Business ID
 * Example: CFX-IN-WB-NADIA-000001
 */
export const generateConfluxBusinessId = (params: ConfluxIdParams): string => {
  const country = (params.countryCode || 'IN').toUpperCase();
  const state = (params.stateCode || 'WB').toUpperCase();
  const normDist = params.district.toLowerCase().trim().replace(/\s+/g, '-');
  const districtCode = DISTRICT_CODE_MAP[normDist] || normDist.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 7) || 'GEN';
  const seq = String(Math.max(1, Math.floor(params.sequenceNumber))).padStart(6, '0');

  return `CFX-${country}-${state}-${districtCode}-${seq}`;
};

/**
 * Validate syntax of a Conflux Business ID
 */
export const isValidConfluxBusinessId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  const regex = /^CFX-[A-Z]{2,3}-[A-Z]{2,3}-[A-Z0-9]{3,10}-\d{6}$/;
  return regex.test(id.trim());
};

/**
 * Normalize business name into a clean, URL-safe slug
 */
export const slugifyBusinessName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Build canonical public profile path
 */
export const getBusinessProfileUrl = (params: {
  country?: string;
  state?: string;
  district: string;
  city: string;
  slug: string;
}): string => {
  const country = (params.country || 'india').toLowerCase().replace(/\s+/g, '-');
  const state = (params.state || 'west-bengal').toLowerCase().replace(/\s+/g, '-');
  const district = params.district.toLowerCase().replace(/\s+/g, '-');
  const city = params.city.toLowerCase().replace(/\s+/g, '-');
  const slug = params.slug.toLowerCase().replace(/\s+/g, '-');

  return `/business/${country}/${state}/${district}/${city}/${slug}`;
};
