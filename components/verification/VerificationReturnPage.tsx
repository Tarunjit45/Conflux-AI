// Conflux Platform — Paid Verification Return & Evidence Onboarding Page (/verify/payment-return)
// Handles return from Cashfree hosted checkout, confirms payment, collects verification evidence, and submits for manual admin evaluation.
// Core Invariant: Payment covers the manual review; it is NEVER an automatic verification guarantee.

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, CheckCircle2, Clock, AlertCircle, ArrowRight,
  Building2, FileText, Lock, RefreshCw, ExternalLink, HelpCircle,
  MapPin, Phone, Globe, UploadCloud, Printer, Download
} from 'lucide-react';
import { verificationPaymentService } from '../../lib/verificationPaymentService';
import type {
  VerificationOrder,
  VerificationEvidencePayload,
  StatutoryDocumentType
} from '../../types/verificationPayment';

export const VerificationReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<VerificationOrder | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Evidence Form State
  const [legalName, setLegalName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [statutoryDocType, setStatutoryDocType] = useState<StatutoryDocumentType>('TRADE_LICENSE');
  const [statutoryDocNumber, setStatutoryDocNumber] = useState('');
  const [evidenceDocUrl, setEvidenceDocUrl] = useState('');
  const [storefrontPhotoUrl, setStorefrontPhotoUrl] = useState('');
  const [applicantNotes, setApplicantNotes] = useState('');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const checkOrderAndPayment = async () => {
      setIsLoading(true);
      try {
        // 1. First retrieve local or db order
        let existing = await verificationPaymentService.getOrder(orderId);

        // 2. Query status verification endpoint if payment is still pending
        if (!existing || existing.paymentStatus !== 'PAID') {
          try {
            const res = await fetch(`/api/verify-payment?order_id=${encodeURIComponent(orderId)}`);
            if (res.ok) {
              const data = await res.json();
              if (data.isPaid) {
                existing = await verificationPaymentService.confirmPaymentSuccess(
                  orderId,
                  data.paymentReference || `PAY_${Date.now()}`,
                  'CASHFREE_CHECKOUT'
                );
              }
            }
          } catch {
            // Offline / local simulation fallback
            if (existing) {
              existing = await verificationPaymentService.confirmPaymentSuccess(
                orderId,
                `SANDBOX_PAY_${Date.now()}`,
                'SANDBOX_SIMULATION'
              );
            }
          }
        }

        if (existing) {
          setOrder(existing);
          // Pre-populate evidence fields if available
          if (existing.evidence) {
            setLegalName(existing.evidence.legalName || '');
            setFullAddress(existing.evidence.fullAddress || '');
            setCity(existing.evidence.city || '');
            setDistrict(existing.evidence.district || '');
            setPhone(existing.evidence.phone || existing.customerPhone || '');
            setWhatsapp(existing.evidence.whatsapp || '');
            setWebsiteUrl(existing.evidence.websiteUrl || '');
            setGoogleMapsUrl(existing.evidence.googleMapsUrl || '');
            setStatutoryDocType(existing.evidence.statutoryDocType || 'TRADE_LICENSE');
            setStatutoryDocNumber(existing.evidence.statutoryDocNumber || '');
            setEvidenceDocUrl(existing.evidence.evidenceDocUrl || '');
            setStorefrontPhotoUrl(existing.evidence.storefrontPhotoUrl || '');
            setApplicantNotes(existing.evidence.applicantNotes || '');
          } else {
            setPhone(existing.customerPhone || '');
          }
        }
      } catch (err: any) {
        console.error('[VerificationReturnPage] Error resolving order:', err);
        setErrorMessage(err.message || 'Unable to retrieve order details.');
      } finally {
        setIsLoading(false);
      }
    };

    checkOrderAndPayment();
  }, [orderId]);

  const handleSimulatePaymentSuccess = async () => {
    if (!orderId) return;
    setIsVerifyingPayment(true);
    try {
      const updated = await verificationPaymentService.confirmPaymentSuccess(
        orderId,
        `SIMULATED_${Date.now()}`,
        'TEST_PAYMENT'
      );
      setOrder(updated);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment confirmation failed.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !order) return;
    setErrorMessage(null);

    if (!fullAddress.trim()) {
      setErrorMessage('Please enter the physical business address.');
      return;
    }
    if (!statutoryDocNumber.trim()) {
      setErrorMessage('Please enter the license, registration, or tax identification number.');
      return;
    }

    setIsSubmittingEvidence(true);

    try {
      const payload: VerificationEvidencePayload = {
        businessName: order.businessName,
        legalName: legalName.trim() || undefined,
        fullAddress: fullAddress.trim(),
        city: city.trim() || 'Nadia',
        district: district.trim() || 'West Bengal',
        phone: phone.trim() || order.customerPhone,
        whatsapp: whatsapp.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        statutoryDocType,
        statutoryDocNumber: statutoryDocNumber.trim(),
        evidenceDocUrl: evidenceDocUrl.trim() || undefined,
        storefrontPhotoUrl: storefrontPhotoUrl.trim() || undefined,
        applicantNotes: applicantNotes.trim() || undefined
      };

      const updated = await verificationPaymentService.submitEvidence(orderId, payload);
      setOrder(updated);
      setSubmissionSuccess(true);
    } catch (err: any) {
      console.error('[VerificationReturnPage] Error submitting evidence:', err);
      setErrorMessage(err.message || 'Failed to submit evidence documentation. Please try again.');
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3 font-mono text-xs text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Verifying Cashfree transaction status...</p>
        </div>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Order Reference Not Found
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            No valid verification order was specified in the return URL or the session has expired.
          </p>
          <div className="pt-2">
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-all"
            >
              Return to Discovery &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'PAID';
  const isUnderReview = order.verificationStatus === 'UNDER_REVIEW';
  const isVerified = order.verificationStatus === 'VERIFIED';
  const isMoreEvidenceRequired = order.verificationStatus === 'MORE_EVIDENCE_REQUIRED';
  const isRejected = order.verificationStatus === 'REJECTED';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Breadcrumb / Top Link */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <Link to={`/business/${order.businessSlug}`} className="hover:text-blue-700 transition-colors inline-flex items-center gap-1">
            &larr; Back to {order.businessName} profile
          </Link>
          <span className="font-mono text-[11px] bg-slate-200/70 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
            Order: {order.orderId}
          </span>
        </div>

        {/* ── CARD 1: PAYMENT STATUS CONFIRMATION & OFFICIAL RECEIPT ─────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5 print:border-none print:shadow-none">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Verification Assessment Fee Receipt
              </span>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                {isPaid ? 'Payment Confirmed &bull; Assessment Active' : 'Payment Awaiting Confirmation'}
              </h1>
              <p className="text-xs text-slate-600">
                Application for <strong>{order.businessName}</strong> &bull; Amount: <strong>₹{order.amountInr.toFixed(2)} INR</strong>
              </p>
            </div>

            {isPaid ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer print:hidden"
                  title="Print or Save Receipt"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  ₹499 Paid Successfully
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <Clock size={15} className="text-amber-600" />
                Payment Pending
              </span>
            )}
          </div>

          {/* Official Payment Receipt Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Payment Breakdown &amp; Transaction Docket
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Date: {order.paymentTime ? new Date(order.paymentTime).toLocaleString('en-IN') : new Date(order.updatedAt || order.createdAt).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Order ID</span>
                <span className="font-bold text-slate-900 font-mono select-all">{order.orderId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Gateway Reference / ID</span>
                <span className="font-bold text-slate-900 font-mono truncate block select-all" title={order.paymentReference || 'Direct Payment'}>
                  {order.paymentReference || 'Direct Bank Settlement'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Business Application ID</span>
                <span className="font-bold text-slate-900 font-mono truncate block">{order.businessSlug}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Applicant Name</span>
                <span className="font-bold text-slate-900">{order.customerName}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Verification Application Assessment Service (1-Year Review)</span>
                <span className="font-mono font-medium">₹499.00</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Goods &amp; Services Tax (GST)</span>
                <span className="font-mono">GST is not charged</span>
              </div>
              <div className="flex justify-between font-bold text-slate-950 pt-1 border-t border-slate-200 text-sm">
                <span>Total Amount Paid (INR)</span>
                <span className="font-mono text-emerald-700">₹499.00 INR (GST is not charged)</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 pt-1 leading-relaxed italic">
              <strong>Billing Transparency Notice:</strong> Total: ₹499. GST is not charged. Payment covers the manual human and documentary review service and does NOT guarantee verification approval, ranking boosts, or commercial leads. If GST status changes later, invoicing and checkout breakdowns will be updated accordingly.
            </p>
          </div>

          {/* Sandbox Payment Fallback Button if needed */}
          {!isPaid && (
            <div className="pt-2 flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
              <span className="text-amber-900 font-medium">
                Testing in Sandbox or local development? Confirm simulated payment:
              </span>
              <button
                onClick={handleSimulatePaymentSuccess}
                disabled={isVerifyingPayment}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
              >
                {isVerifyingPayment ? 'Confirming...' : 'Simulate Success'}
              </button>
            </div>
          )}
        </div>

        {/* ── CARD 2: REVIEW STATUS & EVIDENCE ONBOARDING ───────────── */}
        {isPaid && (
          <>
            {/* If Order is already Verified */}
            {isVerified && (
              <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                    <ShieldCheck size={15} className="text-emerald-700" />
                    ✓ Conflux Verified
                  </span>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
                    <span>Verified on: <strong className="text-slate-900">{order.verifiedAt ? new Date(order.verifiedAt).toLocaleDateString() : (order.paymentTime ? new Date(order.paymentTime).toLocaleDateString() : new Date().toLocaleDateString())}</strong></span>
                    <span>&bull;</span>
                    <span>Valid until: <strong className="text-slate-900">{order.expiresAt ? new Date(order.expiresAt).toLocaleDateString() : new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-950">
                    {order.businessName} &bull; Verification Completed
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Evaluated and corroborated by Conflux Operations. The official Verified badge with 1-year temporal validity is published on the business profile.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 space-y-2">
                  <span className="font-bold text-emerald-950 uppercase tracking-wider font-mono text-[11px] block">
                    What Conflux reviewed:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs">
                    <li>Operational business identity &amp; legal entity name ({order.evidence?.legalName || order.businessName})</li>
                    <li>Declared address &amp; visual premise evidence in {order.evidence?.city || 'Nadia'}, {order.evidence?.district || 'West Bengal'}</li>
                    <li>Statutory registration credentials ({order.evidence?.statutoryDocType?.replace(/_/g, ' ') || 'Trade License Registry'})</li>
                    <li>Authentic direct customer communication channels (Phone &amp; WhatsApp)</li>
                  </ul>
                  {order.reviewNotes && (
                    <div className="pt-2 border-t border-emerald-200/80 text-[11px] text-slate-600">
                      <strong>Evaluation Summary:</strong> {order.reviewNotes}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                  <strong>Policy Invariant:</strong> Verified status denotes manual evidence inspection of stated business claims against available registries. Conflux does not guarantee business performance, endorse commercial offerings, or accept payment for search placement or customer leads.
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    to={`/business/${order.businessSlug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <span>Verification details &rarr;</span>
                  </Link>
                </div>
              </div>
            )}

            {/* If Order is Under Review */}
            {(isUnderReview || submissionSuccess) && !isVerified && (
              <div className="bg-white rounded-3xl border border-blue-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Clock size={28} />
                </div>
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                    Under Manual Review
                  </span>
                  <h2 className="text-xl font-bold text-slate-950 pt-2">
                    Evidence Received &bull; Under Evaluation
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Thank you. Your statutory documentation has been securely transferred to the Conflux Review Queue.
                    Our verification team will review defined business information and submitted statutory evidence against applicable registries. <strong>Typical review time: 1–2 business days</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock size={13} className="text-blue-600" />
                    <span>Review Protocol &amp; Invariants:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                    <li>Payment is an application review fee, not an automatic verification guarantee.</li>
                    <li>Status updates and evidence requests are communicated directly to <strong>{order.customerEmail}</strong>.</li>
                    <li>Once corroborated, your public profile receives the official <strong>✓ Conflux Verified</strong> badge with 1-year temporal validity (strictly independent from sponsored placement or search ranking).</li>
                  </ul>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    to={`/business/${order.businessSlug}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
                  >
                    <span>Return to Business Profile</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* If More Evidence is Required */}
            {isMoreEvidenceRequired && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertCircle size={15} className="text-amber-700" />
                  Additional Evidence Requested by Conflux Admin:
                </div>
                <p className="leading-relaxed">
                  {order.evidenceRequestedNotes || 'Please supply a clearer copy of your Trade License or GST certificate.'}
                </p>
                <p className="text-[11px] text-amber-800">
                  Please update the information below and re-submit for review.
                </p>
              </div>
            )}

            {/* If Order is Rejected */}
            {isRejected && (
              <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle size={28} />
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                    Verification Rejected
                  </span>
                  <h2 className="text-xl font-bold text-slate-950 pt-2">
                    Application Could Not Be Verified
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Our verification team could not authenticate the submitted claims against official statutory registries.
                  </p>
                </div>
                {order.reviewNotes && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block font-mono text-[11px] uppercase">
                      Admin Evaluation Note
                    </span>
                    <p>{order.reviewNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Evidence Intake Form (Shown when PAID, or when MORE_EVIDENCE_REQUIRED, and not already under review/verified) */}
            {(!order.evidence || isMoreEvidenceRequired) && !isVerified && !submissionSuccess && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700 font-mono uppercase tracking-wider">
                    <FileText size={15} /> Step 2: Submit Verification Evidence
                  </div>
                  <h2 className="text-xl font-bold text-slate-950 mt-1">
                    Statutory Documentation &amp; Storefront Details
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Please provide official government registration credentials (Trade License, GSTIN, MSME, FSSAI) and digital links for independent verification.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* DPDP Act (2023) Notice: Why each category of personal & business data is collected */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-slate-900 uppercase tracking-wider font-mono text-[11px] flex items-center gap-1.5">
                      <Lock size={14} className="text-blue-600" />
                      DPDP Act Data Collection &amp; Privacy Notice
                    </span>
                    <Link to="/privacy-policy" target="_blank" className="text-blue-600 hover:underline font-mono text-[11px]">
                      View Full Policy &rarr;
                    </Link>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    In compliance with the <strong>Digital Personal Data Protection Act, 2023</strong>, Conflux AI collects only information genuinely necessary to corroborate and publish your business verification:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-700">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <strong>Legal Name &amp; Contact:</strong> To verify lawful representation and deliver status updates and clarification requests.
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <strong>Declared Address:</strong> To verify declared operating location and eliminate phantom or fraudulent listings.
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <strong>Statutory License / Number:</strong> To cross-reference with official state/central registry records (MCA, GSTN, FoSCoS, Udyam).
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <strong>Private Evidence Storage:</strong> Documents are restricted to authorized compliance officers and NEVER exposed publicly.
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
                    <ShieldCheck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Public Masking Invariant:</strong> Public business profiles will only show masked numbers (e.g. 19••••••A1Z5). Raw certificates are 100% private. Data is retained for the 1-year verification validity period. Grievances or deletion requests: <a href="mailto:privacy@confluxai.in" className="underline font-bold">privacy@confluxai.in</a>.</span>
                  </div>
                </div>

                <form onSubmit={handleSubmitEvidence} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Registered Legal Name (as per document)
                      </label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={e => setLegalName(e.target.value)}
                        placeholder="e.g. Subir Enterprises Pvt Ltd"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Primary Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Physical Business Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={fullAddress}
                      onChange={e => setFullAddress(e.target.value)}
                      placeholder="e.g. Ground Floor, Ghosh Para Road, Station Bazar, Ranaghat, Nadia, 741201"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        City / Town / Locality *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Ranaghat"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        District *
                      </label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        placeholder="e.g. Nadia"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Statutory Document Details */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono block">
                      Statutory Registry Evidence
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Document / License Type *
                        </label>
                        <select
                          value={statutoryDocType}
                          onChange={e => setStatutoryDocType(e.target.value as StatutoryDocumentType)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none"
                        >
                          <option value="TRADE_LICENSE">Trade License (Municipal / Gram Panchayat)</option>
                          <option value="GSTIN">GSTIN Tax Registration</option>
                          <option value="MSME_UDYAM">MSME Udyam Registration</option>
                          <option value="FSSAI">FSSAI Food Safety License</option>
                          <option value="CLINICAL_ESTABLISHMENT">Clinical Establishment License</option>
                          <option value="PROFESSIONAL_COUNCIL">Professional Council Registration</option>
                          <option value="STOREFRONT_PHOTO">Exterior Physical Signboard Photo</option>
                          <option value="OTHER">Other Government Registration</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Registration / License Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={statutoryDocNumber}
                          onChange={e => setStatutoryDocNumber(e.target.value)}
                          placeholder="e.g. 19AAAAA0000A1Z5 or WB-RAN-12345"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Document URL / Drive Link (Optional)
                        </label>
                        <input
                          type="url"
                          value={evidenceDocUrl}
                          onChange={e => setEvidenceDocUrl(e.target.value)}
                          placeholder="https://drive.google.com/... or public doc link"
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Storefront Photo Link (Optional)
                        </label>
                        <input
                          type="url"
                          value={storefrontPhotoUrl}
                          onChange={e => setStorefrontPhotoUrl(e.target.value)}
                          placeholder="https://... photo of shop front"
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Public Digital References */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Google Maps Listing Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={googleMapsUrl}
                        onChange={e => setGoogleMapsUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Official Website / Facebook (Optional)
                      </label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={e => setWebsiteUrl(e.target.value)}
                        placeholder="https://mybusiness.in"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Applicant Note for Verification Officer (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={applicantNotes}
                      onChange={e => setApplicantNotes(e.target.value)}
                      placeholder="e.g. Operating at this premises for 7 years. License renewed for current fiscal year."
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingEvidence}
                      className="w-full py-3.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[46px]"
                    >
                      {isSubmittingEvidence ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Submitting Evidence to Review Queue...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          <span>Submit Application for Manual Review</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default VerificationReturnPage;
