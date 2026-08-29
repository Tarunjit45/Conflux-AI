// Conflux Platform — Human Discovery Interface (/discover)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, Filter, MapPin, Building2, ShieldCheck, Clock, Phone,
  MessageSquare, ArrowRight, Sparkles, AlertCircle, CheckCircle2,
  Compass, ExternalLink, SlidersHorizontal, Check
} from 'lucide-react';
import { businessService } from '../../lib/businessService';
import { connectService } from '../../lib/connectService';
import type { BusinessSearchResult, CapabilityActionType } from '../../types/business';
import { WEST_BENGAL_DISTRICTS } from '../../data/locationsData';
import { BUSINESS_CATEGORY_TAXONOMY } from '../../data/taxonomiesData';

export const DiscoverPage: React.FC = () => {
  const [results, setResults] = useState<BusinessSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [requiredAction, setRequiredAction] = useState<CapabilityActionType | 'all'>('all');

  const executeSearch = async () => {
    setIsLoading(true);
    const searchParams = {
      query: searchQuery.trim() || undefined,
      district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      verifiedOnly: verifiedOnly ? true : undefined,
      openNow: openNowOnly ? true : undefined,
      requiredAction: requiredAction !== 'all' ? requiredAction : undefined
    };

    const res = await businessService.searchBusinesses(searchParams);
    setResults(res);
    setIsLoading(false);
  };

  useEffect(() => {
    executeSearch();
  }, [selectedDistrict, selectedCategory, verifiedOnly, openNowOnly, requiredAction]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleActionClick = (bizId: string, actionType: 'PHONE_CLICK' | 'WHATSAPP_CLICK') => {
    connectService.logEvent({
      businessId: bizId,
      eventType: actionType,
      channel: 'HUMAN_WEB'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono border border-blue-100">
            <Compass size={14} /> Conflux Business Graph Discovery
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-orbitron text-slate-900 tracking-tight">
            Discover Verified Local Businesses &amp; Industry Leaders
          </h1>
          <p className="text-base text-slate-600 font-medium">
            Search statutory-verified enterprises, manufacturing plants, artisans, and commercial services across West Bengal.
          </p>
        </div>

        {/* Search & Intent Input Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-center bg-white rounded-3xl border border-slate-200 shadow-lg p-2 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search className="ml-4 text-slate-400" size={22} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by business name, product, service, or locality..."
              className="w-full px-4 py-3 bg-transparent text-sm sm:text-base font-medium focus:outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick Filter Control Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
          {/* District Select */}
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Districts</option>
            {WEST_BENGAL_DISTRICTS.map(d => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
          </select>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="agriculture-farming">Agro-Processing & Farming</option>
            <option value="handloom-textiles">Handloom & Textiles</option>
            <option value="manufacturing-industrial">Manufacturing & Machining</option>
            <option value="it-software">IT, AI & Digital Software</option>
            <option value="healthcare">Healthcare & Diagnostic</option>
            <option value="hospitality">Hospitality & Tourism</option>
          </select>

          {/* Action Filter */}
          <select
            value={requiredAction}
            onChange={e => setRequiredAction(e.target.value as any)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Capabilities</option>
            <option value="WHATSAPP">WhatsApp Direct</option>
            <option value="BOOKING">Online Booking</option>
            <option value="CALL">Phone Call</option>
          </select>

          {/* Verified Toggle */}
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              verifiedOnly
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck size={14} /> Verified Only
          </button>

          {/* Open Now Toggle */}
          <button
            type="button"
            onClick={() => setOpenNowOnly(!openNowOnly)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              openNowOnly
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Clock size={14} /> Open Now
          </button>
        </div>

        {/* Search Results Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            {isLoading ? 'Querying Graph...' : `${results.length} Verified Businesses Matched`}
          </div>
          <div className="text-xs text-slate-500">
            Ranking: <span className="font-mono font-bold text-slate-700">Explainable Organic V1</span>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">Searching Conflux Business Graph...</div>
        ) : results.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <Building2 className="mx-auto text-slate-300" size={48} />
            <h3 className="text-lg font-bold font-orbitron text-slate-800">No matching verified businesses found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your filters, selecting a different district, or clearing the &ldquo;Verified Only&rdquo; toggle.
            </p>
          </div>
        ) : (
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
                  className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {biz.confluxBusinessId}
                      </span>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono">
                          <ShieldCheck size={12} className="text-emerald-600" /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold font-mono">
                          {biz.verificationStatus}
                        </span>
                      )}
                    </div>

                    {/* Title & Category */}
                    <div>
                      <h3 className="text-xl font-bold font-orbitron text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        <Link to={profileUrl}>{biz.name}</Link>
                      </h3>
                      <div className="text-xs font-bold text-slate-500 mt-1 capitalize">
                        {biz.categoryName || biz.categoryId}
                      </div>
                    </div>

                    {/* Location & Open Status */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="capitalize">{biz.location.city}, {biz.location.district}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span className={`font-bold font-mono ${isOpenNow ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {isOpenNow ? 'Open Now' : 'Closed'}
                        </span>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {biz.shortSummary || biz.description}
                    </p>

                    {/* Transparent Ranking Reason Tags */}
                    {rankingExplanation.reasonCodes.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        {rankingExplanation.reasonCodes.slice(0, 2).map(code => (
                          <span
                            key={code}
                            className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200"
                          >
                            {code.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connect Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
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
                    </div>

                    <Link
                      to={profileUrl}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all"
                    >
                      View Profile <ArrowRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
