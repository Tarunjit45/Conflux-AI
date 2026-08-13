import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, MessageSquare, ExternalLink, ArrowLeft, ArrowRight, CheckCircle2, Globe, Smartphone, Bot, Cpu, Search, Share2, BarChart } from 'lucide-react';
import { trackLocationEvent } from '../../lib/locationAnalytics';

const RuralDigitalSolutionsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Digital Solutions for Businesses Across West Bengal | Conflux AI';

    // Dynamic Canonical Management
    const canonicalUrl = 'https://confluxai.in/services/digital-solutions-west-bengal';
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    trackLocationEvent('page_view', 'services/digital-solutions-west-bengal');
  }, []);

  const capabilities = [
    { icon: <Globe className="text-blue-600" />, title: "Website Development", desc: "Sub-second React platforms optimized for mobile connections and local search." },
    { icon: <Smartphone className="text-emerald-600" />, title: "WhatsApp Business Automation", desc: "Speed-to-lead bots that respond in 5 seconds and send product catalogs on WhatsApp." },
    { icon: <Bot className="text-purple-600" />, title: "24/7 AI Chatbots", desc: "Context-aware chatbots trained exclusively on your business prices, products, and services." },
    { icon: <Search className="text-orange-500" />, title: "SEO & Search Engine Visibility", desc: "Schema.org structured data helping local businesses rank high on Google and AI search engines." },
    { icon: <Cpu className="text-cyan-600" />, title: "Workflow Automation", desc: "Connect forms, Google Sheets, WhatsApp, and CRMs into unified automated pipelines." },
    { icon: <Share2 className="text-indigo-600" />, title: "Digital Marketing & Creatives", desc: "Data-driven B2B lead generation, video editing, social media, and customer review systems." }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 font-inter">
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://confluxai.in/services/digital-solutions-west-bengal#webpage",
              "url": "https://confluxai.in/services/digital-solutions-west-bengal",
              "name": "Digital Solutions for Businesses Across West Bengal | Conflux AI",
              "description": "Conflux AI provides remote-first digital solutions, website development, WhatsApp automation, and AI chatbots for small and medium businesses outside major cities across West Bengal.",
              "publisher": { "@type": "Organization", "name": "Conflux AI", "url": "https://confluxai.in/" }
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" },
                { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://confluxai.in/solutions" },
                { "@type": "ListItem", "position": 3, "name": "Digital Solutions Across West Bengal", "item": "https://confluxai.in/services/digital-solutions-west-bengal" }
              ]
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
            Evergreen Business Solutions • Statewide Coverage
          </span>
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            Digital Solutions for Businesses <span className="text-blue-600">Across West Bengal</span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed mb-8">
            You do not need to be located in Kolkata to build a high-converting digital presence or implement AI-powered automation. Conflux AI partners remotely with growing enterprises, retail merchants, coaching institutes, and local service providers across all districts of West Bengal.
          </p>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              <strong className="block text-slate-900 font-bold mb-1">Remote-First Operational Proposition</strong>
              Conflux AI is based in Kolkata, West Bengal, and operates a 100% remote collaboration framework. We do not claim local physical offices in sub-locations. Our team conducts workflow audits via video sessions, designs custom cloud software, and deploys production systems remotely to your business.
            </div>
          </div>
        </div>

        {/* Core Digital Stack Grid */}
        <div className="mb-20">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 inline-block">Full-Stack Digital Capabilities</span>
            <h2 className="text-3xl font-bold font-orbitron text-slate-900">
              What Conflux AI Builds for West Bengal Small Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  {cap.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{cap.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Realistic Business Use Cases */}
        <div className="mb-20">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 inline-block">Realistic Business Scenarios</span>
            <h2 className="text-3xl font-bold font-orbitron text-slate-900">
              How Regional Businesses Transform Operations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">Retail & Garment Merchants</span>
              <h3 className="text-xl font-bold text-slate-900">Suburban Clothing & Saree Store</h3>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-600" /> WhatsApp Digital Product Catalog</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-600" /> Instant Stock Inquiries & Orders</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-600" /> Google Search & Map Listing</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-600" /> Simple Mobile Website</li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">Coaching & Tutorials</span>
              <h3 className="text-xl font-bold text-slate-900">Private Coaching Institutes</h3>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Automated Admission Lead Intake</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> WhatsApp Fee & Schedule Bot</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Batch Reminder Notifications</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Lead Routing into Google Sheets</li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">Local Restaurants & Hospitality</span>
              <h3 className="text-xl font-bold text-slate-900">Regional Restaurants & Hotels</h3>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-600" /> Mobile Menu & Specials Showcase</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-600" /> WhatsApp Direct Order Placement</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-600" /> Room Availability & Reservation Bot</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-600" /> Automated Customer Reviews Flow</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Educational Resource Link */}
        <div className="mb-20 p-8 rounded-3xl bg-blue-50/70 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-2 inline-block">Free Educational Resource</span>
            <h3 className="text-2xl font-bold font-orbitron text-slate-900">How Small Businesses in West Bengal Build Digital Presence</h3>
            <p className="text-slate-600 text-sm mt-1">Read our comprehensive 11-step educational guide covering websites, WhatsApp, Google visibility, and automation.</p>
          </div>
          <Link
            to="/blog/guide-how-small-businesses-in-west-bengal-build-digital-presence"
            className="px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            Read Educational Guide <ArrowRight size={14} />
          </Link>
        </div>

        {/* CTA Conversion Box */}
        <div className="p-10 md:p-14 rounded-3xl bg-slate-950 text-white shadow-2xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 block">Get Started Today</span>
            <h3 className="text-3xl md:text-4xl font-bold font-orbitron mb-6">
              Partner with Conflux AI Remotely
            </h3>
            <p className="text-slate-300 text-base mb-8 leading-relaxed font-normal">
              Wherever your business is located in West Bengal, our technical team will collaborate with you remotely to build your digital presence and implement AI automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/918972517557?text=Hi%20Conflux%20AI,%20I%20want%20to%20discuss%20digital%20solutions%20for%20my%20business."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLocationEvent('whatsapp_click', 'services/digital-solutions-west-bengal')}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30"
              >
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>
              <Link
                to="/contact"
                onClick={() => trackLocationEvent('contact_click', 'services/digital-solutions-west-bengal')}
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

export default RuralDigitalSolutionsPage;
