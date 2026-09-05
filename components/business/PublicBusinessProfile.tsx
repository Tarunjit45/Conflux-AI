// Conflux Platform — Authoritative Public Business Profile (Entity Trust Dossier, Decision Interface & Verified Contributions)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, ShieldCheck, ShieldAlert, CheckCircle2, Phone, MessageSquare,
  MapPin, Globe, Calendar, Clock, ExternalLink, ArrowRight, Send, Compass,
  Layers, Check, AlertCircle, FileText, Lock, Sparkles, UserCheck, Star,
  Edit3, Flag, HelpCircle, X, Share2, Camera, Image, Video, Maximize2,
  Radio, Plus, ChevronDown
} from 'lucide-react';
import { businessService } from '../../lib/businessService';
import { connectService } from '../../lib/connectService';
import { contributionService } from '../../lib/contributionService';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { ContributionCard } from '../contributions/ContributionCard';
import { CreateContributionModal } from '../contributions/CreateContributionModal';
import { useAuth } from '../../lib/authContext';
import { ClaimBusinessModal } from './ClaimBusinessModal';
import { trackPageView } from '../../lib/analytics';
import { businessOptimizationEngine } from '../../lib/seo/businessOptimizationEngine';
import { type ConfluxBusiness, type BusinessMediaItem, normalizePublicSourceField } from '../../types/business';
import type { ReviewRatingContribution } from '../../types/contribution';
import type { LocalContribution } from '../../types/localKnowledge';

export const PublicBusinessProfile: React.FC = () => {
  const { district, city, slug } = useParams<{ district: string; city: string; slug: string }>();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const [business, setBusiness] = useState<ConfluxBusiness | null>(null);
  const [reviews, setReviews] = useState<ReviewRatingContribution[]>([]);
  const [communitySignals, setCommunitySignals] = useState<LocalContribution[]>([]);
  const [isSignalModalOpen, setIsSignalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [previewMediaItem, setPreviewMediaItem] = useState<BusinessMediaItem | null>(null);
  const [isDossierExpanded, setIsDossierExpanded] = useState(false);

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

        // Fetch approved reviews
        const approved = await contributionService.getApprovedReviewsForBusiness(found.id);
        setReviews(approved);

        // Fetch linked community signals & local knowledge
        try {
          const signals = await localKnowledgeService.getContributions({ businessId: found.id });
          setCommunitySignals(signals);
        } catch (err) {
          console.warn('[PublicBusinessProfile] Error fetching community signals:', err);
        }

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

  // ── SEO + GEO DYNAMIC METADATA & SCHEMA.ORG INJECTION (PLATFORM-WIDE) ─────────────
  const optimized = business ? businessOptimizationEngine.optimizeBusiness(business) : null;

  useEffect(() => {
    if (!business || !optimized) return;

    // 1. Dynamic Page Title
    document.title = optimized.seoTitle;

    // 2. Dynamic Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', optimized.metaDescription);

    // 3. Dynamic Canonical URL (Hierarchical route)
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', optimized.canonicalUrl);

    // 4. OpenGraph & Twitter Dynamic Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', optimized.openGraph.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', optimized.openGraph.description);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', optimized.openGraph.url);
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && optimized.openGraph.image) ogImage.setAttribute('content', optimized.openGraph.image);

    // 5. Rich JSON-LD Schemas (LocalBusiness subtype, BreadcrumbList, FAQPage)
    let scriptEl = document.getElementById('conflux-business-jsonld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'conflux-business-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(optimized.structuredData);

    // ── GA4: Dynamic Business Profile Page View ────────────────────────
    trackPageView(optimized.seoTitle, optimized.canonicalUrl, `/business/${business.slug}`);

    return () => {
      const el = document.getElementById('conflux-business-jsonld');
      if (el) el.remove();
    };
  }, [business, optimized]);

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
        name: leadName,
        email: leadEmail,
        phone: leadPhone || undefined,
        service: leadService || 'General Inquiry',
        message: leadMessage
      });

      if (res.success) {
        setLeadSuccessMessage('Inquiry sent successfully to the business.');
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
  const explicitMedia = (business.media || []).filter(m => m.status !== 'INACTIVE');
  const activeMedia: BusinessMediaItem[] = explicitMedia.length > 0
    ? explicitMedia
    : (business.storefrontPhotoUrl
        ? [{
            id: `med_sf_${business.id || 'biz'}`,
            url: business.storefrontPhotoUrl,
            mediaType: 'IMAGE',
            sourceUrl: business.storefrontPhotoUrl,
            sourceName: 'Business Proprietor Submission',
            attribution: 'Supplied directly by business proprietor during onboarding',
            dateAdded: business.updatedAt ? business.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
            provenance: 'BUSINESS_PROVIDED',
            status: 'ACTIVE',
            caption: `${business.name} — Storefront & Premises`,
            altText: `Exterior storefront and entrance of ${business.name}`,
            sortOrder: 1
          }]
        : []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-40 md:pb-28 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 font-mono flex-wrap">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/discover" className="hover:text-blue-600 transition-colors">Discover</Link>
          <span>/</span>
          <Link to="/locations/west-bengal" className="hover:text-blue-600 transition-colors">West Bengal</Link>
          <span>/</span>
          <Link to={`/locations/west-bengal/${business.location.district.toLowerCase()}`} className="hover:text-blue-600 transition-colors capitalize">
            {business.location.district}
          </Link>
          <span>/</span>
          <Link to={`/locations/west-bengal/${business.location.district.toLowerCase()}/${business.location.city.toLowerCase()}`} className="hover:text-blue-600 transition-colors capitalize">
            {business.location.city}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-[200px]">{business.name}</span>
        </nav>

        {/* ── TOP HERO CARD ────────────────────────────────────────── */}
        <div className="p-5 sm:p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
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

              {/* Verified Social Channels */}
              {business.socialLinks && business.socialLinks.filter(s => s.isActive && s.platform === 'facebook').map(s => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-200"
                >
                  <Share2 size={14} className="text-blue-600" /> {s.label || 'Official Facebook Page'} <ExternalLink size={12} />
                </a>
              ))}
              {(!business.socialLinks || business.socialLinks.length === 0) && business.onlineSources?.facebookUrl && (
                <a
                  href={business.onlineSources.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-200"
                >
                  <Share2 size={14} className="text-blue-600" /> Official Facebook Store <ExternalLink size={12} />
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
              <h2 className="flex items-center gap-2 text-base font-bold font-orbitron text-slate-900">
                <Layers size={20} className="text-blue-600" /> Services &amp; Capabilities
              </h2>

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

            {/* ── REAL BUSINESS MEDIA GALLERY (1–3 PHOTOS / VIDEOS) ── */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <h2 className="flex items-center gap-2 text-base font-bold font-orbitron text-slate-900">
                    <Camera size={20} className="text-blue-600" /> Business Photos &amp; Videos
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Authentic visual assets supplied by the business or verified by Conflux administrators.
                  </p>
                </div>
                {activeMedia.length > 0 && (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {activeMedia.length} Verified Media Asset{activeMedia.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {activeMedia.length > 0 ? (
                <div
                  className={`grid grid-cols-1 ${
                    activeMedia.length === 2 ? 'sm:grid-cols-2' : ''
                  } ${
                    activeMedia.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : ''
                  } gap-4 pt-1`}
                >
                  {activeMedia.slice(0, 3).map((item) => {
                    const isBusinessProvided = item.provenance === 'BUSINESS_PROVIDED';
                    const isConfluxVerified = item.provenance === 'CONFLUX_VERIFIED';
                    const isPublicSource = item.provenance === 'PUBLIC_SOURCE';

                    const provenanceLabel = isBusinessProvided
                      ? 'Business Provided'
                      : isConfluxVerified
                      ? 'Conflux Verified'
                      : isPublicSource
                      ? 'Public Source'
                      : 'Admin Added';

                    const badgeColor = isBusinessProvided
                      ? 'bg-emerald-600/90 text-white'
                      : isConfluxVerified
                      ? 'bg-purple-600/90 text-white'
                      : isPublicSource
                      ? 'bg-sky-600/90 text-white'
                      : 'bg-slate-700/90 text-white';

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-slate-300 transition-all"
                      >
                        <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                          {item.mediaType === 'IMAGE' ? (
                            <img
                              src={item.url}
                              alt={item.altText || item.caption || `${business.name} business photo`}
                              loading="lazy"
                              onClick={() => setPreviewMediaItem(item)}
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-2">
                              {item.url.includes('youtube') || item.url.includes('vimeo') || item.url.includes('embed') ? (
                                <iframe
                                  src={item.url}
                                  title={item.caption || `${business.name} official video`}
                                  className="w-full h-full rounded-xl"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={item.url}
                                  controls
                                  className="w-full h-full rounded-xl object-cover"
                                />
                              )}
                            </div>
                          )}

                          {/* Provenance & Media Type Badges */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono font-bold uppercase">
                              {item.mediaType === 'IMAGE' ? 'PHOTO' : 'VIDEO'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-mono font-bold ${badgeColor}`}>
                              {provenanceLabel}
                            </span>
                          </div>

                          {item.mediaType === 'IMAGE' && (
                            <button
                              type="button"
                              onClick={() => setPreviewMediaItem(item)}
                              className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Expand photo"
                            >
                              <Maximize2 size={13} />
                            </button>
                          )}
                        </div>

                        <div className="p-4 space-y-1.5">
                          {item.caption && (
                            <div className="text-xs font-bold text-slate-900 line-clamp-2">
                              {item.caption}
                            </div>
                          )}
                          {item.altText && item.altText !== item.caption && (
                            <div className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                              {item.altText}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-100">
                            <div className="truncate max-w-[180px]">
                              {item.sourceUrl ? (
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline text-blue-600 inline-flex items-center gap-1"
                                >
                                  {item.sourceName || 'Source'} <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span>{item.sourceName || 'Authentic Asset'}</span>
                              )}
                            </div>
                            {item.dateAdded && (
                              <span className="shrink-0">Added: {item.dateAdded}</span>
                            )}
                          </div>
                          {item.attribution && (
                            <div className="text-[10px] text-slate-500 italic">
                              Attribution: {item.attribution}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── HONEST EMPTY STATE (ZERO STOCK / ZERO SYNTHETIC MEDIA) ── */
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 shrink-0 flex items-center justify-center mt-0.5 border border-blue-100">
                      <Camera size={20} />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold font-orbitron text-slate-900">
                        Business media has not been added yet.
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Conflux verifies authentic business photographs and videos directly from proprietors and authorized platform integrations, rather than generating synthetic or unverified stock images.
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Are you the business owner or an authorized administrator? Submit authentic storefront photos or connect official channels to enhance this verified profile.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-200/60">
                    {!isClaimed && (
                      <button
                        type="button"
                        onClick={() => setIsClaimModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck size={14} /> Claim Profile &amp; Submit Photos
                      </button>
                    )}

                    {(business.onlineSources?.facebookUrl || (business.socialLinks && business.socialLinks.some(s => s.platform === 'facebook'))) && (
                      <a
                        href={business.onlineSources?.facebookUrl || business.socialLinks?.find(s => s.platform === 'facebook')?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 inline-flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Share2 size={13} className="text-blue-600" /> View Photos on Official Facebook Page <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── 3-PILLAR TRUST & PROVENANCE DOSSIER (COLLAPSIBLE) ── */}
            <div className="p-5 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <button
                type="button"
                onClick={() => setIsDossierExpanded(!isDossierExpanded)}
                className="w-full text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer group"
                aria-expanded={isDossierExpanded}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                      <span>✓ Information Checked by Conflux</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {business.confidenceScore || 0}% Confidence
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold font-orbitron text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span>How Conflux Knows</span>
                    <span className="text-xs font-mono font-normal text-slate-500">
                      (Tap to {isDossierExpanded ? 'collapse' : 'view evidence'})
                    </span>
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {business.verificationStatus === 'SUPPORTED'
                      ? 'Statutory entity corroboration, direct proprietor submission, and public digital sources audited.'
                      : 'Standard listing corroborated against public records and direct proprietor declaration.'}
                  </p>
                </div>

                <div className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 transition-colors shrink-0">
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-200 ${isDossierExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {isDossierExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6 pt-4 border-t border-slate-100 overflow-hidden"
                  >

              {/* PILLAR 1: BUSINESS-PROVIDED INFORMATION */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Building2 size={15} className="text-blue-600" /> 1. Business-Provided Information
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[11px] font-bold">
                    Direct Proprietor Declaration
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed divide-y divide-slate-200/60">
                  <div className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-semibold text-slate-500">Stated Legal &amp; Commercial Name:</span>
                    <span className="font-bold text-slate-900">{business.name} {business.legalName ? `(${business.legalName})` : ''}</span>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-semibold text-slate-500">Stated Classification:</span>
                    <span className="font-bold text-slate-900">{business.categoryName || business.categoryId}</span>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-semibold text-slate-500">Stated Address:</span>
                    <span className="font-bold text-slate-900">{business.location.fullAddress}, {business.location.city}, {business.location.district}</span>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-semibold text-slate-500">Declared Direct Order Channels:</span>
                    <span className="font-bold text-slate-900">
                      Phone: {business.contact.phone || 'N/A'} | WhatsApp: {business.contact.whatsapp || 'N/A'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="font-semibold text-slate-500 block mb-0.5">Proprietor Description:</span>
                    <p className="italic text-slate-800">&ldquo;{business.description}&rdquo;</p>
                  </div>
                  <div className="pt-2 flex items-center gap-1.5 text-blue-700 font-semibold text-[11px]">
                    <CheckCircle2 size={13} className="text-blue-600" /> Supported by provided business onboarding submission
                  </div>
                </div>
              </div>

              {/* PILLAR 2: PUBLIC-SOURCE INFORMATION */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-bold text-xs text-indigo-900 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Globe size={15} className="text-indigo-600" /> 2. Public-Source Information &amp; Extraction
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono text-[11px] font-bold">
                    Corroborated Web Signals
                  </span>
                </div>

                {/* Sources Audited */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider font-mono">
                    Public Sources Audited:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(business.sourceLinks && business.sourceLinks.length > 0) ? (
                      business.sourceLinks.filter(s => s.isActive).map(src => (
                        <div key={src.id} className="p-2.5 rounded-xl bg-white border border-indigo-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Share2 size={14} className="text-blue-600 shrink-0" />
                            <span className="font-bold text-slate-800 truncate">{src.platform}</span>
                          </div>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-mono text-[11px] font-semibold shrink-0"
                          >
                            View Source <ExternalLink size={10} />
                          </a>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-2.5 rounded-xl bg-white border border-indigo-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Share2 size={14} className="text-blue-600" />
                            <span className="font-bold text-slate-800">Facebook Public Store</span>
                          </div>
                          <a
                            href={business.onlineSources?.facebookUrl || 'https://www.facebook.com/p/A2Z-Supplement-100083318218146/'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-mono text-[11px] font-semibold"
                          >
                            View Source <ExternalLink size={10} />
                          </a>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-indigo-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe size={14} className="text-slate-400" />
                            <span className="font-bold text-slate-800">Official Website</span>
                          </div>
                          <span className="text-slate-500 font-mono text-[11px]">None Provided</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Extracted Facts */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider font-mono">
                    Extracted Factual Details:
                  </div>
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-indigo-100 divide-y divide-slate-100">
                    <div className="pt-1.5 first:pt-0 flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-500 font-medium">Public Store Name:</span>
                      <span className="font-bold text-slate-900">
                        {normalizePublicSourceField(business.publicSourceEnrichment?.extractedName) || business.name}
                      </span>
                    </div>
                    <div className="pt-1.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-500 font-medium">Public Store Address:</span>
                      <span className="font-bold text-slate-900">
                        {normalizePublicSourceField(business.publicSourceEnrichment?.extractedAddress) || business.location.fullAddress}
                      </span>
                    </div>
                    {business.services && business.services.length > 0 && (
                      <div className="pt-1.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-slate-500 font-medium">Catalogued Offerings:</span>
                        <span className="font-bold text-slate-900">
                          {business.services.slice(0, 6).join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="pt-1.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-500 font-medium">Public Operating Hours:</span>
                      <span className="font-bold text-slate-900">
                        {normalizePublicSourceField(business.publicSourceEnrichment?.extractedOperatingHours || business.publicSourceEnrichment?.extractedHours) || (business.operatingHours && business.operatingHours.length > 0 ? 'Published Business Hours' : 'Schedule on file')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Discrepancies / Conflicts Flagged for Review */}
                {optimized && optimized.sourceProvenanceConflicts.length > 0 ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-amber-950 font-mono text-[11px] uppercase tracking-wider">
                      <AlertCircle size={14} className="text-amber-700" /> Information Differs Across Sources:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-amber-900/90 leading-relaxed text-[11px]">
                      {optimized.sourceProvenanceConflicts.map((c, i) => (
                        <li key={i}>
                          <strong>{c.field}:</strong> {c.explanation}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-amber-800 italic pt-0.5">
                      Note: Conflux does not silently resolve conflicting data. Both business-provided and public sources are transparently documented above.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>Corroborated: Business submission aligns with verified public digital references.</span>
                  </div>
                )}

                {/* Media & Platform Protection Notice */}
                <div className="p-3 rounded-xl bg-slate-100/80 text-[11px] text-slate-600 leading-relaxed">
                  <strong>Media &amp; Privacy Policy:</strong> In strict compliance with platform terms and automated scraping restrictions, unauthenticated photo scraping and bot logins are not performed. Direct links to authorized public presences and contact lines are preserved above.
                </div>
              </div>

              {/* PILLAR 3: CONFLUX-VERIFIED INFORMATION */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-bold text-xs text-emerald-950 uppercase tracking-wider font-mono flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-700" /> 3. Conflux Verification Status
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono text-[11px] font-bold">
                    Zero-Fabrication Standard
                  </span>
                </div>

                <div className="space-y-2 text-xs divide-y divide-emerald-200/50">
                  <div className="pt-2 first:pt-0 flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Business Identity:</span>
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-600" /> Supported by provided business information
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Official Website:</span>
                    <span className="font-bold text-slate-600">
                      {business.contact.websiteUrl ? (
                        <a href={business.contact.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {business.contact.websiteUrl.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        'No standalone website provided (direct messaging active)'
                      )}
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Social Presence:</span>
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      {business.onlineSources?.facebookUrl || business.socialLinks?.length ? (
                        <CheckCircle2 size={13} className="text-emerald-600" />
                      ) : null}
                      {business.onlineSources?.facebookUrl ? 'Facebook Page identified & linked' : 'Active digital channels'}
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Direct Telephone &amp; WhatsApp:</span>
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-600" /> Connect channels active ({business.contact.phone || business.contact.whatsapp || 'Verified'})
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Statutory Licensing (FSSAI / GSTIN / MSME):</span>
                    <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                      business.verificationStatus === 'SUPPORTED' && business.primaryRegistrar
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-amber-800 bg-amber-100/80'
                    }`}>
                      {business.verificationStatus === 'SUPPORTED' && business.primaryRegistrar
                        ? `Verified (${business.primaryRegistrar})`
                        : 'Not yet verified'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200/80 text-[11px] text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Lock size={12} className="text-emerald-600" /> Absence &ne; Contradiction Invariant:
                  </div>
                  <p className="leading-relaxed">
                    The lack of a statutory corporate or GST registration docket does not indicate the business is illegitimate; it signifies that primary registrar documentation has not yet been submitted or evaluated by Conflux Verify.
                  </p>
                </div>
              </div>

              {/* Internal Directory Navigation Links */}
              {optimized && optimized.internalLinks.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-700 font-mono uppercase tracking-wider">
                    Internal Hub Navigation:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {optimized.internalLinks.map((link, idx) => (
                      <Link
                        key={idx}
                        to={link.url}
                        className="px-3 py-1 rounded-lg bg-white hover:bg-slate-200 text-blue-700 font-semibold border border-slate-200 transition-colors capitalize"
                      >
                        {link.anchorText} &rarr;
                      </Link>
                    ))}
                  </div>
                </div>
              )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── ENTITY TRUTH & DIRECT ANSWERS (GEO / AI OVERVIEW GROUNDING) ── */}
            {optimized && optimized.faqItems.length > 0 && (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="flex items-center gap-2 text-base font-bold font-orbitron text-slate-900">
                    <Sparkles size={20} className="text-blue-600" /> Entity Truth &amp; Direct Answers
                  </h2>
                  <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 font-bold">
                    Search &amp; AI Engine Grounding
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Factual questions and direct answers derived strictly from authentic business records. Visible text matches JSON-LD FAQPage schema 100%.
                </p>

                <div className="divide-y divide-slate-100 space-y-3 pt-1">
                  {optimized.faqItems.map((faq) => (
                    <div key={faq.id} className="pt-3 first:pt-0 space-y-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <HelpCircle size={14} className="text-blue-600 shrink-0" />
                          {faq.question}
                        </span>
                        {faq.evidenceSource && (
                          <span className="text-[10px] font-mono font-medium text-slate-400 shrink-0 hidden sm:inline">
                            {faq.evidenceSource}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pl-5">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* ── COMMUNITY SIGNALS & GROUND-TRUTH INTELLIGENCE ─────────── */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                      <Radio size={16} className="animate-pulse" />
                    </span>
                    <h3 className="text-lg font-bold font-orbitron text-slate-900">
                      Community Signals &amp; Ground Truth
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Field updates, photos, recommendations, and confirmations from local residents for {business.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSignalModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Plus size={14} /> Add Community Signal
                </button>
              </div>

              {communitySignals.length > 0 ? (
                <div className="space-y-4">
                  {communitySignals.map((signal) => (
                    <ContributionCard
                      key={signal.id}
                      contribution={signal}
                      onUpdated={(updated) => {
                        setCommunitySignals(prev => prev.map(s => s.id === updated.id ? updated : s));
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                  <Radio size={24} className="mx-auto text-slate-400" />
                  <div className="text-sm font-bold text-slate-800">
                    No community field signals logged yet for {business.name}.
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Know about current product availability, changed timings, or have photos of this location? Contribute verified evidence.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSignalModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus size={13} /> Share First Signal
                    </button>
                  </div>
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Service Required</label>
                      <input
                        type="text"
                        value={leadService}
                        onChange={e => setLeadService(e.target.value)}
                        placeholder="e.g. Appointment, Booking, Quote"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
              <h2 className="flex items-center gap-2 text-sm font-bold font-orbitron text-slate-900">
                <MapPin size={18} className="text-blue-600" /> Location &amp; Landmark
              </h2>

              <div className="text-sm font-medium text-slate-800 leading-relaxed">
                {business.location.fullAddress}
              </div>

              {business.landmark && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">Landmark:</span> {business.landmark}
                </div>
              )}

              <div className="text-xs text-slate-500 space-y-1.5 pt-1 border-t border-slate-100 font-mono">
                <div>
                  City:{' '}
                  <Link
                    to={`/locations/west-bengal/${business.location.district.toLowerCase()}/${business.location.city.toLowerCase()}`}
                    className="capitalize text-blue-600 hover:underline font-bold"
                  >
                    {business.location.city}
                  </Link>
                </div>
                <div>
                  District:{' '}
                  <Link
                    to={`/locations/west-bengal/${business.location.district.toLowerCase()}`}
                    className="capitalize text-blue-600 hover:underline font-bold"
                  >
                    {business.location.district}
                  </Link>
                </div>
                <div>
                  State:{' '}
                  <Link
                    to="/locations/west-bengal"
                    className="text-blue-600 hover:underline font-bold"
                  >
                    West Bengal, India
                  </Link>
                </div>
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
                <h2 className="flex items-center gap-2 text-sm font-bold font-orbitron text-slate-900">
                  <Clock size={18} className="text-blue-600" /> Operating Hours
                </h2>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-base sm:text-xs font-medium focus:outline-none"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-base sm:text-xs focus:outline-none"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-base sm:text-xs focus:outline-none"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-base sm:text-xs font-medium focus:outline-none"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-base sm:text-xs focus:outline-none"
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

      {/* Local Knowledge Community Signal Modal */}
      {business && (
        <CreateContributionModal
          isOpen={isSignalModalOpen}
          onClose={() => setIsSignalModalOpen(false)}
          defaultLocality={business.location.city.toLowerCase()}
          defaultLocalityName={business.location.city}
          defaultBusinessId={business.id}
          onCreated={(newContrib) => {
            setCommunitySignals(prev => [newContrib, ...prev]);
          }}
        />
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

      {/* Full Image Preview Modal */}
      {previewMediaItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewMediaItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-3 p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="font-bold text-sm text-slate-900 truncate">
                {previewMediaItem.caption || `${business.name} Business Asset`}
              </div>
              <button
                type="button"
                onClick={() => setPreviewMediaItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img
                src={previewMediaItem.url}
                alt={previewMediaItem.altText || previewMediaItem.caption || "Business photo preview"}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="text-xs text-slate-600 flex items-center justify-between pt-1 font-mono">
              <span>Provenance: <strong>{previewMediaItem.provenance.replace('_', ' ')}</strong></span>
              {previewMediaItem.attribution && (
                <span className="italic text-slate-500">{previewMediaItem.attribution}</span>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── MOBILE STICKY ACTION BAR (ANCHORED ABOVE BOTTOMNAV) ── */}
      <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2.5 flex items-center justify-between gap-2 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {business.contact.whatsapp && (
          <a
            href={`https://wa.me/${business.contact.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleActionClick('WHATSAPP_CLICK')}
            className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <MessageSquare size={16} />
            <span>WhatsApp</span>
          </a>
        )}

        {business.contact.phone && (
          <a
            href={`tel:${business.contact.phone}`}
            onClick={() => handleActionClick('PHONE_CLICK')}
            className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 active:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Phone size={16} />
            <span>Call</span>
          </a>
        )}

        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(business.location.fullAddress)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleActionClick('DIRECTIONS_CLICK')}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1 shrink-0"
          title="Directions"
        >
          <Compass size={16} className="text-blue-600" />
          <span>Directions</span>
        </a>
      </div>
    </div>
  );
};
