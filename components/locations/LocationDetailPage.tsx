import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NADIA_LOCATIONS, OTHER_MAJOR_WB_LOCATIONS, WEST_BENGAL_DISTRICTS } from '../../data/locationsData';
import { getArticlesByDistrict } from '../../data/articlesData';
import { MapPin, ArrowLeft, ArrowRight, ShieldCheck, Zap, MessageSquare, ExternalLink, CheckCircle2, HelpCircle, Building2, BookOpen, Clock, FileCheck, Award } from 'lucide-react';
import { trackLocationEvent } from '../../lib/locationAnalytics';

const LocationDetailPage: React.FC = () => {
  const { districtSlug, citySlug } = useParams<{ districtSlug: string; citySlug: string }>();
  
  const allLocations = [...NADIA_LOCATIONS, ...OTHER_MAJOR_WB_LOCATIONS];
  const location = allLocations.find(l => l.slug === citySlug && l.districtSlug === districtSlug);
  const parentDistrict = WEST_BENGAL_DISTRICTS.find(d => d.slug === districtSlug);

  const districtArticles = parentDistrict ? getArticlesByDistrict(parentDistrict.slug) : [];
  const relevantArticles = districtArticles.filter(a =>
    a.slug.includes(location?.slug || '') ||
    a.title.toLowerCase().includes((location?.name || '').toLowerCase()) ||
    (a.excerpt || '').toLowerCase().includes((location?.name || '').toLowerCase())
  );
  const displayedArticles = relevantArticles.length >= 1 ? relevantArticles : districtArticles.slice(0, 3);

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
            ...(location.verifiedEntities && location.verifiedEntities.length > 0 ? [{
              "@type": "ItemList",
              "name": `Verified Entities and Statutory Registries in ${location.name}`,
              "description": `Statutory registrations and accredited records verified by Conflux AI for ${location.name}, ${parentDistrict?.name || 'Nadia'}.`,
              "itemListElement": location.verifiedEntities.map((ent, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "name": ent.name,
                "description": ent.claimSummary,
                "url": `https://confluxai.in${ent.verifyQueryUrl}`
              }))
            }] : []),
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
              <strong className="block text-slate-900 font-bold mb-1">Local Visibility &amp; Trust in {location.name}</strong>
              Conflux AI is a Local Visibility &amp; Trust Platform based in Kolkata, West Bengal. We connect local businesses in {location.name} to Google Search, Google Maps, AI search engines, and direct WhatsApp lead conversion channels.
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

        {/* VERIFIED LOCAL ENTITIES & STATUTORY REGISTRIES */}
        {location.verifiedEntities && location.verifiedEntities.length > 0 && (
          <section className="mb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" /> Evidence &amp; Verification Layer
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                  Verified Local Entities &amp; Registries in {location.name}
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
                  Ground-truth statutory registrations, food safety licenses, and historical Geographical Indications (GI) verified against primary government databases for {location.name}.
                </p>
              </div>
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all shrink-0 self-start sm:self-auto"
              >
                Conflux Verify Portal <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {location.verifiedEntities.map((ent) => (
                <div
                  key={ent.id}
                  className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-6"
                >
                  {/* Top Badges & Entity Classification */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                        <ShieldCheck size={14} className="text-emerald-600" /> {ent.verificationStatus}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
                        {ent.sourceTier === 'TIER_1_PRIMARY_AUTHORITATIVE' ? 'Tier 1: Primary Official Registrar' : ent.sourceTier.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                      {ent.entityType === 'REGISTERED_BUSINESS' ? 'Registered Corporate Business' : 'Geographical Indication (GI) Heritage Cluster'}
                    </span>
                  </div>

                  {/* Entity Name & Statutory Identifier */}
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900 mb-3">
                      {ent.name}
                    </h3>
                    {ent.statutoryIdentifier && (
                      <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl mb-4">
                        <FileCheck size={14} className="text-blue-600" />
                        <span>{ent.statutoryIdentifier}</span>
                      </div>
                    )}
                    <p className="text-slate-700 text-base leading-relaxed font-medium">
                      {ent.claimSummary}
                    </p>
                  </div>

                  {/* Location Context & Role */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Local Industry &amp; Geographic Relevance:
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {ent.locationRelevance}
                    </p>
                  </div>

                  {/* Provenance & Registrar Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-600">
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold block mb-1 uppercase tracking-wider">Primary Registrar</span>
                      <span className="font-bold text-slate-900 block">{ent.registrarName}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold block mb-1 uppercase tracking-wider">Registry Standing</span>
                      <span className="font-bold text-emerald-700 block flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        {ent.validThrough ? `Active (Valid Through ${ent.validThrough})` : 'Active Statutory Docket'}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold block mb-1 uppercase tracking-wider">Benchmark Evaluation</span>
                      <span className="font-bold text-slate-900 block font-mono">{ent.benchmarkCaseId || 'Verified Record'} (100% Deterministic)</span>
                    </div>
                  </div>

                  {/* Contextual Internal Links & Action CTAs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                      {ent.relatedArticleSlug && (
                        <Link
                          to={`/blog/${ent.relatedArticleSlug}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <BookOpen size={13} /> Related {location.name} Industry Strategy &rarr;
                        </Link>
                      )}
                      {ent.relatedGuideSlug && (
                        <Link
                          to={`/verify/guides/${ent.relatedGuideSlug}`}
                          className="text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
                        >
                          <ShieldCheck size={13} /> Verification Guide &rarr;
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <a
                        href={ent.registrarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        Official Registrar <ExternalLink size={13} />
                      </a>
                      <Link
                        to={ent.verifyQueryUrl}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/10 transition-all"
                      >
                        Verify on Conflux <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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

        {/* RELATED LOCAL INDUSTRY STRATEGY ARTICLES */}
        {displayedArticles.length > 0 && (
          <section className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
              <div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                  <BookOpen size={12} className="text-blue-600" /> Local Field Blueprints
                </span>
                <h2 className="text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
                  Automation &amp; Growth Case Studies for {location.name}
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
                  Actionable market guides, wholesale ordering workflows, and technology blueprints relevant to {location.name} businesses.
                </p>
              </div>
              <Link
                to={`/blog?district=${districtSlug}`}
                className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1 shrink-0"
              >
                All {parentDistrict?.name} Guides ({districtArticles.length}) <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedArticles.map((art) => (
                <Link
                  key={art.id}
                  to={`/blog/${art.slug}`}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">
                      {art.category || 'Local Strategy'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors mb-3">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3 mb-4">
                      {art.excerpt || art.seoDescription}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>Read Case Study</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
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
