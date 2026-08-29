// Conflux Platform — Authoritative Public Business Profile (Entity Trust Dossier & Decision Interface)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2, ShieldCheck, ShieldAlert, CheckCircle2, Phone, MessageSquare,
  MapPin, Globe, Calendar, Clock, ExternalLink, ArrowRight, Send, Compass,
  Layers, Check, AlertCircle, FileText, Lock, Sparkles, UserCheck
} from 'lucide-react';
import { businessService } from '../../lib/businessService';
import { connectService } from '../../lib/connectService';
import { ClaimBusinessModal } from './ClaimBusinessModal';
import type { ConfluxBusiness } from '../../types/business';

export const PublicBusinessProfile: React.FC = () => {
  const { district, city, slug } = useParams<{ district: string; city: string; slug: string }>();
  const [business, setBusiness] = useState<ConfluxBusiness | null>(null);
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

  useEffect(() => {
    const fetchBusiness = async () => {
      setIsLoading(true);
      if (slug) {
        const found = await businessService.getBusinessBySlug(slug);
        if (found) {
          setBusiness(found);
          setIsOpenNow(businessService.isBusinessOpenNow(found.operatingHours));
          document.title = `${found.name} | Verified Business Identity | Conflux`;

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

    fetchBusiness();
  }, [slug]);

  const handleActionClick = (action: 'PHONE_CLICK' | 'WHATSAPP_CLICK' | 'WEBSITE_CLICK' | 'DIRECTIONS_CLICK' | 'BOOKING_CLICK') => {
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
    const res = await connectService.submitLead({
      businessId: business.id,
      businessName: business.name,
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      service: leadService || `Inquiry regarding ${business.name}`,
      message: leadMessage
    });

    setIsSubmittingLead(false);
    if (res.success) {
      setLeadSuccessMessage(`Your inquiry has been directly routed to ${business.name} management.`);
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
      setLeadService('');
      setLeadMessage('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-sm font-mono">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Resolving Business Entity from Business Graph...
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold font-orbitron text-slate-900">Entity Not Found</h2>
          <p className="text-xs text-slate-600">
            The requested business entity is either unlisted or undergoing verification review.
          </p>
          <Link
            to="/discover"
            className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            Explore Verified Businesses <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = business.verificationStatus === 'SUPPORTED';
  const isClaimedByOwner = business.claimStatus === 'VERIFIED_OWNER';
  const isClaimPending = business.claimStatus === 'CLAIM_PENDING';

  // Schema.org LocalBusiness JSON-LD structure
  const schemaOrgJson = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    legalName: business.legalName || business.name,
    identifier: business.confluxBusinessId,
    description: business.description,
    url: business.contact.websiteUrl || `https://confluxai.in/business/india/west-bengal/${business.location.district}/${business.location.city}/${business.slug}`,
    telephone: business.contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.location.fullAddress,
      addressLocality: business.location.city,
      addressRegion: 'West Bengal',
      addressCountry: 'IN'
    },
    geo: business.location.latitude && business.location.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: business.location.latitude,
      longitude: business.location.longitude
    } : undefined
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJson) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 overflow-x-auto py-2">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/discover" className="hover:text-blue-600 transition-colors">Discover</Link>
          <span>/</span>
          <Link to={`/locations/${business.location.district}`} className="hover:text-blue-600 transition-colors capitalize">
            {business.location.district}
          </Link>
          <span>/</span>
          <span className="text-slate-800 capitalize">{business.location.city}</span>
          <span>/</span>
          <span className="text-blue-600 truncate max-w-[200px]">{business.name}</span>
        </nav>

        {/* Claim Business Notification Banner for Unclaimed Entities */}
        {!isClaimedByOwner && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <Building2 className="text-amber-700 mt-0.5 sm:mt-0 shrink-0" size={18} />
              <div>
                <span className="font-bold text-amber-900">
                  {isClaimPending ? 'Ownership Claim Pending Review' : 'Publicly Documented Business Entity'}
                </span>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  {isClaimPending
                    ? 'An ownership verification request is currently undergoing statutory audit.'
                    : 'This profile is compiled from official public registries. Are you the authorized owner or manager?'}
                </p>
              </div>
            </div>

            {!isClaimPending && (
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="shrink-0 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Claim This Business &rarr;
              </button>
            )}
          </div>
        )}

        {/* Hero Identity Header Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                ID: {business.confluxBusinessId}
              </span>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl uppercase tracking-wider">
                {business.categoryName || business.categoryId}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-mono ${
                isOpenNow ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                <Clock size={14} /> {isOpenNow ? 'OPEN NOW' : 'CLOSED'}
              </span>
            </div>

            {/* Verification Status Pill */}
            <div>
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold font-mono shadow-md shadow-emerald-500/20">
                  <ShieldCheck size={16} /> CONFLUX VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold font-mono">
                  <AlertCircle size={16} /> {business.verificationStatus}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-orbitron text-slate-900 tracking-tight">
              {business.name}
            </h1>
            {business.legalName && (
              <p className="text-sm font-semibold text-slate-500">
                Statutory Entity: <span className="text-slate-800">{business.legalName}</span>
              </p>
            )}
            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-4xl">
              {business.description}
            </p>
          </div>

          {/* Granular Services & Capabilities Badges */}
          {business.services && business.services.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Key Services &amp; Capabilities
              </div>
              <div className="flex flex-wrap gap-2">
                {business.services.map((svc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-50 text-blue-900 border border-blue-100 text-xs font-bold"
                  >
                    <Check size={13} className="text-blue-600" /> {svc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Connect Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            {business.contact.phone && (
              <a
                href={`tel:${business.contact.phone}`}
                onClick={() => handleActionClick('PHONE_CLICK')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Phone size={16} /> Call Business
              </a>
            )}

            {business.contact.whatsapp && (
              <a
                href={`https://wa.me/${business.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleActionClick('WHATSAPP_CLICK')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <MessageSquare size={16} /> WhatsApp Inquiry
              </a>
            )}

            {business.contact.websiteUrl && (
              <a
                href={business.contact.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleActionClick('WEBSITE_CLICK')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all cursor-pointer"
              >
                <Globe size={16} /> Official Website <ExternalLink size={14} />
              </a>
            )}

            {business.contact.bookingUrl && (
              <a
                href={business.contact.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleActionClick('BOOKING_CLICK')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <Calendar size={16} /> Book Service / Order
              </a>
            )}
          </div>
        </div>

        {/* Two-Column Grid: Trust Dossier & Location/Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Column (2 Cols): Verification Dossier & Inquiry */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* CONFLUX VERIFIED TRUST DOSSIER */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg font-orbitron">
                  <ShieldCheck size={22} className="text-emerald-600" /> Why Trust This Business?
                </div>
                <Link
                  to="/verify/methodology"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Verification Standards &rarr;
                </Link>
              </div>

              {/* What is Verified Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Statutory Legal Identity</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Physical Location &amp; Landmark</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Primary Registrar License</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Direct Communication Channels</span>
                </div>
              </div>

              {/* Primary Registrar Grounding */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Primary Statutory Evidence:
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {business.primaryRegistrar || 'Statutory Master Docket'}
                </div>
                {business.evidenceSummary && (
                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    &ldquo;{business.evidenceSummary}&rdquo;
                  </p>
                )}
                {business.lastVerifiedAt && (
                  <div className="text-[11px] text-slate-500 pt-1 font-mono">
                    Audit Timestamp: {new Date(business.lastVerifiedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Strict Zero Fake Reviews Guarantee */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Lock size={13} /> Conflux Evidence Grounding Moat:
                </div>
                <p className="leading-relaxed">
                  Conflux does not fabricate review stars, synthetic ratings, or artificial popularity metrics. All trust classifications are deterministically verified against government gazettes and statutory licensing dockets.
                </p>
              </div>
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
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Service or Product Requirement</label>
                      <input
                        type="text"
                        value={leadService}
                        onChange={e => setLeadService(e.target.value)}
                        placeholder="e.g. USG Scan Appointment, Bulk Procurement"
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
