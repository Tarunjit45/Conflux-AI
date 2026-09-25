// Conflux Platform — Cancellation & Refund Policy
// Compliant with Consumer Protection (E-Commerce) Rules, 2020 & Cashfree Merchant Onboarding Standards

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Mail, 
  Phone, 
  MapPin, 
  Scale
} from 'lucide-react';

const RefundPolicyPage: React.FC = () => {
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
            <Scale size={14} /> Legal &amp; Compliance
          </div>
          <h1 className="font-orbitron text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Cancellation &amp; <span className="text-blue-600">Refund Policy</span>
          </h1>
          <p className="text-slate-600 font-normal text-sm sm:text-base leading-relaxed max-w-3xl">
            This document outlines the cancellation, evaluation, and refund policies for services offered by Conflux AI, including the paid Conflux Verified application fee and related digital advisory services.
          </p>
          <div className="text-xs text-slate-600 font-medium">
            Effective Date: {lastUpdated} &bull; Applicable across all transactions processed on confluxai.in
          </div>
        </div>

        {/* Core Notice Callout */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200/80 mb-12 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
            <AlertCircle size={18} className="text-amber-700 shrink-0" />
            <span>Key Summary for Conflux Verified Applications (₹499 Review Fee)</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            The ₹499 first-year fee is an <strong>application assessment fee</strong> that covers manual human investigation, documentary scrutiny, and registrar cross-referencing. <strong>Payment does not guarantee verification approval.</strong> Once our compliance analysts begin review, the fee is non-refundable regardless of the outcome. Incomplete applications are granted a <strong>14-day window</strong> to submit supplementary evidence at zero extra cost.
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-12 text-sm leading-relaxed text-slate-700">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">1</span>
              <span>Scope &amp; Operating Principles</span>
            </h2>
            <p>
              Conflux AI operates a Local Visibility &amp; Trust Platform. We provide two distinct tiers of business engagement:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li><strong>Free Basic Business Listing:</strong> Creating, claiming, and maintaining a standard business profile on the Conflux directory is completely free of charge.</li>
              <li><strong>Paid Conflux Verified Application:</strong> A specialized, evidence-grounded review process priced at ₹499 for the first year, providing comprehensive statutory, location, and operational verification.</li>
              <li><strong>Bespoke Digital &amp; Automation Services:</strong> Enterprise software, WhatsApp automations, and AI chatbots delivered under separate milestone-based contracts.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">2</span>
              <span>Conflux Verified Application Assessment Fee (₹499)</span>
            </h2>
            <div className="space-y-3">
              <p>
                When you submit a Conflux Verified application and pay the ₹499 launch fee, you are compensating Conflux AI for the specialized administrative, technical, and human labor involved in verifying your establishment. This includes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700">Primary registrar authentication against official portals (GST portal, municipal trade registers, FSSAI FoSCoS, MSME Udyam, etc.)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700">Physical address, geocoordinate, and storefront imagery corroboration</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700">Proprietorship identity, direct contact, and operational capability validation</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700">Issuance of an immutable, tamper-resistant verification docket on the Conflux Business Graph</span>
                </div>
              </div>
              <p className="font-semibold text-slate-900 pt-2">
                Non-Refundable Policy Once Review Commences:
              </p>
              <p>
                Because costs and labor are irrevocably expended during documentary and registry investigation, the ₹499 fee is strictly <strong>non-refundable once manual review has begun</strong>. An application that does not satisfy statutory thresholds or fails authentication does not entitle the applicant to a refund, as the assessment service was rendered in full.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">3</span>
              <span>The 14-Day Evidence Cure Period</span>
            </h2>
            <p>
              We firmly believe in fair, transparent evaluation. If an applicant’s submitted documentation is unclear, expired, blurry, or requires additional registry corroboration:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Our compliance team will update your application to <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">MORE_EVIDENCE_REQUIRED</span>.</li>
              <li>You will receive an email specifying exactly what documents or clarifications are needed.</li>
              <li>You have <strong>fourteen (14) calendar days</strong> from the date of the notice to upload rectified or supplementary documentation.</li>
              <li><strong>Zero additional charges</strong> are levied for reviewing the supplementary documents during this cure window.</li>
              <li>If no evidence is provided within 14 days, the application is marked as rejected, and a fresh application must be submitted for future reviews.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">4</span>
              <span>Eligible Refund Circumstances</span>
            </h2>
            <p>
              Full refunds are granted under the following specific, objective conditions:
            </p>
            <div className="space-y-2.5">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">A. Duplicate / Multiple Deductions</div>
                <p className="text-xs text-slate-600">
                  If an error causes multiple debits from your bank account or card for a single application order, all duplicate debits will be refunded in full immediately upon reconciliation.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">B. Cancellation Prior to Initiation of Review</div>
                <p className="text-xs text-slate-600">
                  If you request cancellation within <strong>two (2) hours of payment</strong> and our compliance officers have not yet begun document review or external registrar lookups, a full refund will be processed upon written request to <a href="mailto:confluxai45@gmail.com" className="text-blue-600 underline">confluxai45@gmail.com</a>.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">C. Gateway / Technical Payment Failures</div>
                <p className="text-xs text-slate-600">
                  If funds are deducted from your account but the payment gateway fails to communicate a successful status to our servers, and our team cannot reconcile the order within 48 hours, a 100% reversal will be triggered automatically.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">5</span>
              <span>Refund Processing Mechanism &amp; Timelines</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CreditCard size={15} className="text-blue-600" />
                <span>Original Source Method Reversal</span>
              </div>
              <p>
                All eligible refunds are issued directly through our payment partner, <strong>Cashfree Payments India Private Limited</strong>, back to the exact payment method (UPI ID, Debit/Credit Card, or NetBanking account) used during checkout. Conflux AI does not issue cash refunds or third-party bank transfers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <div className="font-bold text-slate-900">Cashfree Initiation Window:</div>
                  <div>1 to 2 business days after refund approval</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <div className="font-bold text-slate-900">Bank Credit / Reflection:</div>
                  <div>5 to 7 working days (subject to issuing bank and NPCI clearing)</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">6</span>
              <span>Bespoke Digital &amp; Software Solutions</span>
            </h2>
            <p>
              For custom software development, WhatsApp chatbot architectures, and automation deployments:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li>Services are governed by the specific Statement of Work (SOW) and service contract executed between Conflux AI and the client.</li>
              <li>Milestone-based payments for approved project phases are non-refundable once deliverables for that milestone have been accepted.</li>
              <li>Project termination terms, exit criteria, and deliverable handoffs are defined in the individual client agreement.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">7</span>
              <span>Grievance Redressal &amp; Support Contact</span>
            </h2>
            <p>
              If you have questions regarding a deduction, wish to request a review of your application outcome, or need assistance with a payment:
            </p>
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 max-w-xl">
              <div className="font-bold text-slate-900 text-sm">Grievance Officer &amp; Support Desk</div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-blue-600 shrink-0" />
                  <span>Email: <a href="mailto:confluxai45@gmail.com" className="text-blue-600 font-bold hover:underline">confluxai45@gmail.com</a> (cc: <a href="mailto:contact@confluxai.in" className="text-blue-600 font-bold hover:underline">contact@confluxai.in</a>)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="text-blue-600 shrink-0" />
                  <span>Phone / WhatsApp: <a href="tel:+919734433100" className="text-blue-600 font-bold hover:underline">+91 97344 33100</a></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={15} className="text-blue-600 shrink-0" />
                  <span>Address: Kolkata, West Bengal 700001, India</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={15} className="text-blue-600 shrink-0" />
                  <span>Operating Hours: Monday – Saturday, 10:00 AM – 6:30 PM IST</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                All refund requests are acknowledged within 24 business hours and resolved within 7 business days in accordance with the Consumer Protection (E-Commerce) Rules, 2020.
              </p>
            </div>
          </section>

        </div>

        {/* Footer Back Button */}
        <div className="pt-16 mt-16 border-t border-slate-200 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            &larr; Back to Home
          </Link>
          <Link 
            to="/verify" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            How Verification Works &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RefundPolicyPage;
