import { LocationItem } from '../types/location';
export type { LocationItem };

export const WEST_BENGAL_STATE: LocationItem = {
  id: 'wb-state',
  slug: 'west-bengal',
  name: 'West Bengal',
  displayName: 'West Bengal',
  type: 'state',
  stateSlug: 'west-bengal',
  status: 'PUBLISHED',
  priority: 1,
  tier: 1,
  hqName: 'Kolkata',
  division: 'Presidency Division',
  majorIndustries: [
    'Information Technology & Software',
    'Manufacturing & Industrial Engineering',
    'E-Commerce & Retail Trade',
    'Education & Healthcare Systems',
    'Textile & Handloom Logistics',
    'Real Estate & Construction'
  ],
  metaTitle: 'Local Business Visibility & Verification in West Bengal | Conflux AI',
  metaDescription: 'Conflux AI is a Local Visibility + Trust Platform that helps local businesses become discoverable, trusted, and contactable across Google and AI search.',
  h1Title: 'Local Business Visibility & Verification for West Bengal',
  summary: 'Conflux AI delivers structured local business verification, Schema.org LocalBusiness entity graphs, and lead conversion systems for commercial enterprises across all 23 districts of West Bengal.',
  localBusinessContext: 'West Bengal is a major commercial engine in Eastern India. From Kolkata to Siliguri and industrial zones like Durgapur and Haldia, businesses require modern visibility and verification to build trust and acquire high-intent clients.',
  automationOpportunities: [
    'Instant WhatsApp Speed-to-Lead Response Pipelines',
    'Automated Multi-Channel Lead Scoring & CRM Sync',
    'RAG-Powered Custom Knowledge Base Chatbots',
    'Multi-Department Workflow & API Integration'
  ],
  useCases: [
    {
      title: '24/7 Prospect Qualification',
      description: 'Capture and qualify website and WhatsApp inquiries instantly without manual staff latency.',
      impact: 'Zero lead loss during off-hours with 100% automated CRM ingestion.'
    },
    {
      title: 'Cross-Department API Synchronization',
      description: 'Connect inventory, invoicing, CRM, and customer support systems into unified workflows.',
      impact: 'Reduces operational overhead by automating repetitive data entry.'
    }
  ],
  faqs: [
    {
      question: 'Does Conflux AI operate a physical office in every district of West Bengal?',
      answer: 'No. Conflux AI is a Local Visibility + Trust Platform based in Kolkata, West Bengal. We collaborate with business clients across all districts of West Bengal through high-touch digital communication, verification workflows, and automated lead solutions.'
    },
    {
      question: 'How do West Bengal businesses partner with Conflux AI remotely?',
      answer: 'We begin with a virtual workflow audit and technical blueprinting session over Google Meet or Zoom, design and test automation pipelines in sandbox environments, and deploy production workflows directly to your cloud stack.'
    }
  ]
};

export const WEST_BENGAL_DISTRICTS: LocationItem[] = [
  {
    id: 'dist-nadia',
    slug: 'nadia',
    name: 'Nadia',
    displayName: 'Nadia District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 1,
    hqName: 'Krishnanagar',
    division: 'Presidency Division',
    subdivisions: ['Krishnanagar Sadar', 'Kalyani', 'Ranaghat', 'Tehatta'],
    majorIndustries: ['Handloom & Textiles', 'Education & Biotech', 'Agro-Processing & Dairy', 'Retail & Commercial Trade'],
    keyCommercialHubs: ['Krishnanagar', 'Kalyani', 'Ranaghat', 'Nabadwip', 'Santipur', 'Chakdaha'],
    metaTitle: 'Local Business Visibility & Verification in Nadia District | Conflux AI',
    metaDescription: 'Conflux AI is a Local Visibility + Trust Platform helping businesses across Nadia district become discoverable, trusted, and contactable across Google and AI search.',
    h1Title: 'Local Business Visibility & Verification for Nadia',
    summary: 'Serving enterprises in Krishnanagar, Kalyani, Ranaghat, Nabadwip, Santipur, and Chakdaha with structured entity verification and lead conversion.',
    localBusinessContext: 'Nadia district is a prominent economic corridor in West Bengal, bridging academic research in Kalyani, textile heritage in Santipur/Nabadwip, and trade hubs in Krishnanagar and Ranaghat.',
    automationOpportunities: [
      'Automated Lead Capture for Textile & Wholesale Trade',
      'WhatsApp Integration for Education & Training Institutes in Kalyani',
      '24/7 Inquiry Bots for Healthcare & Diagnostic Facilities'
    ]
  },
  {
    id: 'dist-kolkata',
    slug: 'kolkata',
    name: 'Kolkata',
    displayName: 'Kolkata District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 1,
    hqName: 'Kolkata',
    division: 'Presidency Division',
    majorIndustries: ['IT & Enterprise Software', 'Financial Services', 'Real Estate', 'Healthcare', 'Corporate Consultancies'],
    keyCommercialHubs: ['Salt Lake Sector V', 'New Town Rajarhat', 'Park Street', 'Dalhousie', 'Bhowanipore'],
    metaTitle: 'Local Business Visibility & Verification in Kolkata | Conflux AI',
    metaDescription: 'Conflux AI is a Local Visibility + Trust Platform based in Kolkata, West Bengal. We help local businesses become discoverable, trusted, and contactable across Google and AI search.',
    h1Title: 'Local Business Visibility & Verification in Kolkata',
    summary: 'Building structured entity graphs, statutory verification dockets, and lead conversion platforms for Kolkata corporate services, clinics, and retail establishments.',
    localBusinessContext: 'Kolkata is the primary commercial financial center of Eastern India. Businesses in Sector V, New Town, and South Kolkata leverage our platform to establish verified trust and acquire high-intent clients.'
  },
  {
    id: 'dist-north-24-parganas',
    slug: 'north-24-parganas',
    name: 'North 24 Parganas',
    displayName: 'North 24 Parganas District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 1,
    hqName: 'Barasat',
    division: 'Presidency Division',
    subdivisions: ['Barasat Sadar', 'Barrackpore', 'Bidhannagar', 'Bangar', 'Basirhat'],
    majorIndustries: ['IT & Tech Parks', 'Manufacturing', 'Retail Trade', 'Logistics & Export'],
    keyCommercialHubs: ['Bidhannagar / Salt Lake', 'Rajarhat', 'Barrackpore', 'Barasat'],
    metaTitle: 'AI Automation Services in North 24 Parganas | Conflux AI',
    metaDescription: 'Conflux AI delivers custom AI workflow pipelines and WhatsApp Business automation for enterprises in North 24 Parganas district.',
    h1Title: 'AI Automation & Digital Workflows for North 24 Parganas',
    summary: 'Automating customer support, lead response, and operational workflows for tech, manufacturing, and retail businesses in North 24 Parganas.'
  },
  {
    id: 'dist-south-24-parganas',
    slug: 'south-24-parganas',
    name: 'South 24 Parganas',
    displayName: 'South 24 Parganas District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 1,
    hqName: 'Alipore',
    division: 'Presidency Division',
    majorIndustries: ['Port & Logistics', 'Real Estate Development', 'Healthcare', 'Aquaculture & Export'],
    metaTitle: 'AI Automation Services in South 24 Parganas | Conflux AI',
    metaDescription: 'Custom AI agent development, workflow integrations, and web platforms for South 24 Parganas businesses.',
    h1Title: 'AI Automation & Web Engineering for South 24 Parganas'
  },
  {
    id: 'dist-howrah',
    slug: 'howrah',
    name: 'Howrah',
    displayName: 'Howrah District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 1,
    hqName: 'Howrah',
    division: 'Presidency Division',
    majorIndustries: ['Heavy Industry', 'Foundry & Hardware', 'Logistics Junctions', 'Commercial Trade'],
    metaTitle: 'AI Automation Services in Howrah District | Conflux AI',
    metaDescription: 'Streamline industrial manufacturing, logistics, and trade operations in Howrah with remote AI automation pipelines from Conflux AI.',
    h1Title: 'AI Automation & Industrial Workflows for Howrah'
  },
  {
    id: 'dist-hooghly',
    slug: 'hooghly',
    name: 'Hooghly',
    displayName: 'Hooghly District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 1,
    hqName: 'Chinsurah',
    division: 'Burdwan Division',
    majorIndustries: ['Automotive & Manufacturing', 'Jute & Agriculture', 'Commercial Trade', 'Healthcare'],
    metaTitle: 'Local Business Visibility & Verification in Hooghly District | Conflux AI',
    metaDescription: 'Conflux AI provides automated lead response, CRM syncing, and modern web applications for businesses across Hooghly district.',
    h1Title: 'AI Automation & Digital Transformation for Hooghly'
  },
  {
    id: 'dist-paschim-bardhaman',
    slug: 'paschim-bardhaman',
    name: 'Paschim Bardhaman',
    displayName: 'Paschim Bardhaman District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 1,
    hqName: 'Asansol',
    division: 'Burdwan Division',
    majorIndustries: ['Steel & Metal Manufacturing', 'Coal & Energy', 'Engineering Services', 'Education'],
    keyCommercialHubs: ['Asansol', 'Durgapur', 'Raniganj'],
    metaTitle: 'AI Automation Services in Paschim Bardhaman | Conflux AI',
    metaDescription: 'Industrial automation, WhatsApp CRM bots, and web engineering for businesses in Asansol and Durgapur.',
    h1Title: 'AI Automation & Manufacturing Workflows in Paschim Bardhaman'
  },
  {
    id: 'dist-purba-bardhaman',
    slug: 'purba-bardhaman',
    name: 'Purba Bardhaman',
    displayName: 'Purba Bardhaman District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 3,
    tier: 1,
    hqName: 'Bardhaman',
    division: 'Burdwan Division',
    majorIndustries: ['Agro-Processing & Rice Mills', 'Cold Storage', 'Retail Trade'],
    metaTitle: 'AI Automation Services in Purba Bardhaman | Conflux AI',
    metaDescription: 'Automate agro-trading, customer inquiry routing, and business workflows in Purba Bardhaman.',
    h1Title: 'AI Automation & Agro-Industrial Growth in Purba Bardhaman'
  },
  {
    id: 'dist-purba-medinipur',
    slug: 'purba-medinipur',
    name: 'Purba Medinipur',
    displayName: 'Purba Medinipur District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 1,
    hqName: 'Tamluk',
    division: 'Medinipur Division',
    majorIndustries: ['Petrochemicals & Haldia Port Industrial Belt', 'Tourism (Digha)', 'Aquaculture'],
    keyCommercialHubs: ['Haldia', 'Tamluk', 'Contai', 'Digha'],
    metaTitle: 'Local Business Visibility & Verification in Purba Medinipur | Conflux AI',
    metaDescription: 'Remote AI automation pipelines and WhatsApp CRM bots for industrial and tourism enterprises in Haldia & Purba Medinipur.',
    h1Title: 'AI Automation & Port Industrial Solutions in Purba Medinipur'
  },
  {
    id: 'dist-paschim-medinipur',
    slug: 'paschim-medinipur',
    name: 'Paschim Medinipur',
    displayName: 'Paschim Medinipur District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 3,
    tier: 1,
    hqName: 'Midnapore',
    division: 'Medinipur Division',
    majorIndustries: ['Education (IIT Kharagpur Cluster)', 'Rail & Logistics Junctions', 'Agriculture'],
    keyCommercialHubs: ['Kharagpur', 'Midnapore'],
    metaTitle: 'AI Automation Services in Paschim Medinipur | Conflux AI',
    metaDescription: 'AI agents, workflow automation, and custom chatbots for businesses in Kharagpur and Midnapore.',
    h1Title: 'AI Automation & Digital Infrastructure for Paschim Medinipur'
  },
  {
    id: 'dist-birbhum',
    slug: 'birbhum',
    name: 'Birbhum',
    displayName: 'Birbhum District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 3,
    tier: 1,
    hqName: 'Suri',
    division: 'Burdwan Division',
    majorIndustries: ['Handicrafts & Tourism (Bolpur-Santiniketan)', 'Mining & Stone Crushing', 'Agriculture'],
    metaTitle: 'Local Business Visibility & Verification in Birbhum District | Conflux AI',
    metaDescription: 'Automate booking, inquiry management, and lead conversion for tourism and commercial businesses in Birbhum.',
    h1Title: 'AI Automation & Digital Growth for Birbhum'
  },
  {
    id: 'dist-bankura',
    slug: 'bankura',
    name: 'Bankura',
    displayName: 'Bankura District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 3,
    tier: 1,
    hqName: 'Bankura',
    division: 'Medinipur Division',
    majorIndustries: ['Handloom & Terracotta Tourism', 'Agriculture', 'Small Scale Manufacturing'],
    metaTitle: 'AI Automation Services in Bankura District | Conflux AI',
    metaDescription: 'Remote AI automation workflows and web engineering for commercial businesses in Bankura.',
    h1Title: 'AI Automation & Digital Solutions for Bankura'
  },
  {
    id: 'dist-purulia',
    slug: 'purulia',
    name: 'Purulia',
    displayName: 'Purulia District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 3,
    tier: 1,
    hqName: 'Purulia',
    division: 'Medinipur Division',
    majorIndustries: ['Thermal Power & Industrial Minerals', 'Eco-Tourism', 'Agriculture'],
    metaTitle: 'AI Automation Services in Purulia District | Conflux AI',
    metaDescription: 'Automate business workflows and client lead management in Purulia with Conflux AI remote systems.',
    h1Title: 'AI Automation & Technical Solutions for Purulia'
  },
  {
    id: 'dist-jhargram',
    slug: 'jhargram',
    name: 'Jhargram',
    displayName: 'Jhargram District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 4,
    tier: 1,
    hqName: 'Jhargram',
    division: 'Medinipur Division',
    majorIndustries: ['Forestry Products & Agro-Forestry', 'Heritage Tourism'],
    metaTitle: 'Local Business Visibility & Verification in Jhargram | Conflux AI',
    metaDescription: 'Digital solutions, AI chatbots, and lead automation for businesses in Jhargram district.',
    h1Title: 'AI Automation & Growth Solutions for Jhargram'
  },
  {
    id: 'dist-malda',
    slug: 'malda',
    name: 'Malda',
    displayName: 'Malda District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 3,
    tier: 1,
    hqName: 'English Bazar / Malda',
    division: 'Malda Division',
    majorIndustries: ['Silk & Textile Trade', 'Mango & Food Processing', 'Cross-Border Wholesale Trade'],
    metaTitle: 'AI Automation Services in Malda District | Conflux AI',
    metaDescription: 'Automate wholesale lead capture, WhatsApp communication, and business workflows in Malda.',
    h1Title: 'AI Automation & Trade Workflow Solutions for Malda'
  },
  {
    id: 'dist-murshidabad',
    slug: 'murshidabad',
    name: 'Murshidabad',
    displayName: 'Murshidabad District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 1,
    hqName: 'Baharampur',
    division: 'Malda Division',
    majorIndustries: ['Silk Weaving & Handloom', 'Heritage Tourism', 'Bidi & Agricultural Processing', 'Retail Trade'],
    keyCommercialHubs: ['Baharampur', 'Jangipur', 'Kandi', 'Lalgola'],
    metaTitle: 'Local Business Visibility & Verification in Murshidabad | Conflux AI',
    metaDescription: 'Custom AI chatbots, WhatsApp business automation, and high-performance web development for Murshidabad enterprises.',
    h1Title: 'AI Automation & Business Systems in Murshidabad'
  },
  {
    id: 'dist-uttar-dinajpur',
    slug: 'uttar-dinajpur',
    name: 'Uttar Dinajpur',
    displayName: 'Uttar Dinajpur District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 4,
    tier: 1,
    hqName: 'Raiganj',
    division: 'Malda Division',
    majorIndustries: ['Agro-Trading & Poultry', 'Retail Commerce'],
    metaTitle: 'AI Automation Services in Uttar Dinajpur | Conflux AI',
    metaDescription: 'Remote AI automation and custom web application engineering for Raiganj and Uttar Dinajpur.',
    h1Title: 'AI Automation & Digital Workflows for Uttar Dinajpur'
  },
  {
    id: 'dist-dakshin-dinajpur',
    slug: 'dakshin-dinajpur',
    name: 'Dakshin Dinajpur',
    displayName: 'Dakshin Dinajpur District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 4,
    tier: 1,
    hqName: 'Balurghat',
    division: 'Malda Division',
    majorIndustries: ['Agro-Processing & Rice Milling', 'Border Trade'],
    metaTitle: 'Local Business Visibility & Verification in Dakshin Dinajpur | Conflux AI',
    metaDescription: 'Remote AI engineering, chatbot integration, and web development for businesses in Balurghat.',
    h1Title: 'AI Automation & Business Development in Dakshin Dinajpur'
  },
  {
    id: 'dist-jalpaiguri',
    slug: 'jalpaiguri',
    name: 'Jalpaiguri',
    displayName: 'Jalpaiguri District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 3,
    tier: 1,
    hqName: 'Jalpaiguri',
    division: 'Jalpaiguri Division',
    majorIndustries: ['Tea Processing & Packaging', 'Timber & Agro-Forestry', 'Tourism Logistics'],
    metaTitle: 'AI Automation Services in Jalpaiguri District | Conflux AI',
    metaDescription: 'Automate tea processing logistics, lead response, and business workflows in Jalpaiguri.',
    h1Title: 'AI Automation & Industrial Solutions for Jalpaiguri'
  },
  {
    id: 'dist-darjeeling',
    slug: 'darjeeling',
    name: 'Darjeeling',
    displayName: 'Darjeeling District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 1,
    hqName: 'Darjeeling',
    division: 'Jalpaiguri Division',
    majorIndustries: ['Tea Industry & Export', 'Hospitality & Eco-Tourism', 'Siliguri Transit Hub Hub'],
    keyCommercialHubs: ['Siliguri (Part)', 'Darjeeling Town', 'Kurseong'],
    metaTitle: 'Local Business Visibility & Verification in Darjeeling District | Conflux AI',
    metaDescription: 'Custom AI lead engines, WhatsApp booking bots, and web platforms for tourism and tea export enterprises in Darjeeling & Siliguri.',
    h1Title: 'AI Automation & Hospitality Solutions for Darjeeling'
  },
  {
    id: 'dist-kalimpong',
    slug: 'kalimpong',
    name: 'Kalimpong',
    displayName: 'Kalimpong District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 4,
    tier: 1,
    hqName: 'Kalimpong',
    division: 'Jalpaiguri Division',
    majorIndustries: ['Floriculture & Horticulture Export', 'Eco-Tourism & Hospitality'],
    metaTitle: 'AI Automation Services in Kalimpong | Conflux AI',
    metaDescription: 'Remote AI automation and custom web platforms for hospitality and floriculture exporters in Kalimpong.',
    h1Title: 'AI Automation & Tourism Systems in Kalimpong'
  },
  {
    id: 'dist-cooch-behar',
    slug: 'cooch-behar',
    name: 'Cooch Behar',
    displayName: 'Cooch Behar District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 3,
    tier: 1,
    hqName: 'Cooch Behar',
    division: 'Jalpaiguri Division',
    majorIndustries: ['Tobacco & Agricultural Processing', 'Heritage Tourism'],
    metaTitle: 'AI Automation Services in Cooch Behar District | Conflux AI',
    metaDescription: 'Automate business leads, customer inquiries, and web portals for Cooch Behar enterprises.',
    h1Title: 'AI Automation & Technical Solutions for Cooch Behar'
  },
  {
    id: 'dist-alipurduar',
    slug: 'alipurduar',
    name: 'Alipurduar',
    displayName: 'Alipurduar District',
    type: 'district',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 4,
    tier: 1,
    hqName: 'Alipurduar',
    division: 'Jalpaiguri Division',
    majorIndustries: ['Dooars Tea Gardens', 'Wildlife & Eco-Tourism'],
    metaTitle: 'Local Business Visibility & Verification in Alipurduar | Conflux AI',
    metaDescription: 'Remote AI automation workflows and WhatsApp booking systems for Alipurduar & Dooars tourism.',
    h1Title: 'AI Automation & Eco-Tourism Solutions for Alipurduar'
  }
];

export const NADIA_LOCATIONS: LocationItem[] = [
  {
    id: 'loc-krishnanagar',
    slug: 'krishnanagar',
    name: 'Krishnanagar',
    displayName: 'Krishnanagar',
    type: 'city',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 2,
    hqName: 'Nadia District Headquarters',
    majorIndustries: ['District Administrative Services', 'Commercial Wholesale & Retail', 'Handicrafts & Clay Art', 'Agro-Commodity Trading'],
    businessTypes: ['Local Service Providers', 'Retail Chains', 'Professional Consultancies', 'Educational Institutions'],
    keyCommercialHubs: ['High Street Commercial Zone', 'Rajbari Heritage Market', 'Court Road Business Corridor'],
    nearbyLocationSlugs: ['ranaghat', 'nabadwip', 'santipur', 'chakdaha', 'kalyani'],
    metaTitle: 'AI Automation Services in Krishnanagar | Conflux AI',
    metaDescription: 'Conflux AI delivers remote AI automation, WhatsApp lead bots, and web development for businesses in Krishnanagar, Nadia.',
    h1Title: 'AI Automation & Digital Solutions for Krishnanagar Businesses',
    summary: 'Conflux AI brings autonomous AI workflow automation, 24/7 lead qualification, official WhatsApp API bots, and high-performance website engineering to businesses in Krishnanagar.',
    localBusinessContext: 'As the administrative capital and commercial trade hub of Nadia district, Krishnanagar hosts growing professional services, retail businesses, agricultural commodity traders, and educational centers. Manual inquiry handling and delayed customer follow-ups often lead to lost commercial revenue.',
    automationOpportunities: [
      'WhatsApp Speed-to-Lead Response Bot for Local Retail & Services',
      'Automated Appointment Scheduling for Professional Clinics & Firms',
      '24/7 RAG Knowledge Base Chatbots for Schools & Institutes',
      'Make.com CRM Lead Routing into Google Sheets or HubSpot'
    ],
    useCases: [
      {
        title: 'Instant WhatsApp Speed-to-Lead Ingestion',
        description: 'When a potential buyer or client inquires via Facebook, Google Search, or WhatsApp in Krishnanagar, our automated bot responds in 5 seconds, collects requirements, and notifies your sales rep.',
        impact: 'Elevates conversion rate by eliminating human response delay.'
      },
      {
        title: 'Automated Billing & Invoice Receipts',
        description: 'Sync order data directly from payment gateways or local POS platforms into automated WhatsApp receipt generation.',
        impact: 'Saves 15+ hours weekly in manual clerical accounting.'
      }
    ],
    faqs: [
      {
        question: 'Does Conflux AI have a physical walk-in office in Krishnanagar?',
        answer: 'No. Conflux AI is a Local Visibility + Trust Platform based in Kolkata. We partner with Krishnanagar business owners via digital strategy meetings, verification workflows, and lead conversion setups.'
      },
      {
        question: 'What AI automation services are most effective for Krishnanagar companies?',
        answer: 'WhatsApp Business API automation for instant lead qualification, custom AI chatbots trained on your services, and sub-second React website platforms built for mobile conversion.'
      }
    ]
  },
  {
    id: 'loc-kalyani',
    slug: 'kalyani',
    name: 'Kalyani',
    displayName: 'Kalyani',
    type: 'city',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 2,
    hqName: 'Kalyani Industrial & Academic Hub',
    majorIndustries: ['Higher Education & Research', 'Healthcare & Super-Specialty Hospitals', 'Industrial Manufacturing & Biotech', 'Software & IT Services'],
    businessTypes: ['Colleges & Universities', 'Hospitals & Diagnostic Centers', 'Manufacturing Facilities', 'Tech Startups'],
    keyCommercialHubs: ['Kalyani Industrial Area Block D', 'Kalyani Central Park Commercial Belt', 'AIIMS Kalyani Corridor'],
    nearbyLocationSlugs: ['chakdaha', 'ranaghat', 'haringhata', 'krishnanagar'],
    metaTitle: 'Local Business Visibility & Verification in Kalyani | Conflux AI',
    metaDescription: 'Custom AI agents, WhatsApp support bots, and web platform development for education, healthcare, and industrial enterprises in Kalyani.',
    h1Title: 'AI Automation & Software Engineering in Kalyani',
    summary: 'Empowering Kalyani educational institutes, hospitals, biotech firms, and industrial setups with AI-driven lead automation and intelligent digital infrastructure.',
    localBusinessContext: 'Kalyani is a planned industrial, academic, and medical powerhouse in West Bengal, home to premier universities, AIIMS Kalyani, and manufacturing parks. These sectors generate high volumes of prospective student and patient inquiries requiring structured automation.',
    automationOpportunities: [
      'Student Admission Helpline Automation on WhatsApp',
      'Patient Appointment Booking & OPD Inquiry Chatbots',
      'Supplier & Logistics Status Tracking Bots for Industrial Units',
      'Custom React Web Platforms with 100/100 Speed Scores'
    ],
    useCases: [
      {
        title: 'Patient & Student Inquiry Triage',
        description: 'Deploy a RAG chatbot trained on institutional prospectuses, fee structures, or hospital department timings.',
        impact: 'Handles 80%+ of repetitive inquiries 24/7 without extra staff overhead.'
      }
    ],
    faqs: [
      {
        question: 'Can Conflux AI integrate WhatsApp automation with college or hospital CRMs in Kalyani?',
        answer: 'Yes. We build custom API webhooks that seamlessly link incoming WhatsApp conversations to your existing database, Airtable, or CRM platform.'
      }
    ]
  },
  {
    id: 'loc-ranaghat',
    slug: 'ranaghat',
    name: 'Ranaghat',
    displayName: 'Ranaghat',
    type: 'city',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 2,
    majorIndustries: ['Rail Logistics & Transit Junction', 'Wholesale Consumer Goods', 'Agro-Processing & Food Manufacturing', 'Textile Trade', 'Agricultural Commerce'],
    businessTypes: ['Wholesale Distributors', 'Food Processors', 'Retail Showrooms', 'Logistics Agencies', 'Local Commercial Services'],
    keyCommercialHubs: [
      'Ranaghat Station Road Wholesale Market',
      'NH 12 Commercial & Industrial Belt',
      'Rathtala Trading Corridor',
      'Subhas Avenue Retail Hub',
      'Ranaghat Court Road Business Zone'
    ],
    nearbyLocationSlugs: ['krishnanagar', 'chakdaha', 'santipur', 'birnagar'],
    metaTitle: 'AI Automation Services in Ranaghat | Conflux AI',
    metaDescription: 'Automate wholesale order intake, WhatsApp speed-to-lead qualification, and business workflows for distributors and retailers in Ranaghat, Nadia.',
    h1Title: 'AI Automation & Digital Workflows for Ranaghat Businesses',
    summary: 'Conflux AI provides wholesale order bots, automated CRM pipelines, and web design for commercial distributors, agro-processors, and retail enterprises in Ranaghat.',
    localBusinessContext: 'Ranaghat is a vital railway logistics junction and primary commercial trading hub connecting Kolkata to Central and Northern Nadia along NH 12 (formerly NH 34). The municipality anchors major wholesale trade in FMCG grocery distribution, agro-processing, food manufacturing, and textile supply. With substantial daily trading volumes transacted through Station Road Market, Rathtala, and Subhas Avenue, Ranaghat commercial distributors and manufacturers benefit from automated B2B WhatsApp order routing, instant lead qualification, and digital inventory synchronization.',
    automationOpportunities: [
      'Automated WhatsApp B2B Wholesale Order Routing & SKU Catalog Dispatch',
      'Instant Speed-to-Lead Qualification & Quotation Notifications for Field Sales',
      'Automated Customer Support & Delivery Status Updates for FMCG Distributors',
      'Sub-Second E-Commerce & Product Showcase Web Architecture for Retailers',
      'Statutory Verification & FSSAI License Provenance Grounding for Food Processors'
    ],
    useCases: [
      {
        title: 'FMCG & Grocery Wholesale Order Automation',
        description: 'Enables Ranaghat wholesale distributors to ingest dealer purchase orders via WhatsApp 24/7, parse item quantities automatically, and route finalized orders directly into billing sheets without manual transcription.',
        servicesUsed: ['WhatsApp Business Automation', 'CRM Integration', 'Workflow Automation'],
        impact: 'Reduces order transcription time by 85% and eliminates after-hours order drop-off across Nadia distributor networks.'
      },
      {
        title: 'Agricultural Food Processing & Distributor Inquiry Intake',
        description: 'Automates bulk buyer inquiries, product specification delivery, and FSSAI compliance verification for Ranaghat agro-food processing facilities and packaged food manufacturers.',
        servicesUsed: ['Custom AI Agents', 'Lead Qualification', 'High-Speed Web Platforms'],
        impact: 'Accelerates speed-to-lead from hours to under 30 seconds for regional B2B buyer inquiries.'
      }
    ],
    faqs: [
      {
        question: 'How does Conflux AI deliver digital automation services to Ranaghat businesses?',
        answer: 'Conflux AI operates a remote-first engineering model from Kolkata. We collaborate with Ranaghat business owners, distributors, and manufacturers via secure video consultations, configure automated workflows in isolated cloud sandboxes, and provide end-to-end deployment and support without requiring physical office overhead.'
      },
      {
        question: 'How can Ranaghat wholesale distributors automate WhatsApp order handling?',
        answer: 'We build structured WhatsApp Business API chatbots that present product catalogs, accept multi-line order requests from retailers, validate order details, and instantly notify your sales representatives or dispatch teams.'
      },
      {
        question: 'How does Conflux Verify authenticate registered businesses in Ranaghat?',
        answer: 'Conflux Verify cross-references business entities against primary statutory registries—such as the Food Safety and Standards Authority of India (FoSCoS) for food business operators (e.g., Ranaghat Agro Processing Ltd) and the Ministry of Corporate Affairs (MCA)—to provide auditable, evidence-backed trust reports.'
      }
    ],
    verifiedEntities: [
      {
        id: 'ent_ranaghat_agro',
        name: 'Ranaghat Agro Processing Ltd',
        entityType: 'REGISTERED_BUSINESS',
        statutoryIdentifier: 'FSSAI License: 12823019000452',
        registrarName: 'Food Safety and Standards Authority of India (FoSCoS)',
        registrarUrl: 'https://foscos.fssai.gov.in',
        claimSummary: 'Holds an active Food Business Operator (FBO) manufacturing and processing license in Nadia district.',
        verificationStatus: 'SUPPORTED',
        sourceTier: 'TIER_1_PRIMARY_AUTHORITATIVE',
        validThrough: '2028-05-09',
        benchmarkCaseId: 'GT-04',
        locationRelevance: 'Primary agricultural food processing facility in Ranaghat subdivision, supporting commercial food manufacturing across Nadia district.',
        relatedArticleSlug: 'ranaghat-fmcg-wholesale-grocery-order-intake-automation',
        relatedGuideSlug: 'how-to-verify-gst-udyam-registration',
        verifyQueryUrl: '/verify?entity=Ranaghat+Agro+Processing+Ltd&claim=Ranaghat+Agro+Processing+Ltd+is+registered+under+the+FSSAI+with+an+active+food+business+operator+license+in+Nadia+district'
      }
    ]
  },
  {
    id: 'loc-nabadwip',
    slug: 'nabadwip',
    name: 'Nabadwip',
    displayName: 'Nabadwip',
    type: 'city',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 2,
    majorIndustries: ['Heritage & Religious Tourism', 'Traditional Handloom Weaving', 'Hospitality & Hotels', 'Brass & Metal Craft'],
    keyCommercialHubs: ['Nabadwip Market Corridor', 'Gauranga Bridge Commercial Zone'],
    nearbyLocationSlugs: ['krishnanagar', 'santipur', 'ranaghat'],
    metaTitle: 'Local Business Visibility & Verification in Nabadwip | Conflux AI',
    metaDescription: 'AI automation, WhatsApp hotel booking bots, and e-commerce web design for handloom weavers and hotels in Nabadwip.',
    h1Title: 'AI Automation & E-Commerce Engineering in Nabadwip',
    summary: 'Digitizing Nabadwip tourism, hotel bookings, and handloom saree trade with automated WhatsApp booking systems and global e-commerce portals.',
    localBusinessContext: 'Nabadwip receives over a million pilgrims and tourists annually while producing world-renowned Bengali handloom textiles. Automated booking bots and digital storefronts allow local merchants to sell directly across India.'
  },
  {
    id: 'loc-chakdaha',
    slug: 'chakdaha',
    name: 'Chakdaha',
    displayName: 'Chakdaha',
    type: 'city',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 2,
    majorIndustries: ['Suburban Commercial Trade', 'Agro-Commodity Marketing', 'Education Coaching', 'Healthcare Services'],
    nearbyLocationSlugs: ['kalyani', 'ranaghat', 'krishnanagar'],
    metaTitle: 'AI Automation Services in Chakdaha | Conflux AI',
    metaDescription: 'Streamline lead response, automated customer support, and local web development for Chakdaha businesses.',
    h1Title: 'AI Automation & Digital Solutions in Chakdaha'
  },
  {
    id: 'loc-santipur',
    slug: 'santipur',
    name: 'Santipur',
    displayName: 'Santipur',
    type: 'city',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 2,
    tier: 2,
    majorIndustries: ['Handloom Saree Industry & Export', 'Textile Dyeing & Processing', 'Retail & Wholesale Saree Trade'],
    nearbyLocationSlugs: ['ranaghat', 'nabadwip', 'krishnanagar'],
    metaTitle: 'AI Automation & E-Commerce for Santipur Weavers | Conflux AI',
    metaDescription: 'Conflux AI builds automated WhatsApp saree catalog bots and direct-to-consumer e-commerce platforms for Santipur textile manufacturers.',
    h1Title: 'AI Automation & Digital Sales Channels for Santipur Textile Trade',
    summary: 'Empowering Santipur handloom manufacturers and wholesale saree traders with automated WhatsApp catalogs, B2B lead ingestion, and online sales platforms.',
    verifiedEntities: [
      {
        id: 'ent_santipur_gi',
        name: 'Santipur Cotton Handloom Weaving Tradition',
        entityType: 'GI_HERITAGE_CLUSTER',
        statutoryIdentifier: 'GI Docket: GI-DOCKET-SANTIPUR-84',
        registrarName: 'Geographical Indications Registry (CGPDTM), Govt of India',
        registrarUrl: 'https://ipindiaonline.gov.in',
        claimSummary: 'Recognized historical cotton handloom weaving craft under Nadia regional patronage documented since the 15th century.',
        verificationStatus: 'SUPPORTED',
        sourceTier: 'TIER_1_PRIMARY_AUTHORITATIVE',
        benchmarkCaseId: 'GT-47',
        locationRelevance: 'Statutory Geographical Indication (GI) heritage craft cluster encompassing Santipur handloom weavers, master artisans, and textile guilds across Nadia.',
        relatedArticleSlug: 'santipur-phulia-saree-durga-puja-whatsapp-bulk-booking',
        relatedGuideSlug: 'how-to-verify-indian-company-legal-existence',
        verifyQueryUrl: '/verify?entity=Santipur+Tant+Saree+Guild&claim=Santipur+has+been+a+recognized+center+of+cotton+handloom+weaving+since+the+15th+century+under+the+patronage+of+Nadia+royalty'
      }
    ]
  },
  {
    id: 'loc-bagula',
    slug: 'bagula',
    name: 'Bagula',
    displayName: 'Bagula (Nadia)',
    type: 'commercial_junction',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    subdivisionName: 'Ranaghat Subdivision',
    blockName: 'Hanskhali CD Block',
    gramPanchayatName: 'Bagula I & II Gram Panchayats',
    status: 'PUBLISHED',
    priority: 2,
    tier: 3,
    majorIndustries: ['Retail & Apparel Trade', 'Railway Junction Commerce', 'Agricultural Produce Trading', 'Private Education Tutorials'],
    businessTypes: ['Local Garment Showrooms', 'Wholesale Distributors', 'Coaching Classes', 'Suburban Retailers'],
    keyCommercialHubs: ['Bagula Station Road Market', 'Hanskhali Road Commercial Corridor', 'College Road Market'],
    nearbyLocationSlugs: ['ranaghat', 'krishnanagar', 'santipur', 'chakdaha'],
    opportunityScore: {
      commercialActivityScore: 8,
      businessDensityScore: 7,
      digitalDemandScore: 8,
      confluxFitScore: 9,
      overallScore: 8.0,
      isEstimated: true
    },
    lastResearched: '2026-08-13',
    sourceOfData: 'Nadia District Administration & Census Records',
    metaTitle: 'Digital Solutions & AI Automation for Businesses in Bagula | Conflux AI',
    metaDescription: 'Conflux AI delivers remote-first digital solutions, WhatsApp saree & apparel catalogs, and web development for merchants in Bagula, Nadia.',
    h1Title: 'Digital Solutions & Automation for Businesses in Bagula',
    summary: 'Conflux AI brings remote digital presence, mobile-friendly websites, official WhatsApp product catalogs, and automated lead response to retail and commercial businesses in Bagula, Nadia.',
    localBusinessContext: 'Bagula is a major commercial railway junction town in Nadia under the Hanskhali block of Ranaghat subdivision. Local clothing merchants, saree retailers, coaching centers, and agro-traders serve thousands of residents from surrounding Gram Panchayats. Moving beyond manual foot-traffic dependency allows Bagula merchants to capture customer inquiries and orders 24/7 on WhatsApp.',
    automationOpportunities: [
      'WhatsApp Digital Catalog & Instant Stock Inquiry Bot for Garment Merchants',
      'Student Inquiry Capture & Batch Reminder Automation for Bagula Coaching Classes',
      'Local Google Maps & Business Search Visibility Optimization',
      'Automated Billing Receipts & Order Confirmation Messages'
    ],
    useCases: [
      {
        title: 'Garment & Saree Store WhatsApp Catalog',
        description: 'Bagula apparel merchants showcase new seasonal saree designs and garment arrivals over WhatsApp with automated stock inquiries.',
        impact: 'Expands customer reach beyond local foot traffic to surrounding villages.'
      },
      {
        title: 'Coaching Institute Admission Bot',
        description: 'Capture prospective student details from Facebook or Google and send automated course prospectuses and fee details on WhatsApp.',
        impact: 'Increases batch enrollment while cutting administrative phone work.'
      }
    ],
    faqs: [
      {
        question: 'Does Conflux AI have a physical office in Bagula?',
        answer: 'No. Conflux AI is a remote-first agency based in Kolkata, West Bengal. We serve business owners in Bagula remotely through digital consultation meetings, WhatsApp support channels, and cloud-hosted software implementations.'
      },
      {
        question: 'How can a small retail shop in Bagula start with digital solutions?',
        answer: 'We begin with a simple mobile-friendly website and a WhatsApp Business product catalog bot that allows local customers to browse and inquire about items 24/7.'
      }
    ]
  },
  {
    id: 'loc-hanskhali',
    slug: 'hanskhali',
    name: 'Hanskhali',
    displayName: 'Hanskhali Block',
    type: 'block',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    subdivisionName: 'Ranaghat Subdivision',
    status: 'DATA_ONLY',
    priority: 3,
    tier: 3,
    opportunityScore: {
      commercialActivityScore: 6,
      businessDensityScore: 5,
      digitalDemandScore: 6,
      confluxFitScore: 7,
      overallScore: 6.0,
      isEstimated: true
    },
    lastResearched: '2026-08-13',
    sourceOfData: 'West Bengal Panchayati Raj System'
  },
  {
    id: 'loc-badkulla',
    slug: 'badkulla',
    name: 'Badkulla',
    displayName: 'Badkulla',
    type: 'town',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    subdivisionName: 'Ranaghat Subdivision',
    blockName: 'Hanskhali CD Block',
    status: 'DATA_ONLY',
    priority: 3,
    tier: 3,
    opportunityScore: {
      commercialActivityScore: 7,
      businessDensityScore: 6,
      digitalDemandScore: 7,
      confluxFitScore: 8,
      overallScore: 7.0,
      isEstimated: true
    },
    lastResearched: '2026-08-13',
    sourceOfData: 'Census of India'
  },

  // DATA_ONLY Locations in Nadia (Tier 3 - Not published as indexable pages until unique content is curated)
  {
    id: 'loc-haringhata',
    slug: 'haringhata',
    name: 'Haringhata',
    displayName: 'Haringhata',
    type: 'municipality',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'DATA_ONLY',
    priority: 3,
    tier: 3,
    majorIndustries: ['Dairy Industry', 'Biotechnology', 'Agricultural Sciences']
  },
  {
    id: 'loc-tehatta',
    slug: 'tehatta',
    name: 'Tehatta',
    displayName: 'Tehatta',
    type: 'subdivision',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'DATA_ONLY',
    priority: 3,
    tier: 3,
    majorIndustries: ['Agriculture Trading', 'Subdivisional Governance']
  },
  {
    id: 'loc-karimpur',
    slug: 'karimpur',
    name: 'Karimpur',
    displayName: 'Karimpur',
    type: 'town',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'DATA_ONLY',
    priority: 3,
    tier: 3,
    majorIndustries: ['Border Commercial Trade', 'Agro Marketing']
  },
  {
    id: 'loc-birnagar',
    slug: 'birnagar',
    name: 'Birnagar',
    displayName: 'Birnagar',
    type: 'municipality',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'DATA_ONLY',
    priority: 4,
    tier: 3
  },
  {
    id: 'loc-taherpur',
    slug: 'taherpur',
    name: 'Taherpur',
    displayName: 'Taherpur',
    type: 'town',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'DATA_ONLY',
    priority: 4,
    tier: 3
  },
  {
    id: 'loc-gayespur',
    slug: 'gayespur',
    name: 'Gayespur',
    displayName: 'Gayespur',
    type: 'municipality',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'DATA_ONLY',
    priority: 4,
    tier: 3
  },
  {
    id: 'loc-chapra',
    slug: 'chapra',
    name: 'Chapra',
    displayName: 'Chapra Block',
    type: 'block',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'DATA_ONLY',
    priority: 4,
    tier: 3
  },
  {
    id: 'loc-nakashipara',
    slug: 'nakashipara',
    name: 'Nakashipara',
    displayName: 'Nakashipara Block',
    type: 'block',
    parentSlug: 'nadia',
    districtSlug: 'nadia',
    stateSlug: 'west-bengal',
    status: 'DATA_ONLY',
    priority: 4,
    tier: 3
  }
];

export const OTHER_MAJOR_WB_LOCATIONS: LocationItem[] = [
  {
    id: 'loc-siliguri',
    slug: 'siliguri',
    name: 'Siliguri',
    displayName: 'Siliguri',
    type: 'city',
    districtSlug: 'darjeeling',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 2,
    majorIndustries: ['Tea Auction & Export', 'Tourism Transit & Hospitality', 'North East Transport Logistics', 'Retail & Wholesale Trade'],
    metaTitle: 'Local Business Visibility & Verification in Siliguri | Conflux AI',
    metaDescription: 'Remote AI automation, WhatsApp lead bots, and web platform development for hospitality, tea trade, and logistics in Siliguri.',
    h1Title: 'AI Automation & Digital Workflows for Siliguri Enterprises',
    summary: 'Connecting Siliguri hotels, tour operators, tea exporters, and transport agencies with automated lead response and intelligent systems.'
  },
  {
    id: 'loc-durgapur',
    slug: 'durgapur',
    name: 'Durgapur',
    displayName: 'Durgapur',
    type: 'city',
    districtSlug: 'paschim-bardhaman',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 2,
    majorIndustries: ['Steel Manufacturing & Heavy Engineering', 'Power Generation', 'Medical & Educational Institutes'],
    metaTitle: 'AI Automation Services in Durgapur | Conflux AI',
    metaDescription: 'Industrial workflow automation, WhatsApp CRM bots, and React web platforms for manufacturing and healthcare in Durgapur.',
    h1Title: 'AI Automation & Industrial Software Engineering in Durgapur'
  },
  {
    id: 'loc-asansol',
    slug: 'asansol',
    name: 'Asansol',
    displayName: 'Asansol',
    type: 'city',
    districtSlug: 'paschim-bardhaman',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 2,
    majorIndustries: ['Heavy Industry', 'Coal & Mining Equipment', 'Commercial Logistics'],
    metaTitle: 'Local Business Visibility & Verification in Asansol | Conflux AI',
    metaDescription: 'Remote AI engineering, chatbot integrations, and lead automation for businesses in Asansol.',
    h1Title: 'AI Automation & Digital Solutions in Asansol'
  },
  {
    id: 'loc-haldia',
    slug: 'haldia',
    name: 'Haldia',
    displayName: 'Haldia',
    type: 'city',
    districtSlug: 'purba-medinipur',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 2,
    majorIndustries: ['Port Logistics & Shipping', 'Petrochemical Manufacturing', 'Heavy Industrial Engineering'],
    metaTitle: 'AI Automation Services in Haldia Port City | Conflux AI',
    metaDescription: 'Conflux AI provides automated logistics lead bots, supplier inquiry tracking, and web platforms for Haldia industrial firms.',
    h1Title: 'AI Automation & Port Logistics Workflows in Haldia'
  }
];

export const INDUSTRY_LOCATION_COMBINATIONS: LocationItem[] = [
  {
    id: 'ind-kolkata-real-estate',
    slug: 'kolkata/real-estate',
    name: 'Real Estate Automation in Kolkata',
    displayName: 'Kolkata Real Estate AI Automation',
    type: 'city',
    districtSlug: 'kolkata',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 4,
    majorIndustries: ['Real Estate Developers', 'Property Brokerages', 'Commercial Leasing Agencies'],
    metaTitle: 'Real Estate AI Automation & WhatsApp Lead Bots in Kolkata | Conflux AI',
    metaDescription: 'Automate property lead capture, site visit scheduling, and WhatsApp brochure delivery for Kolkata real estate developers.',
    h1Title: 'AI Automation & WhatsApp Speed-to-Lead for Kolkata Real Estate',
    summary: 'Transform real estate buyer acquisition in Salt Lake, New Town, and South Kolkata with automated WhatsApp brochure bots, instant CRM routing, and site-visit scheduling.',
    useCases: [
      {
        title: 'Instant Property Brochure & Floorplan Bot',
        description: 'Prospects inquiring on Facebook or Google receive interactive WhatsApp messages with project floorplans, price sheets, and video walk-throughs in 5 seconds.',
        impact: 'Increases qualified site visits by 35%.'
      }
    ]
  },
  {
    id: 'ind-haldia-manufacturing',
    slug: 'haldia/manufacturing',
    name: 'Manufacturing Automation in Haldia',
    displayName: 'Haldia Manufacturing AI Automation',
    type: 'industrial_area',
    districtSlug: 'purba-medinipur',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 4,
    majorIndustries: ['Petrochemical Plants', 'Port Logistics Companies', 'Heavy Machine Fabricators'],
    metaTitle: 'Manufacturing & Port Logistics AI Automation in Haldia | Conflux AI',
    metaDescription: 'Automate supplier inquiries, vendor qualification, and logistics status updates for manufacturing plants in Haldia.',
    h1Title: 'AI Automation & Industrial Workflows for Haldia Manufacturing',
    summary: 'Streamline vendor onboarding, quotation processing, and logistics status tracking for Haldia port industrial units.'
  },
  {
    id: 'ind-siliguri-hospitality',
    slug: 'siliguri/hospitality',
    name: 'Hospitality Automation in Siliguri',
    displayName: 'Siliguri Hospitality AI Automation',
    type: 'city',
    districtSlug: 'darjeeling',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 4,
    majorIndustries: ['Hotels & Resorts', 'Dooars & Sikkim Tour Operators', 'Travel Agencies'],
    metaTitle: 'Hospitality & Travel AI Automation in Siliguri | Conflux AI',
    metaDescription: 'WhatsApp room booking bots, tour itinerary generators, and direct booking web platforms for Siliguri hotel and travel operators.',
    h1Title: 'AI Automation & WhatsApp Booking Systems for Siliguri Hospitality',
    summary: 'Automate hotel room availability checks, tour itinerary dispatch, and direct booking confirmations for Siliguri hospitality businesses.'
  },
  {
    id: 'ind-durgapur-manufacturing',
    slug: 'durgapur/manufacturing',
    name: 'Manufacturing Automation in Durgapur',
    displayName: 'Durgapur Industrial AI Automation',
    type: 'city',
    districtSlug: 'paschim-bardhaman',
    stateSlug: 'west-bengal',
    status: 'PUBLISHED',
    priority: 1,
    tier: 4,
    majorIndustries: ['Steel Plants', 'Foundries', 'Industrial Equipment Fabricators'],
    metaTitle: 'Manufacturing AI Automation & Workflow Systems in Durgapur | Conflux AI',
    metaDescription: 'Custom AI agent pipelines, quotation automation, and CRM integrations for Durgapur manufacturing plants.',
    h1Title: 'AI Automation & Workflow Systems for Durgapur Manufacturing'
  }
];

// Helper Functions
export const getAllLocations = (): LocationItem[] => {
  return [
    WEST_BENGAL_STATE,
    ...WEST_BENGAL_DISTRICTS,
    ...NADIA_LOCATIONS,
    ...OTHER_MAJOR_WB_LOCATIONS,
    ...INDUSTRY_LOCATION_COMBINATIONS
  ];
};

export const getPublishedLocations = (): LocationItem[] => {
  return getAllLocations().filter(loc => loc.status === 'PUBLISHED');
};

export const getLocationBySlug = (slug: string): LocationItem | undefined => {
  const all = getAllLocations();
  return all.find(loc => loc.slug === slug || loc.slug === slug.replace(/^\/|\/$/g, ''));
};

export const getDistrictLocations = (districtSlug: string): LocationItem[] => {
  return getAllLocations().filter(loc => loc.districtSlug === districtSlug && loc.status === 'PUBLISHED');
};
