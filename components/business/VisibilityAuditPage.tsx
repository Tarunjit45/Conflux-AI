// Conflux Platform — Standalone Visibility & AI Search Readiness Audit Page

import React from 'react';
import { VisibilityAuditTool } from './VisibilityAuditTool.tsx';
import { ShieldCheck, Bot, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const VisibilityAuditPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-50 font-inter text-slate-900 pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Intro */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider">
            <Globe size={13} className="text-blue-600" /> Free Technical Assessment
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-orbitron text-slate-950 tracking-tight">
            Local Business Visibility &amp; AI Readiness Audit
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Measure your technical SEO foundation, local NAP consistency, statutory evidence depth, and AI-search retrieval readiness across Google, ChatGPT, and Gemini.
          </p>
        </div>

        {/* Audit Tool Card */}
        <VisibilityAuditTool />

        {/* Value Explainer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-bold font-orbitron text-slate-900 text-sm">
              <Globe size={18} className="text-blue-600" /> Google Search &amp; Maps
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verify that your local address, coordinates, and Schema.org structured data are crawlable and properly indexed by search engines.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-bold font-orbitron text-slate-900 text-sm">
              <Bot size={18} className="text-purple-600" /> AI Engine Retrieval (GEO/AEO)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Structure entity descriptions and service Q&amp;As so AI models can accurately understand, reference, and quote your business.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-bold font-orbitron text-slate-900 text-sm">
              <ShieldCheck size={18} className="text-emerald-600" /> Evidence-Based Trust
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect official registration records to prove authenticity and provide customers with transparent proof.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center pt-4">
          <Link
            to="/business"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 hover:underline"
          >
            Learn more about Conflux B2B Solutions for Businesses &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
};
