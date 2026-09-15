// Conflux Platform — Local Trust & Discovery Platform Homepage

import React, { useEffect, useState } from 'react';
import { Hero } from './components/Hero.tsx';
import {
  ShieldCheck, ArrowRight, CheckCircle2,
  Building2, Phone, MessageSquare, MapPin, Store, Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessService } from './lib/businessService';
import type { ConfluxBusiness } from './types/business';

const POPULAR_DISTRICTS = [
  { name: 'Nadia', slug: 'nadia', count: 'Ranaghat, Krishnanagar, Kalyani' },
  { name: 'Kolkata', slug: 'kolkata', count: 'Central, Salt Lake, South' },
  { name: 'North 24 Parganas', slug: 'north-24-parganas', count: 'Barasat, Barrackpore, Habra' },
  { name: 'South 24 Parganas', slug: 'south-24-parganas', count: 'Baruipur, Sonarpur, Diamond Harbour' },
  { name: 'Hooghly', slug: 'hooghly', count: 'Chinsurah, Serampore, Chandannagar' },
  { name: 'Howrah', slug: 'howrah', count: 'Howrah City, Bally, Uluberia' },
];

const LandingPage: React.FC = () => {
  const [featuredBusinesses, setFeaturedBusinesses] = useState<ConfluxBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    businessService.searchBusinesses({ verifiedOnly: true })
      .then(results => {
        if (isMounted) {
          if (Array.isArray(results)) {
            setFeaturedBusinesses(results.slice(0, 3).map(r => r?.business).filter(Boolean));
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <main className="relative z-10 w-full overflow-hidden bg-white font-inter text-slate-900">
      {/* SECTION 1: Consumer Search-First Hero */}
      <section id="home" className="relative bg-white">
        <Hero />
      </section>

      {/* SECTION 2: Verified Local Businesses Highlights */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                Local Discoveries
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-inter mt-1">
                Verified Businesses in West Bengal
              </h2>
            </div>
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 self-start sm:self-auto"
            >
              <span>Explore full directory</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-700 border-r-transparent mb-2" />
                <p className="text-xs text-slate-500 font-medium">Finding verified businesses...</p>
              </div>
            ) : featuredBusinesses.length > 0 ? (
              featuredBusinesses.map((biz) => {
                const isOpen = businessService.isBusinessOpenNow(biz.operatingHours);
                return (
                  <div
                    key={biz.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          <ShieldCheck size={12} className="text-emerald-600" /> Conflux Verified
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {isOpen ? '● Open Now' : 'Closed'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        <Link to={`/business/${biz.slug}`} className="hover:text-blue-700 transition-colors">
                          {biz.name}
                        </Link>
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={12} className="text-blue-600 shrink-0" />
                        <span className="truncate">{biz.location.locality || biz.location.city}, {biz.location.district}</span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {biz.shortSummary || biz.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {biz.contact.whatsapp && (
                        <a
                          href={`https://wa.me/${biz.contact.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(biz.name)},%20I%20found%20your%20business%20on%20Conflux%20AI.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
                        >
                          <MessageSquare size={13} /> WhatsApp
                        </a>
                      )}
                      {biz.contact.phone && (
                        <a
                          href={`tel:${biz.contact.phone}`}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                        >
                          <Phone size={13} /> Call
                        </a>
                      )}
                      <Link
                        to={`/business/${biz.slug}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors min-h-[40px] flex items-center justify-center"
                        title="View profile"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
                <Store size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-600">Discover verified local businesses across West Bengal.</p>
                <Link to="/discover" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">
                  Browse full directory &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION: Latest Local Information */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                Local Knowledge
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-inter mt-1">
                Latest Local Information &amp; Guides
              </h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 self-start sm:self-auto"
            >
              <span>Browse all guides</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/locations/west-bengal/nadia/ranaghat"
              className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md inline-block">
                  Nadia &bull; Ranaghat
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Ranaghat Local Hub &amp; Verified Directory
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  Verified healthcare clinics, pharmacies, retail stores, and transport details for Ranaghat subdivision.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 inline-flex items-center gap-1">
                View locality guide &rarr;
              </span>
            </Link>

            <Link
              to="/verify"
              className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                  Verification Standards
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  How to Verify Business Credentials in India
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  Step-by-step guidance on checking MCA company registrations, active GSTIN tax numbers, and municipal trade licenses.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 inline-flex items-center gap-1">
                Check evidence guide &rarr;
              </span>
            </Link>

            <Link
              to="/contribute"
              className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md inline-block">
                  Community Network
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Help Improve Your Local Area
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  Know a reliable doctor, shop, or service that should be verified on Conflux? Share verified details with neighbors.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 inline-flex items-center gap-1">
                Suggest information &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: How Conflux Builds Trust */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Verification Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-inter">
              How Conflux Builds Trust
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              We separate verified facts from marketing claims so you can connect with local businesses in confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left pt-2">
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs font-mono">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-inter">Official Registries</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Checked against primary government sources including MCA master data, GSTIN, MSME Udyam, and Trade Licenses.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs font-mono">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-inter">Ground Truth</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Physical premises, contact points, and operating hours are verified with local checks and evidence before verification is granted.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs font-mono">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-inter">Zero Sponsored Bias</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Businesses cannot buy higher search rank or purchase trust badges. Evidence and accuracy decide visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Explore Your Area */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                Regional Coverage
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-inter mt-1">
                Explore Your Area
              </h2>
            </div>
            <Link
              to="/locations"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 self-start sm:self-auto"
            >
              <span>All locations</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {POPULAR_DISTRICTS.map((dist) => (
              <Link
                key={dist.slug}
                to={`/locations/west-bengal/${dist.slug}`}
                className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group flex items-start justify-between"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {dist.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {dist.count}
                  </p>
                </div>
                <Compass size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: For Business Owners */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              For Local Business Owners
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-inter">
              Get your business discovered, trusted, and contacted.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              List your business, verify your statutory credentials, and make it easy for local customers to reach you directly via WhatsApp and phone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/list-business"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all text-center min-h-[44px] flex items-center justify-center shadow-md shadow-blue-900/30"
            >
              List Business Free
            </Link>
            <Link
              to="/business"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center min-h-[44px] flex items-center justify-center"
            >
              Learn More &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
