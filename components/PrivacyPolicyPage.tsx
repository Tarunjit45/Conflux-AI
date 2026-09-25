// Conflux Platform — Privacy Policy & Data Protection Notice
// Compliant with Digital Personal Data Protection Act, 2023 (DPDP Act) & Information Technology Act, 2000

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "September 25, 2026";

  return (
    <div className="min-h-screen bg-white font-inter text-slate-900">
      <div className="pt-32 pb-24 px-4 md:px-6 max-w-5xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft size={14} /> Return to Home
        </Link>

        {/* Hero Header */}
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} /> Privacy &amp; Data Protection Notice
          </div>
          <h1 className="font-orbitron text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Privacy Policy &amp; <span className="text-blue-600">DPDP Compliance</span>
          </h1>
          <p className="text-slate-600 font-normal text-sm sm:text-base leading-relaxed max-w-3xl">
            This Privacy Policy explains how Conflux AI collects, uses, protects, masks, retains, and disposes of personal and business information in compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and the <strong>Information Technology Act, 2000</strong>.
          </p>
          <div className="text-xs text-slate-600 font-medium">
            Effective Date: {lastUpdated} &bull; Applicable to all applicants, business proprietors, and visitors on confluxai.in
          </div>
        </div>

        {/* Core DPDP Invariant Summary Box */}
        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200/80 mb-12 space-y-3">
          <div className="flex items-center gap-2.5 text-blue-950 font-bold text-sm">
            <Lock size={18} className="text-blue-700 shrink-0" />
            <span>DPDP Act Core Commitments on Conflux AI</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-blue-900/90 leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Purpose Limitation:</strong> We collect only data genuinely necessary to evaluate and corroborate business verification claims.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Evidence Privacy:</strong> Raw statutory documents, certificates, and private file URLs are NEVER exposed on the public internet.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Public Masking:</strong> Only masked identification numbers (e.g., 19••••••A1Z5) are displayed publicly.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Rights &amp; Erasure:</strong> You retain the right to access, rectify, or request deletion of submitted evidence at any time.</span>
            </div>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-12 text-sm leading-relaxed text-slate-700">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">1</span>
              <span>Identity of Data Fiduciary</span>
            </h2>
            <p>
              Under the Digital Personal Data Protection Act, 2023, the <strong>Data Fiduciary</strong> responsible for processing your personal and business data is:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">Conflux AI (Platform Operations)</div>
              <div>Entity Status: Individual Proprietorship Registered in West Bengal, India</div>
              <div>Operating Office: Kolkata, West Bengal 700001, India</div>
              <div>Official Contact: <a href="mailto:contact@confluxai.in" className="text-blue-600 font-semibold underline">contact@confluxai.in</a> | Phone: +91 97344 33100</div>
              <div>Designated Privacy &amp; Grievance Officer: <a href="mailto:privacy@confluxai.in" className="text-blue-600 font-semibold underline">privacy@confluxai.in</a></div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">2</span>
              <span>Data Categories Collected &amp; Purpose Specification</span>
            </h2>
            <p>
              In strict accordance with the data minimization principle, Conflux AI collects only information directly required to verify an enterprise and provide directory services. The purpose for each category is detailed below:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 border-b border-slate-200">Category of Data</th>
                    <th className="p-3 border-b border-slate-200">Specific Data Fields</th>
                    <th className="p-3 border-b border-slate-200">Specified Purpose of Collection</th>
                    <th className="p-3 border-b border-slate-200">Public Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">Applicant Identity</td>
                    <td className="p-3 text-slate-600">Full Name, Designation/Role</td>
                    <td className="p-3 text-slate-700">Verify lawful authorization to represent the business enterprise and establish ownership standing.</td>
                    <td className="p-3 text-slate-600 font-medium">Private (Internal Only)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">Contact Details</td>
                    <td className="p-3 text-slate-600">Mobile Phone, Email Address, WhatsApp Number</td>
                    <td className="p-3 text-slate-700">Deliver transactional OTPs, review status notifications, requests for additional evidence, and renewal notices.</td>
                    <td className="p-3 text-slate-700">Declared business phone is public; personal email is private.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">Physical Location</td>
                    <td className="p-3 text-slate-600">Full Address, Locality, District, PIN Code, Geocoordinates</td>
                    <td className="p-3 text-slate-700">Confirm physical storefront presence, enable customer navigation, and prevent fraudulent/phantom listings.</td>
                    <td className="p-3 text-emerald-700 font-semibold">Public (Business Address)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">Statutory Registrations</td>
                    <td className="p-3 text-slate-600">Trade License, GSTIN, MSME Udyam, FSSAI Number, Council Accreditations</td>
                    <td className="p-3 text-slate-700">Cross-reference with official state and central registries (MCA, GST Portal, FoSCoS, Udyam) to corroborate legitimate trade status.</td>
                    <td className="p-3 text-amber-800 font-semibold">Masked Only (e.g. 19••••••A1Z5)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">Uploaded Evidence Files</td>
                    <td className="p-3 text-slate-600">License Certificates, PDFs, Exterior Storefront Signboard Photos</td>
                    <td className="p-3 text-slate-700">Ground truth documentary inspection by compliance officers. Storefront photos verify physical signage and trading reality.</td>
                    <td className="p-3 text-slate-900 font-bold">Documents: 100% Private. Storefront Photo: Public upon consent.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">3</span>
              <span>Evidence Storage, Access Control &amp; Public Masking</span>
            </h2>
            <div className="space-y-3 text-slate-700">
              <p>
                Conflux AI enforces rigorous technological and organizational measures to safeguard sensitive evidence:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <EyeOff size={15} className="text-slate-700" />
                    <span>Never Exposed Publicly</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Uploaded statutory certificates, trade licenses, and private document URLs are never indexed by web crawlers, never returned in public APIs, and never made accessible to ordinary website visitors.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Lock size={15} className="text-slate-700" />
                    <span>Role-Based Administrator Access</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Access to raw evidence dockets is strictly restricted to authenticated Conflux compliance officers actively conducting the manual verification assessment.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                <strong>Public Masking Invariant:</strong> When an application is approved and the Conflux Verified badge is displayed on a public profile, any registration numbers are masked using our deterministic masking function (e.g. showing only the first two and last two characters, such as <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-800">19••••••A1Z5</code>). This provides sufficient provenance for consumers while protecting business proprietors from identity harvesting or scrapers.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">4</span>
              <span>Data Retention &amp; Disposal Rules</span>
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Conflux AI retains personal and statutory verification data only for as long as is necessary to fulfill the stated verification purpose:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs sm:text-sm">
                <li><strong>During Active Review:</strong> Documents and communications are retained in active status throughout the review and 14-day evidence cure periods.</li>
                <li><strong>Active Conflux Verified Badge (1 Year):</strong> Evidence records supporting an approved verification are maintained for the 1-year validity duration of the badge to uphold public auditability.</li>
                <li><strong>Post-Expiry / Non-Renewal:</strong> If a verification lapses without renewal, evidence dockets are archived for a maximum of 90 days, after which proprietary documents are permanently purged from active systems.</li>
                <li><strong>Statutory Financial Records:</strong> Payment transaction references, order IDs, and payment amounts are retained for the statutory period mandated by Indian tax and accounting regulations (typically 7–8 years).</li>
                <li><strong>Applicant-Requested Erasure:</strong> An applicant may request early deletion of their submitted evidence at any time, which will result in the immediate revocation of the associated Verified badge.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">5</span>
              <span>Rights of Data Principals (Under DPDP Act, 2023)</span>
            </h2>
            <p>
              As a Data Principal under Indian data protection law, you possess enforceable rights regarding your personal information:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-slate-900 block mb-1">Right to Access Information</span>
                <span className="text-slate-600">Request a summary of personal data being processed and the processing activities undertaken by Conflux AI.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-slate-900 block mb-1">Right to Correction &amp; Erasure</span>
                <span className="text-slate-600">Request correction of inaccurate or misleading data, completion of incomplete data, or erasure of personal data no longer necessary.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-slate-900 block mb-1">Right of Grievance Redressal</span>
                <span className="text-slate-600">Access an readily available grievance redressal mechanism provided by Conflux AI regarding data processing obligations.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-slate-900 block mb-1">Right to Nominate</span>
                <span className="text-slate-600">Nominate an individual to exercise your data rights in the event of death or incapacity, as provided under DPDP rules.</span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">6</span>
              <span>Payment Processing &amp; Banking Partners</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              All payment transactions for the ₹499 verification review fee are processed through our licensed payment aggregator partner, <strong>Cashfree Payments India Private Limited</strong>. Conflux AI does not store, process, or transmit raw credit card numbers, debit card PINs, CVVs, or NetBanking passwords on our servers. All banking communications occur via PCI-DSS compliant 256-bit encrypted channels directly with Cashfree and the respective issuing banks.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">7</span>
              <span>Data Protection Grievance Officer &amp; Redressal</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              If you have any questions, concerns, grievances, or requests regarding the processing of your personal data or wish to exercise your statutory rights under the DPDP Act, 2023, please reach out to our designated Data Protection Grievance Officer:
            </p>
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 max-w-xl">
              <div className="font-bold text-slate-900 text-sm">Data Protection &amp; Privacy Grievance Officer</div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-blue-600 shrink-0" />
                  <span>Email: <a href="mailto:privacy@confluxai.in" className="text-blue-600 font-bold hover:underline">privacy@confluxai.in</a> (cc: <a href="mailto:confluxai45@gmail.com" className="text-blue-600 font-bold hover:underline">confluxai45@gmail.com</a>)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="text-blue-600 shrink-0" />
                  <span>Phone: <a href="tel:+919734433100" className="text-blue-600 font-bold hover:underline">+91 97344 33100</a></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={15} className="text-blue-600 shrink-0" />
                  <span>Address: Conflux AI Operations, Kolkata, West Bengal 700001, India</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={15} className="text-blue-600 shrink-0" />
                  <span>Response Timeline: Acknowledged within 48 hours; resolved within 30 days.</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                Note on DPDP Act Commencement: Provisions of the Digital Personal Data Protection Act, 2023 that depend on central government notification of specific rules and the operationalization of the Data Protection Board of India will become active in accordance with official gazette notifications.
              </p>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-16 mt-16 border-t border-slate-200 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            &larr; Back to Home
          </Link>
          <div className="flex items-center gap-4 text-xs font-bold">
            <Link to="/refund-policy" className="text-slate-600 hover:text-slate-900">Refund Policy &rarr;</Link>
            <Link to="/terms" className="text-slate-600 hover:text-slate-900">Terms of Service &rarr;</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
