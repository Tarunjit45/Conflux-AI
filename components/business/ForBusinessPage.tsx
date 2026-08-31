// Conflux Platform — B2B For Businesses Overview & Visibility Solutions

import React from 'react';
import { motion } from 'framer-motion';
import {
  Search, ShieldCheck, CheckCircle2, ArrowRight, Bot, BarChart3,
  Phone, Globe, Zap, Building2, Lock, Sparkles, Check, ChevronRight, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VisibilityAuditTool } from './VisibilityAuditTool.tsx';

export const ForBusinessPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-white font-inter text-slate-900 pt-28 pb-20 overflow-x-hidden">
      {/* ── HERO SECTION ────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles size={13} className="text-blue-600" /> B2B Local Visibility + Trust Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-orbitron text-slate-950 tracking-tight leading-[1.1]">
            Get Discovered, <span className="text-blue-600">Trusted</span>, and Contacted.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            We make local businesses discoverable, understandable, trusted, and contactable across Google search, local maps, and AI engines (ChatGPT, Google Gemini, Perplexity).
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#audit-tool"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Check My Business Visibility</span>
              <ArrowRight size={16} />
            </a>

            <Link
              to="/list-business"
              className="px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Building2 size={16} />
              <span>List &amp; Verify Business</span>
            </Link>
          </div>
        </div>

        {/* Core Value Flow Banner */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
          <div className="text-xs font-bold text-blue-400 uppercase font-mono tracking-wider">
            The Conflux Value Engine
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {[
              { step: '1. Business', desc: 'Canonical Identity' },
              { step: '2. Sources', desc: 'Authoritative Registries' },
              { step: '3. Evidence', desc: 'Verifiable Dockets' },
              { step: '4. Verification', desc: 'Conflux Trust Badge' },
              { step: '5. Search / AI', desc: 'Google & AI Discovery' },
              { step: '6. Customer', desc: 'Informed Buyer' },
              { step: '7. Lead', desc: 'Direct Conversion' }
            ].map((node, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <div className="text-xs font-bold font-orbitron text-white">{node.step}</div>
                <div className="text-[10px] text-slate-400">{node.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4-STEP WORKFLOW: AUDIT -> FIX -> MONITOR -> GROW ─────────── */}
      <section className="py-20 bg-slate-50 border-y border-slate-200 mt-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-950">
              The 4-Step Visibility &amp; Growth Framework
            </h2>
            <p className="text-sm text-slate-600">
              A transparent, engineering-driven process designed to convert search visibility into qualified customer leads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1: Audit */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-bold font-orbitron flex items-center justify-center text-lg border border-blue-200">
                01
              </div>
              <h3 className="text-base font-bold font-orbitron text-slate-900">Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluate technical SEO, Schema.org structured data, NAP consistency, and AI search presence across Google and AI models.
              </p>
            </div>

            {/* Step 2: Fix */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold font-orbitron flex items-center justify-center text-lg border border-emerald-200">
                02
              </div>
              <h3 className="text-base font-bold font-orbitron text-slate-900">Fix &amp; Verify</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deploy clean semantic markup, verify statutory registration evidence, and attach the Conflux Verified Badge to physical entities.
              </p>
            </div>

            {/* Step 3: Monitor */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 font-bold font-orbitron flex items-center justify-center text-lg border border-purple-200">
                03
              </div>
              <h3 className="text-base font-bold font-orbitron text-slate-900">Monitor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track real Google Search Console query impressions, indexing health, and telephone/WhatsApp click-through rates with zero fabricated data.
              </p>
            </div>

            {/* Step 4: Grow */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold font-orbitron flex items-center justify-center text-lg border border-amber-200">
                04
              </div>
              <h3 className="text-base font-bold font-orbitron text-slate-900">Grow</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Capture high-intent local customer inquiries through speed-to-lead WhatsApp routing and direct booking endpoints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE VISIBILITY AUDIT TOOL SECTION ────────────────── */}
      <section id="audit-tool" className="py-20 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto">
        <VisibilityAuditTool />
      </section>

      {/* ── WHAT CONFLUX IMPLEMENTS (DELIVERABLES) ───────────────────── */}
      <section className="py-20 bg-slate-950 text-white px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold text-blue-400 uppercase font-mono tracking-widest">
              Standard Deliverables
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-orbitron">
              What Conflux Implements for Your Business
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Clear technical deliverables without fake ranking guarantees or manufactured traffic metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Search & AI Discoverability */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Globe size={20} />
              </div>
              <h3 className="text-base font-bold font-orbitron">Search &amp; AI Visibility</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>Schema.org LocalBusiness &amp; GeoCoordinates JSON-LD</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>AI search Q&amp;A entity formatting (GEO/AEO)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>Google Maps &amp; District Directory alignment</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2: Evidence & Trust Badges */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold font-orbitron">Evidence Verification</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Primary registrar docket verification (MCA / GSTIN / MSME)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Conflux Verified Badge with public evidence link</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Genuine storefront and proprietor photo certification</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3: Lead Routing & Telemetry */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Phone size={20} />
              </div>
              <h3 className="text-base font-bold font-orbitron">Lead Conversion Paths</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-purple-400 shrink-0 mt-0.5" />
                  <span>Direct WhatsApp 1-tap customer lead routing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-purple-400 shrink-0 mt-0.5" />
                  <span>Click-to-call &amp; booking endpoint telemetry</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-purple-400 shrink-0 mt-0.5" />
                  <span>Real inquiry tracking without synthetic metrics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-6">
            <Link
              to="/list-business"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-xl"
            >
              <span>Submit Your Business Listing</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
