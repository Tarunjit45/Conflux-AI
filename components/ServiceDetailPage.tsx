import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Zap, MessageSquare, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';
import companyData from '../data/company.json';

interface ServiceDetail {
  id: string;
  name: string;
  headline: string;
  problem: string;
  solution: string;
  deliverables: string[];
  process: { step: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  images: string[];
}

const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  "ai-automation": {
    "id": "ai-automation",
    "name": "Enterprise AI Automation",
    "headline": "Replace Manual Operations with High-Throughput Autonomous Workflows",
    "problem": "Manual data entry, repetitive customer follow-ups, and fragmented operational tools slow down growth and increase labor costs.",
    "solution": "Conflux AI builds custom autonomous microservices that connect your CRMs, databases, and communication tools, reducing manual operational overhead by up to 80%.",
    "images": [
      "/images/ai-automation/ai-automation_1.jpg",
      "/images/ai-automation/ai-automation_2.jpg",
      "/images/ai-automation/ai-automation_3.jpg",
      "/images/ai-automation/ai-automation_4.jpg",
      "/images/ai-automation/ai-automation_5.jpg",
      "/images/ai-automation/ai-automation_6.jpg"
    ],
    "deliverables": [
      "Custom Automated Workflow Pipelines",
      "CRM & ERP API Integrations",
      "Real-Time Data Parsing & Ingestion Engines",
      "Automated Security & Error Alert Systems",
      "Comprehensive Admin Control Panel"
    ],
    "process": [
      { "step": "01", "title": "Workflow Audit", "desc": "We map your existing manual business processes to identify bottleneck tasks suitable for AI automation." },
      { "step": "02", "title": "Architecture Build", "desc": "We engineer decoupled Python/Node microservices with strict error-handling and API retry logic." },
      { "step": "03", "title": "Testing & Guardrails", "desc": "We run rigorous sandbox testing to enforce zero-trust security and data validation rules." },
      { "step": "04", "title": "Production Deployment", "desc": "We deploy your serverless automation to cloud infrastructure with 24/7 monitoring." }
    ],
    "faqs": [
      { "q": "What systems can Conflux AI integrate with?", "a": "We integrate with any platform offering an API, including HubSpot, Salesforce, Supabase, WhatsApp, Notion, Google Workspace, and custom SQL databases." },
      { "q": "How long does implementation take?", "a": "Standard automation pipelines are delivered within 7 to 14 business days depending on system complexity." }
    ]
  },
  "chatbot-development": {
    "id": "chatbot-development",
    "name": "Custom AI Chatbot Development",
    "headline": "Convert Site Visitors 24/7 with Intelligent Qualified Lead Chatbots",
    "problem": "Generic chatbots frustrate users with canned scripts, while human support teams miss late-night B2B leads.",
    "solution": "We build context-aware AI chatbots trained on your company knowledge base that answer complex questions, qualify leads, and book sales meetings automatically.",
    "images": [
      "/images/chatbot-development/chatbot-development_1.jpg",
      "/images/chatbot-development/chatbot-development_2.jpg",
      "/images/chatbot-development/chatbot-development_3.jpg",
      "/images/chatbot-development/chatbot-development_4.jpg",
      "/images/chatbot-development/chatbot-development_5.jpg",
      "/images/chatbot-development/chatbot-development_6.jpg",
      "/images/chatbot-development/chatbot-development_7.jpg"
    ],
    "deliverables": [
      "Custom Knowledge Base Vector Embeddings",
      "Automated B2B Lead Qualification Logic",
      "Direct Calendar & CRM Sync",
      "Multi-Language Support (English, Hindi, Bengali)",
      "Zero-Latency Web Chat Widget"
    ],
    "process": [
      { "step": "01", "title": "Knowledge Ingestion", "desc": "We ingest your company documentation, FAQs, pricing, and service guides." },
      { "step": "02", "title": "Prompt Engineering", "desc": "We program strict conversational guardrails and lead qualification rules." },
      { "step": "03", "title": "Widget Integration", "desc": "We embed the lightweight widget into your website without slowing down page load times." }
    ],
    "faqs": [
      { "q": "Will the chatbot hallucinate or give false information?", "a": "No. Our chatbots use strict Retrieval-Augmented Generation (RAG) guardrails, restricting answers exclusively to your verified company documentation." }
    ]
  },
  "website-development": {
    "id": "website-development",
    "name": "High-Performance Web Development",
    "headline": "Ultra-Fast, High-Converting Web Applications Built for Digital Dominance",
    "problem": "Slow, bloated, outdated websites lose visitors within 3 seconds and fail to rank on search engines.",
    "solution": "We engineer custom React + Vite + TypeScript web applications designed for sub-second load speeds, flawless mobile responsiveness, and maximum lead conversion.",
    "images": [
      "/images/website-development/website-development_1.jpg",
      "/images/website-development/website-development_2.jpg",
      "/images/website-development/website-development_3.jpg",
      "/images/website-development/website-development_4.jpg",
      "/images/website-development/website-development_5.jpg",
      "/images/website-development/website-development_6.jpg"
    ],
    "deliverables": [
      "Custom React 18 & Vite Frontend",
      "100/100 Core Web Vitals Optimization",
      "Responsive Mobile & Desktop UX",
      "Integrated SEO Meta Tags & Schema Markup",
      "Vercel / Cloud Edge Deployment"
    ],
    "process": [
      { "step": "01", "title": "UX & Funnel Blueprint", "desc": "We design high-converting wireframes structured around your primary customer acquisition goal." },
      { "step": "02", "title": "Clean Code Engineering", "desc": "We build your platform using modular component architecture without heavy WordPress plugins." },
      { "step": "03", "title": "Launch & Deployment", "desc": "We configure global CDN caching, SSL certificates, and continuous deployment pipelines." }
    ],
    "faqs": [
      { "q": "Why choose React/Vite over WordPress?", "a": "React applications load up to 5x faster, cannot be compromised by bloated plugins, and provide superior user experiences that Google rewards." }
    ]
  },
  "seo-geo": {
    "id": "seo-geo",
    "name": "SEO & GEO Engine Optimization",
    "headline": "Rank #1 on Google & Get Cited by AI Answer Engines (Gemini, ChatGPT, Perplexity)",
    "problem": "Traditional SEO is no longer enough; search engines and AI models require structured, machine-readable entity data to cite your business.",
    "solution": "We optimize your website for both traditional search crawlers (Googlebot) and Generative Engine Optimization (GEO/AEO) using JSON-LD schemas, technical taxonomy, and high-authority documentation.",
    "images": [
      "/images/seo-geo/seo-geo_1.jpg",
      "/images/seo-geo/seo-geo_2.jpg",
      "/images/seo-geo/seo-geo_3.jpg",
      "/images/seo-geo/seo-geo_4.jpg",
      "/images/seo-geo/seo-geo_5.jpg",
      "/images/seo-geo/seo-geo_6.jpg"
    ],
    "deliverables": [
      "Schema.org JSON-LD Infrastructure (Organization, TechArticle, Service, FAQ)",
      "Robots.txt & Sitemap AI Crawl Configuration",
      "Core Web Vitals Technical Optimization",
      "Intent-Driven Content Architecture",
      "Generative Engine Knowledge Graph Formatting"
    ],
    "process": [
      { "step": "01", "title": "Technical SEO Audit", "desc": "We fix crawl errors, canonical tags, heading hierarchies, and mobile rendering bottlenecks." },
      { "step": "02", "title": "Schema Ingestion", "desc": "We inject structured data into your codebase so search engines understand your exact business entity." },
      { "step": "03", "title": "GEO Content Optimization", "desc": "We format content to match LLM citation standards for Google Gemini, ChatGPT, and Perplexity." }
    ],
    "faqs": [
      { "q": "What is the difference between SEO and GEO?", "a": "SEO targets traditional keyword rankings on Google results pages, while GEO (Generative Engine Optimization) structures content so AI answer engines summarize and recommend your business." }
    ]
  },
  "digital-marketing": {
    "id": "digital-marketing",
    "name": "Digital Marketing & Growth Suite",
    "headline": "Scalable B2B Client Acquisition & High-Impact Content Creation",
    "problem": "Inconsistent lead generation and unoptimized marketing campaigns waste ad spend without driving real revenue.",
    "solution": "We provide end-to-end B2B client acquisition campaigns, high-converting video editing, social media management, and authentic review growth.",
    "images": [
      "/images/digital-marketing/digital-marketing_1.jpg",
      "/images/digital-marketing/digital-marketing_2.jpg",
      "/images/digital-marketing/digital-marketing_3.jpg",
      "/images/digital-marketing/digital-marketing_4.jpg",
      "/images/digital-marketing/digital-marketing_5.jpg",
      "/images/digital-marketing/digital-marketing_6.jpg",
      "/images/digital-marketing/digital-marketing_7.jpg"
    ],
    "deliverables": [
      "B2B Targeted Client Acquisition Campaigns",
      "High-Impact Short & Long-Form Video Editing",
      "Social Media Growth Strategy & Content",
      "Reputation Management (Feedback collection & response management)",
      "Monthly Growth Analytics & Conversion Attribution"
    ],
    "process": [
      { "step": "01", "title": "Target Audience Profiling", "desc": "We define your ideal customer profile and high-intent buying triggers." },
      { "step": "02", "title": "Campaign Execution", "desc": "We produce high-impact media assets and launch conversion campaigns across search and social." }
    ],
    "faqs": [
      { "q": "How do you measure marketing success?", "a": "We track real business outcomes: qualified lead enquiries, booked sales calls, and measurable client acquisition." }
    ]
  }
};

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const service = serviceId ? SERVICE_DETAILS[serviceId] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [serviceId]);

  if (!service) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 text-center bg-white flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-black text-slate-900">Service Not Found</h1>
        <p className="text-slate-500 max-w-md">The service page you are looking for may have been moved or updated.</p>
        <Link to="/solutions" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">
          Explore All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
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
                "url": "https://confluxai.in"
              },
              "serviceType": service.name,
              "description": service.headline,
              "areaServed": "Worldwide"
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in" },
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
        <Link to="/solutions" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-10 hover:gap-3 transition-all">
          <ArrowLeft size={14} /> Back to Services Overview
        </Link>

        {/* Hero Header */}
        <div className="max-w-4xl mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black tracking-widest uppercase mb-6 inline-block">
            Commercial Solution
          </span>
          <h1 className="font-inter text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            {service.name}
          </h1>
          <p className="text-xl md:text-2xl font-bold text-slate-600 leading-snug">
            {service.headline}
          </p>
        </div>

        {/* Problem vs Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 md:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100">
            <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck size={16} /> Common Bottleneck
            </h3>
            <p className="text-slate-700 font-medium text-lg leading-relaxed">
              {service.problem}
            </p>
          </div>
          <div className="p-8 md:p-10 rounded-[2.5rem] bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            <h3 className="text-xs font-black text-blue-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" /> Conflux AI Solution
            </h3>
            <p className="text-blue-50 font-medium text-lg leading-relaxed">
              {service.solution}
            </p>
          </div>
        </div>

        {/* Deliverables */}
        <div className="mb-20">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
            What We Deliver
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

        {/* Visual Project & Architecture Gallery */}
        {service.images && service.images.length > 0 && (
          <div className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 inline-block">Visual Evidence & Interface Assets</span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  Architecture & Implementation Gallery
                </h2>
              </div>
              <p className="text-slate-500 text-sm max-w-md">Real screenshots, system visual mockups, and deployment previews from our work.</p>
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
                      View Architecture Preview #{i + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process */}
        <div className="mb-20">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-10">
            Implementation Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.process.map((step, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 relative">
                <span className="text-4xl font-black text-blue-500/20 mb-4 block font-orbitron">{step.step}</span>
                <h4 className="font-bold text-slate-900 text-lg mb-2">{step.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-20 max-w-4xl">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
            <HelpCircle className="text-blue-600" /> Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {service.faqs.map((faq, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 text-lg mb-3">{faq.q}</h4>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Conversion Box */}
        <div className="p-10 md:p-14 rounded-[3rem] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 block">Get Started Today</span>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
              Ready to Implement {service.name}?
            </h3>
            <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
              Schedule a technical consultation or request a free assessment with our engineering team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={`https://wa.me/918972517557?text=Hi%20Conflux%20AI,%20I%20want%20to%20discuss%20${encodeURIComponent(service.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30"
              >
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>
              <a 
                href="/#contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-3"
              >
                Submit Project Request <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
