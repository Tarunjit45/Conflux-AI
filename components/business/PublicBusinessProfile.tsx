// Conflux Platform — Authoritative Public Business Profile (Entity Trust Dossier, Decision Interface & Verified Contributions)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2, ShieldCheck, ShieldAlert, CheckCircle2, Phone, MessageSquare,
  MapPin, Globe, Calendar, Clock, ExternalLink, ArrowRight, Send, Compass,
  Layers, Check, AlertCircle, FileText, Lock, Sparkles, UserCheck, Star,
  Edit3, Flag, HelpCircle, X
} from 'lucide-react';
import { businessService } from '../../lib/businessService';
import { connectService } from '../../lib/connectService';
import { contributionService } from '../../lib/contributionService';
import { useAuth } from '../../lib/authContext';
import { ClaimBusinessModal } from './ClaimBusinessModal';
import type { ConfluxBusiness } from '../../types/business';
import type { ReviewRatingContribution } from '../../types/contribution';

export const PublicBusinessProfile: React.FC = () => {
  const { district, city, slug } = useParams<{ district: string; city: string; slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const [business, setBusiness] = useState<ConfluxBusiness | null>(null);
  const [reviews, setReviews] = useState<ReviewRatingContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Direct Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadService, setLeadService] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccessMessage, setLeadSuccessMessage] = useState<string | null>(null);

  // Contribution Modal States
  const [activeContribModal, setActiveContribModal] = useState<'REVIEW' | 'EDIT' | 'REPORT' | null>(null);
  const [contribRating, setContribRating] = useState(5);
  const [contribReviewText, setContribReviewText] = useState('');
  const [contribEditField, setContribEditField] = useState<'operatingHours' | 'services' | 'contactPhone' | 'address' | 'landmark'>('services');
  const [contribEditValue, setContribEditValue] = useState('');
  const [contribEditRationale, setContribEditRationale] = useState('');
  const [contribReportIssue, setContribReportIssue] = useState<any>('OUTDATED_HOURS');
  const [contribReportDetails, setContribReportDetails] = useState('');
  const [contribStatusMessage, setContribStatusMessage] = useState<string | null>(null);

  const fetchBusinessAndReviews = async () => {
    setIsLoading(true);
    if (slug) {
      const found = await businessService.getBusinessBySlug(slug);
      if (found) {
        setBusiness(found);
        setIsOpenNow(businessService.isBusinessOpenNow(found.operatingHours));
        document.title = `${found.name} | Verified Business Identity | Conflux`;

        // Fetch approved reviews
        const approved = await contributionService.getApprovedReviewsForBusiness(found.id);
        setReviews(approved);

        // Log telemetry view event
        connectService.logEvent({
          businessId: found.id,
          eventType: 'BUSINESS_VIEW',
          channel: 'HUMAN_WEB'
        });
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBusinessAndReviews();
  }, [slug]);

  const handleActionClick = (action: any) => {
    if (!business) return;
    connectService.logEvent({
      businessId: business.id,
      eventType: action,
      channel: 'HUMAN_WEB'
    });
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !leadName || !leadEmail) return;

    setIsSubmittingLead(true);
    try {
      const res = await connectService.submitLead({
        businessId: business.id,
        businessName: business.name,
        contactName: leadName,
        contactEmail: leadEmail,
        contactPhone: leadPhone,
        serviceRequested: leadService || undefined,
        message: leadMessage
      });

      if (res.success) {
        setLeadSuccessMessage(res.message);
        setLeadName('');
        setLeadEmail('');
        setLeadPhone('');
        setLeadService('');
        setLeadMessage('');
      }
    } catch (err: any) {
      alert(`Error submitting inquiry: ${err.message}`);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !user) return;

    try {
      await contributionService.submitReview(
        user.id,
        user.email,
        user.fullName || user.email.split('@')[0],
        business.id,
        contribRating,
        contribReviewText,
        { businessName: business.name }
      );
      setContribStatusMessage('Review submitted successfully. It will appear after administrative moderation.');
      setContribReviewText('');
      setTimeout(() => {
        setActiveContribModal(null);
        setContribStatusMessage(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !user) return;

    try {
      await contributionService.submitSuggestedEdit(
        user.id,
        user.email,
        user.fullName || user.email.split('@')[0],
        business.id,
        contribEditField,
        contribEditValue,
        contribEditRationale,
        business.name
      );
      setContribStatusMessage('Suggested correction submitted for review.');
      setContribEditValue('');
      setContribEditRationale('');
      setTimeout(() => {
        setActiveContribModal(null);
        setContribStatusMessage(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !user) return;

    try {
      await contributionService.submitInaccuracyReport(
        user.id,
        user.email,
        user.fullName || user.email.split('@')[0],
        business.id,
        contribReportIssue,
        contribReportDetails,
        business.name
      );
      setContribStatusMessage('Inaccuracy report received. Conflux administrators will investigate.');
      setContribReportDetails('');
      setTimeout(() => {
        setActiveContribModal(null);
        setContribStatusMessage(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3 font-mono text-xs text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Resolving Conflux Business Graph node...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <h2 className="text-xl font-bold font-orbitron text-slate-900">
            Business Not Found
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The requested business node does not exist or has been removed from the Conflux Business Graph.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/discover"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              Browse Discover &rarr;
            </Link>
            <Link
              to="/list-business"
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              List a Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = business.verificationStatus === 'SUPPORTED';
  const isClaimed = business.claimStatus === 'VERIFIED_OWNER';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 font-mono flex-wrap">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/discover" className="hover:text-blue-600 transition-colors">Discover</Link>
          <span>/</span>
          <span className="capitalize">{business.location.district}</span>
          <span>/</span>
          <span className="capitalize">{business.location.city}</span>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-[200px]">{business.name}</span>
        </nav>

        {/* ── TOP HERO CARD ────────────────────────────────────────── */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              
              {/* Conflux Business ID & Verification Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                  {business.confluxBusinessId}
                </span>

                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono shadow-sm">
                    <ShieldCheck size={14} className="text-emerald-600" /> CONFLUX VERIFIED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold font-mono">
                    STANDARD LISTING ({business.verificationStatus})
                  </span>
                )}

                {isClaimed ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold font-mono">
                    <UserCheck size={13} /> VERIFIED PROPRIETOR
                  </span>
                ) : (
                  <button
                    onClick={() => setIsClaimModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold font-mono hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Claim This Business Profile &rarr;
                  </button>
                )}
              </div>

              {/* Title & Legal Name */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                  {business.name}
                </h1>
                {business.legalName && (
                  <div className="text-xs font-bold text-slate-500 mt-1 font-mono">
                    Legal Registered Name: {business.legalName}
                  </div>
                )}
              </div>

              {/* Category & Locality */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                <span className="capitalize text-slate-900 font-bold bg-slate-100 px-2.5 py-1 rounded-md">
                  {business.categoryName || business.categoryId}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="capitalize">{business.location.city}, {business.location.district}</span>
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock size={14} className="text-slate-400" />
                  <span className={isOpenNow ? 'text-emerald-700 font-bold' : 'text-slate-500 font-bold'}>
                    {isOpenNow ? 'OPEN NOW' : 'CLOSED'}
                  </span>
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed pt-2">
                {business.description}
              </p>
            </div>

            {/* Quick Outbound Connect Panel */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 shrink-0 lg:w-72">
              <div className="text-xs font-bold font-orbitron text-slate-900 uppercase tracking-wider">
                Direct Customer Connect
              </div>

              {business.contact.phone && (
                <a
                  href={`tel:${business.contact.phone}`}
                  onClick={() => handleActionClick('PHONE_CLICK')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone size={14} /> Call {business.contact.phone}
                </a>
              )}

              {business.contact.whatsapp && (
                <a
                  href={`https://wa.me/${business.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleActionClick('WHATSAPP_CLICK')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={14} /> Direct WhatsApp Chat
                </a>
              )}

              {business.contact.bookingUrl && (
                <a
                  href={business.contact.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleActionClick('BOOKING_CLICK')}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar size={14} /> Online Booking / Order
                </a>
              )}

              {business.contact.websiteUrl && (
                <a
                  href={business.contact.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleActionClick('WEBSITE_CLICK')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Globe size={14} /> Visit Official Website <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN MAIN CONTENT ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2 Cols): Services, Trust Dossier, Reviews & Inquiry */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* SERVICES & CAPABILITIES */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-base font-bold font-orbitron text-slate-900">
                <Layers size={20} className="text-blue-600" /> Services &amp; Capabilities
              </div>

              {business.services && business.services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {business.services.map((svc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-2.5 text-xs font-bold text-slate-800"
                    >
                      <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                      <span>{svc}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">General commercial enterprise services.</p>
              )}
            </div>

            {/* TRUST & PROVENANCE DOSSIER */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-base font-bold font-orbitron text-slate-900">
                  <ShieldCheck size={20} className="text-emerald-600" /> Trust &amp; Provenance Dossier
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Confidence: {business.confidenceScore || 0}%
                </span>
              </div>

              {/* Provenance: Source Information vs Conflux Verification */}
              <div className="space-y-3">
                {/* 1. Source Information */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Source Information:
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono text-[10px] font-bold">
                      Official Public / Regulatory Registry
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {business.primaryRegistrar || 'Primary Statutory Registry Docket'}
                  </div>
                  {business.evidenceSummary && (
                    <p className="text-xs text-slate-700 leading-relaxed pt-0.5">
                      &ldquo;{business.evidenceSummary}&rdquo;
                    </p>
                  )}
                </div>

                {/* 2. Conflux Verification Result */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-emerald-700" /> Conflux Verification:
                    </span>
                    <span className="font-mono text-emerald-800 font-bold text-[11px]">
                      {isVerified ? 'VERIFIED (STATUTORY)' : business.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Evaluated and corroboration grounded against primary statutory licensing records.
                  </p>
                  {business.lastVerifiedAt && (
                    <div className="text-[11px] text-emerald-700 pt-0.5 font-mono">
                      Last Verified: {new Date(business.lastVerifiedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Strict Zero Fake Reviews Guarantee */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Lock size={13} /> Conflux Evidence Grounding Guarantee:
                </div>
                <p className="leading-relaxed">
                  Conflux does not fabricate review stars, synthetic ratings, or artificial popularity metrics. All trust classifications are deterministically verified against government gazettes and statutory licensing dockets.
                </p>
              </div>
            </div>

            {/* ── REVIEWS & VERIFIED CONTRIBUTIONS SECTION ─────────── */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold font-orbitron text-slate-900 flex items-center gap-2">
                    <Star size={18} className="text-amber-500" /> Customer Reviews &amp; Contributions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Accountable community contributions tied to authenticated user accounts.
                  </p>
                </div>

                {/* Contribution Action Triggers */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveContribModal('REVIEW')}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Star size={13} /> Write a Review
                  </button>
                  <button
                    onClick={() => setActiveContribModal('EDIT')}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Edit3 size={13} /> Suggest Edit
                  </button>
                  <button
                    onClick={() => setActiveContribModal('REPORT')}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Flag size={13} /> Report
                  </button>
                </div>
              </div>

              {/* Reviews List or Honest Zero State */}
              {reviews.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    No Conflux reviews yet.
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Conflux never fabricates artificial 5-star ratings. Have you visited or transacted with {business.name}? Share your genuine experience.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveContribModal('REVIEW')}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Be the First to Review &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{rev.userDisplayName}</span>
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            Authenticated User
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        &ldquo;{rev.reviewText}&rdquo;
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Submitted: {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DIRECT INQUIRY / LEAD FORM */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-orbitron text-slate-900">
                  Direct Inbound Inquiry
                </h3>
                <p className="text-xs text-slate-500">
                  Send a verified inquiry directly to {business.name}.
                </p>
              </div>

              {leadSuccessMessage ? (
                <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600" /> Inquiry Dispatched Successfully
                  </div>
                  <p className="text-xs leading-relaxed">{leadSuccessMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Your Full Name *</label>
                      <input
                        type="text"
                        value={leadName}
                        onChange={e => setLeadName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Email Address *</label>
                      <input
                        type="email"
                        value={leadEmail}
                        onChange={e => setLeadEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        value={leadPhone}
                        onChange={e => setLeadPhone(e.target.value)}
                        placeholder="+91 98300 XXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Service Required</label>
                      <input
                        type="text"
                        value={leadService}
                        onChange={e => setLeadService(e.target.value)}
                        placeholder="e.g. Appointment, Booking, Quote"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Message / Inquiries</label>
                    <textarea
                      rows={3}
                      value={leadMessage}
                      onChange={e => setLeadMessage(e.target.value)}
                      placeholder="Specify requirements, timelines, or questions..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingLead ? 'Routing Inbound Lead...' : 'Send Inquiry'} <Send size={14} />
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Right Sidebar (1 Col): Location & Operating Hours */}
          <div className="space-y-8">
            
            {/* Location & Directions Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold font-orbitron text-slate-900">
                <MapPin size={18} className="text-blue-600" /> Location &amp; Landmark
              </div>

              <div className="text-sm font-medium text-slate-800 leading-relaxed">
                {business.location.fullAddress}
              </div>

              {business.landmark && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">Landmark:</span> {business.landmark}
                </div>
              )}

              <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100 font-mono">
                <div>City: <span className="capitalize text-slate-800">{business.location.city}</span></div>
                <div>District: <span className="capitalize text-slate-800">{business.location.district}</span></div>
                <div>State: West Bengal, India</div>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(business.location.fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleActionClick('DIRECTIONS_CLICK')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass size={14} /> Get Driving Directions <ExternalLink size={12} />
              </a>
            </div>

            {/* Operating Hours Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold font-orbitron text-slate-900">
                  <Clock size={18} className="text-blue-600" /> Operating Hours
                </div>
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                  isOpenNow ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isOpenNow ? 'OPEN' : 'CLOSED'}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, idx) => {
                  const dayRecord = business.operatingHours.find(h => h.dayOfWeek === idx);
                  const isClosed = !dayRecord || dayRecord.isClosed || !dayRecord.opensAt;

                  return (
                    <div key={dayName} className="py-2 flex items-center justify-between">
                      <span className="font-medium text-slate-600">{dayName}</span>
                      <span className={`font-mono font-bold ${isClosed ? 'text-slate-400' : 'text-slate-900'}`}>
                        {isClosed ? 'Closed' : `${dayRecord.opensAt} - ${dayRecord.closesAt}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── USER CONTRIBUTION MODAL ──────────────────────────────── */}
      {activeContribModal && (
        <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="text-base font-bold font-orbitron text-slate-900">
                {activeContribModal === 'REVIEW' && 'Write a Customer Review'}
                {activeContribModal === 'EDIT' && 'Suggest a Correction / Edit'}
                {activeContribModal === 'REPORT' && 'Report Inaccurate Information'}
              </div>
              <button
                onClick={() => {
                  setActiveContribModal(null);
                  setContribStatusMessage(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {contribStatusMessage ? (
              <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{contribStatusMessage}</span>
              </div>
            ) : !isAuthenticated ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div className="text-sm font-bold text-slate-900">Account Required for Contributions</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To prevent abuse, review-bombing, and spam, you must be signed in to submit reviews, corrections, or reports. Browsing Conflux remains 100% anonymous and free.
                </p>
                <Link
                  to="/login"
                  className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Sign In or Create Account &rarr;
                </Link>
              </div>
            ) : activeContribModal === 'REVIEW' ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Rating (1 to 5 Stars)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setContribRating(star)}
                        className={`p-1.5 rounded-lg text-lg cursor-pointer ${
                          star <= contribRating ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-slate-600 ml-2">
                      {contribRating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Your Experience Review *</label>
                  <textarea
                    rows={4}
                    value={contribReviewText}
                    onChange={e => setContribReviewText(e.target.value)}
                    placeholder="Describe your genuine experience with services, facilities, punctuality, or customer service..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveContribModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            ) : activeContribModal === 'EDIT' ? (
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Field to Correct</label>
                  <select
                    value={contribEditField}
                    onChange={e => setContribEditField(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  >
                    <option value="services">Services / Capabilities</option>
                    <option value="operatingHours">Operating Hours</option>
                    <option value="contactPhone">Phone Number</option>
                    <option value="address">Physical Address</option>
                    <option value="landmark">Landmark</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Correct Value *</label>
                  <input
                    type="text"
                    value={contribEditValue}
                    onChange={e => setContribEditValue(e.target.value)}
                    placeholder="e.g. Added new USG facility or Open until 10 PM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Rationale / How do you know? *</label>
                  <textarea
                    rows={3}
                    value={contribEditRationale}
                    onChange={e => setContribEditRationale(e.target.value)}
                    placeholder="e.g. Visited clinic yesterday and saw updated signboard..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveContribModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Submit Correction
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Type of Inaccuracy</label>
                  <select
                    value={contribReportIssue}
                    onChange={e => setContribReportIssue(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  >
                    <option value="OUTDATED_HOURS">Outdated Hours / Schedule</option>
                    <option value="CLOSED_PERMANENTLY">Permanently Closed</option>
                    <option value="WRONG_LOCATION">Incorrect Address / Location</option>
                    <option value="WRONG_PHONE">Invalid Phone Number</option>
                    <option value="UNAUTHORIZED_LISTING">Unauthorized Listing</option>
                    <option value="OTHER">Other Inaccuracy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Specific Details *</label>
                  <textarea
                    rows={3}
                    value={contribReportDetails}
                    onChange={e => setContribReportDetails(e.target.value)}
                    placeholder="Please explain what is inaccurate so administrators can corroborate and fix..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveContribModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Claim Business Modal */}
      <ClaimBusinessModal
        business={business}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onClaimSuccess={() => {
          setBusiness({
            ...business,
            claimStatus: 'CLAIM_PENDING'
          });
        }}
      />
    </div>
  );
};
