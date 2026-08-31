// Conflux Platform — Interactive Business Visibility & AI Search Readiness Audit Tool

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  Sparkles, Globe, MapPin, Building2, HelpCircle, Phone, Lock, FileText,
  RefreshCw, BarChart3, Bot, Compass, ExternalLink
} from 'lucide-react';
import { runVisibilityAudit, type VisibilityAuditReport, type AuditCheckItem } from '../../lib/visibilityAudit.ts';
import { Link } from 'react-router-dom';

interface VisibilityAuditToolProps {
  initialBusinessName?: string;
  initialLocation?: string;
  initialWebsite?: string;
  onAuditComplete?: (report: VisibilityAuditReport) => void;
  compact?: boolean;
}

export const VisibilityAuditTool: React.FC<VisibilityAuditToolProps> = ({
  initialBusinessName = '',
  initialLocation = '',
  initialWebsite = '',
  onAuditComplete,
  compact = false
}) => {
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [location, setLocation] = useState(initialLocation);
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsite);
  const [category, setCategory] = useState('');
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [report, setReport] = useState<VisibilityAuditReport | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CHECKS' | 'DELIVERABLES'>('OVERVIEW');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !location) return;

    setIsAuditing(true);
    setTimeout(() => {
      const generatedReport = runVisibilityAudit({
        businessName,
        location,
        websiteUrl: websiteUrl || undefined,
        category: category || undefined
      });
      setReport(generatedReport);
      setIsAuditing(false);
      if (onAuditComplete) {
        onAuditComplete(generatedReport);
      }
    }, 700);
  };

  const getStatusBadge = (status: AuditCheckItem['status']) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={12} className="text-emerald-600" /> PASS
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertTriangle size={12} className="text-amber-600" /> NEEDS ATTENTION
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <XCircle size={12} className="text-rose-600" /> CRITICAL GAP
          </span>
        );
      case 'REQUIRES_INTEGRATION':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            <HelpCircle size={12} className="text-blue-600" /> REQUIRES GSC
          </span>
        );
    }
  };

  return (
    <div className="w-full font-inter">
      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles size={13} className="text-blue-600" /> Local Visibility &amp; AI Readiness Audit
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-900 tracking-tight">
            Check My Business Visibility
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Evaluate your technical SEO, local search signals, business identity consistency, AI-search readiness, and contact pathways based on measurable criteria.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Business Name */}
          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Business Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Ranaghat Diagnostic Centre"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Location / District *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Ranaghat, Nadia, West Bengal"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          {/* Website URL (Optional) */}
          <div className="sm:col-span-7 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Website URL <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="url"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://yourbusiness.in"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Industry Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="">Select Category...</option>
              <option value="healthcare">Healthcare &amp; Diagnostics</option>
              <option value="retail">Retail &amp; Showrooms</option>
              <option value="manufacturing">Manufacturing &amp; Engineering</option>
              <option value="hospitality">Hospitality &amp; Dining</option>
              <option value="professional-services">Professional Services</option>
              <option value="home-repair">Home Repair &amp; Workshops</option>
              <option value="agro-processing">Agro-Processing &amp; Trade</option>
              <option value="handloom-craft">Handloom &amp; Textiles</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-12 pt-2">
            <button
              type="submit"
              disabled={isAuditing}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAuditing ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Evaluating Signals &amp; Technical Footprint...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Run Free Visibility &amp; Trust Audit
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" /> Evidence-based evaluation
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={14} className="text-blue-600" /> Zero synthetic data &bull; 100% confidential
          </span>
          <span className="flex items-center gap-1.5">
            <Bot size={14} className="text-purple-600" /> Google &amp; AI-search ready
          </span>
        </div>
      </div>

      {/* Audit Results Report */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-8"
          >
            {/* Header Score Card */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                    Audit Report #{report.id}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black font-orbitron tracking-tight text-white">
                    {report.businessName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <MapPin size={13} className="text-blue-400" /> {report.location}
                    {report.websiteUrl && (
                      <span className="flex items-center gap-1 text-slate-400">
                        &bull; <Globe size={13} /> {report.websiteUrl}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score Gauge */}
                <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:px-6 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Overall Score</div>
                    <div className="text-xs font-bold text-blue-400 font-orbitron">{report.statusGrade.replace(/_/g, ' ')}</div>
                  </div>
                  <div className={`text-4xl font-black font-orbitron ${
                    report.overallScore >= 75 ? 'text-emerald-400' : report.overallScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {report.overallScore}<span className="text-lg text-slate-500 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* 5 Pillar Category Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-800">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Technical SEO</div>
                  <div className="text-lg font-bold font-orbitron text-white">{report.categoryScores.technicalSeo}%</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Local Signals</div>
                  <div className="text-lg font-bold font-orbitron text-white">{report.categoryScores.localSignals}%</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Identity Evidence</div>
                  <div className="text-lg font-bold font-orbitron text-white">{report.categoryScores.identityConsistency}%</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400">AI Readiness</div>
                  <div className="text-lg font-bold font-orbitron text-white">{report.categoryScores.aiReadiness}%</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Conversion Paths</div>
                  <div className="text-lg font-bold font-orbitron text-white">{report.categoryScores.conversionPaths}%</div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6">
              {[
                { id: 'OVERVIEW', label: 'Executive Summary' },
                { id: 'CHECKS', label: `Detailed Audit Checks (${report.checks.length})` },
                { id: 'DELIVERABLES', label: 'Conflux Implementation Roadmap' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                <p className="text-slate-700 leading-relaxed text-sm sm:text-base font-medium">
                  {report.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Problems Found */}
                  <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-3">
                    <div className="flex items-center gap-2 text-rose-950 font-bold font-orbitron text-sm">
                      <XCircle size={16} className="text-rose-600" /> Problems Identified
                    </div>
                    <ul className="space-y-2">
                      {report.problemsFound.map((prob, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-rose-900 leading-relaxed">
                          <span className="font-bold text-rose-600 shrink-0">&bull;</span>
                          <span>{prob}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Fixes */}
                  <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold font-orbitron text-sm">
                      <CheckCircle2 size={16} className="text-emerald-600" /> Recommended Action Items
                    </div>
                    <ul className="space-y-2">
                      {report.recommendedFixes.map((fix, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-emerald-900 leading-relaxed">
                          <span className="font-bold text-emerald-600 shrink-0">&bull;</span>
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Commercial Outcome Box */}
                <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 space-y-2">
                  <div className="text-xs font-bold text-blue-900 uppercase font-mono tracking-wider">
                    Expected Commercial Outcome
                  </div>
                  <p className="text-xs sm:text-sm text-blue-950 font-medium leading-relaxed">
                    {report.expectedCommercialOutcome}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: DETAILED CHECKS */}
            {activeTab === 'CHECKS' && (
              <div className="space-y-4">
                {report.checks.map(check => (
                  <div key={check.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          {check.category.replace(/_/g, ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{check.title}</h4>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Finding:</strong> {check.finding}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Observed Evidence</span>
                        <p className="text-slate-600">{check.evidence}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-700 uppercase">What Conflux Implements</span>
                        <p className="text-blue-950 font-medium">{check.whatConfluxImplements}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: DELIVERABLES & ROADMAP */}
            {activeTab === 'DELIVERABLES' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* What Conflux Implements */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="text-sm font-bold font-orbitron text-slate-900 flex items-center gap-2">
                      <Compass size={16} className="text-blue-600" /> What Conflux Will Implement
                    </div>
                    <ul className="space-y-2.5">
                      {report.whatConfluxWillImplement.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
                          <span className="font-semibold">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What Will Be Measured */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="text-sm font-bold font-orbitron text-slate-900 flex items-center gap-2">
                      <BarChart3 size={16} className="text-emerald-600" /> What Will Be Measured
                    </div>
                    <ul className="space-y-2.5">
                      {report.whatWillBeMeasured.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-semibold">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Limitations & Integrity */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
                  <div className="font-bold text-slate-800 uppercase font-mono text-[10px]">
                    Technical Governance &amp; Truthfulness Notice
                  </div>
                  <ul className="space-y-1">
                    {report.dataLimitations.map((lim, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-slate-400">&bull;</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Next Steps CTA */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-lg sm:text-xl font-bold font-orbitron">
                  Ready to fix your local visibility and get verified?
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  Submit your business profile or apply for the Conflux Verified Badge to start receiving customer leads.
                </p>
              </div>

              <Link
                to="/list-business"
                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-lg shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <span>List &amp; Verify Business</span>
                <ArrowRight size={15} />
              </Link>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
