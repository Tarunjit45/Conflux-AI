// Conflux Platform — Streamlined 7-Step Business Onboarding Pipeline (/list-business)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Globe, Share2, FileText, UserCheck, Phone,
  CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, HelpCircle,
  AlertCircle, Check, Clock, Upload, X, MessageSquare, ExternalLink, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessService } from '../../lib/businessService';
import type {
  BusinessSubmissionApplication,
  SubmittedOnlineSources,
  ServiceInterestRequests
} from '../../types/business';
import { WEST_BENGAL_DISTRICTS } from '../../data/locationsData';

export const BusinessSubmissionPage: React.FC = () => {
  // Step tracker: 1 to 7 = Questions, 8 = Review, 9 = Success
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [submissionResult, setSubmissionResult] = useState<{
    applicationId: string;
    confluxBusinessId?: string;
    businessName: string;
  } | null>(null);

  // ── STEP 1: BUSINESS NAME ──────────────────────────────────────────
  const [businessName, setBusinessName] = useState('');
  const [category, setCategoryId] = useState('healthcare');

  // ── STEP 2: LOCATION ───────────────────────────────────────────────
  const [district, setDistrict] = useState('nadia');
  const [city, setCity] = useState('ranaghat');
  const [fullAddress, setFullAddress] = useState('');

  // ── STEP 3: WEBSITE ────────────────────────────────────────────────
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [needWebsiteHelp, setNeedWebsiteHelp] = useState(false);

  // ── STEP 4: ONLINE SOURCES ─────────────────────────────────────────
  const [hasOnlineSources, setHasOnlineSources] = useState<boolean | null>(null);
  const [onlineSources, setOnlineSources] = useState<SubmittedOnlineSources>({
    googleBusinessUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    justdialUrl: '',
    indiamartUrl: '',
    otherUrl: ''
  });
  const [needGoogleHelp, setNeedGoogleHelp] = useState(false);
  const [needSocialHelp, setNeedSocialHelp] = useState(false);
  const [needOnlinePresenceHelp, setNeedOnlinePresenceHelp] = useState(false);

  // ── STEP 5: DESCRIPTION ────────────────────────────────────────────
  const [description, setDescription] = useState('');

  // ── STEP 6: REPRESENTATIVE ─────────────────────────────────────────
  const [ownerName, setOwnerName] = useState('');
  const [ownerRole, setOwnerRole] = useState('Owner');
  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState('');
  const [ownerPhotoFileName, setOwnerPhotoFileName] = useState('');

  // ── STEP 7: CONTACT METHODS ────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [needWhatsAppHelp, setNeedWhatsAppHelp] = useState(false);
  const [needBookingHelp, setNeedBookingHelp] = useState(false);

  // Validation per step
  const handleNextStep = () => {
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!businessName || businessName.trim().length < 2) {
        setErrorMessage('Please enter your business name (minimum 2 characters).');
        return;
      }
    } else if (currentStep === 2) {
      if (!city || city.trim().length < 2) {
        setErrorMessage('Please enter your city, municipality, or town.');
        return;
      }
      if (!fullAddress || fullAddress.trim().length < 3) {
        setErrorMessage('Please enter your area, market, or physical address.');
        return;
      }
    } else if (currentStep === 3) {
      if (hasWebsite === null) {
        setErrorMessage('Please indicate whether you have a business website.');
        return;
      }
      if (hasWebsite && (!websiteUrl || websiteUrl.trim().length < 4)) {
        setErrorMessage('Please enter a valid website URL or select "I don\'t have a website".');
        return;
      }
    } else if (currentStep === 4) {
      if (hasOnlineSources === null) {
        setErrorMessage('Please specify your online sources or select "I don\'t have these".');
        return;
      }
    } else if (currentStep === 5) {
      if (!description || description.trim().length < 5) {
        setErrorMessage('Please provide a brief description of what your business provides.');
        return;
      }
    } else if (currentStep === 6) {
      if (!ownerName || ownerName.trim().length < 2) {
        setErrorMessage('Please enter the name of the person representing this business.');
        return;
      }
    } else if (currentStep === 7) {
      if (!phone || phone.trim().length < 6) {
        setErrorMessage('Please enter a valid business contact telephone number.');
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Final Submission Handler
  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const serviceInterestRequests: ServiceInterestRequests = {
        needWebsite: needWebsiteHelp,
        needGooglePresence: needGoogleHelp,
        needSocialPresence: needSocialHelp,
        needWhatsAppSystem: needWhatsAppHelp,
        needBookingSystem: needBookingHelp
      };

      const result = await businessService.submitApplication({
        submissionType: 'CONFLUX_VERIFIED',
        businessName: businessName.trim(),
        legalName: businessName.trim(),
        businessType: 'LOCAL_BUSINESS',
        categoryId: category,
        categoryName: category.replace(/-/g, ' ').toUpperCase(),
        description: description.trim(),
        district,
        city: city.trim(),
        fullAddress: fullAddress.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim() || 'contact@confluxai.in',
        websiteUrl: hasWebsite && websiteUrl ? websiteUrl.trim() : undefined,
        hasWebsite: Boolean(hasWebsite),
        bookingUrl: bookingUrl.trim() || undefined,
        ownerName: ownerName.trim(),
        ownerRole: ownerRole.trim(),
        ownerPhone: phone.trim(),
        ownerEmail: email.trim() || 'contact@confluxai.in',
        ownerPhotoUrl: ownerPhotoUrl || undefined,
        onlineSources: hasOnlineSources ? onlineSources : undefined,
        serviceInterestRequests,
        services: [],
        privateEvidence: [],
        declarationConfirmed: true,
        noStockImagesConfirmed: true,
        evidenceStatus: 'PENDING_REVIEW',
        confluxPlan: 'FREE',
        paymentStatus: 'NOT_APPLICABLE'
      });

      setSubmissionResult({
        applicationId: result.id,
        confluxBusinessId: result.confluxBusinessId,
        businessName: result.businessName
      });
      setCurrentStep(9); // Success screen
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-inter text-slate-900 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Step Indicator Header (Only shown during steps 1 to 7) */}
        {currentStep <= 7 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              <span>Step {currentStep} of 7</span>
              <span>{Math.round((currentStep / 7) * 100)}% Complete</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── STEP 1: BUSINESS NAME ─────────────────────────────── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
                    Business Identity
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-950 tracking-tight">
                    What's your business name?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Enter the name your customers know your business by.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. Ranaghat Diagnostic Centre"
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Industry Category
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    >
                      <option value="healthcare">Healthcare &amp; Diagnostics</option>
                      <option value="food-hospitality">Restaurants, Cafes &amp; Dining</option>
                      <option value="retail-trade">Retail Showrooms &amp; Shops</option>
                      <option value="manufacturing-industrial">Manufacturing, Fabrication &amp; Engineering</option>
                      <option value="services-repairs">Home Repairs, AC &amp; Electricals</option>
                      <option value="tourism-hospitality">Hotels, Resorts &amp; Homestays</option>
                      <option value="salons-beauty">Salons, Spa &amp; Personal Care</option>
                      <option value="handloom-textiles">Handloom, Sarees &amp; Textiles</option>
                      <option value="agriculture-farming">Agro-Processing &amp; Trade</option>
                      <option value="professional-services">Legal, Tax &amp; Consulting</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: LOCATION ──────────────────────────────────── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
                    Location
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-950 tracking-tight">
                    Where is your business located?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    We only collect the minimum useful location information to help local customers find you.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        District *
                      </label>
                      <select
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                      >
                        {WEST_BENGAL_DISTRICTS.map(d => (
                          <option key={d.slug} value={d.slug}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        City / Town / Municipality *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Ranaghat or Krishnanagar"
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Address / Area / Landmark *
                    </label>
                    <input
                      type="text"
                      value={fullAddress}
                      onChange={e => setFullAddress(e.target.value)}
                      placeholder="e.g. Court Para, Near Old Bus Stand"
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: WEBSITE ───────────────────────────────────── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
                    Online Presence
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-950 tracking-tight">
                    Do you have a business website?
                  </h1>
                </div>

                {/* Yes / No Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setHasWebsite(true);
                      setNeedWebsiteHelp(false);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      hasWebsite === true
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Globe className={hasWebsite === true ? 'text-blue-600' : 'text-slate-400'} size={20} />
                      {hasWebsite === true && <CheckCircle2 size={18} className="text-blue-600" />}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Yes, I have a website</h3>
                    <p className="text-xs text-slate-500 mt-1">I will provide my existing domain URL.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHasWebsite(false);
                      setWebsiteUrl('');
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      hasWebsite === false
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <HelpCircle className={hasWebsite === false ? 'text-blue-600' : 'text-slate-400'} size={20} />
                      {hasWebsite === false && <CheckCircle2 size={18} className="text-blue-600" />}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">I don't have a website</h3>
                    <p className="text-xs text-slate-500 mt-1">Conflux can verify through other sources.</p>
                  </button>
                </div>

                {/* Conditional URL Input if Yes */}
                {hasWebsite === true && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Website URL *
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourbusiness.in"
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                  </div>
                )}

                {/* Helpful Missing-Asset Message if No */}
                {hasWebsite === false && (
                  <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
                    <p className="text-xs sm:text-sm text-blue-950 font-medium leading-relaxed">
                      No website? That's okay. Conflux can help you build a professional, search-ready website for your business.
                    </p>
                    <label className="flex items-center gap-2 text-xs font-bold text-blue-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needWebsiteHelp}
                        onChange={e => setNeedWebsiteHelp(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>I'd like information about building a website</span>
                    </label>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 4: ONLINE SOURCES ────────────────────────────── */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
                    Public Sources
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-950 tracking-tight">
                    Where can customers find your business online?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Add any existing profile links. Skip any platforms you don't have.
                  </p>
                </div>

                {/* Yes / No Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setHasOnlineSources(true);
                      setNeedGoogleHelp(false);
                      setNeedSocialHelp(false);
                      setNeedOnlinePresenceHelp(false);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      hasOnlineSources === true
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <h3 className="font-bold text-slate-900 text-sm">I have online profiles</h3>
                    <p className="text-xs text-slate-500 mt-1">Google Maps, Facebook, Instagram, Justdial, etc.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHasOnlineSources(false);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      hasOnlineSources === false
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <h3 className="font-bold text-slate-900 text-sm">I don't have these</h3>
                    <p className="text-xs text-slate-500 mt-1">No online listings currently exist.</p>
                  </button>
                </div>

                {/* Optional Source Inputs */}
                {hasOnlineSources === true && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Google Business Profile / Maps URL</label>
                      <input
                        type="url"
                        value={onlineSources.googleBusinessUrl}
                        onChange={e => setOnlineSources({ ...onlineSources, googleBusinessUrl: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Facebook Page</label>
                        <input
                          type="url"
                          value={onlineSources.facebookUrl}
                          onChange={e => setOnlineSources({ ...onlineSources, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Instagram</label>
                        <input
                          type="url"
                          value={onlineSources.instagramUrl}
                          onChange={e => setOnlineSources({ ...onlineSources, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Justdial / IndiaMART</label>
                        <input
                          type="url"
                          value={onlineSources.justdialUrl || onlineSources.indiamartUrl}
                          onChange={e => setOnlineSources({ ...onlineSources, justdialUrl: e.target.value })}
                          placeholder="https://justdial.com/..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">LinkedIn / Other</label>
                        <input
                          type="url"
                          value={onlineSources.otherUrl}
                          onChange={e => setOnlineSources({ ...onlineSources, otherUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Helpful Missing-Asset Assistance */}
                {hasOnlineSources === false && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                      Optional Assistance Requests
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={needGoogleHelp}
                          onChange={e => setNeedGoogleHelp(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300"
                        />
                        <span>Need help setting up Google Business Profile</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={needSocialHelp}
                          onChange={e => setNeedSocialHelp(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300"
                        />
                        <span>Need help establishing social media presence</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={needOnlinePresenceHelp}
                          onChange={e => setNeedOnlinePresenceHelp(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300"
                        />
                        <span>Need general guidance on online discoverability</span>
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 5: DESCRIPTION ───────────────────────────────── */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
                    Business Overview
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-950 tracking-tight">
                    What does your business do?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Tell us briefly what your business provides. Conflux will use your information and available sources to build the business profile.
                  </p>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. We provide clinical pathology, USG diagnostics, digital X-rays, and specialist doctor consultations."
                    className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Keep it simple. You do not need to write long SEO text.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 6: REPRESENTATIVE ────────────────────────────── */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
                    Representation
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-950 tracking-tight">
                    Who represents this business?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Enter the responsible contact person or authorized representative.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Representative Name *
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      placeholder="e.g. Tanmoy Sen"
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Role / Designation
                    </label>
                    <select
                      value={ownerRole}
                      onChange={e => setOwnerRole(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    >
                      <option value="Owner">Owner / Proprietor</option>
                      <option value="Founder">Founder / Co-Founder</option>
                      <option value="Director">Managing Director</option>
                      <option value="Manager">General Manager</option>
                      <option value="Authorized Representative">Authorized Representative</option>
                    </select>
                  </div>

                  {/* Optional Representative Photo */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Representative Photo <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={ownerPhotoUrl}
                        onChange={e => setOwnerPhotoUrl(e.target.value)}
                        placeholder="Image URL (optional)"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Photographs are completely optional and not required for submission.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 7: CONTACT METHODS ───────────────────────────── */}
            {currentStep === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
                    Contact Channels
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-950 tracking-tight">
                    How can customers contact this business?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Provide the phone number and channels where customer inquiries should be sent.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Business Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. +91 97344 33100"
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        WhatsApp Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        placeholder="Leave blank to use phone"
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. contact@business.in"
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Online Booking URL <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={bookingUrl}
                      onChange={e => setBookingUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Contact Help Opportunities */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 pt-3">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needWhatsAppHelp}
                        onChange={e => setNeedWhatsAppHelp(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <span>I'd like information about 1-click WhatsApp customer routing</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needBookingHelp}
                        onChange={e => setNeedBookingHelp(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <span>I'd like help setting up online booking or appointments</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 8: FINAL REVIEW SCREEN ───────────────────────── */}
            {currentStep === 8 && (
              <motion.div
                key="step8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
                    Review &amp; Confirmation
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-slate-950 tracking-tight">
                    Review your submission
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Conflux will review the information you provided and check available sources before publishing your business profile.
                  </p>
                </div>

                {/* Summary Box */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Business</span>
                    <span className="col-span-2 font-bold text-slate-900">{businessName}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Location</span>
                    <span className="col-span-2 text-slate-800">{fullAddress}, {city}, {district}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Website</span>
                    <span className="col-span-2 text-slate-800">
                      {hasWebsite && websiteUrl ? websiteUrl : 'No website (Requested guidance)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Description</span>
                    <span className="col-span-2 text-slate-800 line-clamp-2">{description}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Representative</span>
                    <span className="col-span-2 text-slate-800">{ownerName} ({ownerRole})</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Contact</span>
                    <span className="col-span-2 text-slate-800">{phone} {whatsapp ? `• WhatsApp: ${whatsapp}` : ''}</span>
                  </div>

                  {/* Requested Assistance Flags */}
                  {(needWebsiteHelp || needGoogleHelp || needSocialHelp || needWhatsAppHelp || needBookingHelp) && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <span className="font-bold text-blue-700">Requested Assistance</span>
                      <div className="col-span-2 space-y-1 text-xs text-blue-900 font-medium">
                        {needWebsiteHelp && <div>&bull; Website Information</div>}
                        {needGoogleHelp && <div>&bull; Google Business Profile setup</div>}
                        {needSocialHelp && <div>&bull; Social presence assistance</div>}
                        {needWhatsAppHelp && <div>&bull; WhatsApp routing integration</div>}
                        {needBookingHelp && <div>&bull; Online booking setup</div>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 leading-relaxed font-medium">
                  <ShieldCheck size={16} className="inline mr-1.5 text-blue-600 -mt-0.5" />
                  Your listing will be reviewed by Conflux against authoritative statutory registries before publication.
                </div>
              </motion.div>
            )}

            {/* ── STEP 9: SUCCESS & PIPELINE STATUS SCREEN ───────────── */}
            {currentStep === 9 && submissionResult && (
              <motion.div
                key="step9"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest">
                    Reference #{submissionResult.applicationId}
                  </span>
                  <h1 className="text-3xl font-black font-orbitron text-slate-950 tracking-tight">
                    Verification request received
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    We have received your business submission for <strong>{submissionResult.businessName}</strong>. We may contact you if additional information or clarification is required.
                  </p>
                </div>

                {/* Verification Pipeline Tracker */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-3.5">
                  <div className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider border-b border-slate-200 pb-2">
                    Review &amp; Publication Pipeline
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                    <span>1. Submission received</span>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>2. Information review</span>
                    <span className="text-amber-600 font-mono text-[11px]">In Queue ⏳</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>3. Source verification</span>
                    <span className="text-slate-400 font-mono text-[11px]">Pending ⏳</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>4. Admin review &amp; verification</span>
                    <span className="text-slate-400 font-mono text-[11px]">Pending ⏳</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>5. Profile publication</span>
                    <span className="text-slate-400 font-mono text-[11px]">Pending ⏳</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Link
                    to="/business/audit"
                    className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md"
                  >
                    Check Visibility Audit
                  </Link>
                  <Link
                    to="/"
                    className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs font-mono uppercase tracking-wider transition-all border border-slate-200"
                  >
                    Return to Home
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons (Only during steps 1 to 8) */}
          {currentStep <= 8 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <Link
                  to="/"
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase font-mono tracking-wider"
                >
                  Cancel
                </Link>
              )}

              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </main>
  );
};
