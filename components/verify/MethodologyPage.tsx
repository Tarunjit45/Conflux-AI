import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Layers, 
  ArrowRight, 
  Database, 
  Search, 
  ExternalLink,
  Lock,
  Compass,
  BookOpen,
  Info
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6 gap-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/verify" className="hover:text-blue-600 transition-colors">Verify</Link>
          <span>/</span>
          <span className="text-blue-600">Methodology & Evidence Architecture</span>
        </nav>

        {/* Header Hero */}
        <header className="bg-white rounded-2xl border border-slate-200/80 p-8 md:p-12 shadow-sm mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck size={14} className="text-blue-600" />
            Bounded Epistemic Architecture
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-[1.15]">
            Conflux Verify Methodology & Evidence Standards
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mb-8">
            A deterministic evidence and verification framework designed to evaluate business assertions against primary statutory registries, accredited bodies, and verifiable provenance records.
          </p>
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
            <div><strong className="text-slate-900">Current Scope:</strong> Legal Existence, Registration, Certification</div>
            <div>•</div>
            <div><strong className="text-slate-900">Evaluation Mode:</strong> Deterministic Rule Engine & Live Registrar Retrieval</div>
            <div>•</div>
            <div><strong className="text-slate-900">Safety Target:</strong> False-Supported Rate &lt; 2.0% (0.0% on evaluated benchmarks)</div>
          </div>
        </header>

        {/* Core Principles */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Compass className="text-blue-600" size={24} />
              Five Core Epistemic Safety Principles
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Conflux Verify adheres to strict verification invariants to prevent hallucinations, false corroboration, and manufactured certainty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-red-600 font-mono font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Principle 1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Absence ≠ Contradiction</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The absence of a record in a queried database does <strong>not</strong> prove that a business or claim is fraudulent. Unregistered sole proprietorships or alternate trade names return <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-amber-700">INSUFFICIENT_EVIDENCE</span> or <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700">UNVERIFIED</span>, never a manufactured contradiction.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-red-600 font-mono font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Principle 2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Network Failure ≠ Evidence</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                HTTP timeouts, parser drops, rate limits, or DNS errors are operational failures, <strong>never factual evidence</strong>. When a remote registrar is unreachable, the system degrades safely to <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700">UNVERIFIED</span> with zero confidence penalty.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-blue-600 font-mono font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Principle 3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">First-Party Assertion ≠ Independent Confirmation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Statements published on an entity's own website, brochures, or self-issued press releases are classified as <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-indigo-700">TIER_2_FIRST_PARTY</span>. They cannot substantiate independent compliance without primary registrar corroboration.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-amber-600 font-mono font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Principle 4
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ambiguous Entity ≠ Verified Entity</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When a business name matches multiple active registrations (e.g., generic commercial names), the system refuses to merge records. It issues a <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-blue-700">PARTIALLY_SUPPORTED</span> status requiring exact statutory registration identifiers (CIN / GSTIN / Udyam).
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
              <div className="text-purple-600 font-mono font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock size={14} />
                Principle 5
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Expired Certification ≠ Active Certification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ISO accreditations, statutory licenses, and regulatory approvals are time-bounded. When a historical certificate has lapsed without an active surveillance audit, the system returns <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-purple-700">OUTDATED</span>, accurately validating past compliance while rejecting current validity assertions.
              </p>
            </div>
          </div>
        </section>

        {/* Source Hierarchy */}
        <section className="mb-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-3">
            <Layers className="text-blue-600" size={24} />
            Source Authority Hierarchy
          </h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Source tiers represent origin authority and independence. Evidence weight is dynamically determined by combining the source tier with the specific claim category.
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">TIER 1</span>
                <span className="text-xs font-semibold text-slate-500">Primary Statutory & Accredited Registrars</span>
              </div>
              <p className="text-xs text-slate-600">
                Official government gazettes, statutory registries (MCA, GSTN, Udyam, FSSAI, RBI), accredited registrar bodies (IAF CertSearch, BIS, USDA NOP), and court records.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">TIER 2</span>
                <span className="text-xs font-semibold text-slate-500">First-Party Disclosures (Direct Entity Origin)</span>
              </div>
              <p className="text-xs text-slate-600">
                Official company domains, signed financial reports, leadership disclosures. Authoritative for first-party intentions and product specs, but not independent third-party confirmation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">TIER 3</span>
                <span className="text-xs font-semibold text-slate-500">Independent High-Quality Sources</span>
              </div>
              <p className="text-xs text-slate-600">
                Established investigative publications, accredited technical benchmark repositories, peer-reviewed engineering archives, and audited industry trade bodies.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">TIER 4</span>
                <span className="text-xs font-semibold text-slate-500">Secondary Directories & Syndicated PR</span>
              </div>
              <p className="text-xs text-slate-600">
                Commercial business directories, press release distribution wires, trade blogs, and scraped aggregators. Syndicated copycats collapse to a single origin signal.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">TIER 5</span>
                <span className="text-xs font-semibold text-slate-500">User-Generated Content & Unverified Forums</span>
              </div>
              <p className="text-xs text-slate-600">
                Anonymous forums, social media commentary, unverified reviews. Zero evidence weight in formal verification calculations.
              </p>
            </div>
          </div>
        </section>

        {/* Anti-Self-Authority Protection */}
        <section className="mb-16 bg-blue-900 text-white rounded-2xl p-8 md:p-10 shadow-lg">
          <div className="flex items-center gap-3 text-blue-300 font-mono text-xs uppercase tracking-wider mb-4">
            <Lock size={16} />
            Provenance Hardening
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Strict Anti-Self-Authority Protection
          </h2>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-6">
            Conflux Verify incorporates an architectural safeguard: <strong>no Conflux-owned page (confluxai.in) can ever receive Tier-1 Authoritative standing</strong>, even if it contains registrar-derived records or summaries. Conflux-owned domains are strictly classified as <span className="font-mono text-xs bg-blue-800 px-1.5 py-0.5 rounded text-blue-200">TIER_2_FIRST_PARTY</span>.
          </p>
          <div className="p-4 bg-blue-950/60 rounded-xl border border-blue-700/50 text-xs text-blue-200 font-mono">
            Origin Architecture: Registered Statutory Authority → Retrieval Adapter → Retrieved Source → Evidence Record → Claim Evaluation → Verification Result
          </div>
        </section>

        {/* Supported Categories & Refusals */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-600" size={20} />
              Supported Claim Categories
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-slate-800 min-w-[140px]">LEGAL_EXISTENCE:</span>
                <span>Active MCA incorporation, Corporate Identity Number (CIN/LLPIN), and ROC jurisdiction.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-slate-800 min-w-[140px]">REGISTRATION:</span>
                <span>Statutory GSTIN, MSME Udyam, FSSAI FoSCoS food licenses, and Trademark registrations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-slate-800 min-w-[140px]">CERTIFICATION:</span>
                <span>IAF CertSearch accredited ISO standards (9001, 14001, 22000, 27001), BIS, and USDA NOP organic accreditations.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-600" size={20} />
              Explicit Refusal Invariants
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-slate-800 min-w-[140px]">Subjective Claims:</span>
                <span>Refuses to verify superlatives like "best agency", "fastest growing", or "leading provider".</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-slate-800 min-w-[140px]">Unbounded Data:</span>
                <span>Refuses to infer financial revenue metrics without statutory audited MCA filings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-slate-800 min-w-[140px]">Search Snippets:</span>
                <span>Refuses to treat unverified search-engine snippets or scraped directory cards as factual evidence.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Educational Guides Catalog */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <BookOpen className="text-blue-600" size={24} />
              Authoritative Verification Guides
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              In-depth educational guides detailing exact manual and automated lookup procedures across primary statutory registries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              to="/verify/guides/how-to-verify-indian-company-legal-existence"
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">MCA Master Data</span>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  How to Verify Indian Company Legal Existence
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Validate 21-character CIN syntax, active ROC status, and incorporation date on mca.gov.in.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                Read Guide <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              to="/verify/guides/how-to-verify-gst-udyam-registration"
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 block">GSTN & Udyam</span>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  How to Verify GST & MSME Udyam Registration
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Verify 15-digit GSTIN active standing, legal entity name, and 19-digit Udyam manufacturing certificates.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                Read Guide <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              to="/verify/guides/how-to-verify-iso-certificate"
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">IAF CertSearch</span>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  How to Verify an ISO 9001 / 27001 Certificate
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Detect unaccredited certificate mills by validating accredited bodies against the global IAF CertSearch registry.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                Read Guide <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              to="/verify/guides/how-to-check-expired-certification"
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 block">Temporal Audits</span>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  How to Check Expired & Lapsed Certifications
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track 3-year certification expiration cycles, surveillance audit milestones, and temporal validity windows.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                Read Guide <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              to="/verify/guides/active-vs-struck-off-company"
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 block">Section 248 MCA</span>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  Active vs Struck-Off Company: Legal Differences
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Understand why struck-off companies lose the legal capacity to execute contracts or issue commercial guarantees.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                Read Guide <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              to="/verify/guides/company-not-found-does-not-mean-fake"
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 block">Epistemic Safety</span>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  Why "Company Not Found" Does Not Mean Fake
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Learn why database absence, unindexed proprietorships, and search timeouts must never be treated as fraud.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                Read Guide <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* CTA to Interactive Verification Portal */}
        <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Test a Business Claim on Conflux Verify
          </h2>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto mb-8">
            Evaluate corporate legal existence, statutory GSTIN/Udyam registrations, and accredited certifications through our deterministic verification engine.
          </p>
          <Link
            to="/verify"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition-all"
          >
            Open Conflux Verify Portal
            <ArrowRight size={16} />
          </Link>
        </section>

      </div>
    </div>
  );
};

export default MethodologyPage;
