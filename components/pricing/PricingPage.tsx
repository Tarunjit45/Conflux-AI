// Conflux Platform — Plans, Subscriptions & Verification Pricing Portal (/pricing & /subscription)
// Comprehensive commercial transparency: ₹499 Verification Review + Commercial Growth Plans + Cashfree PG Gateway

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Check, Sparkles, Building2, Zap, ArrowRight,
  HelpCircle, CreditCard, Lock, ArrowUpRight, CheckCircle2,
  Phone, Globe, BarChart3, AlertCircle, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONFLUX_PLANS, type PlanTier } from '../../types/subscription.ts';
import { VerificationCheckoutModal } from '../verification/VerificationCheckoutModal.tsx';
import { useAuth } from '../../lib/authContext.tsx';

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<{
    id: string;
    name: string;
    slug?: string;
    contact?: { phone?: string; email?: string };
    ownerName?: string;
  }>({
    id: `biz_${Date.now()}`,
    name: '',
    contact: {
      email: user?.email || '',
      phone: ''
    },
    ownerName: user?.fullName || ''
  });

  const [businessNameInput, setBusinessNameInput] = useState('');
  const [businessPhoneInput, setBusinessPhoneInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleStartVerification = () => {
    if (!businessNameInput.trim()) {
      setInputError('Please enter your business or legal entity name to start checkout.');
      return;
    }
    setInputError(null);
    setSelectedBusiness({
      id: `biz_${Date.now()}`,
      name: businessNameInput.trim(),
      slug: businessNameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      contact: {
        phone: businessPhoneInput.trim() || undefined,
        email: user?.email || undefined
      },
      ownerName: user?.fullName || '',
      location: {
        locality: 'Local Area',
        city: 'Kolkata',
        district: 'West Bengal',
        state: 'West Bengal',
        country: 'India'
      }
    });
    setIsCheckoutOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-inter text-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* ── HEADER SECTION ────────────────────────────────────────────── */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles size={13} className="text-blue-600" /> Transparent Local Commerce
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-orbitron text-slate-950 tracking-tight leading-tight">
            Fair, Transparent Pricing for Local Businesses
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Zero hidden commission fees. No inflated PPC bids. Apply for the official <strong>✓ Conflux Verified</strong> trust badge or accelerate customer lead conversion with growth partner subscriptions.
          </p>

          {/* Billing Interval Toggle for Commercial Plans */}
          <div className="flex items-center justify-center pt-2">
            <div className="p-1 rounded-2xl bg-slate-200/80 inline-flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'ANNUAL'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase">
                  2 Mos Free
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ── FLAGSHIP HERO: ₹499 VERIFIED APPLICATION CHECKOUT ─────────── */}
        <section id="verification-hero" className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white border border-blue-800/60 shadow-2xl relative overflow-hidden scroll-mt-24">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider font-mono">
                <ShieldCheck size={14} className="text-blue-400" />
                <span>Primary Regulatory Standing</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold font-orbitron tracking-tight text-white leading-tight">
                Conflux Verified Trust Badge
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Independent, human-evaluated evidence audit of your business registration against municipal Trade Licenses, GSTIN, MSME Udyam, or State Regulatory Registers. Displays the official <strong>✓ Conflux Verified</strong> seal on your profile across Google and AI search.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Trade License / GSTIN Corroboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Physical Location &amp; Phone Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>1-Year Official Verified Badge</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Direct Customer WhatsApp &amp; Call Paths</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800">
                <strong>Policy Guarantee:</strong> The ₹499 first-year fee covers manual administrative inspection against government registers. Payment does NOT buy an automatic pass or synthetic search ranking.
              </div>
            </div>

            {/* Right Action / Checkout Card */}
            <div className="lg:col-span-5 bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 space-y-5">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Verification Review Fee
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-black text-slate-950 font-orbitron">₹499</span>
                    <span className="text-xs text-slate-500 font-medium">/ 1st Year Review</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  Fixed Fee
                </span>
              </div>

              {/* Instant Checkout Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Name to Verify *
                  </label>
                  <input
                    type="text"
                    value={businessNameInput}
                    onChange={(e) => {
                      setBusinessNameInput(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    placeholder="e.g. Apex Health Clinic or Roy Saree Center"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (For Review Alerts)
                  </label>
                  <input
                    type="tel"
                    value={businessPhoneInput}
                    onChange={(e) => setBusinessPhoneInput(e.target.value)}
                    placeholder="10-digit phone number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>

                {inputError && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-[11px] font-medium flex items-center gap-1.5 border border-red-200">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{inputError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleStartVerification}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard size={15} />
                  <span>Proceed to Pay ₹499 via Cashfree</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Payment Trust Footer */}
              <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Lock size={12} className="text-emerald-600" />
                  <span>256-Bit SSL Encryption</span>
                </span>
                <span>Powered by <strong>Cashfree PG</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMERCIAL PLANS COMPARISON GRID ──────────────────────────── */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-slate-950">
              Commercial Value &amp; Growth Subscriptions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Accelerate local customer acquisition, prioritize direct leads, and monitor search telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {(['FREE', 'VERIFIED_GROWTH', 'REGIONAL_SCALE', 'ENTERPRISE'] as PlanTier[]).map((tier) => {
              const plan = CONFLUX_PLANS[tier];
              const isPopular = tier === 'VERIFIED_GROWTH';
              const price = billingCycle === 'ANNUAL' ? Math.round(plan.annualAmountInr / 12) : plan.monthlyAmountInr;

              return (
                <div
                  key={tier}
                  className={`p-6 sm:p-7 rounded-3xl flex flex-col justify-between transition-all relative ${
                    isPopular
                      ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-600/10'
                      : 'bg-white border border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider font-mono shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold font-orbitron text-slate-950">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 min-h-[32px] leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="border-y border-slate-100 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black font-orbitron text-slate-950">
                          {price === 0 ? 'Free' : `₹${price.toLocaleString()}`}
                        </span>
                        {price > 0 && (
                          <span className="text-xs text-slate-500">
                            / mo {billingCycle === 'ANNUAL' && '(billed annually)'}
                          </span>
                        )}
                      </div>
                      {billingCycle === 'ANNUAL' && plan.annualAmountInr > 0 && (
                        <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                          ₹{plan.annualAmountInr.toLocaleString()} / year (Save 17%)
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {plan.highlightedFeatures.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check size={14} className="text-blue-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    {tier === 'FREE' ? (
                      <Link
                        to="/list-business"
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Building2 size={14} />
                        <span>List Free</span>
                      </Link>
                    ) : tier === 'ENTERPRISE' ? (
                      <Link
                        to="/contact"
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>Contact Enterprise Sales</span>
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const heroEl = document.getElementById('verification-hero');
                          if (heroEl) {
                            heroEl.scrollIntoView({ behavior: 'smooth' });
                            const inputEl = heroEl.querySelector('input');
                            if (inputEl) (inputEl as HTMLInputElement).focus();
                          } else {
                            handleStartVerification();
                          }
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isPopular
                            ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-md'
                            : 'bg-slate-900 hover:bg-black text-white shadow-xs'
                        }`}
                      >
                        <Zap size={14} />
                        <span>Get Started</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── PAYMENT METHODS & BANKING SECURITY ────────────────────────── */}
        <section className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Accepted Payment Methods &amp; Banking Standards
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-700 font-semibold">
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              UPI (Google Pay, PhonePe, Paytm)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              All Major Credit &amp; Debit Cards (Visa, Mastercard, RuPay)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              NetBanking (50+ Indian Banks)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              Instant GST Invoice
            </span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-xl mx-auto">
            All verification fee and commercial plan payments are processed securely via <strong>Cashfree Payments India Private Limited</strong>. Conflux AI does not store credit card or banking credentials.
          </p>
        </section>

        {/* ── FREQUENTLY ASKED QUESTIONS ─────────────────────────────────── */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-orbitron text-slate-950">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-600">
              Everything you need to know about our fees, review process, and commercial entitlements.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What does the ₹499 verification fee cover?",
                a: "The ₹499 first-year fee compensates the specialized administrative, technical, and human labor involved in manually verifying your establishment against municipal Trade Licenses, GSTIN, FSSAI, or MCA records. It is an application review fee."
              },
              {
                q: "Does paying the fee guarantee that my business will be verified?",
                a: "No. In strict compliance with regulatory standards, payment of the assessment fee does not purchase or guarantee verification approval. Approval is granted solely if the submitted documentation corroborates with authoritative government records."
              },
              {
                q: "What payment methods are supported on Cashfree checkout?",
                a: "You can pay using any UPI app (Google Pay, PhonePe, Paytm, BHIM), all domestic Debit and Credit cards (RuPay, Visa, Mastercard), NetBanking across 50+ banks, and mobile wallets."
              },
              {
                q: "What happens immediately after I complete payment?",
                a: "Cashfree securely redirects you back to the Conflux Evidence Intake Portal (/verify/payment-return). There, you enter your statutory registration number (GSTIN, Trade License, or Udyam number) and upload documentation. Our compliance team begins review within 1–2 business days."
              },
              {
                q: "Can I list my business on Conflux AI for free?",
                a: "Yes! The Directory Free tier is 100% free forever. It includes public directory indexing, Schema.org LocalBusiness structured data for Google, and inbound inquiry capture."
              }
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Cashfree PG Verification Checkout Modal */}
      {selectedBusiness.name && (
        <VerificationCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          business={selectedBusiness}
        />
      )}
    </main>
  );
};
