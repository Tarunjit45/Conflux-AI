import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WEST_BENGAL_STATE, WEST_BENGAL_DISTRICTS, NADIA_LOCATIONS, INDUSTRY_LOCATION_COMBINATIONS } from '../../data/locationsData';
import { MapPin, ArrowLeft, ArrowRight, ShieldCheck, Zap, MessageSquare, ExternalLink, Building2, Cpu, CheckCircle2 } from 'lucide-react';
import { trackLocationEvent } from '../../lib/locationAnalytics';

const LocationHubPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = WEST_BENGAL_STATE.metaTitle || 'Remote AI Automation Services in West Bengal | Conflux AI';
    
    // Dynamic Canonical Management
    const canonicalUrl = 'https://confluxai.in/locations/west-bengal';
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    trackLocationEvent('page_view', 'locations/west-bengal');
  }, []);

  const publishedNadiaCities = NADIA_LOCATIONS.filter(l => l.status === 'PUBLISHED');

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 font-inter">
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://confluxai.in/locations/west-bengal#webpage",
              "url": "https://confluxai.in/locations/west-bengal",
              "name": WEST_BENGAL_STATE.metaTitle,
              "description": WEST_BENGAL_STATE.metaDescription,
              "publisher": { "@type": "Organization", "name": "Conflux AI", "url": "https://confluxai.in/" }
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" },
                { "@type": "ListItem", "position": 2, "name": "Locations", "item": "https://confluxai.in/locations/west-bengal" }
              ]
            }
          ]
        })}
      </script>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-10 hover:gap-3 transition-all">
          <ArrowLeft size={14} /> Return to Main Home
        </Link>

        {/* Hero Section */}
        <div className="max-w-4xl mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold tracking-widest uppercase mb-6 inline-block">
            Statewide Remote Service Network
          </span>
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            {WEST_BENGAL_STATE.h1Title}
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed mb-8">
            Conflux AI is a remote-first AI automation and digital solutions agency based in Kolkata, West Bengal, serving commercial enterprises across all 23 districts of West Bengal, India, and globally.
          </p>

          {/* Factual Positioning Banner */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              <strong className="block text-slate-900 font-bold mb-1">Truthful Remote Service Model</strong>
              We do not pretend to operate physical storefronts in every city. Instead, we deliver high-touch remote engineering, virtual workflow audits, official WhatsApp API setups, and custom AI agent deployments over secure cloud infrastructure.
            </div>
          </div>
        </div>

        {/* Highlighted Spotlight: Nadia District */}
        <div className="mb-20 p-8 md:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-800">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-3 inline-block">
                Detailed Coverage Spotlight
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-white">
                Nadia District <span className="text-blue-500">Coverage Network</span>
              </h2>
            </div>
            <Link 
              to="/locations/west-bengal/nadia" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 shrink-0"
            >
              Explore Nadia District Hub <ArrowRight size={14} />
            </Link>
          </div>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 max-w-3xl">
            Nadia district encompasses key administrative, industrial, educational, and commercial centers including Krishnanagar, Kalyani, Ranaghat, Nabadwip, Santipur, and Chakdaha.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedNadiaCities.map((city) => (
              <Link 
                key={city.id} 
                to={`/locations/west-bengal/nadia/${city.slug}`}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-blue-400 transition-all group flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    <MapPin size={16} className="text-blue-400" /> {city.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{city.majorIndustries?.slice(0, 2).join(', ')}</p>
                </div>
                <ArrowRight size={16} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* West Bengal All 23 Districts Directory */}
        <div className="mb-20">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 inline-block">Administrative Directory</span>
            <h2 className="text-3xl font-bold font-orbitron text-slate-900">
              West Bengal District Coverage Directory
            </h2>
            <p className="text-slate-600 text-sm mt-2">Explore Conflux AI remote-first service capabilities across all current 23 districts of West Bengal.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {WEST_BENGAL_DISTRICTS.map((dist) => (
              <Link
                key={dist.id}
                to={`/locations/west-bengal/${dist.slug}`}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{dist.division}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{dist.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">HQ: {dist.hqName}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Explore District</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Industry + Location Combinations (Tier 4) */}
        <div className="mb-20">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 inline-block">High-Intent Sector Solutions</span>
            <h2 className="text-3xl font-bold font-orbitron text-slate-900">
              Industry + Location High-Intent Solutions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INDUSTRY_LOCATION_COMBINATIONS.map((item) => (
              <Link
                key={item.id}
                to={`/locations/west-bengal/${item.slug}`}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{item.displayName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{item.majorIndustries?.join(', ')}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-normal leading-relaxed mb-4">{item.summary}</p>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 group-hover:gap-3 transition-all">
                  View Sector Architecture <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* How Remote Collaboration Works */}
        <div className="mb-20 p-10 rounded-3xl bg-slate-50 border border-slate-200">
          <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900 mb-8">
            How West Bengal Businesses Partner with Conflux AI Remotely
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Virtual Workflow Audit", desc: "We schedule a video consultation to review your existing customer intake bottlenecks and manual tasks." },
              { step: "02", title: "Technical Blueprinting", desc: "We map exact AI prompts, webhook triggers, WhatsApp API routes, and database models." },
              { step: "03", title: "Sandbox Testing", desc: "We test automation pipelines in isolated sandbox environments with strict error handling." },
              { step: "04", title: "Cloud Deployment", desc: "We deploy production bots and serverless workflows to your stack with 24/7 logging." }
            ].map((s, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200">
                <span className="text-3xl font-black text-blue-600/20 font-orbitron block mb-3">{s.step}</span>
                <h3 className="font-bold text-slate-900 text-base mb-2">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Conversion Card */}
        <div className="p-10 md:p-14 rounded-3xl bg-slate-950 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 block">Statewide Digital Transformation</span>
            <h3 className="text-3xl md:text-4xl font-bold font-orbitron mb-6">
              Ready to Automate Your Business in West Bengal?
            </h3>
            <p className="text-slate-300 text-base mb-8 font-normal leading-relaxed">
              Schedule a technical consultation or request a custom AI automation blueprint tailored to your location and industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://wa.me/918972517557?text=Hi%20Conflux%20AI,%20I%20want%20to%20discuss%20AI%20automation%20for%20my%20West%20Bengal%20business."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLocationEvent('whatsapp_click', 'locations/west-bengal')}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30"
              >
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>
              <Link 
                to="/contact"
                onClick={() => trackLocationEvent('contact_click', 'locations/west-bengal')}
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

export default LocationHubPage;
