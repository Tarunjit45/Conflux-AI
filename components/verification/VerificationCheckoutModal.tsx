// Conflux Platform — Apply for Conflux Verified Checkout Modal
// Launch price: ₹499 for first year. Core Invariant: Review fee; manual review required, not a guaranteed outcome.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, ArrowRight, Lock, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { verificationPaymentService } from '../../lib/verificationPaymentService.ts';
import type { ConfluxBusiness } from '../../types/business.ts';

interface VerificationCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: ConfluxBusiness;
  onSuccessRedirect?: (orderId: string) => void;
}

export const VerificationCheckoutModal: React.FC<VerificationCheckoutModalProps> = ({
  isOpen,
  onClose,
  business,
  onSuccessRedirect
}) => {
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState(business.contact?.email || '');
  const [applicantPhone, setApplicantPhone] = useState(business.contact?.phone || '');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const loadCashfreeSdk = (): Promise<any> => {
    return new Promise((resolve) => {
      if ((window as any).Cashfree) {
        return resolve((window as any).Cashfree);
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve((window as any).Cashfree);
      script.onerror = () => resolve(null);
      document.body.appendChild(script);
    });
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!applicantName.trim()) {
      setErrorMessage('Please enter the applicant or proprietor name.');
      return;
    }
    if (!applicantEmail.trim() || !applicantEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address for review notifications.');
      return;
    }
    if (!applicantPhone.trim() || applicantPhone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!agreedToPolicy) {
      setErrorMessage('Please confirm your acknowledgment of the Cancellation & Refund Policy before proceeding.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderRes = await verificationPaymentService.createOrder({
        businessId: business.id,
        businessSlug: business.slug,
        businessName: business.name,
        customerName: applicantName.trim(),
        customerEmail: applicantEmail.trim(),
        customerPhone: applicantPhone.trim()
      });

      if (!orderRes.success || !orderRes.orderId) {
        throw new Error(orderRes.error || 'Failed to create verification order.');
      }

      // Check if Cashfree JS SDK is available for hosted checkout
      const CashfreeConstructor = await loadCashfreeSdk();
      if (CashfreeConstructor && orderRes.paymentSessionId && !orderRes.paymentSessionId.startsWith('session_sandbox')) {
        const cashfree = new CashfreeConstructor({
          mode: orderRes.environment === 'PRODUCTION' ? 'production' : 'sandbox'
        });
        cashfree.checkout({
          paymentSessionId: orderRes.paymentSessionId,
          redirectTarget: '_self'
        });
        return;
      }

      // In Sandbox or test mode without live banking keys, navigate directly to verification return flow
      if (onSuccessRedirect) {
        onSuccessRedirect(orderRes.orderId);
      } else {
        window.location.href = `/verify/payment-return?order_id=${encodeURIComponent(orderRes.orderId)}`;
      }
    } catch (err: any) {
      console.error('[Verification Checkout Error]', err);
      setErrorMessage(err.message || 'An error occurred initializing payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
              <ShieldCheck size={14} className="text-emerald-600" />
              Conflux Verified Order
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Get Your Business Verified
            </h2>
            <p className="text-xs text-slate-500">
              For <strong>{business.name}</strong> &bull; {business.location.locality || business.location.city}, {business.location.district}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pricing & Policy Summary Banner */}
        <div className="p-6 bg-slate-50/80 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Launch Pricing</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-950">₹499</span>
                <span className="text-xs font-medium text-slate-500">/ first year review</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                <Sparkles size={12} /> 1-Year Verified Badge
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Independent review of defined business information and submitted statutory evidence</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Official <strong>✓ Conflux Verified</strong> badge published upon admin approval (1-year validity)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Strictly decoupled from sponsored placement, paid ranking, or advertising</span>
            </div>
          </div>

          {/* Mandatory Review & Refund Policy */}
          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-950 leading-relaxed space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-900 font-mono text-[10px] uppercase tracking-wider">
              <AlertCircle size={13} className="text-amber-700 shrink-0" />
              <span>Verification Review &amp; Refund Policy</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-900/90">
              <li><strong>Review Fee:</strong> ₹499 is an order review fee for manual evidence inspection. Payment does NOT guarantee verification approval.</li>
              <li><strong>If More Evidence Required:</strong> If documents are incomplete, you may supply additional proof within 14 days with zero extra charge.</li>
              <li><strong>Non-Refundable:</strong> Once manual investigation and registrar lookups commence, the review fee is strictly non-refundable regardless of outcome.</li>
              <li><strong>Review Turnaround:</strong> Typical review time: 1–2 business days.</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleProceedToPayment} className="p-6 sm:p-8 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Applicant / Proprietor Name *
            </label>
            <input
              type="text"
              required
              value={applicantName}
              onChange={e => setApplicantName(e.target.value)}
              placeholder="e.g. Subir Karmakar"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Notification Email *
              </label>
              <input
                type="email"
                required
                value={applicantEmail}
                onChange={e => setApplicantEmail(e.target.value)}
                placeholder="contact@business.in"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Contact Mobile (for OTP / UPI) *
              </label>
              <input
                type="tel"
                required
                value={applicantPhone}
                onChange={e => setApplicantPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* DPDP Act Privacy Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800 flex items-center gap-1 mb-0.5">
              <Lock size={12} className="text-blue-600" />
              <span>DPDP Privacy Notice:</span>
            </span>
            Conflux collects your contact and business details solely for manual verification against statutory registries and transactional updates. Evidence documents are kept 100% private and never exposed publicly.
          </div>

          <div className="pt-1 pb-1 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="agreeRefundPolicy"
              required
              checked={agreedToPolicy}
              onChange={e => setAgreedToPolicy(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
            />
            <label htmlFor="agreeRefundPolicy" className="text-[11px] text-slate-600 leading-snug cursor-pointer select-none">
              I understand that ₹499 is an assessment fee for manual verification (not a guaranteed pass, ranking boost, or endorsement) and is non-refundable once review begins. I agree to the{' '}
              <a 
                href="/refund-policy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 font-bold underline hover:text-blue-800"
              >
                Refund Policy
              </a>
              {', '}
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 font-bold underline hover:text-blue-800"
              >
                Terms of Service
              </a>
              {', '}
              <a 
                href="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 font-bold underline hover:text-blue-800"
              >
                Privacy Policy
              </a>
              {', and '}
              <a 
                href="/verify/methodology" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 font-bold underline hover:text-blue-800"
              >
                Verification Methodology
              </a>.
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Connecting to Cashfree Checkout...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Proceed to Pay ₹499 via Cashfree</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium pt-1">
            <span className="flex items-center gap-1">
              <Lock size={11} /> 256-bit Encrypted
            </span>
            <span>&bull;</span>
            <span>Cashfree Hosted Checkout</span>
            <span>&bull;</span>
            <span>UPI / Card / NetBanking</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
