// Conflux Platform — Solutions & Capabilities Overview

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  TrendingUp, 
  Sparkles,
  Phone,
  Bot,
  Building2,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

const servicesList = [
  {
    id: "local-visibility-seo",
    name: "Local Search & Entity Graph Optimization",
    tagline: "Google Search, Local Maps & Schema.org JSON-LD",
    description: "We optimize your local business presence for Google search and Maps using Schema.org LocalBusiness JSON-LD markup, geographic coordinates, and district corridor alignment.",
    image: "/images/seo-geo/seo-geo_1.jpg",
    icon: Globe,
    points: [
      "Schema.org LocalBusiness & PostalAddress JSON-LD",
      "Google Maps & Corridor NAP Synchronization",
      "Granular Service & Category Taxonomy",
      "District Directory & Regional Hub Linking"
    ],
    diagram: "Local Query → Structured LocalBusiness Node → Search Ranking → Customer Lead"
  },
  {
    id: "ai-search-geo",
    name: "AI Search Readiness (GEO / AEO)",
    tagline: "ChatGPT, Google Gemini & Perplexity Answer Modeling",
    description: "We structure your business entity data into concise, factual question-answer blocks and Schema.org FAQPage markup so AI models can cite, quote, and recommend your services.",
    image: "/images/chatbot-development/chatbot-development_1.jpg",
    icon: Bot,
    points: [
      "Entity Disambiguation & Knowledge Graph Cards",
      "FAQPage Structured Answer Embedding",
      "Machine-Readable Capability Endpoints (CALL, WHATSAPP)",
      "Zero Hallucination Factual Q&A Architecture"
    ],
    diagram: "AI Prompt → Entity Knowledge Card → Accurate AI Citation → Direct Contact"
  },
  {
    id: "evidence-verification",
    name: "Evidence Synthesis & Conflux Verified Badges",
    tagline: "Statutory Registry Provenance & Trust Certification",
    description: "We connect your business claims to official primary registries (MCA, GSTIN, FSSAI, MSME Udyam) and certify authentic storefront photography to build unshakeable buyer trust.",
    image: "/images/ai-automation/ai-automation_1.jpg",
    icon: ShieldCheck,
    points: [
      "Statutory Registration Docket Cross-Referencing",
      "Public Evidence-Linked Conflux Verified Badge",
      "Original Storefront & Proprietor Photo Certification",
      "Transparent 0–100 Confidence Scoring"
    ],
    diagram: "Business Claim → Official Registry Docket → Evidence Audit → Verified Trust Badge"
  },
  {
    id: "whatsapp-speed-to-lead",
    name: "WhatsApp Speed-to-Lead & Mobile Routing",
    tagline: "Direct 1-Tap Mobile Lead Conversion Funnels",
    description: "Over 82% of local business inquiries initiate on mobile. We integrate 1-tap WhatsApp click-to-chat funnels and smart call routing that turn search visitors into paying customers instantly.",
    image: "/images/digital-marketing/digital-marketing_1.jpg",
    icon: Phone,
    points: [
      "1-Click Direct WhatsApp Inquiry Funnels",
      "Smart Mobile Call & Booking Routing",
      "Automated Speed-to-Lead Telemetry",
      "Zero Friction Lead Notification Alerts"
    ],
    diagram: "Search Visitor → 1-Click WhatsApp CTA → Instant Conversation → Paying Customer"
  },
  {
    id: "canonical-web-nodes",
    name: "High-Speed Canonical Business Web Platforms",
    tagline: "Sub-Second React 18 & Edge Cloud Delivery",
    description: "We engineer lightweight, sub-second web platforms with 100/100 Core Web Vitals, zero bloat, and automated search engine sitemaps designed for maximum mobile conversion.",
    image: "/images/website-development/website-development_1.jpg",
    icon: Zap,
    points: [
      "Sub-Second React + Vite Edge Delivery",
      "100/100 Core Web Vitals Performance",
      "Automated XML Sitemaps & Canonical URLs",
      "Zero Bloat Accessible UI Design"
    ],
    diagram: "Customer Visit → Sub-Second Load → Clear Evidence → Immediate Conversion"
  },
  {
    id: "lead-telemetry-growth",
    name: "Lead Telemetry & Transparent Growth Tracking",
    tagline: "Verified Search Console & Inquiry Measurement",
    description: "We provide honest, evidence-based performance tracking with real Google Search Console query metrics and phone/WhatsApp click telemetry—with zero fabricated data.",
    image: "/images/ai-automation/ai-automation_1.jpg",
    icon: TrendingUp,
    points: [
      "Verified Google Search Console Integration",
      "Real Click-to-Call & WhatsApp Lead Tracking",
      "Crawl & Indexing Health Monitoring",
      "Zero Synthetic or Fabricated Metrics"
    ],
    diagram: "Real Search Impressions → Click Telemetry → Inbound Inquiry → Business Revenue"
  }
];

function Zap(props: any) {
  return <Sparkles {...props} />;
}

export const SolutionsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-inter text-slate-900">
      <div className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={14} /> Return to Home
        </Link>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-3xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider inline-block">
              Platform Solutions &amp; Capabilities
            </span>
            <h1 className="font-orbitron text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
              Engineered for <span className="text-blue-600">Visibility</span>, Trust &amp; Leads.
            </h1>
            <p className="text-slate-600 font-normal text-base sm:text-lg leading-relaxed">
              We make local businesses discoverable across Google and AI search engines, trusted through primary evidence verification, and contactable through high-converting mobile lead channels.
            </p>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold shrink-0">
            <ShieldCheck size={18} className="text-emerald-600" />
            "Audit &rarr; Fix &rarr; Monitor &rarr; Grow"
          </div>
        </div>

        {/* 6 Core Solutions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {servicesList.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-6">
                  {/* Icon & Title */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Icon size={24} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">0{index + 1}</span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-bold font-orbitron text-slate-900 group-hover:text-blue-600 transition-colors">
                      {service.name}
                    </h2>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">
                      {service.tagline}
                    </p>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {service.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {service.points.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  {/* Architecture Diagram */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600">
                    <span className="font-bold text-slate-800 block mb-0.5">Execution Flow:</span>
                    {service.diagram}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <Link
                    to="/business/audit"
                    className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-all group-hover:gap-3"
                  >
                    <span>Audit My Business</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Call to Action Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold font-orbitron">
              Ready to verify and grow your business visibility?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Run our free evidence-based audit or list your business directly to start receiving verified customer leads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <Link
              to="/business/audit"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-lg"
            >
              Check Visibility Free
            </Link>
            <Link
              to="/list-business"
              className="px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-lg"
            >
              List Business Now
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SolutionsPage;
