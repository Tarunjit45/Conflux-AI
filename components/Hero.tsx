// Conflux Platform — Evidence-Based Hero Section

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Search, Globe,
  Bot, Phone, MapPin, Building2, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[85vh] bg-white text-slate-900 pt-28 pb-16 px-4 sm:px-6 lg:px-12 flex items-center overflow-hidden font-inter border-b border-slate-100">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-slate-50/60 -z-10" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Core Positioning */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Local Visibility + Trust Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-orbitron text-slate-950 tracking-tight leading-[1.1]">
            Make your business discoverable, <span className="text-blue-600">trusted</span>, and contactable.
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Google visibility + AI-search readiness + business evidence + lead conversion. We connect local businesses to authoritative registries, search engines, and high-intent customer demand.
          </p>

          {/* Core Benefit Pillars */}
          <div className="grid grid-cols-2 gap-3 py-1">
            {[
              "Google Search & Local Maps",
              "AI Search (GEO / AEO) Ready",
              "Evidence-Based Trust Badges",
              "1-Tap WhatsApp & Phone Leads"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Dual CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a 
              href="#audit-tool"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide transition-all shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Check My Business Visibility</span>
            </a>

            <Link 
              to="/business"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm tracking-wide transition-all border border-slate-200"
            >
              <span>For Businesses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center gap-3 pt-3 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Connecting to authoritative official sources &bull; Zero synthetic ranking claims</span>
          </div>
        </motion.div>

        {/* Right Column: Live Trust & Visibility Node Simulation */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-6"
        >
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl shadow-slate-200/60 space-y-6">
            
            {/* Entity Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">CFX-IN-WB-NADIA-000005</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-600" /> Conflux Verified
                  </span>
                </div>
                <h2 className="text-xl font-bold font-orbitron text-slate-900">
                  Ranaghat Diagnostic Centre
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={13} className="text-blue-600" /> Court Para, Ranaghat, Nadia, West Bengal
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono uppercase text-slate-400">Confidence</div>
                <div className="text-2xl font-black font-orbitron text-emerald-600">92.0%</div>
              </div>
            </div>

            {/* Evidence & Registry Source Attribution */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold text-slate-800 font-mono text-[11px] uppercase">Authoritative Statutory Record</span>
                <span className="text-emerald-700 font-bold">Corroborated</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Health &amp; Family Welfare Department &bull; Clinical Establishment License #WB-NAD-2024-8831 &bull; Active &amp; Verified.
              </p>
            </div>

            {/* Search & AI Readiness Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-medium">
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-900 space-y-0.5">
                <div className="font-bold text-[11px]">Google Maps</div>
                <div className="text-[10px] text-blue-600">NAP Aligned</div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 text-purple-900 space-y-0.5">
                <div className="font-bold text-[11px]">AI Search (GEO)</div>
                <div className="text-[10px] text-purple-600">Q&amp;A Structured</div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 space-y-0.5 col-span-2 sm:col-span-1">
                <div className="font-bold text-[11px]">Direct Lead Route</div>
                <div className="text-[10px] text-emerald-600">Instant 1-Tap</div>
              </div>
            </div>

            {/* Direct Action Capabilities */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20">
                <Phone size={14} /> WhatsApp Direct Lead
              </div>
              <Link
                to="/discover"
                className="p-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Explore Directory</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
