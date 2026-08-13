import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NADIA_LOCATIONS, OTHER_MAJOR_WB_LOCATIONS, WEST_BENGAL_DISTRICTS } from '../../data/locationsData';
import { MapPin, ArrowLeft, ArrowRight, ShieldCheck, Zap, MessageSquare, ExternalLink, CheckCircle2, HelpCircle, Building2 } from 'lucide-react';
import { trackLocationEvent } from '../../lib/locationAnalytics';

const LocationDetailPage: React.FC = () => {
  const { districtSlug, citySlug } = useParams<{ districtSlug: string; citySlug: string }>();
  
  const allLocations = [...NADIA_LOCATIONS, ...OTHER_MAJOR_WB_LOCATIONS];
  const location = allLocations.find(l => l.slug === citySlug && l.districtSlug === districtSlug);
  const parentDistrict = WEST_BENGAL_DISTRICTS.find(d => d.slug === districtSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location) {
      document.title = location.metaTitle || `AI Automation Services in ${location.name} | Conflux AI`;
      
      const canonicalUrl = `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}`;
      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonicalUrl);

      trackLocationEvent('page_view', `locations/west-bengal/${districtSlug}/${location.slug}`);
    }
  }, [districtSlug, citySlug, location]);

  if (!location || location.status !== 'PUBLISHED') {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 text-center bg-white flex flex-col items-center justify-center gap-6 font-inter">
        <h1 className="text-4xl font-black text-slate-900 font-orbitron">Location Page Not Found</h1>
        <p className="text-slate-500 max-w-md">The requested location page is not published or is under technical data review.</p>
        <Link to="/locations/west-bengal" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">
          Return to West Bengal Directory
        </Link>
      </div>
    );
  }

  // Get nearby locations
  const nearbyLocations = allLocations.filter(
    l => location.nearbyLocationSlugs?.includes(l.slug) && l.status === 'PUBLISHED'
  );

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 font-inter">
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}#webpage`,
              "url": `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}`,
              "name": location.metaTitle,
              "description": location.metaDescription,
              "publisher": { "@type": "Organization", "name": "Conflux AI", "url": "https://confluxai.in/" }
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" },
                { "@type": "ListItem", "position": 2, "name": "West Bengal", "item": "https://confluxai.in/locations/west-bengal" },
                { "@type": "ListItem", "position": 3, "name": parentDistrict?.name || 'District', "item": `https://confluxai.in/locations/west-bengal/${districtSlug}` },
                { "@type": "ListItem", "position": 4, "name": location.name, "item": `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}` }
              ]
            },
            ...(location.faqs && location.faqs.length > 0 ? [{
              "@type": "FAQPage",
              "mainEntity": location.faqs.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.answer }
              }))
            }] : [])
          ]
        })}
      </script>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-8 uppercase tracking-wider flex-wrap">
          <Link to="/locations/west-bengal" className="text-blue-600 hover:underline">West Bengal</Link>
          <span>/</span>
          <Link to={`/locations/west-bengal/${districtSlug}`} className="text-blue-600 hover:underline">{parentDistrict?.name || 'District'}</Link>
          <span>/</span>
          <span className="text-slate-900">{location.name}</span>
        </div>

        {/* Hero Header */}
        <div className="max-w-4xl mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold tracking-widest uppercase mb-6 inline-block">
            {location.type} • {parentDistrict?.name} District
          </span>
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            {location.h1Title || `AI Automation Services in ${location.name}`}
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed mb-8">
            {location.summary}
          </p>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              <strong className="block text-slate-900 font-bold mb-1">Remote Service Model for {location.name}</strong>
              Conflux AI is a remote-first agency based in Kolkata, West Bengal. We collaborate with business clients in {location.name} via high-touch digital communication channels, virtual consultations, and remote cloud software deployment.
            </div>
          </div>
        </div>

        {/* Local Business Context & Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={16} /> Commercial Ecosystem
            </h2>
            <h3 className="text-2xl font-bold font-orbitron text-slate-900">Why Businesses in {location.name} Benefit from Automation</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              {location.localBusinessContext}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 space-y-4">
            <h2 className="text-xs font-bold text-blue-100 uppercase tracking-widest flex items-center gap-2">
              <Zap size={16} className="text-yellow-300" /> Automation Focus Areas
            </h2>
            <h3 className="text-2xl font-bold font-orbitron text-white">Targeted System Upgrades</h3>
            <ul className="space-y-3">
              {location.automationOpportunities?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-blue-50 font-medium">
                  <CheckCircle2 size={18} className="text-yellow-300 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Specific Industry Use Cases */}
        {location.useCases && location.useCases.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold font-orbitron text-slate-900 mb-8">
              Proven Automation Use Cases for {location.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {location.useCases.map((uc, idx) => (
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

        {/* Nearby Locations Navigation */}
        {nearbyLocations.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold font-orbitron text-slate-900 mb-6">
              Related Commercial Locations in {parentDistrict?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbyLocations.map((nearby) => (
                <Link
                  key={nearby.id}
                  to={`/locations/west-bengal/${districtSlug}/${nearby.slug}`}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-white transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{nearby.name}</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {location.faqs && location.faqs.length > 0 && (
          <div className="mb-20 max-w-4xl">
            <h2 className="text-3xl font-bold font-orbitron text-slate-900 mb-8 flex items-center gap-3">
              <HelpCircle className="text-blue-600" /> Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {location.faqs.map((faq, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-base md:text-lg mb-3">{faq.question}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
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
              Implement AI Automation in {location.name}
            </h3>
            <p className="text-slate-300 text-base mb-8 leading-relaxed font-normal">
              Schedule a virtual technical consultation or request a custom AI automation plan for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/918972517557?text=Hi%20Conflux%20AI,%20I%20want%20to%20discuss%20automation%20for%20my%20business%20in%20${encodeURIComponent(location.name)}.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLocationEvent('whatsapp_click', `locations/west-bengal/${districtSlug}/${location.slug}`)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30"
              >
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>
              <Link
                to="/contact"
                onClick={() => trackLocationEvent('contact_click', `locations/west-bengal/${districtSlug}/${location.slug}`)}
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

export default LocationDetailPage;
