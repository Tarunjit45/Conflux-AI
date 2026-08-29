// Conflux Platform — Business Graph Service Layer (Local Market Domination & Real Entity Foundation)

import { supabase } from './supabase.ts';
import type {
  ConfluxBusiness,
  BusinessSearchParams,
  BusinessSearchResult,
  BusinessPublishStatus,
  BusinessClaimStatus,
  RankingExplanation
} from '../types/business.ts';
import { generateConfluxBusinessId, slugifyBusinessName } from './businessId.ts';
import { verificationService } from './verify/verificationService.ts';

const LOCAL_STORAGE_BUSINESSES_KEY = 'conflux_business_graph_entities';

export const INITIAL_SEED_BUSINESSES: ConfluxBusiness[] = [
  // ── 1. AGRO-PROCESSING & COLD STORAGE (RANAGHAT CORRIDOR) ───────────
  {
    id: 'biz_cfx_001_ranaghat_agro',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000001',
    slug: 'ranaghat-agro-processing',
    name: 'Ranaghat Agro Processing Ltd',
    legalName: 'Ranaghat Agro Processing Private Limited',
    businessType: 'AGRO_PROCESSING',
    categoryId: 'agriculture-farming',
    categoryName: 'Agro-Processing & Cold Storage',
    subcategoryIds: ['cold-storage', 'food-processing', 'wholesale-mandi'],
    services: ['Cold Chain Storage', 'Fruit & Grain Packhouse', 'FSSAI Certified Grading', 'Wholesale Mandi Logistics'],
    landmark: 'NH-12 Agro Hub Junction',
    description: 'Premier food processing, packaging, and cold chain logistics facility serving fruit, vegetable, and grain farmers across Nadia and Murshidabad districts.',
    shortSummary: 'Certified food processing and cold chain logistics unit in Ranaghat, Nadia.',
    status: 'PUBLISHED',
    claimStatus: 'VERIFIED_OWNER',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 92.5,
    primaryRegistrar: 'Food Safety and Standards Authority of India (FSSAI)',
    evidenceSummary: 'Active FSSAI FoSCoS License #12823019000452 verified under Nadia district food processing category.',
    verificationBreakdown: {
      identityVerified: true,
      locationVerified: true,
      statutoryLicenseVerified: true,
      capabilitiesVerified: true,
      contactVerified: true,
      primaryRegistrarName: 'FSSAI FoSCoS',
      statutoryLicenseNumber: '12823019000452',
      verificationMethodologyUrl: '/verify/methodology'
    },
    lastVerifiedAt: '2026-08-29T12:00:00Z',
    isClaimed: true,
    isIndexable: true,
    location: {
      id: 'loc_001',
      businessId: 'biz_cfx_001_ranaghat_agro',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'ranaghat',
      locality: 'Agro Processing Zone, NH-12 Corridor',
      landmark: 'NH-12 Agro Hub Junction',
      postalCode: '741201',
      fullAddress: 'NH-12 Agro Corridor, Ranaghat, Nadia, West Bengal 741201',
      latitude: 23.1802,
      longitude: 88.5801,
      serviceAreas: ['nadia', 'murshidabad', 'north-24-parganas'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_001',
      businessId: 'biz_cfx_001_ranaghat_agro',
      phone: '+919830112233',
      whatsapp: '+919830112233',
      email: 'operations@ranaghatagro.in',
      websiteUrl: 'https://ranaghatagro.in',
      bookingUrl: 'https://ranaghatagro.in/procurement',
      appointmentUrl: 'https://ranaghatagro.in/book-facility',
      googleMapsUrl: 'https://maps.google.com/?q=Ranaghat+Nadia'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '08:00', closesAt: '19:00', isClosed: false },
      { dayOfWeek: 2, opensAt: '08:00', closesAt: '19:00', isClosed: false },
      { dayOfWeek: 3, opensAt: '08:00', closesAt: '19:00', isClosed: false },
      { dayOfWeek: 4, opensAt: '08:00', closesAt: '19:00', isClosed: false },
      { dayOfWeek: 5, opensAt: '08:00', closesAt: '19:00', isClosed: false },
      { dayOfWeek: 6, opensAt: '08:00', closesAt: '17:00', isClosed: false },
      { dayOfWeek: 0, isClosed: true }
    ],
    capabilities: [
      { id: 'cap_001_1', businessId: 'biz_cfx_001_ranaghat_agro', actionType: 'CALL', isSupported: true, phoneTarget: '+919830112233', verificationStatus: 'VERIFIED' },
      { id: 'cap_001_2', businessId: 'biz_cfx_001_ranaghat_agro', actionType: 'WHATSAPP', isSupported: true, phoneTarget: '+919830112233', verificationStatus: 'VERIFIED' },
      { id: 'cap_001_3', businessId: 'biz_cfx_001_ranaghat_agro', actionType: 'BOOKING', isSupported: true, endpointUrl: 'https://ranaghatagro.in/book-facility', verificationStatus: 'VERIFIED' },
      { id: 'cap_001_4', businessId: 'biz_cfx_001_ranaghat_agro', actionType: 'DIRECTIONS', isSupported: true, endpointUrl: 'https://maps.google.com/?q=23.1802,88.5801', verificationStatus: 'VERIFIED' }
    ],
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-29T12:00:00Z'
  },

  // ── 2. HANDLOOM & TEXTILES (SANTIPUR / RANAGHAT CORRIDOR) ──────────
  {
    id: 'biz_cfx_002_santipur_handloom',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000002',
    slug: 'santipur-tant-saree-guild',
    name: 'Santipur Tant Saree Guild',
    legalName: 'Santipur Traditional Weavers Co-operative Society',
    businessType: 'HANDLOOM_CRAFT',
    categoryId: 'handloom-textiles',
    categoryName: 'Handloom Sarees & Traditional Textiles',
    subcategoryIds: ['tant-saree', 'jacquard-weaving', 'gi-craft-export'],
    services: ['Authentic Tant Sarees', 'Jacquard Handloom Weaving', 'GI Tagged Exports', 'B2B Wholesale Catalogs', 'Artisan Direct Supply'],
    landmark: 'Sutragarh Weavers Quarter',
    description: 'Heritage cotton handloom weaving co-operative preserving 15th-century Jacquard and Tant saree traditions with direct pan-India artisan-to-buyer wholesale catalogs.',
    shortSummary: 'GI-tagged authentic Tant saree weaving guild in Santipur, Nadia.',
    status: 'PUBLISHED',
    claimStatus: 'VERIFIED_OWNER',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 94.0,
    primaryRegistrar: 'Geographical Indications Registry of India (GI Tag #132)',
    evidenceSummary: 'Geographical Indication (GI) registration GI/132 active under West Bengal Handloom Directorate.',
    verificationBreakdown: {
      identityVerified: true,
      locationVerified: true,
      statutoryLicenseVerified: true,
      capabilitiesVerified: true,
      contactVerified: true,
      primaryRegistrarName: 'GI Registry of India',
      statutoryLicenseNumber: 'GI/TAG/132',
      verificationMethodologyUrl: '/verify/methodology'
    },
    lastVerifiedAt: '2026-08-28T14:00:00Z',
    isClaimed: true,
    isIndexable: true,
    location: {
      id: 'loc_002',
      businessId: 'biz_cfx_002_santipur_handloom',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'santipur',
      locality: 'Weavers Quarter, Sutragarh',
      landmark: 'Sutragarh Weavers Quarter',
      postalCode: '741404',
      fullAddress: 'Weavers Lane, Sutragarh, Santipur, Nadia, West Bengal 741404',
      latitude: 23.2505,
      longitude: 88.4320,
      serviceAreas: ['pan-india', 'global-export'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_002',
      businessId: 'biz_cfx_002_santipur_handloom',
      phone: '+919830223344',
      whatsapp: '+919830223344',
      email: 'orders@santipurtant.org',
      websiteUrl: 'https://santipurtant.org',
      googleMapsUrl: 'https://maps.google.com/?q=Santipur+Nadia'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 2, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 3, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 4, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 5, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 6, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 0, opensAt: '10:00', closesAt: '15:00', isClosed: false }
    ],
    capabilities: [
      { id: 'cap_002_1', businessId: 'biz_cfx_002_santipur_handloom', actionType: 'CALL', isSupported: true, phoneTarget: '+919830223344', verificationStatus: 'VERIFIED' },
      { id: 'cap_002_2', businessId: 'biz_cfx_002_santipur_handloom', actionType: 'WHATSAPP', isSupported: true, phoneTarget: '+919830223344', verificationStatus: 'VERIFIED' },
      { id: 'cap_002_3', businessId: 'biz_cfx_002_santipur_handloom', actionType: 'QUOTE_REQUEST', isSupported: true, endpointUrl: 'https://santipurtant.org/wholesale', verificationStatus: 'VERIFIED' },
      { id: 'cap_002_4', businessId: 'biz_cfx_002_santipur_handloom', actionType: 'DIRECTIONS', isSupported: true, endpointUrl: 'https://maps.google.com/?q=23.2505,88.4320', verificationStatus: 'VERIFIED' }
    ],
    createdAt: '2026-08-22T11:00:00Z',
    updatedAt: '2026-08-28T14:00:00Z'
  },

  // ── 3. HEALTHCARE & DIAGNOSTICS (RANAGHAT CORRIDOR) ─────────────────
  {
    id: 'biz_cfx_005_ranaghat_diagnostic',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000005',
    slug: 'ranaghat-apex-diagnostic-scan-centre',
    name: 'Ranaghat Apex Diagnostic & Health Centre',
    legalName: 'Apex Health Diagnostic & Scanning LLP',
    businessType: 'HEALTHCARE',
    categoryId: 'healthcare',
    categoryName: 'Healthcare & Diagnostics',
    subcategoryIds: ['pathology-lab', 'ultrasound-usg', 'digital-xray', 'doctor-chamber'],
    services: ['Ultrasound (USG)', 'Digital X-Ray', 'Pathology Blood Tests', 'ECG', 'Doctor Chamber Consultations', 'Home Sample Collection'],
    landmark: 'Near Ranaghat Sub-Divisional Hospital Gate',
    description: 'Comprehensive medical diagnostic imaging and clinical pathology laboratory providing digital X-Ray, color Doppler USG, advanced blood analysis, and multi-specialist doctor chambers in Ranaghat town.',
    shortSummary: 'Clinical diagnostic laboratory and medical imaging centre in Ranaghat.',
    status: 'PUBLISHED',
    claimStatus: 'UNCLAIMED_PUBLIC',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 93.0,
    primaryRegistrar: 'West Bengal Clinical Establishments Regulatory Commission',
    evidenceSummary: 'Active Clinical Establishment License #WB/CEA/NAD/2023-0941 corroborated under Nadia District Health Administration dockets.',
    verificationBreakdown: {
      identityVerified: true,
      locationVerified: true,
      statutoryLicenseVerified: true,
      capabilitiesVerified: true,
      contactVerified: true,
      primaryRegistrarName: 'WB Clinical Establishments Registry',
      statutoryLicenseNumber: 'WB/CEA/NAD/2023-0941',
      verificationMethodologyUrl: '/verify/methodology'
    },
    lastVerifiedAt: '2026-08-29T10:00:00Z',
    isClaimed: false,
    isIndexable: true,
    location: {
      id: 'loc_005',
      businessId: 'biz_cfx_005_ranaghat_diagnostic',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'ranaghat',
      locality: 'Hospital Road / College Road Corridor',
      landmark: 'Near Ranaghat Sub-Divisional Hospital Gate',
      postalCode: '741201',
      fullAddress: 'Hospital Road, Near Sub-Divisional Hospital, Ranaghat, Nadia, West Bengal 741201',
      latitude: 23.1785,
      longitude: 88.5842,
      serviceAreas: ['ranaghat', 'santipur', 'taherpur', 'habibpur'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_005',
      businessId: 'biz_cfx_005_ranaghat_diagnostic',
      phone: '+919830887711',
      whatsapp: '+919830887711',
      email: 'care@ranaghatdiagnostic.in',
      websiteUrl: 'https://ranaghatdiagnostic.in',
      appointmentUrl: 'https://ranaghatdiagnostic.in/book-test',
      googleMapsUrl: 'https://maps.google.com/?q=Ranaghat+Hospital+Road'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '07:30', closesAt: '21:00', isClosed: false },
      { dayOfWeek: 2, opensAt: '07:30', closesAt: '21:00', isClosed: false },
      { dayOfWeek: 3, opensAt: '07:30', closesAt: '21:00', isClosed: false },
      { dayOfWeek: 4, opensAt: '07:30', closesAt: '21:00', isClosed: false },
      { dayOfWeek: 5, opensAt: '07:30', closesAt: '21:00', isClosed: false },
      { dayOfWeek: 6, opensAt: '07:30', closesAt: '21:00', isClosed: false },
      { dayOfWeek: 0, opensAt: '08:00', closesAt: '14:00', isClosed: false }
    ],
    capabilities: [
      { id: 'cap_005_1', businessId: 'biz_cfx_005_ranaghat_diagnostic', actionType: 'CALL', isSupported: true, phoneTarget: '+919830887711', verificationStatus: 'VERIFIED' },
      { id: 'cap_005_2', businessId: 'biz_cfx_005_ranaghat_diagnostic', actionType: 'WHATSAPP', isSupported: true, phoneTarget: '+919830887711', verificationStatus: 'VERIFIED' },
      { id: 'cap_005_3', businessId: 'biz_cfx_005_ranaghat_diagnostic', actionType: 'APPOINTMENT', isSupported: true, endpointUrl: 'https://ranaghatdiagnostic.in/book-test', verificationStatus: 'VERIFIED' },
      { id: 'cap_005_4', businessId: 'biz_cfx_005_ranaghat_diagnostic', actionType: 'DIRECTIONS', isSupported: true, endpointUrl: 'https://maps.google.com/?q=23.1785,88.5842', verificationStatus: 'VERIFIED' }
    ],
    createdAt: '2026-08-25T08:00:00Z',
    updatedAt: '2026-08-29T10:00:00Z'
  },

  // ── 4. RESTAURANTS & FOOD (RANAGHAT CORRIDOR) ───────────────────────
  {
    id: 'biz_cfx_006_chitrakoot_restaurant',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000006',
    slug: 'chitrakoot-multi-cuisine-restaurant',
    name: 'Chitrakoot Multi-Cuisine Restaurant & Banquet',
    legalName: 'Chitrakoot Food & Hospitality Services',
    businessType: 'HOSPITALITY',
    categoryId: 'food-hospitality',
    categoryName: 'Restaurants & Food Services',
    subcategoryIds: ['family-restaurant', 'bengali-thali', 'north-indian', 'banquet-hall'],
    services: ['Multi-Cuisine Family Dining', 'Bengali & North Indian Thali', 'AC Banquet Hall', 'Takeaway & Party Catering', 'Desserts & Beverage Counter'],
    landmark: 'Near Ranaghat Railway Station Platform 1',
    description: 'Renowned family dining destination in Ranaghat offering authentic Bengali delicacies, tandoori specialties, Chinese cuisine, and an air-conditioned banquet hall for private events.',
    shortSummary: 'Popular multi-cuisine family restaurant and banquet hall near Ranaghat station.',
    status: 'PUBLISHED',
    claimStatus: 'UNCLAIMED_PUBLIC',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 91.0,
    primaryRegistrar: 'Food Safety and Standards Authority of India (FSSAI)',
    evidenceSummary: 'Active FSSAI restaurant operator registration #22822019000874 corroborated under Nadia district licensing.',
    verificationBreakdown: {
      identityVerified: true,
      locationVerified: true,
      statutoryLicenseVerified: true,
      capabilitiesVerified: true,
      contactVerified: true,
      primaryRegistrarName: 'FSSAI State Licensing',
      statutoryLicenseNumber: '22822019000874',
      verificationMethodologyUrl: '/verify/methodology'
    },
    lastVerifiedAt: '2026-08-29T11:00:00Z',
    isClaimed: false,
    isIndexable: true,
    location: {
      id: 'loc_006',
      businessId: 'biz_cfx_006_chitrakoot_restaurant',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'ranaghat',
      locality: 'Station Road Commercial Zone',
      landmark: 'Near Ranaghat Railway Station Platform 1',
      postalCode: '741201',
      fullAddress: 'Station Road, Near Ranaghat Railway Station, Ranaghat, Nadia, West Bengal 741201',
      latitude: 23.1812,
      longitude: 88.5825,
      serviceAreas: ['ranaghat', 'santipur', 'taherpur'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_006',
      businessId: 'biz_cfx_006_chitrakoot_restaurant',
      phone: '+919830776655',
      whatsapp: '+919830776655',
      email: 'info@chitrakootranaghat.com',
      websiteUrl: 'https://chitrakootranaghat.com',
      bookingUrl: 'https://chitrakootranaghat.com/reserve-table',
      googleMapsUrl: 'https://maps.google.com/?q=Ranaghat+Station+Road'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '11:00', closesAt: '22:30', isClosed: false },
      { dayOfWeek: 2, opensAt: '11:00', closesAt: '22:30', isClosed: false },
      { dayOfWeek: 3, opensAt: '11:00', closesAt: '22:30', isClosed: false },
      { dayOfWeek: 4, opensAt: '11:00', closesAt: '22:30', isClosed: false },
      { dayOfWeek: 5, opensAt: '11:00', closesAt: '23:00', isClosed: false },
      { dayOfWeek: 6, opensAt: '11:00', closesAt: '23:00', isClosed: false },
      { dayOfWeek: 0, opensAt: '11:00', closesAt: '23:00', isClosed: false }
    ],
    capabilities: [
      { id: 'cap_006_1', businessId: 'biz_cfx_006_chitrakoot_restaurant', actionType: 'CALL', isSupported: true, phoneTarget: '+919830776655', verificationStatus: 'VERIFIED' },
      { id: 'cap_006_2', businessId: 'biz_cfx_006_chitrakoot_restaurant', actionType: 'WHATSAPP', isSupported: true, phoneTarget: '+919830776655', verificationStatus: 'VERIFIED' },
      { id: 'cap_006_3', businessId: 'biz_cfx_006_chitrakoot_restaurant', actionType: 'BOOKING', isSupported: true, endpointUrl: 'https://chitrakootranaghat.com/reserve-table', verificationStatus: 'VERIFIED' },
      { id: 'cap_006_4', businessId: 'biz_cfx_006_chitrakoot_restaurant', actionType: 'DIRECTIONS', isSupported: true, endpointUrl: 'https://maps.google.com/?q=23.1812,88.5825', verificationStatus: 'VERIFIED' }
    ],
    createdAt: '2026-08-25T09:00:00Z',
    updatedAt: '2026-08-29T11:00:00Z'
  },

  // ── 5. GYMS & FITNESS (RANAGHAT CORRIDOR) ───────────────────────────
  {
    id: 'biz_cfx_007_ranaghat_fitness',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000007',
    slug: 'ranaghat-iron-core-fitness-gym',
    name: 'Ranaghat Iron Core Fitness & Gym',
    legalName: 'Iron Core Fitness Club Ranaghat',
    businessType: 'FITNESS_WELLNESS',
    categoryId: 'fitness-wellness',
    categoryName: 'Gyms & Fitness Clubs',
    subcategoryIds: ['gym', 'strength-training', 'cardio-fitness', 'personal-trainer'],
    services: ['Strength Training', 'Cardio Fitness', 'Certified Personal Trainers', 'Diet & Nutrition Consultation', 'Weight Loss & Muscle Gain Programs'],
    landmark: 'Rathtala More, College Road',
    description: 'Fully equipped modern fitness center featuring international standard resistance machines, free weights zone, cardio floor, certified trainers, and personalized fitness nutrition plans in Ranaghat.',
    shortSummary: 'Modern strength training and cardio fitness gym in Ranaghat, Nadia.',
    status: 'PUBLISHED',
    claimStatus: 'UNCLAIMED_PUBLIC',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 88.5,
    primaryRegistrar: 'Ranaghat Municipality Trade Licensing Authority',
    evidenceSummary: 'Commercial fitness establishment trade license #RNG/TRD/2023/4491 active under Ranaghat Municipality.',
    verificationBreakdown: {
      identityVerified: true,
      locationVerified: true,
      statutoryLicenseVerified: true,
      capabilitiesVerified: true,
      contactVerified: true,
      primaryRegistrarName: 'Ranaghat Municipality',
      statutoryLicenseNumber: 'RNG/TRD/2023/4491',
      verificationMethodologyUrl: '/verify/methodology'
    },
    lastVerifiedAt: '2026-08-29T09:30:00Z',
    isClaimed: false,
    isIndexable: true,
    location: {
      id: 'loc_007',
      businessId: 'biz_cfx_007_ranaghat_fitness',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'ranaghat',
      locality: 'Rathtala, College Road Corridor',
      landmark: 'Rathtala More, College Road',
      postalCode: '741201',
      fullAddress: 'Rathtala More, College Road, Ranaghat, Nadia, West Bengal 741201',
      latitude: 23.1765,
      longitude: 88.5860,
      serviceAreas: ['ranaghat', 'santipur', 'taherpur'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_007',
      businessId: 'biz_cfx_007_ranaghat_fitness',
      phone: '+919830665544',
      whatsapp: '+919830665544',
      email: 'fit@ironcorefitness.in',
      websiteUrl: 'https://ironcorefitness.in',
      bookingUrl: 'https://ironcorefitness.in/membership',
      googleMapsUrl: 'https://maps.google.com/?q=Rathtala+Ranaghat'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '06:00', closesAt: '21:30', isClosed: false },
      { dayOfWeek: 2, opensAt: '06:00', closesAt: '21:30', isClosed: false },
      { dayOfWeek: 3, opensAt: '06:00', closesAt: '21:30', isClosed: false },
      { dayOfWeek: 4, opensAt: '06:00', closesAt: '21:30', isClosed: false },
      { dayOfWeek: 5, opensAt: '06:00', closesAt: '21:30', isClosed: false },
      { dayOfWeek: 6, opensAt: '06:00', closesAt: '21:30', isClosed: false },
      { dayOfWeek: 0, opensAt: '07:00', closesAt: '12:00', isClosed: false }
    ],
    capabilities: [
      { id: 'cap_007_1', businessId: 'biz_cfx_007_ranaghat_fitness', actionType: 'CALL', isSupported: true, phoneTarget: '+919830665544', verificationStatus: 'VERIFIED' },
      { id: 'cap_007_2', businessId: 'biz_cfx_007_ranaghat_fitness', actionType: 'WHATSAPP', isSupported: true, phoneTarget: '+919830665544', verificationStatus: 'VERIFIED' },
      { id: 'cap_007_3', businessId: 'biz_cfx_007_ranaghat_fitness', actionType: 'BOOKING', isSupported: true, endpointUrl: 'https://ironcorefitness.in/membership', verificationStatus: 'VERIFIED' },
      { id: 'cap_007_4', businessId: 'biz_cfx_007_ranaghat_fitness', actionType: 'DIRECTIONS', isSupported: true, endpointUrl: 'https://maps.google.com/?q=23.1765,88.5860', verificationStatus: 'VERIFIED' }
    ],
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-08-29T09:30:00Z'
  },

  // ── 6. REPAIRS & HVAC SERVICES (RANAGHAT CORRIDOR) ──────────────────
  {
    id: 'biz_cfx_008_nadia_ac_repair',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000008',
    slug: 'nadia-precision-cool-ac-refrigeration',
    name: 'Nadia Precision Cool AC & Refrigeration Services',
    legalName: 'Precision Cool Electrical & HVAC Enterprises',
    businessType: 'HOME_REPAIR',
    categoryId: 'services-repairs',
    categoryName: 'Repairs & Home Services',
    subcategoryIds: ['ac-repair', 'ac-installation', 'refrigerator-service', 'hvac-technician'],
    services: ['Split AC Installation', 'Inverter AC Repair & Gas Refill', 'Commercial Refrigerator Servicing', 'Doorstep Technician Visits', 'Annual Maintenance Contract (AMC)'],
    landmark: 'Near Netaji Subhash Statue More',
    description: 'Expert residential and commercial air conditioning and refrigeration repair service provider offering doorstep diagnostics, gas recharging, PCB circuit repair, and quick-response maintenance.',
    shortSummary: 'Certified AC installation, repair, and cooling system maintenance in Ranaghat.',
    status: 'PUBLISHED',
    claimStatus: 'UNCLAIMED_PUBLIC',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 90.0,
    primaryRegistrar: 'Ministry of Micro, Small and Medium Enterprises (MSME Udyam)',
    evidenceSummary: 'Active MSME Udyam registration #UDYAM-WB-14-0029841 verified under HVAC and electrical repair classification.',
    verificationBreakdown: {
      identityVerified: true,
      locationVerified: true,
      statutoryLicenseVerified: true,
      capabilitiesVerified: true,
      contactVerified: true,
      primaryRegistrarName: 'MSME Udyam',
      statutoryLicenseNumber: 'UDYAM-WB-14-0029841',
      verificationMethodologyUrl: '/verify/methodology'
    },
    lastVerifiedAt: '2026-08-29T09:00:00Z',
    isClaimed: false,
    isIndexable: true,
    location: {
      id: 'loc_008',
      businessId: 'biz_cfx_008_nadia_ac_repair',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'ranaghat',
      locality: 'Netaji Subhash Road',
      landmark: 'Near Netaji Subhash Statue More',
      postalCode: '741201',
      fullAddress: 'Netaji Subhash Road, Ranaghat, Nadia, West Bengal 741201',
      latitude: 23.1820,
      longitude: 88.5810,
      serviceAreas: ['ranaghat', 'santipur', 'kalyani', 'chakdaha'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_008',
      businessId: 'biz_cfx_008_nadia_ac_repair',
      phone: '+919830554433',
      whatsapp: '+919830554433',
      email: 'service@precisioncool.in',
      websiteUrl: 'https://precisioncool.in',
      bookingUrl: 'https://precisioncool.in/book-technician',
      googleMapsUrl: 'https://maps.google.com/?q=Ranaghat+NS+Road'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '08:30', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 2, opensAt: '08:30', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 3, opensAt: '08:30', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 4, opensAt: '08:30', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 5, opensAt: '08:30', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 6, opensAt: '08:30', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 0, opensAt: '09:00', closesAt: '18:00', isClosed: false }
    ],
    capabilities: [
      { id: 'cap_008_1', businessId: 'biz_cfx_008_nadia_ac_repair', actionType: 'CALL', isSupported: true, phoneTarget: '+919830554433', verificationStatus: 'VERIFIED' },
      { id: 'cap_008_2', businessId: 'biz_cfx_008_nadia_ac_repair', actionType: 'WHATSAPP', isSupported: true, phoneTarget: '+919830554433', verificationStatus: 'VERIFIED' },
      { id: 'cap_008_3', businessId: 'biz_cfx_008_nadia_ac_repair', actionType: 'BOOKING', isSupported: true, endpointUrl: 'https://precisioncool.in/book-technician', verificationStatus: 'VERIFIED' },
      { id: 'cap_008_4', businessId: 'biz_cfx_008_nadia_ac_repair', actionType: 'DIRECTIONS', isSupported: true, endpointUrl: 'https://maps.google.com/?q=23.1820,88.5810', verificationStatus: 'VERIFIED' }
    ],
    createdAt: '2026-08-25T11:00:00Z',
    updatedAt: '2026-08-29T09:00:00Z'
  },

  // ── 7. HOTELS & LODGING (RANAGHAT CORRIDOR) ────────────────────────
  {
    id: 'biz_cfx_009_ranaghat_hotel',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000009',
    slug: 'ranaghat-residency-hotel-lodge',
    name: 'Ranaghat Residency Hotel & Executive Lodge',
    legalName: 'Ranaghat Residency Hospitality LLP',
    businessType: 'HOSPITALITY',
    categoryId: 'tourism-hospitality',
    categoryName: 'Hotels & Tourism',
    subcategoryIds: ['ac-hotel', 'executive-lodge', 'business-stay', 'conference-room'],
    services: ['AC Executive Rooms', '24/7 Front Desk', 'Free High-Speed Wi-Fi', 'Conference Room', 'Station Pickup & Taxi Assistance', 'In-Room Dining'],
    landmark: 'Near Ranaghat Court More / NH-12 Junction',
    description: 'Premier executive business hotel and guest lodge in Ranaghat providing air-conditioned rooms, 24-hour reception, conference facilities, and convenient connectivity to Ranaghat railway station and NH-12.',
    shortSummary: 'Executive AC hotel and business lodge near Ranaghat Court More.',
    status: 'PUBLISHED',
    claimStatus: 'UNCLAIMED_PUBLIC',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 89.0,
    primaryRegistrar: 'West Bengal Tourism Directorate & Municipal Hospitality Dockets',
    evidenceSummary: 'Hospitality trade license corroborated with active municipal commercial docket.',
    verificationBreakdown: {
      identityVerified: true,
      locationVerified: true,
      statutoryLicenseVerified: true,
      capabilitiesVerified: true,
      contactVerified: true,
      primaryRegistrarName: 'WB Tourism Directorate',
      statutoryLicenseNumber: 'WB/HTL/RNG/2023-5502',
      verificationMethodologyUrl: '/verify/methodology'
    },
    lastVerifiedAt: '2026-08-29T08:30:00Z',
    isClaimed: false,
    isIndexable: true,
    location: {
      id: 'loc_009',
      businessId: 'biz_cfx_009_ranaghat_hotel',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'ranaghat',
      locality: 'Court Road More',
      landmark: 'Near Ranaghat Court More / NH-12 Junction',
      postalCode: '741201',
      fullAddress: 'Court Road More, Ranaghat, Nadia, West Bengal 741201',
      latitude: 23.1795,
      longitude: 88.5830,
      serviceAreas: ['ranaghat', 'nadia', 'travelers'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_009',
      businessId: 'biz_cfx_009_ranaghat_hotel',
      phone: '+919830443322',
      whatsapp: '+919830443322',
      email: 'stay@ranaghatresidency.com',
      websiteUrl: 'https://ranaghatresidency.com',
      bookingUrl: 'https://ranaghatresidency.com/book-room',
      googleMapsUrl: 'https://maps.google.com/?q=Ranaghat+Court+Road'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '00:00', closesAt: '23:59', isClosed: false },
      { dayOfWeek: 2, opensAt: '00:00', closesAt: '23:59', isClosed: false },
      { dayOfWeek: 3, opensAt: '00:00', closesAt: '23:59', isClosed: false },
      { dayOfWeek: 4, opensAt: '00:00', closesAt: '23:59', isClosed: false },
      { dayOfWeek: 5, opensAt: '00:00', closesAt: '23:59', isClosed: false },
      { dayOfWeek: 6, opensAt: '00:00', closesAt: '23:59', isClosed: false },
      { dayOfWeek: 0, opensAt: '00:00', closesAt: '23:59', isClosed: false }
    ],
    capabilities: [
      { id: 'cap_009_1', businessId: 'biz_cfx_009_ranaghat_hotel', actionType: 'CALL', isSupported: true, phoneTarget: '+919830443322', verificationStatus: 'VERIFIED' },
      { id: 'cap_009_2', businessId: 'biz_cfx_009_ranaghat_hotel', actionType: 'WHATSAPP', isSupported: true, phoneTarget: '+919830443322', verificationStatus: 'VERIFIED' },
      { id: 'cap_009_3', businessId: 'biz_cfx_009_ranaghat_hotel', actionType: 'BOOKING', isSupported: true, endpointUrl: 'https://ranaghatresidency.com/book-room', verificationStatus: 'VERIFIED' },
      { id: 'cap_009_4', businessId: 'biz_cfx_009_ranaghat_hotel', actionType: 'DIRECTIONS', isSupported: true, endpointUrl: 'https://maps.google.com/?q=23.1795,88.5830', verificationStatus: 'VERIFIED' }
    ],
    createdAt: '2026-08-25T12:00:00Z',
    updatedAt: '2026-08-29T08:30:00Z'
  },

  // ── 8. SALONS & PERSONAL CARE (RANAGHAT CORRIDOR) ───────────────────
  {
    id: 'biz_cfx_0010_elegance_salon',
    confluxBusinessId: 'CFX-IN-WB-NADIA-000010',
    slug: 'elegance-herbal-unisex-salon-spa',
    name: 'Elegance Herbal Unisex Salon & Spa',
    legalName: 'Elegance Beauty Care Enterprises',
    businessType: 'LOCAL_BUSINESS',
    categoryId: 'salons-beauty',
    categoryName: 'Salons & Personal Care',
    subcategoryIds: ['unisex-salon', 'hair-styling', 'bridal-makeup', 'facial-spa'],
    services: ['Hair Styling & Keratin', 'Facial & Herbal Skin Care', 'Bridal & Groom Makeover', 'Herbal Hair Spa', 'Pedicure & Manicure'],
    landmark: 'Near Mission Para Bus Stop',
    description: 'Professional unisex beauty salon and wellness spa specializing in herbal hair therapies, skin rejuvenation, modern haircuts, and bridal makeover packages.',
    shortSummary: 'Unisex beauty salon and personal care spa in Mission Para, Ranaghat.',
    status: 'PUBLISHED',
    claimStatus: 'UNCLAIMED_PUBLIC',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'STATUTORY_VERIFIED',
    confidenceScore: 87.5,
    primaryRegistrar: 'Ranaghat Municipal Commercial Docket',
    evidenceSummary: 'Commercial salon establishment trade certificate #RNG/BEAU/2023/1102 active under Ranaghat Municipality.',
    verificationBreakdown: {
      identityVerified: true,
      locationVerified: true,
      statutoryLicenseVerified: true,
      capabilitiesVerified: true,
      contactVerified: true,
      primaryRegistrarName: 'Ranaghat Municipality',
      statutoryLicenseNumber: 'RNG/BEAU/2023/1102',
      verificationMethodologyUrl: '/verify/methodology'
    },
    lastVerifiedAt: '2026-08-29T08:00:00Z',
    isClaimed: false,
    isIndexable: true,
    location: {
      id: 'loc_010',
      businessId: 'biz_cfx_0010_elegance_salon',
      country: 'India',
      state: 'West Bengal',
      district: 'nadia',
      city: 'ranaghat',
      locality: 'Mission Para More',
      landmark: 'Near Mission Para Bus Stop',
      postalCode: '741201',
      fullAddress: 'Mission Para More, Ranaghat, Nadia, West Bengal 741201',
      latitude: 23.1770,
      longitude: 88.5815,
      serviceAreas: ['ranaghat', 'santipur'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_010',
      businessId: 'biz_cfx_0010_elegance_salon',
      phone: '+919830332211',
      whatsapp: '+919830332211',
      email: 'glow@elegancesalon.in',
      websiteUrl: 'https://elegancesalon.in',
      bookingUrl: 'https://elegancesalon.in/book-appointment',
      googleMapsUrl: 'https://maps.google.com/?q=Mission+Para+Ranaghat'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '10:00', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 2, opensAt: '10:00', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 3, opensAt: '10:00', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 4, opensAt: '10:00', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 5, opensAt: '10:00', closesAt: '20:30', isClosed: false },
      { dayOfWeek: 6, opensAt: '10:00', closesAt: '21:00', isClosed: false },
      { dayOfWeek: 0, opensAt: '10:00', closesAt: '21:00', isClosed: false }
    ],
    capabilities: [
      { id: 'cap_010_1', businessId: 'biz_cfx_0010_elegance_salon', actionType: 'CALL', isSupported: true, phoneTarget: '+919830332211', verificationStatus: 'VERIFIED' },
      { id: 'cap_010_2', businessId: 'biz_cfx_0010_elegance_salon', actionType: 'WHATSAPP', isSupported: true, phoneTarget: '+919830332211', verificationStatus: 'VERIFIED' },
      { id: 'cap_010_3', businessId: 'biz_cfx_0010_elegance_salon', actionType: 'APPOINTMENT', isSupported: true, endpointUrl: 'https://elegancesalon.in/book-appointment', verificationStatus: 'VERIFIED' },
      { id: 'cap_010_4', businessId: 'biz_cfx_0010_elegance_salon', actionType: 'DIRECTIONS', isSupported: true, endpointUrl: 'https://maps.google.com/?q=23.1770,88.5815', verificationStatus: 'VERIFIED' }
    ],
    createdAt: '2026-08-25T13:00:00Z',
    updatedAt: '2026-08-29T08:00:00Z'
  },

  // ── 9. MANUFACTURING & INDUSTRIAL (HOWRAH / NADIA CORRIDOR) ─────────
  {
    id: 'biz_cfx_003_abc_precision',
    confluxBusinessId: 'CFX-IN-WB-HOWRAH-000003',
    slug: 'abc-precision-components',
    name: 'ABC Precision Components Pvt Ltd',
    legalName: 'ABC Precision Engineering Private Limited',
    businessType: 'MANUFACTURER',
    categoryId: 'manufacturing-industrial',
    categoryName: 'Precision Machining & Industrial Engineering',
    subcategoryIds: ['cnc-machining', 'aerospace-tooling', 'heavy-fabrication'],
    services: ['CNC Milling & Turning', 'Aerospace Tooling', 'Precision Metallurgical Casting', 'Industrial Job Work'],
    landmark: 'Baltikuri Industrial Complex',
    description: 'High-tolerance CNC machining, industrial tool fabrication, and precision metallurgical casting for automotive and heavy engineering applications.',
    shortSummary: 'ISO 9001:2015 certified precision CNC machining in Howrah.',
    status: 'PUBLISHED',
    claimStatus: 'VERIFIED_OWNER',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'ENTERPRISE_AUTHENTICATED',
    confidenceScore: 92.0,
    primaryRegistrar: 'IAF CertSearch / Quality Management Accreditation Body',
    evidenceSummary: 'IAF CertSearch accreditation QMS-IND-2023-09841 verified active through September 2026.',
    verificationBreakdown: {
      identityVerified: true,
      locationVerified: true,
      statutoryLicenseVerified: true,
      capabilitiesVerified: true,
      contactVerified: true,
      primaryRegistrarName: 'IAF CertSearch',
      statutoryLicenseNumber: 'QMS-IND-2023-09841',
      verificationMethodologyUrl: '/verify/methodology'
    },
    lastVerifiedAt: '2026-08-29T11:30:00Z',
    isClaimed: true,
    isIndexable: true,
    location: {
      id: 'loc_003',
      businessId: 'biz_cfx_003_abc_precision',
      country: 'India',
      state: 'West Bengal',
      district: 'howrah',
      city: 'howrah',
      locality: 'Baltikuri Industrial Complex',
      landmark: 'Baltikuri Industrial Complex',
      postalCode: '711113',
      fullAddress: 'Baltikuri Industrial Estate, Howrah, West Bengal 711113',
      latitude: 22.6012,
      longitude: 88.3105,
      serviceAreas: ['eastern-india', 'pan-india'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_003',
      businessId: 'biz_cfx_003_abc_precision',
      phone: '+913326778899',
      whatsapp: '+919830556677',
      email: 'sales@abcprecision.in',
      websiteUrl: 'https://abcprecision.in',
      bookingUrl: 'https://abcprecision.in/rfq',
      googleMapsUrl: 'https://maps.google.com/?q=Baltikuri+Howrah'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '08:30', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 2, opensAt: '08:30', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 3, opensAt: '08:30', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 4, opensAt: '08:30', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 5, opensAt: '08:30', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 6, opensAt: '08:30', closesAt: '14:00', isClosed: false },
      { dayOfWeek: 0, isClosed: true }
    ],
    capabilities: [
      { id: 'cap_003_1', businessId: 'biz_cfx_003_abc_precision', actionType: 'CALL', isSupported: true, phoneTarget: '+913326778899', verificationStatus: 'VERIFIED' },
      { id: 'cap_003_2', businessId: 'biz_cfx_003_abc_precision', actionType: 'QUOTE_REQUEST', isSupported: true, endpointUrl: 'https://abcprecision.in/rfq', verificationStatus: 'VERIFIED' },
      { id: 'cap_003_3', businessId: 'biz_cfx_003_abc_precision', actionType: 'DIRECTIONS', isSupported: true, endpointUrl: 'https://maps.google.com/?q=22.6012,88.3105', verificationStatus: 'VERIFIED' }
    ],
    createdAt: '2026-08-25T09:00:00Z',
    updatedAt: '2026-08-29T11:30:00Z'
  },

  // ── 10. IT, AI & DIGITAL SOFTWARE (KOLKATA / WEST BENGAL) ───────────
  {
    id: 'biz_cfx_004_conflux_ai',
    confluxBusinessId: 'CFX-IN-WB-KOLKATA-000004',
    slug: 'conflux-ai',
    name: 'Conflux AI',
    legalName: 'Conflux Digital Infrastructure Technologies',
    businessType: 'PROFESSIONAL_SERVICE',
    categoryId: 'it-software',
    categoryName: 'AI Engineering, Trust & Web Infrastructure',
    subcategoryIds: ['ai-automation', 'verification-engine', 'semantic-seo'],
    services: ['AI Business Automation', 'Deterministic Verification Systems', 'Sub-second React Cloud Platforms', 'WhatsApp Business API Workflows'],
    landmark: 'Salt Lake Sector V Tech Hub',
    description: 'Trust, Discovery & Connectivity Infrastructure for Local Businesses and AI Agents. Architected by Tarunjit Biswas & Shouvik Majumdar.',
    shortSummary: 'Trust & Discovery Infrastructure for Businesses and AI Agents.',
    status: 'PUBLISHED',
    claimStatus: 'VERIFIED_OWNER',
    verificationStatus: 'SUPPORTED',
    verificationLevel: 'ENTERPRISE_AUTHENTICATED',
    confidenceScore: 90.0,
    primaryRegistrar: 'First-Party Engineering Docket & Statutory ROC Filings',
    evidenceSummary: 'Corroborated by executive leadership disclosures, verified public repositories, and sub-second React cloud infrastructure.',
    verificationBreakdown: {
      identityVerified: true,
      locationVerified: true,
      statutoryLicenseVerified: true,
      capabilitiesVerified: true,
      contactVerified: true,
      primaryRegistrarName: 'ROC West Bengal',
      verificationMethodologyUrl: '/verify/methodology'
    },
    lastVerifiedAt: '2026-08-29T12:00:00Z',
    isClaimed: true,
    isIndexable: true,
    location: {
      id: 'loc_004',
      businessId: 'biz_cfx_004_conflux_ai',
      country: 'India',
      state: 'West Bengal',
      district: 'kolkata',
      city: 'kolkata',
      locality: 'Salt Lake Sector V',
      landmark: 'Salt Lake Sector V Tech Hub',
      postalCode: '700091',
      fullAddress: 'Salt Lake Sector V, Kolkata, West Bengal 700091',
      latitude: 22.5726,
      longitude: 88.3639,
      serviceAreas: ['west-bengal', 'india', 'global'],
      isPrimary: true
    },
    contact: {
      id: 'cnt_004',
      businessId: 'biz_cfx_004_conflux_ai',
      phone: '+919830000000',
      whatsapp: '+919830000000',
      email: 'contact@confluxai.in',
      websiteUrl: 'https://confluxai.in',
      appointmentUrl: 'https://confluxai.in/contact',
      googleMapsUrl: 'https://maps.google.com/?q=Salt+Lake+Sector+V+Kolkata'
    },
    operatingHours: [
      { dayOfWeek: 1, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 2, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 3, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 4, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 5, opensAt: '09:00', closesAt: '20:00', isClosed: false },
      { dayOfWeek: 6, opensAt: '10:00', closesAt: '18:00', isClosed: false },
      { dayOfWeek: 0, isClosed: true }
    ],
    capabilities: [
      { id: 'cap_004_1', businessId: 'biz_cfx_004_conflux_ai', actionType: 'WHATSAPP', isSupported: true, phoneTarget: '+919830000000', verificationStatus: 'VERIFIED' },
      { id: 'cap_004_2', businessId: 'biz_cfx_004_conflux_ai', actionType: 'APPOINTMENT', isSupported: true, endpointUrl: 'https://confluxai.in/contact', verificationStatus: 'VERIFIED' },
      { id: 'cap_004_3', businessId: 'biz_cfx_004_conflux_ai', actionType: 'WEBSITE', isSupported: true, endpointUrl: 'https://confluxai.in', verificationStatus: 'VERIFIED' }
    ],
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-29T12:00:00Z'
  }
];

export class BusinessService {
  private memoryCache: ConfluxBusiness[] | null = null;

  private getLocalStore(): ConfluxBusiness[] {
    if (typeof localStorage === 'undefined') {
      if (!this.memoryCache) {
        this.memoryCache = JSON.parse(JSON.stringify(INITIAL_SEED_BUSINESSES));
      }
      return this.memoryCache || INITIAL_SEED_BUSINESSES;
    }

    const raw = localStorage.getItem(LOCAL_STORAGE_BUSINESSES_KEY);
    if (!raw) {
      this.setLocalStore(INITIAL_SEED_BUSINESSES);
      return INITIAL_SEED_BUSINESSES;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback on parse error
    }
    this.setLocalStore(INITIAL_SEED_BUSINESSES);
    return INITIAL_SEED_BUSINESSES;
  }

  private setLocalStore(data: ConfluxBusiness[]) {
    this.memoryCache = data;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_BUSINESSES_KEY, JSON.stringify(data));
    }
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
}

export const businessService = new BusinessService();
