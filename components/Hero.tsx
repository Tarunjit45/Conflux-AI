// Conflux Platform — Guided 2-Step Consumer Discovery Hero

import React, { useState } from 'react';
import {
  Search, ShieldCheck, ArrowRight, MapPin, CheckCircle2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const QUICK_CATEGORIES = [
  { label: '🏥 Healthcare', query: 'Doctor' },
  { label: '🍽️ Restaurants', query: 'Restaurant' },
  { label: '🛠️ Repairs & AC', query: 'AC Repair' },
  { label: '🧵 Handloom Sarees', query: 'Saree' },
  { label: '🛍️ Retail Shops', query: 'Shop' }
];

export const Hero: React.FC = () => {
  const [whatQuery, setWhatQuery] = useState('');
  const [whereQuery, setWhereQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const what = whatQuery.trim();
    const where = whereQuery.trim();

    if (what) params.set('what', what);
    if (where) params.set('where', where);

    const queryString = params.toString();
    navigate(queryString ? `/discover?${queryString}` : '/discover');
  };

  const handleCategoryClick = (categoryQuery: string) => {
    const params = new URLSearchParams();
    params.set('what', categoryQuery);
    if (whereQuery.trim()) {
      params.set('where', whereQuery.trim());
    }
    navigate(`/discover?${params.toString()}`);
  };

  return (
    <section className="relative bg-white text-slate-900 pt-16 sm:pt-24 pb-10 sm:pb-16 px-4 sm:px-6 lg:px-12 overflow-hidden font-inter border-b border-slate-100">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-slate-50/50 -z-10" />
      <div className="absolute top-12 right-10 w-72 h-72 bg-blue-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full text-center space-y-6">
        
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Local Information &amp; Trust Network</span>
        </div>

        {/* Primary Headline & Supporting Copy */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight max-w-3xl mx-auto font-inter">
            Discover local businesses you can trust.
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Find local businesses, check the evidence, and connect directly with verified proprietors.
          </p>
        </div>

        {/* ── GUIDED 2-STEP SEARCH BAR ── */}
        <form 
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto p-2 sm:p-2.5 rounded-2xl bg-white shadow-lg shadow-slate-200/80 border border-slate-200 text-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          {/* Step 1: What */}
          <div className="relative flex items-center flex-1 pl-3 pr-2 py-1 bg-slate-50/70 sm:bg-transparent rounded-xl sm:rounded-none">
            <Search className="text-blue-600 shrink-0 mr-2.5" size={18} />
            <input
              type="text"
              value={whatQuery}
              onChange={(e) => setWhatQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none py-2"
              autoComplete="off"
            />
          </div>

          <div className="hidden sm:block w-px h-8 bg-slate-200 my-auto" />

          {/* Step 2: Where */}
          <div className="relative flex items-center flex-1 pl-3 pr-2 py-1 bg-slate-50/70 sm:bg-transparent rounded-xl sm:rounded-none">
            <MapPin className="text-slate-400 shrink-0 mr-2.5" size={18} />
            <input
              type="text"
              value={whereQuery}
              onChange={(e) => setWhereQuery(e.target.value)}
              placeholder="Where?"
              className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none py-2"
              autoComplete="off"
            />
          </div>

          {/* Submit Action: Search */}
          <button
            type="submit"
            aria-label="Search local businesses"
            className="px-7 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-sm shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer min-h-[44px]"
          >
            <span>Search</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {QUICK_CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategoryClick(cat.query)}
              className="px-3.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 text-slate-700 text-xs font-medium transition-all cursor-pointer min-h-[36px] flex items-center"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> Statutory checked evidence
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> Direct WhatsApp &amp; Call
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> Zero sponsored bias
          </span>
        </div>

        {/* Business Owner Pathway / Secondary CTA */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Own a local business?</span>
          <Link
            to="/list-business"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-bold transition-all border border-slate-200/80"
          >
            <span>List Your Business — Free</span>
            <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Hero;
