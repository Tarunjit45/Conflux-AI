// Conflux Platform — Local Visibility & Trust Platform Homepage

import React from 'react';
import { Hero } from './components/Hero.tsx';
import { VisibilityAuditTool } from './components/business/VisibilityAuditTool.tsx';
import TrustEngine from './components/TrustEngine.tsx';
import CompanyGlance from './components/CompanyGlance.tsx';
import ContactForm from './components/ContactForm.tsx';
import {
  ShieldCheck, Search, ArrowRight, Bot, Globe, CheckCircle2,
  Building2, Phone, Sparkles, HelpCircle, Check, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <main className="relative z-10 w-full overflow-hidden bg-white font-inter text-slate-900">
      {/* SECTION 1: Evidence-Based Hero */}
      <section id="home" className="relative bg-white">
        <Hero />
      </section>

      {/* SECTION 2: Interactive Visibility Audit Tool */}
      <section id="audit-tool" className="py-20 px-4 sm:px-6 lg:px-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto space-y-6">
          <VisibilityAuditTool />
        </div>
      </section>

      {/* SECTION 3: 4-Step Visibility Framework (Audit -> Fix -> Monitor -> Grow) */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold text-blue-600 uppercase font-mono tracking-widest">
              Core Framework
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-950">
              How Conflux Drives Local Discoverability &amp; Leads
            </h2>
            <p className="text-sm text-slate-600">
              Audit &rarr; Fix &rarr; Monitor &rarr; Grow. An engineering-led methodology to make businesses easy to discover, trust, and contact.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Audit */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold font-orbitron flex items-center justify-center text-sm shadow-md shadow-blue-600/20">
                01
              </div>
              <h3 className="text-base font-bold font-orbitron text-slate-900">Visibility Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan technical SEO, NAP accuracy, Schema.org LocalBusiness markup, and AI search readiness against measurable engineering criteria.
              </p>
            </div>

            {/* 2. Fix */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold font-orbitron flex items-center justify-center text-sm shadow-md shadow-emerald-600/20">
                02
              </div>
              <h3 className="text-base font-bold font-orbitron text-slate-900">Fix &amp; Verify</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Implement structured JSON-LD entity schemas, link statutory primary registrar dockets, and attach the Conflux Verified Trust Badge.
              </p>
            </div>

            {/* 3. Monitor */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold font-orbitron flex items-center justify-center text-sm shadow-md shadow-purple-600/20">
                03
              </div>
              <h3 className="text-base font-bold font-orbitron text-slate-900">Monitor Health</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track verified Google Search Console query trends, indexing stability, and AI knowledge graph citation integrity without synthetic numbers.
              </p>
            </div>

            {/* 4. Grow */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-bold font-orbitron flex items-center justify-center text-sm shadow-md shadow-amber-600/20">
                04
              </div>
              <h3 className="text-base font-bold font-orbitron text-slate-900">Convert Leads</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect high-intent local buyers directly to your business through automated WhatsApp speed-to-lead and 1-tap mobile calling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Dual Pillars (Consumer Promise vs Business Promise) */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Consumer Pillar */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold uppercase tracking-wider border border-blue-200">
                  <Search size={13} /> For Consumers &amp; Buyers
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-900 leading-tight">
                  Find a business. Check the evidence. Decide with confidence.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Discover verified local healthcare centers, engineering workshops, retail establishments, and professional services across West Bengal. Every listing links directly to primary statutory source documents.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                    <span>Transparent registry source links (MCA, GSTIN, Trade License)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                    <span>Conflux Verified Badge with public evidence dockets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                    <span>1-Click direct WhatsApp &amp; phone connection</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <span>Explore Local Business Directory</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  to="/verify"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Verify a Claim &rarr;
                </Link>
              </div>
            </div>

            {/* Business Pillar */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider border border-emerald-800/60">
                  <Building2 size={13} /> For Business Owners
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-orbitron text-white leading-tight">
                  Get discovered, trusted, and contacted.
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Make your business visible across Google Search, Google Maps, and AI search engines (ChatGPT, Google Gemini, Perplexity) with structured entity architectures and verified statutory trust badges.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>Schema.org LocalBusiness &amp; GeoCoordinates JSON-LD</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>AI search (GEO / AEO) entity structuring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>Qualified customer inquiries delivered to your phone</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to="/business"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  <span>Learn More For Businesses</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  to="/list-business"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  List Business Free
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: Trust Engine & Verification Principles */}
      <section id="trust" className="py-20 bg-white border-b border-slate-100 overflow-hidden">
        <TrustEngine />
      </section>

      {/* SECTION 6: Company Glance & Technical Footprint */}
      <section className="bg-slate-950 py-10 border-b border-slate-900">
        <CompanyGlance />
      </section>

      {/* SECTION 7: Direct Contact & Consultation */}
      <section id="contact" className="py-20 px-4 sm:px-6 md:px-12 lg:px-24 relative bg-slate-50 border-t border-slate-200">
        <ContactForm />
      </section>
    </main>
  );
};

export default LandingPage;
