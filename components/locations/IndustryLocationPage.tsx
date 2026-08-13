import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { INDUSTRY_LOCATION_COMBINATIONS } from '../../data/locationsData';
import { ArrowLeft, ArrowRight, ShieldCheck, Zap, MessageSquare, ExternalLink, CheckCircle2, Building2 } from 'lucide-react';
import { trackLocationEvent } from '../../lib/locationAnalytics';

const IndustryLocationPage: React.FC = () => {
  const { citySlug, industrySlug } = useParams<{ citySlug: string; industrySlug: string }>();
  const combinedSlug = `${citySlug}/${industrySlug}`;
  
  const item = INDUSTRY_LOCATION_COMBINATIONS.find(i => i.slug === combinedSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (item) {
      document.title = item.metaTitle || `${item.displayName} | Conflux AI`;
      
      const canonicalUrl = `https://confluxai.in/locations/west-bengal/${item.slug}`;
      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonicalUrl);

      trackLocationEvent('page_view', `locations/west-bengal/${item.slug}`);
    }
  }, [citySlug, industrySlug, item]);

  if (!item || item.status !== 'PUBLISHED') {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 text-center bg-white flex flex-col items-center justify-center gap-6 font-inter">
        <h1 className="text-4xl font-black text-slate-900 font-orbitron">Industry Solution Not Found</h1>
        <p className="text-slate-500 max-w-md">The requested sector solution page is not available or is under review.</p>
        <Link to="/locations/west-bengal" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">
          Return to West Bengal Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 font-inter">
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `https://confluxai.in/locations/west-bengal/${item.slug}#webpage`,
              "url": `https://confluxai.in/locations/west-bengal/${item.slug}`,
              "name": item.metaTitle,
              "description": item.metaDescription,
              "publisher": { "@type": "Organization", "name": "Conflux AI", "url": "https://confluxai.in/" }
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" },
                { "@type": "ListItem", "position": 2, "name": "West Bengal", "item": "https://confluxai.in/locations/west-bengal" },
                { "@type": "ListItem", "position": 3, "name": item.displayName, "item": `https://confluxai.in/locations/west-bengal/${item.slug}` }
              ]
            }
          ]
        })}
      </script>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-8 uppercase tracking-wider">
          <Link to="/locations/west-bengal" className="text-blue-600 hover:underline">West Bengal</Link>
          <span>/</span>
          <span className="text-slate-900">{item.displayName}</span>
        </div>

        {/* Hero Header */}
        <div className="max-w-4xl mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold tracking-widest uppercase mb-6 inline-block">
            High-Intent Sector Architecture
          </span>
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            {item.h1Title}
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed mb-8">
            {item.summary}
          </p>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              <strong className="block text-slate-900 font-bold mb-1">Remote AI Engineering Partnership</strong>
              Conflux AI delivers custom autonomous agents, official WhatsApp API bots, and cloud-hosted CRM workflow integrations to sector operators across West Bengal.
            </div>
          </div>
        </div>

        {/* Sector Use Cases */}
        {item.useCases && item.useCases.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold font-orbitron text-slate-900 mb-8">
              Targeted Workflow Use Cases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {item.useCases.map((uc, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">{uc.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{uc.description}</p>
                  <div className="p-4 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
                    Business Impact: {uc.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Box */}
        <div className="p-10 md:p-14 rounded-3xl bg-slate-950 text-white shadow-2xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 block">Get Started Today</span>
            <h3 className="text-3xl md:text-4xl font-bold font-orbitron mb-6">
              Implement {item.name}
            </h3>
            <p className="text-slate-300 text-base mb-8 leading-relaxed font-normal">
              Schedule a virtual technical consultation with Conflux AI to design your sector automation pipeline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/918972517557?text=Hi%20Conflux%20AI,%20I%20want%20to%20discuss%20${encodeURIComponent(item.name)}.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLocationEvent('whatsapp_click', `locations/west-bengal/${item.slug}`)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30"
              >
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>
              <Link
                to="/contact"
                onClick={() => trackLocationEvent('contact_click', `locations/west-bengal/${item.slug}`)}
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

export default IndustryLocationPage;
