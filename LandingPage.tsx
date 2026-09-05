// Conflux Platform — Local Visibility & Trust Platform Homepage (Consumer-First Discovery)

import React, { useEffect, useState } from 'react';
import { Hero } from './components/Hero.tsx';
import ContactForm from './components/ContactForm.tsx';
import {
  ShieldCheck, Search, ArrowRight, CheckCircle2,
  Building2, Phone, MessageSquare, MapPin, Store
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessService } from './lib/businessService';
import type { ConfluxBusiness } from './types/business';

const LandingPage: React.FC = () => {
  const [featuredBusinesses, setFeaturedBusinesses] = useState<ConfluxBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    businessService.searchBusinesses({ verifiedOnly: true })
      .then(results => {
        if (isMounted) {
          setFeaturedBusinesses(results.slice(0, 3).map(r => r.business));
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

      {/* SECTION 2: Verified Local Places & Services Highlights */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase font-mono tracking-wider block">
                Verified Local Highlights
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-orbitron text-slate-950">
                Statutory Verified Businesses in West Bengal
              </h2>
            </div>
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 self-start sm:self-auto"
            >
              <span>Explore full directory</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredBusinesses.length > 0 ? (
              featuredBusinesses.map((biz) => {
                const isOpen = businessService.isBusinessOpenNow(biz.operatingHours);
                return (
                  <div
                    key={biz.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200">
                          <ShieldCheck size={11} className="text-emerald-600" /> Conflux Verified
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {isOpen ? '● Open Now' : 'Closed'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold font-orbitron text-slate-900 leading-snug">
                        <Link to={`/business/${biz.slug}`} className="hover:text-blue-600 transition-colors">
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
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors min-h-[40px] flex items-center justify-center"
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
                <Link to="/discover" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                  Browse full directory &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: How Conflux Verifies (Calm, 3-Pillar Truth) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-blue-600 uppercase font-mono tracking-wider">
              Verification Standards
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-orbitron text-slate-950">
              Why You Can Trust What You See on Conflux
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              We separate verified legal facts from uncorroborated claims. No paid search ranking, no synthetic reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-sm font-bold font-orbitron text-slate-900">Official Registries</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Checked against primary government databases including MCA, GSTIN, MSME Udyam, and Trade Licenses.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-sm font-bold font-orbitron text-slate-900">Community Ground Truth</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Operating hours, route updates, and local notices corroborated by real neighbors and verified shop owners.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-sm font-bold font-orbitron text-slate-900">Zero Sponsored Bias</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Businesses cannot buy higher search rank or fake trust badges. Evidence and accuracy decide visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Gentle Business Owner Banner */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-12 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
              For Local Business Owners
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white">
              Get your business discovered, trusted, and contacted.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Make your business visible on Google, Maps, and AI search with structured Schema.org markup and statutory verification badges.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              to="/list-business"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all text-center min-h-[44px] flex items-center justify-center shadow-md shadow-emerald-900/30"
            >
              List Business Free
            </Link>
            <Link
              to="/business"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center min-h-[44px] flex items-center justify-center"
            >
              Learn More &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5: Direct Contact / Partnership */}
      <section id="contact" className="py-14 sm:py-20 px-4 sm:px-6 md:px-12 lg:px-24 bg-slate-50 border-t border-slate-200">
        <ContactForm />
      </section>
    </main>
  );
};

export default LandingPage;
