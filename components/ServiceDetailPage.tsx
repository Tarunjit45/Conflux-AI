import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Zap, MessageSquare, ExternalLink, ShieldCheck, HelpCircle, Cpu, Users } from 'lucide-react';

interface ServiceDetail {
  id: string;
  name: string;
  headline: string;
  problem: string;
  solution: string;
  whoIsItFor: string;
  integrations: string[];
  deliverables: string[];
  process: { step: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  images: string[];
}

const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  "ai-automation": {
    "id": "ai-automation",
    "name": "Enterprise AI Automation",
    "headline": "Streamline Business Operations with High-Throughput Autonomous AI Systems",
    "problem": "Manual data entry, repetitive customer follow-ups, and disconnected software systems slow operational throughput and increase overhead.",
    "solution": "Conflux AI builds custom autonomous microservices and AI pipelines that connect CRMs, databases, and communication tools into unified automated workflows.",
    "whoIsItFor": "Growing businesses, B2B agencies, e-commerce brands, and enterprise teams seeking to automate repetitive operational tasks.",
    "integrations": ["HubSpot", "Salesforce", "Supabase", "WhatsApp Business API", "Google Workspace", "Notion", "PostgreSQL"],
    "images": [
      "/images/ai-automation/ai-automation_1.jpg",
      "/images/ai-automation/ai-automation_2.jpg",
      "/images/ai-automation/ai-automation_3.jpg",
      "/images/ai-automation/ai-automation_4.jpg"
    ],
    "deliverables": [
      "Custom Automated Workflow Pipelines",
      "CRM & ERP API Integrations",
      "Real-Time Data Parsing & Ingestion Engines",
      "Automated Security & Error Alert Systems",
      "Comprehensive Admin Operational Dashboard"
    ],
    "process": [
      { "step": "01", "title": "Workflow Audit", "desc": "We map manual business processes to identify bottleneck tasks suitable for AI automation." },
      { "step": "02", "title": "Architecture Design", "desc": "We engineer decoupled Python/Node microservices with strict error handling and API retry logic." },
      { "step": "03", "title": "Guardrails & Testing", "desc": "We run rigorous sandbox testing to enforce zero-trust security and data validation rules." },
      { "step": "04", "title": "Production Deployment", "desc": "We deploy serverless automation pipelines to cloud edge infrastructure with 24/7 logging." }
    ],
    "faqs": [
      { "q": "What is AI automation for small and medium businesses?", "a": "AI automation combines artificial intelligence models with software integrations to execute repetitive operational tasks—such as lead routing, invoice parsing, and email follow-ups—without manual human effort." },
      { "q": "What software platforms can Conflux AI integrate with?", "a": "We integrate with any platform offering a modern API or Webhook interface, including HubSpot, Salesforce, Supabase, WhatsApp, Notion, Google Workspace, and custom SQL databases." },
      { "q": "How long does implementation take?", "a": "Standard automation pipelines are delivered within 7 to 14 business days depending on system complexity and third-party API requirements." }
    ]
  },
  "ai-agents": {
    "id": "ai-agents",
    "name": "AI Agents & Autonomous Systems",
    "headline": "Deploy Intelligent Autonomous Agents to Perform Complex Multi-Step Business Tasks",
    "problem": "Traditional rule-based automation breaks when encountering variable user inputs, unstructured documents, or non-standard workflows.",
    "solution": "We design stateful AI agents equipped with tool-use capabilities, vector memory, and decision logic that perform multi-step tasks autonomously.",
    "whoIsItFor": "B2B sales teams, customer success departments, research teams, and operations managers handling complex lead qualification or document analysis.",
    "integrations": ["OpenAI GPT-4o", "Anthropic Claude", "Pinecone", "LangChain", "Make.com", "Zapier"],
    "images": [
      "/images/ai-automation/ai-automation_2.jpg",
      "/images/ai-automation/ai-automation_3.jpg"
    ],
    "deliverables": [
      "Task-Specific Autonomous AI Agent Architecture",
      "Vector Memory & Knowledge Base Embeddings",
      "Multi-Tool Execution Capability (Webhooks, Search, DB)",
      "Strict Output Validation Guardrails",
      "Audit Log & Monitoring Dashboard"
    ],
    "process": [
      { "step": "01", "title": "Agent Scope Definition", "desc": "We establish exact agent roles, goal criteria, authorized tools, and decision boundaries." },
      { "step": "02", "title": "Tool & Memory Wiring", "desc": "We connect vector memory databases and external APIs for autonomous tool execution." },
      { "step": "03", "title": "Eval & Benchmark Testing", "desc": "We run benchmark evaluation tests to ensure consistent, accurate agent responses." }
    ],
    "faqs": [
      { "q": "What is the difference between an AI agent and traditional automation?", "a": "Traditional automation follows rigid IF/THEN rules. An AI agent uses large language models to reason over variable data, decide which tools to invoke, and adapt to non-standard inputs." },
      { "q": "How do you ensure AI agents don't make unauthorized decisions?", "a": "We enforce strict system prompts, API permission boundaries, human-in-the-loop approval triggers, and real-time execution logging." }
    ]
  },
  "whatsapp-automation": {
    "id": "whatsapp-automation",
    "name": "WhatsApp Business Automation",
    "headline": "Automate Instant Lead Response, Prospect Qualification, and Support via WhatsApp API",
    "problem": "Businesses lose high-intent customer inquiries when leads wait hours for a manual WhatsApp reply.",
    "solution": "Conflux AI implements official WhatsApp Business API automation bots that respond within seconds, qualify lead intent, capture customer details, and sync directly with your CRM.",
    "whoIsItFor": "Local services, D2C brands, real estate firms, educational institutions, and B2B companies receiving high lead volume on WhatsApp.",
    "integrations": ["WhatsApp Business API", "Make.com", "HubSpot", "Google Sheets", "Razorpay", "Zapier"],
    "images": [
      "/images/chatbot-development/chatbot-development_1.jpg",
      "/images/chatbot-development/chatbot-development_2.jpg"
    ],
    "deliverables": [
      "Official WhatsApp Business API Account Setup",
      "Automated Speed-to-Lead Response Flow",
      "Interactive WhatsApp Menu & Catalog Logic",
      "CRM & Spreadsheet Lead Auto-Sync",
      "Live Human Agent Handoff Trigger"
    ],
    "process": [
      { "step": "01", "title": "API Verification", "desc": "We assist with official Meta WhatsApp Business API application and phone number verification." },
      { "step": "02", "title": "Conversation Design", "desc": "We design natural conversational flows and quick-reply button menus tailored to your sales funnel." },
      { "step": "03", "title": "CRM Connection", "desc": "We map incoming WhatsApp lead data directly into your backend CRM or lead sheet." }
    ],
    "faqs": [
      { "q": "How can an Indian business automate WhatsApp leads?", "a": "By linking the official Meta WhatsApp Business API to an automation platform like Make.com or a custom AI webhook, leads receive instant replies 24/7 and are automatically qualified into your CRM." },
      { "q": "Can the bot hand over complex chats to a human agent?", "a": "Yes. When a prospect requests a human representative or reaches a specific qualification stage, the bot immediately routes the conversation to a live agent." }
    ]
  },
  "chatbot-development": {
    "id": "chatbot-development",
    "name": "Custom AI Chatbot Development",
    "headline": "Convert Website Visitors 24/7 with Intelligent RAG-Powered Conversational Widgets",
    "problem": "Generic scripted chatbots frustrate visitors, while human support teams cannot operate around the clock.",
    "solution": "We build context-aware AI chatbots trained exclusively on your company documentation using Retrieval-Augmented Generation (RAG) to deliver accurate, non-hallucinating answers.",
    "whoIsItFor": "SaaS platforms, corporate service providers, e-commerce stores, and consultancy agencies wanting 24/7 prospect qualification.",
    "integrations": ["OpenAI API", "Supabase Vector", "LangChain", "HubSpot", "Salesforce", "Cal.com"],
    "images": [
      "/images/chatbot-development/chatbot-development_1.jpg",
      "/images/chatbot-development/chatbot-development_3.jpg"
    ],
    "deliverables": [
      "Company Knowledge Base Vector Embeddings",
      "RAG Guardrail Engine (Zero Hallucinations)",
      "B2B Lead Qualification & Booking Integration",
      "Multi-Language Chat Capability (English, Hindi, Bengali)",
      "Sub-Second Mobile-Friendly Web Chat Widget"
    ],
    "process": [
      { "step": "01", "title": "Knowledge Ingestion", "desc": "We ingest company documentations, FAQs, service catalogs, and pricing structures." },
      { "step": "02", "title": "Prompt Guardrails", "desc": "We program strict system prompts so the chatbot answers strictly from your verified data." },
      { "step": "03", "title": "Embed & Test", "desc": "We embed the chat widget into your website and verify zero impact on page speed." }
    ],
    "faqs": [
      { "q": "Will the AI chatbot give false information or hallucinate?", "a": "No. Our RAG architecture restricts the chatbot to retrieving answers solely from your approved company knowledge base documents." },
      { "q": "Can the chatbot schedule sales appointments directly?", "a": "Yes. The chatbot can present available calendar slots and book sales calls directly into Calendly or Cal.com." }
    ]
  },
  "workflow-automation": {
    "id": "workflow-automation",
    "name": "Business Workflow Automation",
    "headline": "Connect Disparate Software Systems into Seamless Automated Workflows",
    "problem": "Information trapped in separate tools requires manual copy-pasting, causing delays, data errors, and operational friction.",
    "solution": "We build robust webhook and API automation architectures using platforms like Make.com, Zapier, and custom serverless functions to synchronize data seamlessly across departments.",
    "whoIsItFor": "Operations leads, sales managers, agency owners, and financial administrators seeking cross-platform data sync.",
    "integrations": ["Make.com", "Zapier", "Airtable", "Google Workspace", "Shopify", "Slack", "Stripe"],
    "images": [
      "/images/ai-automation/ai-automation_4.jpg"
    ],
    "deliverables": [
      "Multi-Application Data Synchronization",
      "Custom Webhook & API Trigger Configuration",
      "Automated Error Handling & Email Alerts",
      "Departmental Lead Routing Logic",
      "Complete Technical Workflow Schematic"
    ],
    "process": [
      { "step": "01", "title": "App Mapping", "desc": "We audit your existing tech stack and map data inputs and outputs across all platforms." },
      { "step": "02", "title": "Integration Build", "desc": "We configure custom webhook payloads and data transformation modules." },
      { "step": "03", "title": "Validation Run", "desc": "We test sample data transactions to verify 100% data integrity and system reliability." }
    ],
    "faqs": [
      { "q": "What happens if an API service experiences downtime?", "a": "Our automated workflows include retry queues and instant alert notifications, preventing data loss during temporary third-party outages." }
    ]
  },
  "website-development": {
    "id": "website-development",
    "name": "High-Performance Web Development",
    "headline": "Ultra-Fast, Sub-Second React Web Platforms Built for Maximum Lead Conversion",
    "problem": "Slow, outdated WordPress websites lose up to 50% of mobile visitors before the page finishes loading.",
    "solution": "Conflux AI engineers custom web applications using React 18, Vite, TypeScript, and serverless edge hosting for instant loading speeds and clean user experience.",
    "whoIsItFor": "Businesses, professional services, B2B agencies, and tech startups requiring a modern, high-converting digital presence.",
    "integrations": ["React 18", "Vite", "TypeScript", "Tailwind CSS", "Vercel Edge Cloud", "Supabase"],
    "images": [
      "/images/website-development/website-development_1.jpg",
      "/images/website-development/website-development_2.jpg",
      "/images/website-development/website-development_3.jpg"
    ],
    "deliverables": [
      "Custom React 18 + Vite Web Application",
      "100/100 Core Web Vitals Optimization",
      "Flawless Mobile & Desktop UX Design",
      "Structured Schema.org Metadata Integration",
      "Global Edge Cloud Hosting Deployment"
    ],
    "process": [
      { "step": "01", "title": "Wireframing & Funnel Design", "desc": "We architect visual layouts focused on clear hierarchy and frictionless call-to-action paths." },
      { "step": "02", "title": "Clean Code Build", "desc": "We write modular TypeScript code without reliance on bloated third-party plugins." },
      { "step": "03", "title": "Speed Optimization & Launch", "desc": "We run speed benchmarks, configure global CDN caching, and launch your domain." }
    ],
    "faqs": [
      { "q": "Why choose React and Vite over traditional CMS platforms?", "a": "React platforms load in under a second, offer superior security against plugin vulnerabilities, and deliver higher conversion rates." }
    ]
  },
  "seo-geo": {
    "id": "seo-geo",
    "name": "SEO & Technical Search Optimization",
    "headline": "Rank High on Google & Optimize Technical Schema for AI & Traditional Crawlers",
    "problem": "Search engines and AI systems skip websites lacking structured entity data, clear semantic HTML, or fast technical performance.",
    "solution": "We implement comprehensive technical SEO, Schema.org JSON-LD data structures, sitemaps, canonical tagging, and content taxonomy to ensure maximum search visibility.",
    "whoIsItFor": "Local businesses, professional service firms, and online platforms wanting reliable search discovery.",
    "integrations": ["Schema.org", "Google Search Console", "Bing Webmaster Tools", "Sitemap XML", "JSON-LD"],
    "images": [
      "/images/seo-geo/seo-geo_1.jpg",
      "/images/seo-geo/seo-geo_2.jpg"
    ],
    "deliverables": [
      "Complete Technical SEO & Crawlability Audit",
      "Schema.org JSON-LD Integration (Organization, WebSite, Service, FAQ)",
      "Sitemap.xml & Robots.txt Crawler Optimization",
      "Core Web Vitals Technical Performance Tuning",
      "Canonical URL & Semantic HTML Verification"
    ],
    "process": [
      { "step": "01", "title": "Crawlability Inspection", "desc": "We identify and resolve indexation bottlenecks, redirect loops, and missing metadata." },
      { "step": "02", "title": "Schema Injection", "desc": "We inject structured data graphs detailing your business entity, services, and locations." },
      { "step": "03", "title": "Monitoring", "desc": "We submit sitemaps to Google and Bing search consoles to track indexation status." }
    ],
    "faqs": [
      { "q": "What is Schema.org structured data and why is it important?", "a": "Schema.org is a standardized machine-readable format that explicitly informs Google and AI crawlers about your business name, services, location, and official profiles." }
    ]
  },
  "digital-marketing": {
    "id": "digital-marketing",
    "name": "Digital Marketing & Growth Suite",
    "headline": "Data-Driven Customer Acquisition, Content Strategy, and Visual Campaign Management",
    "problem": "Unfocused marketing efforts waste capital on unqualified clicks without building a predictable pipeline.",
    "solution": "We deliver structured B2B acquisition strategies, video editing, social media management, and conversion-focused funnel analytics to scale customer acquisition.",
    "whoIsItFor": "Businesses seeking structured multi-channel digital acquisition and professional content production.",
    "integrations": ["Meta Ads Manager", "Google Ads", "LinkedIn Campaign Manager", "Analytics"],
    "images": [
      "/images/digital-marketing/digital-marketing_1.jpg",
      "/images/digital-marketing/digital-marketing_2.jpg"
    ],
    "deliverables": [
      "Targeted Customer Acquisition Strategy",
      "Short & Long-Form Video Content Editing",
      "Social Media Platform Management",
      "Reputation Management & Feedback Collection",
      "Monthly Conversion Attribution Reports"
    ],
    "process": [
      { "step": "01", "title": "Audience Profiling", "desc": "We identify ideal customer profiles, buying intent triggers, and competitive positioning." },
      { "step": "02", "title": "Creative Asset Production", "desc": "We edit high-impact video creatives and design visual campaign collateral." },
      { "step": "03", "title": "Campaign Optimization", "desc": "We continuously analyze conversion metrics to optimize client acquisition cost." }
    ],
    "faqs": [
      { "q": "How do you measure marketing performance?", "a": "We focus on tangible business outcomes: cost per qualified lead, conversion rate, and pipeline growth." }
    ]
  },
  "meta-ads": {
    "id": "meta-ads",
    "name": "Meta Ads & Paid Social Acquisition",
    "headline": "Scale Targeted Lead Acquisition Across Facebook and Instagram",
    "problem": "Generic ad copy and broad targeting waste budget on low-quality leads that never convert.",
    "solution": "We engineer high-converting Meta ad campaigns utilizing audience profiling, custom video creatives, lead forms, and pixel attribution tracking.",
    "whoIsItFor": "D2C brands, local service providers, real estate firms, and B2B services wanting predictable lead generation.",
    "integrations": ["Meta Pixel", "Facebook Lead Ads", "Custom Audience API", "Zapier"],
    "images": [
      "/images/digital-marketing/digital-marketing_3.jpg"
    ],
    "deliverables": [
      "Meta Campaign Architecture & Funnel Design",
      "High-Converting Ad Copy & Video Creatives",
      "Custom & Lookalike Audience Setup",
      "Automated Lead Form Instant Sync",
      "Weekly Ad Performance Reports"
    ],
    "process": [
      { "step": "01", "title": "Funnel Strategy", "desc": "We map out high-converting audience segments and lead capture hooks." },
      { "step": "02", "title": "Creative Testing", "desc": "We test multiple visual formats and angles to identify winning ad creatives." },
      { "step": "03", "title": "Scale & Optimize", "desc": "We allocate budget to top-performing campaigns and continuously refine cost per lead." }
    ],
    "faqs": [
      { "q": "How quickly do Meta ad campaigns produce lead data?", "a": "Meta ad campaigns begin delivering lead data within 24 to 48 hours after campaign approval and activation." }
    ]
  },
  "google-ads": {
    "id": "google-ads",
    "name": "Google Ads & PPC Search Marketing",
    "headline": "Capture High-Intent Customers Searching Active Buying Keywords on Google",
    "problem": "Bidding on broad keywords burns ad budget on casual browsers instead of motivated buyers.",
    "solution": "We build search engine marketing campaigns focused on exact-intent keywords, negative keyword lists, tight ad groups, and conversion-optimized landing pages.",
    "whoIsItFor": "High-ticket service providers, B2B companies, and local firms targeting active search queries.",
    "integrations": ["Google Search Ads", "Google Conversion Tracking", "Google Tag Manager", "Google Analytics 4"],
    "images": [
      "/images/digital-marketing/digital-marketing_4.jpg"
    ],
    "deliverables": [
      "High-Intent Keyword & Competitor Research",
      "Single-Theme Ad Group Architecture",
      "Negative Keyword List Optimization",
      "Google Conversion Tag Integration",
      "ROI & Cost-Per-Acquisition Reporting"
    ],
    "process": [
      { "step": "01", "title": "Keyword Audit", "desc": "We isolate high-conversion search queries with clear commercial purchasing intent." },
      { "step": "02", "title": "Ad Writing & Setup", "desc": "We craft compelling search ads highlighting your distinct business advantages." },
      { "step": "03", "title": "Bid Management", "desc": "We monitor search terms daily to refine bid strategies and eliminate wasted spend." }
    ],
    "faqs": [
      { "q": "Why is negative keyword management critical for Google Ads?", "a": "Negative keywords block irrelevant search queries, preventing wasted ad spend on job seekers, free searches, or unrelated topics." }
    ]
  },
  "ecommerce-development": {
    "id": "ecommerce-development",
    "name": "E-Commerce Development & Catalogs",
    "headline": "High-Converting Online Stores, WhatsApp Product Catalogs & Instant UPI Checkout",
    "problem": "Generic slow storefronts, high commission fees from third-party marketplace platforms, and clunky mobile checkouts hurt conversion and profit margins.",
    "solution": "Conflux AI develops high-performance custom e-commerce platforms and automated WhatsApp digital product catalogs integrated with instant UPI payment gateways and real-time inventory synchronization.",
    "whoIsItFor": "D2C brands, retailers, agro-producers, handicraft artisans, and wholesale merchants looking for direct customer sales without marketplace commissions.",
    "integrations": ["Shopify", "WooCommerce", "Razorpay", "PhonePe", "Cashfree", "WhatsApp Business API", "Stripe", "Supabase"],
    "images": [
      "/images/website-development/website-development_1.jpg",
      "/images/website-development/website-development_2.jpg"
    ],
    "deliverables": [
      "Sub-Second Mobile Storefront with Instant Search",
      "Interactive WhatsApp Product Catalog & Checkout Bot",
      "RBI-Compliant UPI & Card Payment Gateway Integration",
      "Automated Order Ingestion & WhatsApp Dispatch Receipts",
      "Custom Inventory & Pricing Management Dashboard"
    ],
    "process": [
      { "step": "01", "title": "Catalog & Architecture", "desc": "We organize your product inventory, SKU variants, pricing tiers, and mobile checkout flow." },
      { "step": "02", "title": "Payment & Webhook Setup", "desc": "We integrate secure UPI QR payment links and automated order receipt webhooks." },
      { "step": "03", "title": "Speed Optimization & Launch", "desc": "We test mobile load times across 4G networks, configure global CDN caching, and deploy live." }
    ],
    "faqs": [
      { "q": "Can customers purchase directly through WhatsApp without installing an app?", "a": "Yes. Conflux AI builds interactive WhatsApp catalogs with button-based selection and automated UPI payment links that allow buyers to complete purchases in under 30 seconds." },
      { "q": "Which Indian payment gateways are supported?", "a": "We integrate all leading Indian payment gateways including Razorpay, PhonePe PG, Cashfree, and Paytm for instant UPI, Debit/Credit card, and Net Banking payments." }
    ]
  }
};

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const service = serviceId ? SERVICE_DETAILS[serviceId] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (service) {
      document.title = `${service.name} | Conflux AI`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', service.headline);
      }
      const canonicalUrl = `https://confluxai.in/services/${service.id}`;
      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonicalUrl);
    }
  }, [serviceId, service]);

  if (!service) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 text-center bg-white flex flex-col items-center justify-center gap-6 font-inter">
        <h1 className="text-4xl font-black text-slate-900 font-orbitron">Service Not Found</h1>
        <p className="text-slate-500 max-w-md">The service page you are looking for may have been moved or updated.</p>
        <Link to="/solutions" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">
          Explore All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 font-inter">
      {/* Schema.org JSON-LD Service & Breadcrumb Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "name": service.name,
              "provider": {
                "@type": "Organization",
                "name": "Conflux AI",
                "url": "https://confluxai.in/"
              },
              "serviceType": service.name,
              "description": service.headline,
              "areaServed": "Worldwide"
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" },
                { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://confluxai.in/solutions" },
                { "@type": "ListItem", "position": 3, "name": service.name, "item": `https://confluxai.in/services/${service.id}` }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": service.faqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a }
              }))
            }
          ]
        })}
      </script>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Back Link */}
        <Link to="/solutions" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-10 hover:gap-3 transition-all">
          <ArrowLeft size={14} /> Return to Capabilities Overview
        </Link>

        {/* Hero Header */}
        <div className="max-w-4xl mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold tracking-widest uppercase mb-6 inline-block">
            Commercial Solution
          </span>
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            {service.name}
          </h1>
          <p className="text-xl md:text-2xl font-bold text-slate-600 leading-snug">
            {service.headline}
          </p>
        </div>

        {/* Problem vs Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 md:p-10 rounded-3xl bg-slate-50 border border-slate-200">
            <h2 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck size={16} /> Operational Bottleneck
            </h2>
            <p className="text-slate-700 font-medium text-base md:text-lg leading-relaxed">
              {service.problem}
            </p>
          </div>
          <div className="p-8 md:p-10 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/20">
            <h2 className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={16} className="text-yellow-300" /> Conflux AI Implementation
            </h2>
            <p className="text-blue-50 font-medium text-base md:text-lg leading-relaxed">
              {service.solution}
            </p>
          </div>
        </div>

        {/* Target Audience & Integrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 rounded-3xl bg-white border border-slate-200">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users size={16} /> Suitable For
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {service.whoIsItFor}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Cpu size={16} /> Supported Integrations & Stack
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {service.integrations.map((tech, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900 tracking-tight mb-8">
            Core Scope & Deliverables
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.deliverables.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="font-bold text-slate-800 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Gallery */}
        {service.images && service.images.length > 0 && (
          <div className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 inline-block">Architecture & System Proof</span>
                <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
                  Visual Implementation Previews
                </h2>
              </div>
              <p className="text-slate-500 text-sm max-w-md">System visual schematics, dashboard previews, and interface mockups.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.images.map((imgUrl, i) => (
                <div key={i} className="group relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                  <img 
                    src={imgUrl} 
                    alt={`${service.name} Asset ${i + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <span className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-lg">
                      Preview Architecture #{i + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900 tracking-tight mb-10">
            Step-by-Step Delivery Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.process.map((step, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-slate-200 relative">
                <span className="text-4xl font-black text-blue-600/20 mb-4 block font-orbitron">{step.step}</span>
                <h3 className="font-bold text-slate-900 text-base mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-20 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900 tracking-tight mb-8 flex items-center gap-3">
            <HelpCircle className="text-blue-600" /> Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {service.faqs.map((faq, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base md:text-lg mb-3">{faq.q}</h3>
                <p className="text-slate-600 font-normal text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Conversion Box */}
        <div className="p-10 md:p-14 rounded-3xl bg-slate-950 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 block">Get Started Today</span>
            <h3 className="text-3xl md:text-4xl font-bold font-orbitron tracking-tight mb-6">
              Implement {service.name}
            </h3>
            <p className="text-slate-300 font-normal text-base md:text-lg mb-8 leading-relaxed">
              Schedule a technical consultation or request a custom implementation plan from Conflux AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={`https://wa.me/918972517557?text=Hi%20Conflux%20AI,%20I%20want%20to%20discuss%20${encodeURIComponent(service.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30"
              >
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>
              <Link 
                to="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-3"
              >
                Submit Project Request <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
