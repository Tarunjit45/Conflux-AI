// Conflux Platform — Consumer-Facing Local Business Discovery Hub (/discover)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Building2, ShieldCheck, Clock, Phone,
  MessageSquare, ArrowRight, Sparkles, AlertCircle, CheckCircle2,
  Compass, ExternalLink, Calendar, X, Filter, RotateCcw, Check,
  Layers, ChevronRight, HelpCircle, Navigation, Radio, Plus
} from 'lucide-react';
import { businessService } from '../../lib/businessService';
import { connectService } from '../../lib/connectService';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { ContributionCard } from '../contributions/ContributionCard';
import { RequestBusinessModal } from '../contributions/RequestBusinessModal';
import { CreateContributionModal } from '../contributions/CreateContributionModal';
import type { BusinessSearchResult, CapabilityActionType, ConfluxBusiness } from '../../types/business';
import type { LocalContribution } from '../../types/localKnowledge';
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
  { id: 'health', name: 'Healthcare & Clinics', icon: '🏥', categoryFilter: 'healthcare' },
  { id: 'food', name: 'Restaurants & Dining', icon: '🍽️', categoryFilter: 'food-hospitality' },
  { id: 'repairs', name: 'AC & Home Repairs', icon: '🛠️', categoryFilter: 'services-repairs' },
  { id: 'textiles', name: 'Handloom & Sarees', icon: '🧵', categoryFilter: 'handloom-textiles' },
  { id: 'retail', name: 'Retail & Shops', icon: '🛍️', categoryFilter: 'retail-shops' },
  { id: 'gyms', name: 'Gyms & Fitness', icon: '💪', categoryFilter: 'fitness-wellness' },
  { id: 'hotels', name: 'Hotels & Lodging', icon: '🏨', categoryFilter: 'tourism-hospitality' },
  { id: 'salons', name: 'Salons & Spa', icon: '✂️', categoryFilter: 'salons-beauty' },
  { id: 'agro', name: 'Agro & Cold Storage', icon: '🌾', categoryFilter: 'agriculture-farming' },
  { id: 'mfg', name: 'Manufacturing', icon: '⚙️', categoryFilter: 'manufacturing-industrial' },
  { id: 'it', name: 'IT & Software', icon: '💻', categoryFilter: 'it-software' }
];

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<BusinessSearchResult[]>([]);
  const [fallbackBusinesses, setFallbackBusinesses] = useState<ConfluxBusiness[]>([]);
  const [contributions, setContributions] = useState<LocalContribution[]>([]);
  const [discoveryMode, setDiscoveryMode] = useState<'BUSINESSES' | 'COMMUNITY_SIGNALS'>('BUSINESSES');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State — Initialize from URL search params if present
  const initialWhat = searchParams.get('what') || '';
  const initialWhere = searchParams.get('where') || '';

  const [whatQuery, setWhatQuery] = useState(initialWhat);
  const [whereQuery, setWhereQuery] = useState(initialWhere);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [requiredAction, setRequiredAction] = useState<CapabilityActionType | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount =
    (whereQuery.trim() !== '' ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (openNowOnly ? 1 : 0) +
    (requiredAction !== 'all' ? 1 : 0) +
    (activeCategory !== 'all' ? 1 : 0);

  // Load fallback verified businesses once
  useEffect(() => {
    businessService.searchBusinesses({ verifiedOnly: true })
      .then(res => {
        if (Array.isArray(res)) {
          setFallbackBusinesses(res.slice(0, 3).map(r => r.business).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  const executeSearch = async (overrideWhat?: string, overrideWhere?: string) => {
    setIsLoading(true);

    const currentWhat = overrideWhat !== undefined ? overrideWhat : whatQuery;
    const currentWhere = overrideWhere !== undefined ? overrideWhere : whereQuery;

    // Natural Intent Parser: Extract embedded "in <location>" from "what" query if whereQuery is empty
    let parsedWhat = currentWhat.trim();
    let parsedWhere = currentWhere.trim().toLowerCase();

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

    const [res, contribs] = await Promise.all([
      businessService.searchBusinesses({
        query: parsedWhat || undefined,
        district: districtParam,
        city: cityParam,
        category: categoryParam,
        verifiedOnly: verifiedOnly ? true : undefined,
        openNow: openNowOnly ? true : undefined,
        requiredAction: requiredAction !== 'all' ? requiredAction : undefined
      }),
      localKnowledgeService.getContributions({
        locality: cityParam || districtParam || undefined,
        query: parsedWhat || undefined
      }).catch(err => {
        console.warn('[DiscoverPage] Error loading contributions:', err);
        return [] as LocalContribution[];
      })
    ]);

    setResults(Array.isArray(res) ? res : []);
    setContributions(Array.isArray(contribs) ? contribs : []);
    setIsLoading(false);

    // Track search intent telemetry (fail-safe)
    if (parsedWhat || parsedWhere) {
      try {
        connectService.logEvent({
          businessId: 'conflux_discovery_hub',
          eventType: 'DISCOVERY_SEARCH',
          intentId: `${parsedWhat || 'all_services'} | ${parsedWhere || 'all_locations'}`
        });
      } catch {
        // Telemetry fail-open
      }
    }
  };

  // Run search whenever filters or URL params change
  useEffect(() => {
    executeSearch();
  }, [activeCategory, verifiedOnly, openNowOnly, requiredAction]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (whatQuery.trim()) params.set('what', whatQuery.trim());
    if (whereQuery.trim()) params.set('where', whereQuery.trim());
    setSearchParams(params);
    executeSearch();
  };

  const handleIntentShortcut = (what: string, where: string = '') => {
    setWhatQuery(what);
    setWhereQuery(where);
    const params = new URLSearchParams();
    if (what.trim()) params.set('what', what.trim());
    if (where.trim()) params.set('where', where.trim());
    setSearchParams(params);
    executeSearch(what, where);
  };

  const handleResetFilters = () => {
    setWhatQuery('');
    setWhereQuery('');
    setActiveCategory('all');
    setVerifiedOnly(false);
    setOpenNowOnly(false);
    setRequiredAction('all');
    setSearchParams({});
    businessService.searchBusinesses().then(res => {
      if (Array.isArray(res)) setResults(res);
    });
  };

  const handleActionClick = (
    bizId: string,
    actionType: 'PHONE_CLICK' | 'WHATSAPP_CLICK' | 'DIRECTIONS_CLICK' | 'BOOKING_CLICK'
  ) => {
    try {
      connectService.logEvent({
        businessId: bizId,
        eventType: actionType,
        channel: 'HUMAN_WEB'
      });
    } catch {
      // Telemetry fail-open
    }
  };

  const hasActiveFilters =
    whatQuery.trim() !== '' ||
    whereQuery.trim() !== '' ||
    activeCategory !== 'all' ||
    verifiedOnly ||
    openNowOnly ||
    requiredAction !== 'all';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-inter">
      {/* ── DAYLIGHT HERO SECTION ─────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 text-slate-900 pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-slate-50/60 -z-10" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold">
            <ShieldCheck size={14} className="text-blue-600" />
            <span>Local Trust &amp; Discovery Hub</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Find a local business you can trust.
            </h1>
            <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Discover statutory-verified businesses, clinics, and local services across West Bengal.
            </p>
          </div>

          {/* ── GUIDED 2-STEP SEARCH INPUT BAR ─────────────────────── */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto mt-4 p-2 sm:p-2.5 rounded-2xl bg-white shadow-lg shadow-slate-200/80 border border-slate-200 text-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-left"
          >
            {/* Step 1: What */}
            <div className="relative flex items-center flex-1 pl-3 pr-2 py-1 bg-slate-50/70 sm:bg-transparent rounded-xl sm:rounded-none">
              <Search className="text-blue-600 shrink-0 mr-2.5" size={18} />
              <input
                type="text"
                value={whatQuery}
                onChange={e => setWhatQuery(e.target.value)}
                placeholder="What are you looking for? (Doctor, AC...)"
                className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none py-1.5"
              />
              {whatQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setWhatQuery('');
                    executeSearch('', whereQuery);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 mr-1 cursor-pointer"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200 my-auto" />

            {/* Step 2: Where */}
            <div className="relative flex items-center flex-1 pl-3 pr-2 py-1 bg-slate-50/70 sm:bg-transparent rounded-xl sm:rounded-none">
              <MapPin className="text-slate-400 shrink-0 mr-2.5" size={18} />
              <input
                type="text"
                value={whereQuery}
                onChange={e => setWhereQuery(e.target.value)}
                placeholder="Where? (Ranaghat, Nadia, Kolkata)"
                className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none py-1.5"
              />
              {whereQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setWhereQuery('');
                    executeSearch(whatQuery, '');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 mr-1 cursor-pointer"
                  title="Clear location"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                isFilterOpen || activeFilterCount > 0
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Filters"
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              className="min-h-[44px] py-2.5 px-5 sm:px-6 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-sm shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Search</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* ── COLLAPSIBLE FILTER PANEL ─────────────────────────── */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="max-w-3xl mx-auto mt-3 overflow-hidden text-left"
              >
                <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-white/20 text-slate-900 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="text-xs font-bold font-orbitron text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Filter size={14} className="text-blue-600" />
                      <span>Search &amp; Quality Filters</span>
                    </div>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-xs font-bold text-slate-500 hover:text-red-600 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>Reset All</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Location Input */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                        Location / City / District
                      </label>
                      <div className="relative flex items-center">
                        <MapPin size={16} className="text-blue-600 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={whereQuery}
                          onChange={e => setWhereQuery(e.target.value)}
                          placeholder="e.g. Ranaghat, Santipur, Nadia..."
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Preferred Channel */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                        Direct Contact Channel
                      </label>
                      <select
                        value={requiredAction}
                        onChange={e => setRequiredAction(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">All Channels</option>
                        <option value="WHATSAPP">WhatsApp Direct</option>
                        <option value="CALL">Direct Call</option>
                        <option value="BOOKING">Online Booking</option>
                        <option value="DIRECTIONS">Map Directions</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setVerifiedOnly(!verifiedOnly)}
                      className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        verifiedOnly
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <ShieldCheck size={15} className={verifiedOnly ? 'text-white' : 'text-emerald-600'} />
                      <span>Statutory Verified Only</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenNowOnly(!openNowOnly)}
                      className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        openNowOnly
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Clock size={15} className={openNowOnly ? 'text-white' : 'text-blue-600'} />
                      <span>Open Now</span>
                    </button>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        executeSearch();
                        setIsFilterOpen(false);
                      }}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Category Shortcuts */}
          {/* Quick Category Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium text-xs">Popular:</span>
            {[
              { label: '🏥 Diagnostic & Doctors', query: 'Doctor' },
              { label: '🍽️ Restaurants', query: 'Restaurant' },
              { label: '💪 Gyms', query: 'Gym' },
              { label: '❄️ AC Repair', query: 'AC Repair' },
              { label: '🏨 Hotels', query: 'Hotel' },
              { label: '🧵 Handloom Sarees', query: 'Saree' }
            ].map(pill => (
              <button
                key={pill.label}
                type="button"
                onClick={() => handleIntentShortcut(pill.query, '')}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Trust Value Badges Under Search */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Statutory Evidence Grounded
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Zero Sponsored Ranking Bias
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Direct WhatsApp &amp; Call
            </span>
          </div>
        </div>
      </section>

      {/* ── INTENT & CATEGORY SHORTCUT CHIPS ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-md border border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_SHORTCUTS.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                openNowOnly
                  ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock size={14} className={openNowOnly ? 'text-white' : 'text-blue-700'} />
              <span>Open Now</span>
            </button>

            {/* Capability Select */}
            <select
              value={requiredAction}
              onChange={e => setRequiredAction(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold focus:outline-none cursor-pointer border-none min-h-[40px]"
            >
              <option value="all">All Contact Methods</option>
              <option value="WHATSAPP">WhatsApp Direct</option>
              <option value="CALL">Direct Call</option>
              <option value="BOOKING">Online Booking</option>
              <option value="DIRECTIONS">Map Directions</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer min-h-[40px]"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Results Counter */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-900">
              {isLoading
                ? 'Searching...'
                : results.length === 0
                ? '0 Businesses'
                : `${results.length} ${results.length === 1 ? 'Business' : 'Businesses'}`}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              West Bengal Directory
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
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse space-y-4"
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
          /* Calm Empty State with Clear Progressive Actions */
          <div className="space-y-8">
            <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-5 max-w-2xl mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center">
                <Building2 size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {whereQuery.trim()
                    ? `We're building the trusted local network in ${whereQuery.trim()}.`
                    : "We're building the trusted local network here."}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                  {whereQuery.trim()
                    ? `No verified businesses found in ${whereQuery.trim()} yet. We verify every business against primary statutory records before publishing.`
                    : 'No verified businesses match this specific filter yet.'}
                </p>
              </div>

              {/* One clear set of next actions */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setWhereQuery('Nadia');
                    executeSearch(whatQuery, 'Nadia');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Explore Nadia District
                </button>
                <Link
                  to="/list-business"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all"
                >
                  Add a Business Free
                </Link>
                <Link
                  to="/contribute"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Suggest Local Information
                </Link>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-semibold"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Fallback Listings: Gracefully expand to nearest verified businesses */}
            {fallbackBusinesses.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Verified Businesses in Nadia &amp; West Bengal
                    </h4>
                    <span className="text-xs text-slate-500">
                      Statutory verified establishments ready to connect
                    </span>
                  </div>
                  <Link to="/discover" onClick={handleResetFilters} className="text-xs font-bold text-blue-700 hover:underline">
                    View full directory &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fallbackBusinesses.map((biz) => {
                    const isOpen = businessService.isBusinessOpenNow(biz.operatingHours);
                    return (
                      <div
                        key={biz.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              <ShieldCheck size={11} className="text-emerald-600" /> Conflux Verified
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {isOpen ? '● Open' : 'Closed'}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-slate-900">
                            <Link to={`/business/${biz.slug}`} className="hover:text-blue-700">
                              {biz.name}
                            </Link>
                          </h5>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={11} className="text-blue-600" />
                            <span>{biz.location.locality || biz.location.city}, {biz.location.district}</span>
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          {biz.contact.whatsapp && (
                            <a
                              href={`https://wa.me/${biz.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold text-center border border-emerald-200"
                            >
                              WhatsApp
                            </a>
                          )}
                          {biz.contact.phone && (
                            <a
                              href={`tel:${biz.contact.phone}`}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center"
                            >
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Populated Results Grid — Compact Scannable Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {results.map(({ business: biz }) => {
              const isOpenNow = businessService.isBusinessOpenNow(biz.operatingHours);
              const isVerified = biz.verificationStatus === 'SUPPORTED';
              const isPartner = (biz as any).commercialPlan && (biz as any).commercialPlan !== 'FREE';
              const profileUrl = `/business/${biz.slug}`;

              return (
                <div
                  key={biz.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group space-y-3.5"
                >
                  <div className="space-y-2">
                    {/* Badges Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold shadow-sm">
                            <ShieldCheck size={12} className="text-emerald-600 shrink-0" /> Conflux Verified
                          </span>
                        )}
                        {isPartner && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                            Conflux Partner
                          </span>
                        )}
                      </div>

                      <span
                        className={`font-semibold text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                          isOpenNow
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isOpenNow ? '● Open Now' : 'Closed'}
                      </span>
                    </div>

                    {/* Business Name & Location */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                        <Link to={profileUrl}>{biz.name}</Link>
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-blue-700 font-semibold">{biz.categoryName || biz.categoryId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          {biz.location.locality || biz.location.city}, {biz.location.district}
                        </span>
                      </div>
                    </div>

                    {/* Short summary or services */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {biz.shortSummary || biz.description}
                    </p>
                  </div>

                  {/* 1-Tap Connect Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {biz.contact.whatsapp && (
                        <a
                          href={`https://wa.me/${biz.contact.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(biz.name)},%20I%20found%20your%20business%20on%20Conflux%20AI.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleActionClick(biz.id, 'WHATSAPP_CLICK')}
                          className="min-h-[40px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                          title="WhatsApp Inquiry"
                        >
                          <MessageSquare size={13} className="shrink-0" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {biz.contact.phone && (
                        <a
                          href={`tel:${biz.contact.phone}`}
                          onClick={() => handleActionClick(biz.id, 'PHONE_CLICK')}
                          className="min-h-[40px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                          title="Call Directly"
                        >
                          <Phone size={13} className="text-blue-600 shrink-0" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>

                    <Link
                      to={profileUrl}
                      className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1 shrink-0"
                      title="View Details"
                    >
                      <span>Details</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── WHY CONFLUX TRUST MATTERS (EXPLAINER SECTION) ──────── */}
        <div className="mt-16 pt-12 border-t border-slate-200 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 font-inter">
              Why Conflux Discovery is Different
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Unlike generic directories or ad-driven portals, Conflux is built on immutable statutory verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-inter">
                Primary Registrar Grounding
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We independently corroborate registration identifiers, licenses, and trade documents against official registries before verifying a business.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Compass size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-inter">
                Organic Discovery
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero hidden bidding auctions. Ranking is computed transparently based on verification depth, locality relevance, and confirmed operational capability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-inter">
                Direct Connect
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with business owners via phone and official WhatsApp — zero middleman commissions or lead laundering.
              </p>
            </div>
          </div>

          {/* Business Owner Onboarding Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold font-inter text-white">
                Are you a local business owner?
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                List your business and submit statutory credentials to establish verified presence and connect directly with customers in your locality.
              </p>
            </div>
            <Link
              to="/list-business"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0 min-h-[44px] flex items-center justify-center"
            >
              List Your Business Free &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── LOCAL KNOWLEDGE MODALS ───────────────────────────────────── */}
      <RequestBusinessModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultLocality={whereQuery || 'Ranaghat'}
      />

      <CreateContributionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultLocality={whereQuery || 'Ranaghat'}
        onCreated={(newC) => {
          setContributions(prev => [newC, ...prev]);
        }}
      />
    </div>
  );
};
