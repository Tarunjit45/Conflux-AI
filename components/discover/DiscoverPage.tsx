// Conflux Platform — Consumer-Facing Local Business Discovery Hub (/discover)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Building2, ShieldCheck, Clock, Phone,
  MessageSquare, ArrowRight, Sparkles, AlertCircle, CheckCircle2,
  Compass, ExternalLink, Calendar, X, Filter, RotateCcw, Check,
  Layers, ChevronRight, HelpCircle
} from 'lucide-react';
import { businessService } from '../../lib/businessService';
import { connectService } from '../../lib/connectService';
import type { BusinessSearchResult, CapabilityActionType } from '../../types/business';
import { WEST_BENGAL_DISTRICTS } from '../../data/locationsData';

interface CategoryShortcut {
  id: string;
  name: string;
  icon: string;
  categoryFilter?: string;
  searchTerm?: string;
}

const CATEGORY_SHORTCUTS: CategoryShortcut[] = [
  { id: 'all', name: 'All Categories', icon: '✨' },
  { id: 'agro', name: 'Agro & Farming', icon: '🌾', categoryFilter: 'agriculture-farming' },
  { id: 'textiles', name: 'Handloom & Textiles', icon: '🧵', categoryFilter: 'handloom-textiles' },
  { id: 'mfg', name: 'Manufacturing & Industrial', icon: '⚙️', categoryFilter: 'manufacturing-industrial' },
  { id: 'health', name: 'Clinics & Diagnostics', icon: '🏥', categoryFilter: 'healthcare' },
  { id: 'it', name: 'IT & Software', icon: '💻', categoryFilter: 'it-software' },
  { id: 'food', name: 'Restaurants & Food', icon: '🍽️', categoryFilter: 'food-hospitality' },
  { id: 'hotels', name: 'Hotels & Tourism', icon: '🏨', categoryFilter: 'tourism-hospitality' },
  { id: 'repairs', name: 'Repairs & Services', icon: '🛠️', categoryFilter: 'services-repairs' },
  { id: 'services', name: 'Business Services', icon: '💼', categoryFilter: 'business-services' }
];

export const DiscoverPage: React.FC = () => {
  const [results, setResults] = useState<BusinessSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [whatQuery, setWhatQuery] = useState('');
  const [whereQuery, setWhereQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [requiredAction, setRequiredAction] = useState<CapabilityActionType | 'all'>('all');

  const executeSearch = async () => {
    setIsLoading(true);

    // Natural Intent Parser: Extract embedded "in <location>" from "what" query if whereQuery is empty
    let parsedWhat = whatQuery.trim();
    let parsedWhere = whereQuery.trim().toLowerCase();

    if (!parsedWhere && parsedWhat) {
      const match = parsedWhat.match(/(.+?)\s+(?:in|at|near)\s+([a-zA-Z\s-]+)$/i);
      if (match) {
        parsedWhat = match[1].trim();
        parsedWhere = match[2].trim().toLowerCase();
      }
    }

    // Match district or city
    let districtParam: string | undefined = undefined;
    let cityParam: string | undefined = undefined;

    if (parsedWhere && parsedWhere !== 'all' && parsedWhere !== 'west bengal') {
      const isDistrict = WEST_BENGAL_DISTRICTS.some(
        d => d.slug.toLowerCase() === parsedWhere || d.name.toLowerCase() === parsedWhere
      );
      if (isDistrict) {
        districtParam = parsedWhere;
      } else {
        cityParam = parsedWhere;
      }
    }

    const activeCatObj = CATEGORY_SHORTCUTS.find(c => c.id === activeCategory);
    const categoryParam = activeCatObj?.categoryFilter;

    const res = await businessService.searchBusinesses({
      query: parsedWhat || undefined,
      district: districtParam,
      city: cityParam,
      category: categoryParam,
      verifiedOnly: verifiedOnly ? true : undefined,
      openNow: openNowOnly ? true : undefined,
      requiredAction: requiredAction !== 'all' ? requiredAction : undefined
    });

    setResults(res);
    setIsLoading(false);

    // Track search intent telemetry
    if (parsedWhat || parsedWhere) {
      connectService.logEvent({
        businessId: 'conflux_discovery_hub',
        eventType: 'DISCOVERY_SEARCH',
        intentId: `${parsedWhat || 'all_services'} | ${parsedWhere || 'all_locations'}`
      });
    }
  };

  useEffect(() => {
    executeSearch();
  }, [activeCategory, verifiedOnly, openNowOnly, requiredAction]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleResetFilters = () => {
    setWhatQuery('');
    setWhereQuery('');
    setActiveCategory('all');
    setVerifiedOnly(false);
    setOpenNowOnly(false);
    setRequiredAction('all');
    businessService.searchBusinesses().then(res => setResults(res));
  };

  const handleActionClick = (
    bizId: string,
    actionType: 'PHONE_CLICK' | 'WHATSAPP_CLICK' | 'DIRECTIONS_CLICK' | 'BOOKING_CLICK'
  ) => {
    connectService.logEvent({
      businessId: bizId,
      eventType: actionType,
      channel: 'HUMAN_WEB'
    });
  };

  const hasActiveFilters =
    whatQuery.trim() !== '' ||
    whereQuery.trim() !== '' ||
    activeCategory !== 'all' ||
    verifiedOnly ||
    openNowOnly ||
    requiredAction !== 'all';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 pt-4">
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide uppercase font-mono"
          >
            <ShieldCheck size={15} className="text-emerald-400" />
            Verified Local Business Discovery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold font-orbitron tracking-tight text-white leading-tight"
          >
            Find a Local Business You Can Trust
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Tell Conflux what you need, where you need it, and discover statutory-verified enterprises, artisans, clinics, and services you can connect with directly.
          </motion.p>

          {/* ── TWO-PART SEARCH INPUT BAR ─────────────────────────── */}
          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="max-w-4xl mx-auto mt-8 p-2.5 sm:p-3 rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 text-slate-900"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              {/* Field 1: What */}
              <div className="md:col-span-6 relative flex items-center px-3 py-2 bg-slate-50 md:bg-transparent rounded-2xl md:rounded-none md:border-r md:border-slate-200">
                <Search className="text-blue-600 shrink-0 mr-3" size={20} />
                <div className="w-full text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    What are you looking for?
                  </label>
                  <input
                    type="text"
                    value={whatQuery}
                    onChange={e => setWhatQuery(e.target.value)}
                    placeholder="e.g. Restaurants, Agro, Tant Sarees, Diagnostics..."
                    className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                {whatQuery && (
                  <button
                    type="button"
                    onClick={() => setWhatQuery('')}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Field 2: Where */}
              <div className="md:col-span-4 relative flex items-center px-3 py-2 bg-slate-50 md:bg-transparent rounded-2xl md:rounded-none">
                <MapPin className="text-emerald-600 shrink-0 mr-3" size={20} />
                <div className="w-full text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Where?
                  </label>
                  <input
                    type="text"
                    value={whereQuery}
                    onChange={e => setWhereQuery(e.target.value)}
                    placeholder="e.g. Ranaghat, Santipur, Nadia..."
                    className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                {whereQuery && (
                  <button
                    type="button"
                    onClick={() => setWhereQuery('')}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Submit CTA Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Discover</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.form>

          {/* Trust Value Badges Under Search */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" /> Statutory Evidence Grounded
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" /> Zero Sponsored Ranking Bias
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" /> Direct Phone, WhatsApp &amp; Booking
            </span>
          </div>
        </div>
      </section>

      {/* ── INTENT & CATEGORY SHORTCUT CHIPS ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-200/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_SHORTCUTS.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FILTER CONTROLS & RESULTS SUMMARY ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200">
          {/* Quick Gating Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Verified Only Toggle */}
            <button
              type="button"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                verifiedOnly
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck size={14} className={verifiedOnly ? 'text-white' : 'text-emerald-600'} />
              <span>Verified Only</span>
            </button>

            {/* Open Now Toggle */}
            <button
              type="button"
              onClick={() => setOpenNowOnly(!openNowOnly)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                openNowOnly
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock size={14} className={openNowOnly ? 'text-white' : 'text-blue-600'} />
              <span>Open Now</span>
            </button>

            {/* Capability Select */}
            <select
              value={requiredAction}
              onChange={e => setRequiredAction(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold focus:outline-none cursor-pointer border-none"
            >
              <option value="all">All Channels</option>
              <option value="WHATSAPP">WhatsApp Direct</option>
              <option value="CALL">Direct Call</option>
              <option value="BOOKING">Online Booking</option>
              <option value="DIRECTIONS">Map Directions</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Results Counter & Methodology Tag */}
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span className="font-bold text-slate-900">
              {isLoading ? 'Querying Graph...' : `${results.length} Verified Businesses Matched`}
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-[11px] text-slate-400">
              Ranked by Conflux Explainable Trust Engine
            </span>
          </div>
        </div>

        {/* ── SEARCH RESULTS GRID / STATES ──────────────────────── */}
        {isLoading ? (
          /* Loading Skeleton State */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm animate-pulse space-y-4"
              >
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-12 bg-slate-100 rounded w-full"></div>
                <div className="h-8 bg-slate-200 rounded w-full pt-4"></div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          /* Empty / No Results State */
          <div className="p-12 sm:p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-5 max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Building2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-orbitron text-slate-900">
                No Verified Businesses Found
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We couldn&apos;t find verified businesses matching your exact query. Conflux never fabricates fake business listings or unverified placeholder ratings.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800">Helpful Suggestions:</div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Clear the &ldquo;Where&rdquo; field to browse verified enterprises across all districts.</li>
                <li>Try selecting one of the popular category shortcuts above.</li>
                <li>Try searching for statutory sectors like <em>Agro, Handloom, Machining, or Software</em>.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
              <Link
                to="/verify"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                Verify &amp; List Your Business &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* Populated Results Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(({ business: biz, rankingExplanation }) => {
              const isOpenNow = businessService.isBusinessOpenNow(biz.operatingHours);
              const isVerified = biz.verificationStatus === 'SUPPORTED';
              const profileUrl = `/business/india/west-bengal/${biz.location.district}/${biz.location.city}/${biz.slug}`;

              return (
                <motion.div
                  key={biz.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    {/* Top Identity & Verification Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {biz.confluxBusinessId}
                      </span>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold font-mono shadow-sm">
                          <ShieldCheck size={13} className="text-emerald-600" /> STATUTORY VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold font-mono">
                          {biz.verificationStatus}
                        </span>
                      )}
                    </div>

                    {/* Business Name & Category */}
                    <div>
                      <h3 className="text-xl font-bold font-orbitron text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        <Link to={profileUrl}>{biz.name}</Link>
                      </h3>
                      <div className="text-xs font-bold text-slate-500 mt-1 capitalize flex items-center gap-2">
                        <span>{biz.categoryName || biz.categoryId}</span>
                        {biz.legalName && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 truncate max-w-[150px]">{biz.legalName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Location & Live Open Status */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="capitalize font-medium">
                          {biz.location.city}, {biz.location.district}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span
                          className={`font-bold font-mono text-[11px] px-2 py-0.5 rounded-md ${
                            isOpenNow
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isOpenNow ? 'OPEN NOW' : 'CLOSED'}
                        </span>
                      </div>
                    </div>

                    {/* Relevant Trust / Registrar Proof */}
                    {biz.primaryRegistrar && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                          Authoritative Evidence:
                        </div>
                        <div className="text-xs font-bold text-slate-800 line-clamp-1">
                          {biz.primaryRegistrar}
                        </div>
                        {biz.evidenceSummary && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {biz.evidenceSummary}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {biz.shortSummary || biz.description}
                    </p>

                    {/* Explainable Ranking Badges */}
                    {rankingExplanation.reasonCodes.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        {rankingExplanation.reasonCodes.slice(0, 2).map(code => (
                          <span
                            key={code}
                            className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-50/60 text-blue-700 border border-blue-100"
                          >
                            ✓ {code.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connect Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {biz.contact.phone && (
                        <a
                          href={`tel:${biz.contact.phone}`}
                          onClick={() => handleActionClick(biz.id, 'PHONE_CLICK')}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                          title="Call"
                        >
                          <Phone size={14} />
                        </a>
                      )}
                      {biz.contact.whatsapp && (
                        <a
                          href={`https://wa.me/${biz.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleActionClick(biz.id, 'WHATSAPP_CLICK')}
                          className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare size={14} />
                        </a>
                      )}
                      {biz.contact.bookingUrl && (
                        <a
                          href={biz.contact.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleActionClick(biz.id, 'BOOKING_CLICK')}
                          className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                          title="Book Online"
                        >
                          <Calendar size={14} />
                        </a>
                      )}
                    </div>

                    <Link
                      to={profileUrl}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all"
                    >
                      <span>View Profile</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── WHY CONFLUX TRUST MATTERS (EXPLAINER SECTION) ──────── */}
        <div className="mt-16 pt-12 border-t border-slate-200 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold font-orbitron text-slate-900">
              Why Conflux Discovery is Different
            </h2>
            <p className="text-sm text-slate-600">
              Unlike generic directories or ad-driven search portals, Conflux is built on immutable statutory verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-orbitron">
                Primary Registrar Grounding
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We independently corroborate registration identifiers, licenses, and GI tags against Ministry of Corporate Affairs, FSSAI, and IAF CertSearch dockets before certifying a business.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Compass size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-orbitron">
                Explainable Organic Discovery
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero hidden bidding auctions. Ranking is computed transparently based on verification depth, exact locality relevance, and confirmed operational capability.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <MessageSquare size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-orbitron">
                Direct Machine &amp; Human Connect
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with business owners via phone, official WhatsApp, and direct booking channels — with zero middleman commissions or lead laundering.
              </p>
            </div>
          </div>

          {/* Business Owner Onboarding Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl font-bold font-orbitron">
                Are you a verified local business owner?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Get your statutory registration, credentials, and capabilities verified on the Conflux Business Graph to be discovered by local customers and AI search engines.
              </p>
            </div>
            <Link
              to="/verify"
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-lg transition-all shrink-0 cursor-pointer"
            >
              Verify Your Business &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
