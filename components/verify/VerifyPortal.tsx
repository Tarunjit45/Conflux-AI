import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Search, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { verificationService } from '../../lib/verify/verificationService';
import type { VerificationResult } from '../../types/verify';
import { VerificationReportView } from './VerificationReportView';

const SAMPLE_BENCHMARKS = [
  {
    label: 'Conflux AI — Leadership & Kolkata HQ',
    entity: 'Conflux AI',
    claim: 'Conflux AI is an AI automation and digital solutions agency based in Kolkata, founded by Tarunjit Biswas and Shouvik Majumdar'
  },
  {
    label: 'ABC Manufacturing — ISO 9001 Certification',
    entity: 'ABC Manufacturing',
    claim: 'ABC Manufacturing has ISO 9001:2015 Quality Management System Certification'
  },
  {
    label: 'Uncorroborated Distribution Claim',
    entity: 'Eastern Tech Importers',
    claim: 'Eastern Tech Importers is the exclusive direct authorized distributor for Global Chipsets in India'
  }
];

export const VerifyPortal: React.FC = () => {
  const { entitySlug, claimSlug } = useParams<{ entitySlug?: string; claimSlug?: string }>();

  const [entityName, setEntityName] = useState('');
  const [claimText, setClaimText] = useState('');
  const [entityUrl, setEntityUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  // Load benchmark on initial URL if specified
  useEffect(() => {
    if (entitySlug) {
      if (entitySlug.includes('conflux')) {
        handleSampleSelect(SAMPLE_BENCHMARKS[0]);
      } else if (entitySlug.includes('abc')) {
        handleSampleSelect(SAMPLE_BENCHMARKS[1]);
      }
    }
  }, [entitySlug, claimSlug]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await verificationService.verifyClaim({
        entityName,
        claimText,
        entityUrl: entityUrl || undefined
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Verification service error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleSelect = async (sample: typeof SAMPLE_BENCHMARKS[0]) => {
    setEntityName(sample.entity);
    setClaimText(sample.claim);
    setError(null);
    setIsLoading(true);

    try {
      const res = await verificationService.verifyClaim({
        entityName: sample.entity,
        claimText: sample.claim
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Conflux Verify (Experimental MVP)
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Business Claim &amp; Evidence Investigation
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Establish whether an economically important business claim is backed by authoritative primary registrars, first-party records, or unverified secondary assertions.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Business / Entity Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g. ABC Manufacturing, Conflux AI, Tata Power"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Claim Statement <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                placeholder="e.g. Has ISO 9001:2015 certification, Is an authorized tier-1 partner, Operates manufacturing facility in Howrah"
                required
                rows={3}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500">
                ⚡ Provenance-preserving • Primary Registrar &amp; First-Party Hierarchy
              </div>
              <button
                type="submit"
                disabled={isLoading || !entityName.trim() || !claimText.trim()}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Investigating Evidence...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Investigate Claim &rarr;
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sample Benchmarks Quick Selector */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider block mb-3">
              Or Try a Benchmark Demonstration:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_BENCHMARKS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleSelect(sample)}
                  className="text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors text-slate-700 text-left"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Verification Report Result */}
        {result && (
          <div className="pt-4">
            <VerificationReportView result={result} />
          </div>
        )}

        {/* Informational Footer Explaining Trust Model */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-200 text-slate-600 text-xs">
          <div>
            <strong className="block font-bold text-slate-900 mb-1">Tier-1 Authoritative Grounding</strong>
            Prioritizes government gazettes, court filings, and accredited international registrar databases over web hearsay.
          </div>
          <div>
            <strong className="block font-bold text-slate-900 mb-1">Copycat &amp; Circularity Detection</strong>
            Identifies when multiple blogs or aggregator sites merely repeat the same unsubstantiated press release.
          </div>
          <div>
            <strong className="block font-bold text-slate-900 mb-1">No Pay-For-Favorable-Status</strong>
            Verification statuses reflect factual provenance only. Commercial tiers provide API access and monitoring, never altered outcomes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPortal;
