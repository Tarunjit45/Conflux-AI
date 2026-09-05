// Conflux Platform — Mobile-First Consumer Discovery Hero

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, ShieldCheck, ArrowRight, Sparkles, MapPin, Building2, CheckCircle2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const QUICK_CATEGORIES = [
  { label: '🏥 Healthcare', query: 'Doctor' },
  { label: '🍽️ Food & Dining', query: 'Restaurant' },
  { label: '🛠️ Repairs & AC', query: 'AC Repair' },
  { label: '🧵 Handloom Sarees', query: 'Saree' },
  { label: '🛍️ Retail Shops', query: 'Shop' }
];

export const Hero: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/discover?what=${encodeURIComponent(q)}`);
    } else {
      navigate('/discover');
    }
  };

  const handleCategoryClick = (categoryQuery: string) => {
    navigate(`/discover?what=${encodeURIComponent(categoryQuery)}`);
  };

  return (
    <section className="relative bg-white text-slate-900 pt-16 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-6 lg:px-12 overflow-hidden font-inter border-b border-slate-100">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-slate-50/50 -z-10" />
      <div className="absolute top-12 right-10 w-72 h-72 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full text-center space-y-5 sm:space-y-6">
        
        {/* Calm Trust Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Verified Local Discovery &bull; West Bengal
        </div>

        {/* Primary Mobile-First Question / Headline */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-orbitron text-slate-950 tracking-tight leading-tight max-w-3xl mx-auto">
            Find trusted local businesses, doctors &amp; services.
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Statutory-checked clinics, shops, artisans, and services you can connect with directly.
          </p>
        </div>

        {/* ── PRIMARY INTERACTION: ONE UNIFIED SEARCH BAR ── */}
        <form 
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-white shadow-xl shadow-slate-200/70 border border-slate-200 text-slate-900 flex items-center gap-2"
        >
          <div className="relative flex items-center flex-1 pl-3 sm:pl-4">
            <Search className="text-blue-600 shrink-0 mr-2.5 sm:mr-3" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for? (e.g. Doctor, AC, Gym...)"
              className="w-full bg-transparent text-base font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none py-2.5 sm:py-3"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            aria-label="Search"
            className="px-5 sm:px-7 py-3 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px]"
          >
            <span>Search</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Discovery Category Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1">
          {QUICK_CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategoryClick(cat.query)}
              className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 text-slate-700 text-xs font-semibold transition-all cursor-pointer min-h-[36px] flex items-center"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Trust Points - Calm, Short */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> Statutory verified evidence
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> 1-Tap direct WhatsApp &amp; Call
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> Zero sponsored bias
          </span>
        </div>

        {/* For Businesses Sub-Banner */}
        <div className="pt-2 text-xs text-slate-500">
          Own a local business?{' '}
          <Link to="/business" className="font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5">
            Get listed and verified free &rarr;
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Hero;
