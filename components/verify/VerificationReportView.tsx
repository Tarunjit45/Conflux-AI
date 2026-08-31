import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, HelpCircle, ExternalLink, Clock, FileText, CheckCircle2, Share2, Info, Lock } from 'lucide-react';
import type { VerificationResult, VerificationStatus, SourceTier } from '../../types/verify';

interface VerificationReportViewProps {
  result: VerificationResult;
}

const getStatusBadge = (status: VerificationStatus) => {
  switch (status) {
    case 'SUPPORTED':
      return {
        label: 'SUPPORTED',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
        desc: 'Corroborated by authoritative primary or verified first-party evidence.'
      };
    case 'PARTIALLY_SUPPORTED':
      return {
        label: 'PARTIALLY SUPPORTED',
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        desc: 'Evidence supports core elements of the claim, but secondary details remain unverified.'
      };
    case 'CONTRADICTED':
      return {
        label: 'CONTRADICTED',
        bg: 'bg-rose-50 text-rose-800 border-rose-300',
        icon: <XCircle className="w-5 h-5 text-rose-600" />,
        desc: 'Authoritative evidence directly refutes the statement made in the claim.'
      };
    case 'DISPUTED':
      return {
        label: 'DISPUTED',
        bg: 'bg-purple-50 text-purple-800 border-purple-300',
        icon: <AlertTriangle className="w-5 h-5 text-purple-600" />,
        desc: 'Conflicting evidence exists between primary and secondary sources.'
      };
    case 'OUTDATED':
      return {
        label: 'OUTDATED',
        bg: 'bg-orange-50 text-orange-800 border-orange-300',
        icon: <Clock className="w-5 h-5 text-orange-600" />,
        desc: 'Claim was previously true but has lapsed, expired, or been superseded.'
      };
    case 'INSUFFICIENT_EVIDENCE':
    default:
      return {
        label: 'INSUFFICIENT EVIDENCE',
        bg: 'bg-slate-100 text-slate-800 border-slate-300',
        icon: <HelpCircle className="w-5 h-5 text-slate-600" />,
        desc: 'No authoritative primary or first-party records were found to substantiate this claim.'
      };
  }
};

const getTierLabel = (tier: SourceTier) => {
  switch (tier) {
    case 'TIER_1_PRIMARY_AUTHORITATIVE':
      return { text: 'Tier 1: Primary Official Registrar', style: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'TIER_2_FIRST_PARTY':
      return { text: 'Tier 2: Official First-Party Record', style: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    case 'TIER_3_INDEPENDENT_HIGH_QUALITY':
      return { text: 'Tier 3: Independent High Quality', style: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
    case 'TIER_4_SECONDARY':
      return { text: 'Tier 4: Secondary Directory / Aggregator', style: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'TIER_5_USER_GENERATED':
      return { text: 'Tier 5: User-Generated / Community', style: 'bg-amber-50 text-amber-800 border-amber-200' };
  }
};

export const VerificationReportView: React.FC<VerificationReportViewProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const badge = getStatusBadge(result.status);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/verify/${result.entity.slug}/${result.claim.claimHash}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-900 font-inter">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase block font-bold">
            CONFLUX EVIDENCE &amp; VERIFICATION REPORT
          </span>
          <h2 className="text-xl font-black text-white">{result.entity.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          {result.cacheHit && (
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
              ⚡ Cached Result
            </span>
          )}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? 'Link Copied!' : 'Share Report'}
          </button>
        </div>
      </div>

      {/* Claim & Status Header */}
      <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-200">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Claim Under Investigation</div>
        <blockquote className="text-lg md:text-xl font-medium text-slate-900 mb-6 italic border-l-4 border-blue-600 pl-4 py-1">
          "{result.claim.claimText}"
        </blockquote>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${badge.bg}`}>
            {badge.icon}
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Verification Status</div>
              <div className="text-base font-black tracking-tight">{badge.label}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-sm">
              {result.confidence}%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Confidence Score</div>
              <div className="text-sm font-bold text-slate-800">
                {result.confidence >= 80 ? 'High Confidence' : result.confidence >= 50 ? 'Moderate' : 'Low / Tentative'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center gap-3">
            <Clock className="w-6 h-6 text-slate-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Last Verified</div>
              <div className="text-xs font-semibold text-slate-700">
                {new Date(result.lastCheckedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Findings & Explanation */}
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Executive Assessment
          </h3>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base bg-white p-4 rounded-xl border border-slate-200">
            {result.explanation}
          </p>
        </div>

        {/* Supporting Evidence */}
        {result.supportingEvidence.length > 0 && (
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Corroborating Evidence ({result.supportingEvidence.length})
            </h3>
            <div className="space-y-3">
              {result.supportingEvidence.map((ev) => {
                const tier = getTierLabel(ev.source.sourceTier);
                return (
                  <div key={ev.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${tier.style}`}>
                        {tier.text}
                      </span>
                      <a
                        href={ev.source.canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        {ev.source.publisher || ev.source.domain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs md:text-sm text-slate-800 italic bg-white p-3 rounded-lg border border-emerald-100">
                      "{ev.excerpt}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contradicting Evidence */}
        {result.contradictingEvidence.length > 0 && (
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-800 mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              Contradicting / Conflicting Records ({result.contradictingEvidence.length})
            </h3>
            <div className="space-y-3">
              {result.contradictingEvidence.map((ev) => {
                const tier = getTierLabel(ev.source.sourceTier);
                return (
                  <div key={ev.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${tier.style}`}>
                        {tier.text}
                      </span>
                      <a
                        href={ev.source.canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-rose-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        {ev.source.publisher || ev.source.domain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs md:text-sm text-slate-800 italic bg-white p-3 rounded-lg border border-rose-100">
                      "{ev.excerpt}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Limitations & Disclaimers */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Verification Limitations &amp; Scope
          </h4>
          <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
            {result.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>

        {/* Trust Principle Banner */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-950">
            <strong className="block font-bold mb-0.5">Conflux Trust Principle</strong>
            Verification statuses and evidence weights cannot be purchased. Commercial plans fund rapid investigation workflows and continuous monitoring, but never alter factual conclusions.
          </div>
        </div>
      </div>
    </div>
  );
};
