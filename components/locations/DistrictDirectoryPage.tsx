import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { WEST_BENGAL_DISTRICTS, NADIA_LOCATIONS, OTHER_MAJOR_WB_LOCATIONS } from '../../data/locationsData';
import { getArticlesByDistrict } from '../../data/articlesData';
import { MapPin, ArrowLeft, ArrowRight, ShieldCheck, Zap, MessageSquare, ExternalLink, Building2, HelpCircle, Calendar, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { trackLocationEvent } from '../../lib/locationAnalytics';

const DistrictDirectoryPage: React.FC = () => {
  const { districtSlug } = useParams<{ districtSlug: string }>();
  const district = WEST_BENGAL_DISTRICTS.find(d => d.slug === districtSlug);

  // Retrieve genuinely relevant articles for this district
  const districtArticles = district ? getArticlesByDistrict(district.slug) : [];
  const visibleArticles = districtArticles.slice(0, 6);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (district) {
      document.title = district.metaTitle || `AI Automation Agency Serving ${district.name} District | Conflux AI`;
      
      const canonicalUrl = `https://confluxai.in/locations/west-bengal/${district.slug}`;
      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonicalUrl);

      trackLocationEvent('page_view', `locations/west-bengal/${district.slug}`);
    }
  }, [districtSlug, district]);

  if (!district) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 text-center bg-white flex flex-col items-center justify-center gap-6 font-inter">
        <h1 className="text-4xl font-black text-slate-900 font-orbitron">District Not Found</h1>
        <p className="text-slate-500 max-w-md">The district page you are looking for may have been moved or updated.</p>
        <Link to="/locations/west-bengal" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">
          Return to West Bengal Directory
        </Link>
      </div>
    );
  }

  // Get published sub-locations for this district
  const districtSubLocations = [...NADIA_LOCATIONS, ...OTHER_MAJOR_WB_LOCATIONS].filter(
    l => l.districtSlug === district.slug && l.status === 'PUBLISHED'
  );

  // Structured Data Schema Graphs
  const schemaGraph: any[] = [
    {
      "@type": "WebPage",
      "@id": `https://confluxai.in/locations/west-bengal/${district.slug}#webpage`,
      "url": `https://confluxai.in/locations/west-bengal/${district.slug}`,
      "name": district.metaTitle,
      "description": district.metaDescription,
      "publisher": { "@type": "Organization", "name": "Conflux AI", "url": "https://confluxai.in/" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" },
        { "@type": "ListItem", "position": 2, "name": "West Bengal", "item": "https://confluxai.in/locations/west-bengal" },
        { "@type": "ListItem", "position": 3, "name": district.name, "item": `https://confluxai.in/locations/west-bengal/${district.slug}` }
      ]
    }
  ];

  if (visibleArticles.length > 0) {
    schemaGraph.push({
      "@type": "ItemList",
      "name": `Local Business & Intelligence Articles from ${district.name}`,
      "description": `Published technical insights, business growth blueprints, and case studies for ${district.name} district by Conflux AI.`,
      "itemListElement": visibleArticles.map((art, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": art.title,
        "url": `https://confluxai.in/blog/${art.slug}`
      }))
    });
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 font-inter">
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": schemaGraph
        })}
      </script>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-8 uppercase tracking-wider">
          <Link to="/locations/west-bengal" className="text-blue-600 hover:underline">West Bengal</Link>
          <span>/</span>
          <span className="text-slate-900">{district.name} District</span>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold tracking-widest uppercase mb-6 inline-block">
            District Hub • {district.division}
          </span>
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            {district.h1Title || `AI Automation Services in ${district.name} District`}
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed mb-8">
            {district.summary || `Conflux AI provides remote-first AI automation pipelines, WhatsApp Business API bots, and web application engineering for commercial enterprises across ${district.name} district.`}
          </p>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              <strong className="block text-slate-900 font-bold mb-1">Remote Service Delivery to {district.name}</strong>
              Conflux AI is a remote-first AI automation agency based in Kolkata, West Bengal. We partner with business owners across {district.name} district via virtual workflow audits, digital collaboration, and cloud-hosted AI integrations.
            </div>
          </div>
        </div>

        {/* Administrative Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">District Headquarters</span>
            <span className="text-lg font-bold text-slate-900">{district.hqName}</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Administrative Division</span>
            <span className="text-lg font-bold text-slate-900">{district.division}</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Key Sectors</span>
            <span className="text-sm font-bold text-slate-900">{district.majorIndustries?.join(', ')}</span>
          </div>
        </div>

        {/* Sub-Locations Directory */}
        {districtSubLocations.length > 0 && (
          <div className="mb-20">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 inline-block">Cities & Municipalities</span>
              <h2 className="text-3xl font-bold font-orbitron text-slate-900">
                Cities & Commercial Hubs in {district.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {districtSubLocations.map((subLoc) => (
                <Link
                  key={subLoc.id}
                  to={`/locations/west-bengal/${district.slug}/${subLoc.slug}`}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={18} className="text-blue-600" />
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{subLoc.name}</h3>
                    </div>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2">{subLoc.summary}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>View City Automation</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* DISTRICT-BASED ARTICLE DISCOVERY LAYER */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                <BookOpen size={12} className="text-blue-600" /> Regional Knowledge Network
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                Latest Articles from {district.name}
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
                Authoritative local guides, market research, and digital growth blueprints tailored for businesses and tourism in {district.name} district.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-black shrink-0 border border-slate-200">
                {districtArticles.length} Local {districtArticles.length === 1 ? 'Article' : 'Articles'}
              </span>
              {districtArticles.length > 6 && (
                <Link
                  to={`/blog?district=${district.slug}`}
                  className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1 shrink-0"
                >
                  View All ({districtArticles.length}) <ChevronRight size={14} />
                </Link>
              )}
            </div>
          </div>

          {districtArticles.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleArticles.map((art) => {
                  const authorName = typeof art.author === 'object' ? art.author.name : (art.author || 'Conflux AI Editorial');
                  const formattedDate = new Date(art.publishedAt || art.updatedAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <article
                      key={art.id || art.slug}
                      className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        {/* Badges Bar */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
                            {art.category || 'Local Strategy'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-bold border border-slate-200">
                            {art.language === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-100 flex items-center gap-1">
                            <MapPin size={9} /> {district.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 ml-auto">
                            <Calendar size={11} /> {formattedDate}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-inter font-black text-slate-900 text-base md:text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          <Link to={`/blog/${art.slug}`}>
                            {art.title}
                          </Link>
                        </h3>

                        {/* Excerpt */}
                        <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-3 mb-6">
                          {art.excerpt || art.content?.replace(/#|\*|\[|\]|\(.*?\)|\---/g, '').replace(/\s+/g, ' ').trim() || art.title}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold text-slate-400">
                          By {authorName}
                        </span>

                        <Link
                          to={`/blog/${art.slug}`}
                          className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 uppercase tracking-wider group-hover:translate-x-1 transition-transform"
                        >
                          Read Article <ArrowRight size={13} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {districtArticles.length > 6 && (
                <div className="mt-8 text-center">
                  <Link
                    to={`/blog?district=${district.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider transition-colors border border-blue-200/60"
                  >
                    View all {districtArticles.length} articles from {district.name} <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <Sparkles className="mx-auto text-blue-500 mb-3" size={28} />
              <h3 className="text-slate-800 font-bold text-base mb-1">
                Articles for {district.name} are coming soon.
              </h3>
              <p className="text-slate-500 text-xs max-w-lg mx-auto mb-4">
                Our editorial and research team is actively publishing verified local business workflows and automation blueprints across all regions of West Bengal.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/locations/west-bengal"
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Explore West Bengal Directory <ArrowRight size={12} />
                </Link>
                <span className="text-slate-300">•</span>
                <Link
                  to="/blog"
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Browse Full Knowledge Base <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* CTA Box */}
        <div className="p-10 rounded-3xl bg-slate-950 text-white shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-bold font-orbitron mb-4">
            Automate Your Business in {district.name} District
          </h3>
          <p className="text-slate-300 text-sm md:text-base mb-8 max-w-xl">
            Discuss your AI automation requirements with Conflux AI technical leadership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`https://wa.me/918972517557?text=Hi%20Conflux%20AI,%20I%20want%20to%20discuss%20automation%20for%20my%20business%20in%20${encodeURIComponent(district.name)}.`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLocationEvent('whatsapp_click', `locations/west-bengal/${district.slug}`)}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
            >
              <MessageSquare size={16} /> Chat on WhatsApp
            </a>
            <Link
              to="/contact"
              onClick={() => trackLocationEvent('contact_click', `locations/west-bengal/${district.slug}`)}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-3"
            >
              Submit Project Request <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictDirectoryPage;

