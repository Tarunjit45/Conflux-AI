import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
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
    label: 'Ranaghat Agro Processing Ltd — FSSAI License (Nadia)',
    entity: 'Ranaghat Agro Processing Ltd',
    claim: 'Ranaghat Agro Processing Ltd is registered under the FSSAI with an active food business operator license in Nadia district'
  },
  {
    label: 'Santipur Tant Saree Guild — GI Heritage (Nadia)',
    entity: 'Santipur Tant Saree Guild',
    claim: 'Santipur has been a recognized center of cotton handloom weaving since the 15th century under the patronage of Nadia royalty'
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
  const location = useLocation();

  const [entityName, setEntityName] = useState('');
  const [claimText, setClaimText] = useState('');
  const [entityUrl, setEntityUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  // Load benchmark on initial URL or search parameters if specified
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qEntity = params.get('entity');
    const qClaim = params.get('claim');

    if (qEntity && qClaim) {
      setEntityName(qEntity);
      setClaimText(qClaim);
      setIsLoading(true);
      verificationService.verifyClaim({
        entityName: qEntity,
        claimText: qClaim
      }).then(res => {
        setResult(res);
        setIsLoading(false);
      }).catch(err => {
        setError(err.message || 'Verification service error.');
        setIsLoading(false);
      });
      return;
    }

    if (entitySlug) {
      if (entitySlug.includes('conflux')) {
        handleSampleSelect(SAMPLE_BENCHMARKS[0]);
      } else if (entitySlug.includes('ranaghat')) {
        handleSampleSelect(SAMPLE_BENCHMARKS[1]);
      } else if (entitySlug.includes('santipur')) {
        handleSampleSelect(SAMPLE_BENCHMARKS[2]);
      } else if (entitySlug.includes('abc')) {
        handleSampleSelect(SAMPLE_BENCHMARKS[3]);
      }
    }
  }, [entitySlug, claimSlug, location.search]);

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

        {/* Methodology & Guides Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Verification Methodology &amp; Educational Guides
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Learn how Conflux Verify evaluates statutory provenance, handles record absence, and avoids false corroboration.
              </p>
            </div>
            <Link
              to="/verify/methodology"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0"
            >
              Read Full Methodology <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            <Link
              to="/verify/guides/how-to-verify-indian-company-legal-existence"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/20 transition-all text-xs group"
            >
              <span className="font-bold text-slate-900 block mb-1 group-hover:text-blue-600 transition-colors">
                Verify MCA Legal Existence
              </span>
              <span className="text-slate-500">
                Decode 21-character CIN syntax and active ROC master records.
              </span>
            </Link>

            <Link
              to="/verify/guides/how-to-verify-gst-udyam-registration"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/20 transition-all text-xs group"
            >
              <span className="font-bold text-slate-900 block mb-1 group-hover:text-blue-600 transition-colors">
                Verify GSTIN &amp; MSME Udyam
              </span>
              <span className="text-slate-500">
                Inspect 15-digit GSTIN tax standing and 19-digit Udyam classifications.
              </span>
            </Link>

            <Link
              to="/verify/guides/how-to-verify-iso-certificate"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/20 transition-all text-xs group"
            >
              <span className="font-bold text-slate-900 block mb-1 group-hover:text-blue-600 transition-colors">
                Verify ISO Certificates
              </span>
              <span className="text-slate-500">
                Detect unaccredited certificate mills using IAF CertSearch.
              </span>
            </Link>

            <Link
              to="/verify/guides/how-to-check-expired-certification"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/20 transition-all text-xs group"
            >
              <span className="font-bold text-slate-900 block mb-1 group-hover:text-blue-600 transition-colors">
                Check Expired Certifications
              </span>
              <span className="text-slate-500">
                Track 3-year expiration cycles and surveillance audit milestones.
              </span>
            </Link>

            <Link
              to="/verify/guides/active-vs-struck-off-company"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/20 transition-all text-xs group"
            >
              <span className="font-bold text-slate-900 block mb-1 group-hover:text-blue-600 transition-colors">
                Active vs Struck-Off Company
              </span>
              <span className="text-slate-500">
                Legal implications of Section 248 MCA statutory closures.
              </span>
            </Link>

            <Link
              to="/verify/guides/company-not-found-does-not-mean-fake"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/20 transition-all text-xs group"
            >
              <span className="font-bold text-slate-900 block mb-1 group-hover:text-blue-600 transition-colors">
                Absence ≠ Contradiction Guide
              </span>
              <span className="text-slate-500">
                Why a missing database record does not imply fraud.
              </span>
            </Link>
          </div>
        </div>

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
