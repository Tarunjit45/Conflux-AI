// Conflux Platform — Terms of Service & E-Commerce Disclosure
// Compliant with Consumer Protection (E-Commerce) Rules, 2020 & Information Technology Act, 2000

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Scale, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';

export const TermsPage: React.FC = () => {
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
            <Scale size={14} /> Legal Terms &amp; Consumer Disclosure
          </div>
          <h1 className="font-orbitron text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Terms of <span className="text-blue-600">Service</span>
          </h1>
          <p className="text-slate-600 font-normal text-sm sm:text-base leading-relaxed max-w-3xl">
            These Terms of Service govern your access to and use of Conflux AI (confluxai.in), including our business directory, paid verification assessment services, and digital platform tools, in compliance with the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>.
          </p>
          <div className="text-xs text-slate-600 font-medium">
            Effective Date: {lastUpdated} &bull; Applicable across all user sessions and transactions on confluxai.in
          </div>
        </div>

        {/* Core Invariant Callout */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200/80 mb-12 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
            <AlertCircle size={18} className="text-amber-700 shrink-0" />
            <span>Essential Consumer Understanding: Conflux Verified Application</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            Payment of the <strong>₹499 first-year fee is strictly an application assessment fee</strong> for manual documentary scrutiny and registrar verification. <strong>Payment does not guarantee verification approval</strong>, nor does it purchase higher search ranking, sponsored placement, traffic, or customer leads. Conflux search and discovery algorithms operate completely independently of verification fee payments.
          </p>
        </div>

        {/* Terms Body */}
        <div className="space-y-12 text-sm leading-relaxed text-slate-700">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">1</span>
              <span>Platform Operator Identity &amp; Contact Details</span>
            </h2>
            <p>
              In accordance with Rule 4(1) of the Consumer Protection (E-Commerce) Rules, 2020, the legal entity operating the Conflux AI platform is:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">Conflux AI</div>
              <div>Legal Entity Type: Sole Proprietorship registered in West Bengal, India</div>
              <div>Principal Place of Business: Kolkata, West Bengal 700001, India</div>
              <div>Official Contact Email: <a href="mailto:contact@confluxai.in" className="text-blue-600 font-semibold underline">contact@confluxai.in</a> (cc: <a href="mailto:confluxai45@gmail.com" className="text-blue-600 font-semibold underline">confluxai45@gmail.com</a>)</div>
              <div>Customer Care Telephone: <a href="tel:+919734433100" className="text-blue-600 font-semibold underline">+91 97344 33100</a> (Operating Hours: Mon–Sat, 10:00 AM – 6:30 PM IST)</div>
              <div>Designated Grievance Officer: <a href="mailto:grievance@confluxai.in" className="text-blue-600 font-semibold underline">grievance@confluxai.in</a></div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">2</span>
              <span>Services Description &amp; Two-Tier Model</span>
            </h2>
            <p>
              Conflux AI operates a Local Visibility &amp; Trust Platform providing:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-slate-600">
              <li>
                <strong>Free Standard Business Listing:</strong> Any genuine business proprietor may list their enterprise on the Conflux directory at zero charge. Standard listings include basic profile data, operating hours, direct contact lines, and map links.
              </li>
              <li>
                <strong>Paid Conflux Verified Assessment (₹499/Year):</strong> An optional, paid evaluation service where Conflux compliance officers manually inspect statutory government records (Trade License, GSTIN, FSSAI, MSME Udyam) and physical storefront imagery. If authenticated, the business receives the official <strong>✓ Conflux Verified</strong> badge with 1-year temporal validity.
              </li>
              <li>
                <strong>Local Community Contributions:</strong> Community members may submit factual updates, corrections, and reviews subject to administrative moderation.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">3</span>
              <span>Pricing, Fees &amp; Non-Deceptive Billing</span>
            </h2>
            <div className="space-y-3">
              <p>
                In compliance with consumer protection requirements regarding fair trade practices:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">Transparent Flat Pricing</div>
                  <div className="text-slate-600">The Conflux Verified application fee is clearly stated as ₹499.00 INR flat. There are no hidden processing fees, checkout markups, or convenience levies.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">Zero Dark Patterns</div>
                  <div className="text-slate-600">No pre-selected checkboxes, no forced recurring subscriptions, no false urgency counters, and no deceptive countdown timers are employed during checkout.</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 pt-1">
                <strong>Tax Notice:</strong> Under current small business turnover thresholds under the Central Goods and Services Tax Act, 2017, Conflux AI does not charge or collect GST. If registration thresholds are crossed in the future, invoices and checkout breakdowns will be updated with official GSTIN credentials. No fabricated tax claims are ever made.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">4</span>
              <span>Decoupling of Verification from Search Ranking &amp; Commercial Ads</span>
            </h2>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <div className="font-bold flex items-center gap-2 text-emerald-900">
                <ShieldCheck size={16} className="text-emerald-700" />
                <span>Strict Separation of Verification and Commercial Influence</span>
              </div>
              <p className="leading-relaxed">
                Conflux AI strictly adheres to the principle that statutory trust cannot be bought. The <strong>✓ Conflux Verified</strong> badge denotes that specific factual claims (statutory licenses, physical address, and proprietor identity) have been corroborated against official public registers.
              </p>
              <ul className="list-disc list-inside space-y-1 text-emerald-900/90 text-[11px]">
                <li>Verification status does NOT influence search result ordering or directory algorithms.</li>
                <li>Conflux AI does NOT accept payment for sponsored or artificially boosted rankings.</li>
                <li>Conflux AI does NOT guarantee business leads, customer inquiries, commercial transactions, or business growth as a consequence of verification.</li>
                <li>Verification does NOT constitute a Conflux warranty, commercial endorsement, or guarantee of a business’s products, services, or contractual performance.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">5</span>
              <span>Cancellation, Assessment Rules &amp; Refunds</span>
            </h2>
            <p>
              All verification purchases are governed by our formal <Link to="/refund-policy" className="text-blue-600 font-bold underline">Cancellation &amp; Refund Policy</Link>:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs">
              <li><strong>Review Assessment Fee:</strong> The ₹499 fee compensates the compliance labor and administrative costs of documentary verification. It is strictly non-refundable once review begins.</li>
              <li><strong>14-Day Evidence Window:</strong> If documentation is incomplete or ambiguous, applicants are provided 14 calendar days to supply clarifying evidence at zero extra charge.</li>
              <li><strong>Automated Refund for Errors:</strong> Duplicate transactions or gateway processing failures are refunded 100% via the original Cashfree payment source method within 5–7 business days.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">6</span>
              <span>Consumer Grievance Redressal Mechanism</span>
            </h2>
            <p>
              In accordance with Rule 5(3)(e) of the Consumer Protection (E-Commerce) Rules, 2020, Conflux AI maintains a dedicated Consumer Grievance Redressal Mechanism:
            </p>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 max-w-xl">
              <div className="font-bold text-slate-900 text-sm">Grievance Redressal Office</div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-blue-600 shrink-0" />
                  <span>Grievance Email: <a href="mailto:grievance@confluxai.in" className="text-blue-600 font-bold hover:underline">grievance@confluxai.in</a></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="text-blue-600 shrink-0" />
                  <span>Telephone: <a href="tel:+919734433100" className="text-blue-600 font-bold hover:underline">+91 97344 33100</a></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={15} className="text-blue-600 shrink-0" />
                  <span>Postal Address: Conflux AI Grievance Desk, Kolkata, West Bengal 700001, India</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={15} className="text-blue-600 shrink-0" />
                  <span>Statutory Timelines: Acknowledged within 48 hours; resolved within 1 month of receipt.</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Every grievance received via email is assigned a unique tracking reference number communicated to the complainant for continuous progress monitoring.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">7</span>
              <span>Governing Law &amp; Jurisdiction</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              These Terms of Service and any contractual relationship arising between you and Conflux AI shall be governed by and construed in accordance with the substantive laws of the Republic of India. In the event of any legal dispute or controversy that cannot be resolved through mutual grievance conciliation, the competent courts located in <strong>Kolkata, West Bengal, India</strong> shall have exclusive territorial and subject-matter jurisdiction.
            </p>
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
            <Link to="/privacy-policy" className="text-slate-600 hover:text-slate-900">Privacy Policy &rarr;</Link>
            <Link to="/refund-policy" className="text-slate-600 hover:text-slate-900">Refund Policy &rarr;</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TermsPage;
