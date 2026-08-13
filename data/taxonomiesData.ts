import { BusinessCategoryTaxonomy, DigitalNeedTaxonomy, LocationBusinessMapping } from '../types/location';

export const BUSINESS_CATEGORY_TAXONOMY: BusinessCategoryTaxonomy[] = [
  {
    id: 'retail-clothing',
    name: 'Retail & Apparel / Clothing Stores',
    description: 'Local apparel boutiques, saree shops, and garment retailers serving suburban and rural West Bengal hubs.',
    typicalNeeds: [
      'Digital Product Catalog / Price Sheet',
      'WhatsApp Customer Inquiries & Order Booking',
      'Local Google Search & Map Visibility',
      'Automated Customer Follow-up & Restock Alerts'
    ],
    exampleUseCases: [
      {
        title: 'WhatsApp Digital Saree & Garment Catalog',
        description: 'Allow customers to view new arrivals, check sizes, and inquire on WhatsApp directly without a complex e-commerce checkout.',
        servicesUsed: ['WhatsApp Business Automation', 'Website Development']
      }
    ]
  },
  {
    id: 'restaurants-eateries',
    name: 'Local Restaurants, Cafes & Eateries',
    description: 'Food outlets, sweet shops, and regional restaurants managing daily takeaway, dining, and catering inquiries.',
    typicalNeeds: [
      'Mobile Menu & Daily Specials Showcase',
      'WhatsApp Takeaway & Party Order Capture',
      'Google Maps Reviews & Local Search Ranking',
      'Automated Feedback Collection'
    ],
    exampleUseCases: [
      {
        title: 'WhatsApp Menu & Order Placement Bot',
        description: 'Customers scan a QR code or click a link to view the menu on WhatsApp and place catering or takeaway requests.',
        servicesUsed: ['WhatsApp Business Automation', 'Reputation Management']
      }
    ]
  },
  {
    id: 'coaching-education',
    name: 'Coaching Centers & Training Institutes',
    description: 'Private tutorial centers, competitive exam coaching institutes, and vocational training academies.',
    typicalNeeds: [
      'Automated Admission Lead Intake',
      'Batch Timetable & Fee Inquiries on WhatsApp',
      'Parent Notification & Class Reminder Bot',
      'Modern High-Converting Mobile Website'
    ],
    exampleUseCases: [
      {
        title: 'Admission Lead Capture & Instant Prospect Response',
        description: 'Capture student leads from social media and Google, instantly send course details over WhatsApp, and schedule counseling callbacks.',
        servicesUsed: ['WhatsApp Business Automation', 'AI Chatbots', 'Website Development']
      }
    ]
  },
  {
    id: 'healthcare-clinics',
    name: 'Diagnostic Clinics & Healthcare Facilities',
    description: 'Polyclinics, diagnostic centers, pharmacies, and dental practices across West Bengal districts.',
    typicalNeeds: [
      'OPD Doctor Schedule Inquiries',
      'WhatsApp Test Booking & Report Alerts',
      '24/7 RAG Chatbot for Clinic Timings & Services',
      'Google Local Search Visibility'
    ],
    exampleUseCases: [
      {
        title: 'Automated Doctor Appointment & OPD Inquiry Bot',
        description: 'Patients check doctor availability, book appointments, and receive automated WhatsApp reminders before their visit.',
        servicesUsed: ['WhatsApp Business Automation', 'AI Chatbots']
      }
    ]
  },
  {
    id: 'agro-trading',
    name: 'Agro-Commodity Traders & Cold Storages',
    description: 'Rice mills, potato cold storage operators, fertilizer distributors, and agricultural commodity wholesalers.',
    typicalNeeds: [
      'Wholesale Price Sheet Dispatch on WhatsApp',
      'B2B Buyer Lead Ingestion',
      'Automated Dispatch & Receipt Confirmations',
      'Company Trust & Authority Web Portal'
    ],
    exampleUseCases: [
      {
        title: 'Daily Commodity Rate & Buyer Intake Workflow',
        description: 'Broadcast daily wholesale crop/grain prices to verified buyers and automatically log incoming purchase orders into Google Sheets.',
        servicesUsed: ['Workflow Automation', 'WhatsApp Business Automation']
      }
    ]
  },
  {
    id: 'handloom-textile',
    name: 'Handloom & Textile Artisans / Manufacturers',
    description: 'Traditional saree weavers, handloom societies, and textile manufacturers in hubs like Santipur, Nabadwip, and Samudragarh.',
    typicalNeeds: [
      'Direct-to-Consumer Digital Showroom',
      'Wholesale Buyer Verification & Inquiries',
      'Global E-Commerce Storefront',
      'SEO & Search Engine Discovery'
    ],
    exampleUseCases: [
      {
        title: 'B2B Wholesale Weaver Catalog & Sample Request Bot',
        description: 'Showcase authentic handloom weaves to pan-India boutique buyers with automated WhatsApp sample requests.',
        servicesUsed: ['Website Development', 'SEO & GEO', 'WhatsApp Business Automation']
      }
    ]
  },
  {
    id: 'hardware-construction',
    name: 'Hardware, Construction & Building Material Dealers',
    description: 'Cement, TMT bar, tiles, and sanitaryware distributors supplying regional construction projects.',
    typicalNeeds: [
      'Product Quotation Generator',
      'WhatsApp Price Inquiry Handler',
      'Google Maps & Business Visibility',
      'Lead Follow-up Automation'
    ],
    exampleUseCases: [
      {
        title: 'Instant Material Price Quote Bot',
        description: 'Contractors submit required quantities on WhatsApp and receive instant estimated quotations based on current rate sheets.',
        servicesUsed: ['Workflow Automation', 'WhatsApp Business Automation']
      }
    ]
  }
];

export const DIGITAL_NEED_TAXONOMY: DigitalNeedTaxonomy[] = [
  { id: 'basic-website', name: 'Basic Web Presence', category: 'Foundation', description: 'Clean, fast-loading company profile page.', implementationTime: '3-5 Days' },
  { id: 'mobile-webapp', name: 'Mobile-Friendly Web App', category: 'Foundation', description: 'Sub-second React + Vite app optimized for mobile connections.', implementationTime: '5-10 Days' },
  { id: 'google-visibility', name: 'Google Search & Map Visibility (SEO/GEO)', category: 'Visibility', description: 'Schema.org JSON-LD and search engine indexation tuning.', implementationTime: '7-14 Days' },
  { id: 'whatsapp-catalog', name: 'WhatsApp Business & Catalog Setup', category: 'Engagement', description: 'Official Meta WhatsApp Business API with product/service catalog.', implementationTime: '3-7 Days' },
  { id: 'social-media', name: 'Social Media Profiles & Creative Support', category: 'Visibility', description: 'Professional Facebook and Instagram business setup.', implementationTime: '3-5 Days' },
  { id: 'online-catalog', name: 'Online Product Catalog & Price Sheets', category: 'Foundation', description: 'Digital catalog for sharing products without heavy e-commerce overhead.', implementationTime: '5-7 Days' },
  { id: 'lead-intake', name: 'Customer Lead Intake Workflows', category: 'Engagement', description: 'Form and chat lead capture synced to CRM or Google Sheets.', implementationTime: '3-5 Days' },
  { id: 'automated-response', name: 'Automated Lead Response & Follow-up', category: 'Automation', description: 'Instant 5-second WhatsApp response to new leads.', implementationTime: '3-7 Days' },
  { id: 'billing-receipts', name: 'Automated Billing & Digital Receipts', category: 'Automation', description: 'Automated receipt and invoice dispatch over WhatsApp.', implementationTime: '5-7 Days' },
  { id: 'reviews-reputation', name: 'Reviews & Reputation Collection', category: 'Engagement', description: 'Automated post-purchase review request flow.', implementationTime: '3-5 Days' },
  { id: 'analytics-tracking', name: 'Analytics & Lead Conversion Tracking', category: 'Visibility', description: 'Event tracking to identify top conversion channels.', implementationTime: '2-4 Days' },
  { id: 'rag-chatbots', name: 'RAG Knowledge Base Chatbots', category: 'Advanced AI', description: 'AI chatbots trained exclusively on company documents.', implementationTime: '7-14 Days' },
  { id: 'autonomous-agents', name: 'Autonomous Multi-Agent Systems', category: 'Advanced AI', description: 'Multi-step AI agents performing complex business tasks.', implementationTime: '10-21 Days' }
];

export const LOCATION_BUSINESS_MAPPINGS: LocationBusinessMapping[] = [
  {
    id: 'map-bagula-retail',
    locationSlug: 'nadia/bagula',
    locationName: 'Bagula (Nadia)',
    businessCategoryId: 'retail-clothing',
    businessCategoryName: 'Retail & Apparel Stores',
    primaryDigitalNeedIds: ['whatsapp-catalog', 'online-catalog', 'automated-response', 'google-visibility'],
    confluxServices: ['WhatsApp Business Automation', 'High-Performance Web Development', 'SEO & GEO'],
    specificProblem: 'Local garment and saree retailers in Bagula rely on foot traffic and lose sales when local customers cannot view available stock or inquire during off-hours.',
    solutionDescription: 'Conflux AI sets up a lightweight WhatsApp digital catalog and speed-to-lead bot, allowing Bagula merchants to share product collections and answer customer inquiries 24/7.',
    status: 'PUBLISHED'
  },
  {
    id: 'map-krishnanagar-education',
    locationSlug: 'nadia/krishnanagar',
    locationName: 'Krishnanagar (Nadia)',
    businessCategoryId: 'coaching-education',
    businessCategoryName: 'Coaching Centers & Institutes',
    primaryDigitalNeedIds: ['lead-intake', 'automated-response', 'whatsapp-catalog', 'mobile-webapp'],
    confluxServices: ['WhatsApp Business Automation', 'Custom AI Chatbot Development', 'High-Performance Web Development'],
    specificProblem: 'Coaching institutes in Krishnanagar receive dozens of student inquiries before new academic batches, straining office staff and losing prospects.',
    solutionDescription: 'We deploy an automated WhatsApp admission helpline that provides course details, fee structures, and batch timings instantly while logging student leads into CRM.',
    status: 'PUBLISHED'
  },
  {
    id: 'map-nabadwip-tourism',
    locationSlug: 'nadia/nabadwip',
    locationName: 'Nabadwip (Nadia)',
    businessCategoryId: 'restaurants-eateries',
    businessCategoryName: 'Hotels & Heritage Tourism',
    primaryDigitalNeedIds: ['mobile-webapp', 'whatsapp-catalog', 'google-visibility', 'reviews-reputation'],
    confluxServices: ['High-Performance Web Development', 'WhatsApp Business Automation', 'Reputation Management'],
    specificProblem: 'Hotels and guest houses in Nabadwip lose direct room booking revenue to third-party OTA commissions.',
    solutionDescription: 'Conflux AI engineers sub-second mobile web portals and WhatsApp room booking bots, enabling direct customer booking without middleman commissions.',
    status: 'PUBLISHED'
  },
  {
    id: 'map-haldia-manufacturing',
    locationSlug: 'purba-medinipur/haldia',
    locationName: 'Haldia (Purba Medinipur)',
    businessCategoryId: 'hardware-construction',
    businessCategoryName: 'Port Logistics & Manufacturing',
    primaryDigitalNeedIds: ['lead-intake', 'automated-response', 'autonomous-agents', 'google-visibility'],
    confluxServices: ['Enterprise AI Automation', 'AI Agents & Autonomous Systems', 'Business Workflow Automation'],
    specificProblem: 'Haldia manufacturing units handle high volumes of vendor quotations and logistics status checks via scattered manual emails.',
    solutionDescription: 'We build autonomous AI agent pipelines that parse vendor emails, validate compliance, and update internal ERP databases automatically.',
    status: 'PUBLISHED'
  }
];
