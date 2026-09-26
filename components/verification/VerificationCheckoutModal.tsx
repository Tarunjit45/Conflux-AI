// Conflux Platform — Apply for Conflux Verified Checkout Modal
// Launch price: ₹499 for first year. Core Invariant: Review fee; manual review required, not a guaranteed outcome.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, ArrowRight, Lock, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { verificationPaymentService } from '../../lib/verificationPaymentService.ts';
import type { ConfluxBusiness } from '../../types/business.ts';

interface VerificationCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: {
    id: string;
    name: string;
    slug?: string;
    ownerName?: string;
    contact?: {
      phone?: string;
      whatsapp?: string;
      email?: string;
    };
    location?: {
      locality?: string;
      city?: string;
      district?: string;
      state?: string;
      country?: string;
      fullAddress?: string;
    };
  } | ConfluxBusiness | any;
  onSuccessRedirect?: (orderId: string) => void;
}

export const VerificationCheckoutModal: React.FC<VerificationCheckoutModalProps> = ({
  isOpen,
  onClose,
  business,
  onSuccessRedirect
}) => {
  const [applicantName, setApplicantName] = useState((business as any).ownerName || '');
  const [applicantEmail, setApplicantEmail] = useState(business.contact?.email || '');
  const [applicantPhone, setApplicantPhone] = useState(business.contact?.phone || business.contact?.whatsapp || '');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isSubmitting, onClose]);

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
      const CashfreeFn = await loadCashfreeSdk();
      if (CashfreeFn && orderRes.paymentSessionId && !orderRes.paymentSessionId.startsWith('session_sandbox')) {
        let cashfree: any = null;
        try {
          cashfree = typeof CashfreeFn === 'function'
            ? CashfreeFn({
                mode: orderRes.environment === 'PRODUCTION' ? 'production' : 'sandbox'
              })
            : null;
        } catch {
          try {
            cashfree = new (CashfreeFn as any)({
              mode: orderRes.environment === 'PRODUCTION' ? 'production' : 'sandbox'
            });
          } catch (initErr) {
            console.warn('[Cashfree Init Error]', initErr);
          }
        }

        if (cashfree && typeof cashfree.checkout === 'function') {
          cashfree.checkout({
            paymentSessionId: orderRes.paymentSessionId,
            redirectTarget: '_self'
          });
          return;
        }
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
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-lg max-h-[min(90vh,760px)] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-inter"
      >
        {/* Fixed Header */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
          <div className="space-y-1 pr-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
              <ShieldCheck size={13} className="text-emerald-600" />
              Conflux Verified Order
            </span>
            <h2 id="verification-modal-title" className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
              Get Your Business Verified
            </h2>
            <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-sm">
              For <strong>{business.name}</strong> &bull; {business.location?.locality || business.location?.city || 'Local Location'}, {business.location?.district || 'India'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Container (Policy Summary Banner + Form) */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Pricing & Policy Summary Banner */}
          <div className="p-4 sm:p-6 bg-slate-50/90 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Launch Pricing</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950">₹499</span>
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
            <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-950 leading-relaxed space-y-1.5">
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
          <form onSubmit={handleProceedToPayment} className="p-4 sm:p-6 space-y-4">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
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

            <div className="pt-2 sticky bottom-0 bg-white/95 backdrop-blur-xs pb-1">
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

            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Lock size={11} /> 256-bit Encrypted
              </span>
              <span>&bull;</span>
              <span>Cashfree Hosted Checkout</span>
              <span>&bull;</span>
              <span>UPI / Card / NetBanking</span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
