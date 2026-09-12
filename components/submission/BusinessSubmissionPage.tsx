// Conflux Platform — Guided 7-Step Business Onboarding Pipeline (/list-business)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Globe, Share2, Phone,
  CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck,
  AlertCircle, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessService } from '../../lib/businessService';
import type { SubmittedOnlineSources, ServiceInterestRequests } from '../../types/business';
import { WEST_BENGAL_DISTRICTS } from '../../data/locationsData';

export const BusinessSubmissionPage: React.FC = () => {
  // 1 to 6 = Questions, 7 = Review & Submit, 8 = Success
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [submissionResult, setSubmissionResult] = useState<{
    applicationId: string;
    confluxBusinessId?: string;
    businessName: string;
  } | null>(null);

  // ── STEP 1: BUSINESS NAME ──
  const [businessName, setBusinessName] = useState('');
  const [legalName, setLegalName] = useState('');

  // ── STEP 2: LOCATION ──
  const [district, setDistrict] = useState('nadia');
  const [city, setCity] = useState('ranaghat');
  const [fullAddress, setFullAddress] = useState('');

  // ── STEP 3: WEBSITE ──
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');

  // ── STEP 4: CONTACT ──
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerRole, setOwnerRole] = useState('Owner');

  // ── STEP 5: CATEGORY & SERVICES ──
  const [category, setCategoryId] = useState('healthcare');
  const [description, setDescription] = useState('');

  // ── STEP 6: EVIDENCE / ONLINE SOURCES ──
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
        setErrorMessage('Please enter your locality, market, or physical street address.');
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
      if (!phone || phone.trim().length < 6) {
        setErrorMessage('Please enter a valid business contact telephone or mobile number.');
        return;
      }
    } else if (currentStep === 5) {
      if (!description || description.trim().length < 5) {
        setErrorMessage('Please provide a brief description of what your business offers.');
        return;
      }
    } else if (currentStep === 6) {
      if (hasOnlineSources === null) {
        setErrorMessage('Please indicate whether your business has existing online profiles.');
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
        needWebsite: false,
        needGooglePresence: false,
        needSocialPresence: false,
        needWhatsAppSystem: false,
        needBookingSystem: false
      };

      const result = await businessService.submitApplication({
        submissionType: 'CONFLUX_VERIFIED',
        businessName: businessName.trim(),
        legalName: legalName.trim() || businessName.trim(),
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
        bookingUrl: undefined,
        ownerName: ownerName.trim() || 'Business Proprietor',
        ownerRole: ownerRole.trim() || 'Owner',
        ownerPhone: phone.trim(),
        ownerEmail: email.trim() || 'contact@confluxai.in',
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
      setCurrentStep(8); // Success screen
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-inter text-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Step Indicator Header (Only shown during steps 1 to 7) */}
        {currentStep <= 7 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Step {currentStep} of 7</span>
              <span>{Math.round((currentStep / 7) * 100)}% Complete</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-700 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── STEP 1: BUSINESS NAME ─────────────────────────────── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                    1. Business Identity
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    What is your business name?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Enter the name customers use to identify your shop, clinic, or service.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. Ghosh Diagnostics &amp; Clinic"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Registered / Legal Name <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={legalName}
                      onChange={e => setLegalName(e.target.value)}
                      placeholder="e.g. Ghosh Diagnostics Pvt Ltd (if different)"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: LOCATION ──────────────────────────────────── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                    2. Location
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Where is your business located?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Help local customers in West Bengal find your physical location.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">District *</label>
                      <select
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                      >
                        {WEST_BENGAL_DISTRICTS.map(d => (
                          <option key={d.slug} value={d.slug}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">City / Town *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Ranaghat, Krishnanagar, Kalyani"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Street Address &amp; Locality *
                    </label>
                    <input
                      type="text"
                      value={fullAddress}
                      onChange={e => setFullAddress(e.target.value)}
                      placeholder="e.g. Mission Gate Road, Near Post Office"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: WEBSITE ───────────────────────────────────── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                    3. Website
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Do you have a business website?
                  </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setHasWebsite(true)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      hasWebsite === true
                        ? 'border-blue-700 bg-blue-50/50 ring-2 ring-blue-700/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Globe className={hasWebsite === true ? 'text-blue-700' : 'text-slate-400'} size={20} />
                      {hasWebsite === true && <CheckCircle2 size={18} className="text-blue-700" />}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Yes, I have a website</h3>
                    <p className="text-xs text-slate-500 mt-1">Provide your existing domain URL.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHasWebsite(false);
                      setWebsiteUrl('');
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      hasWebsite === false
                        ? 'border-blue-700 bg-blue-50/50 ring-2 ring-blue-700/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <HelpCircle className={hasWebsite === false ? 'text-blue-700' : 'text-slate-400'} size={20} />
                      {hasWebsite === false && <CheckCircle2 size={18} className="text-blue-700" />}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">No website</h3>
                    <p className="text-xs text-slate-500 mt-1">Conflux can verify through direct contact and official records.</p>
                  </button>
                </div>

                {hasWebsite === true && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Website URL *
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourbusiness.in"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      autoFocus
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 4: CONTACT ───────────────────────────────────── */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                    4. Contact Details
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    How can customers reach you?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Provide verified direct numbers for phone and WhatsApp inquiries.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98300 XXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        WhatsApp Number <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        placeholder="Leave blank to use phone"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Email Address <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. contact@business.in"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Representative Name <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={e => setOwnerName(e.target.value)}
                        placeholder="e.g. Amit Ghosh"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Designation
                      </label>
                      <select
                        value={ownerRole}
                        onChange={e => setOwnerRole(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                      >
                        <option value="Owner">Owner / Proprietor</option>
                        <option value="Founder">Founder</option>
                        <option value="Manager">Manager</option>
                        <option value="Authorized Representative">Authorized Representative</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: CATEGORY & SERVICES ───────────────────────── */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                    5. Category &amp; Services
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    What does your business offer?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Select your primary sector and describe your key services or products.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                    >
                      <option value="healthcare">Healthcare &amp; Clinics</option>
                      <option value="food-hospitality">Restaurants &amp; Dining</option>
                      <option value="services-repairs">AC &amp; Home Repairs</option>
                      <option value="handloom-textiles">Handloom &amp; Sarees</option>
                      <option value="retail-shops">Retail &amp; Local Shops</option>
                      <option value="fitness-wellness">Gyms &amp; Fitness</option>
                      <option value="tourism-hospitality">Hotels &amp; Lodging</option>
                      <option value="salons-beauty">Salons &amp; Spa</option>
                      <option value="agriculture-farming">Agro &amp; Cold Storage</option>
                      <option value="manufacturing-industrial">Manufacturing &amp; Industrial</option>
                      <option value="it-software">IT &amp; Software Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Business Description &amp; Services *
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="e.g. Specialist pathology testing, ultrasound, ECG, and general doctor consultations. Open 7 days a week."
                      className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 6: EVIDENCE / ONLINE SOURCES ─────────────────── */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                    6. Verification Evidence
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Do you have existing online profiles?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Existing profiles help Conflux corroborate your business details faster.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setHasOnlineSources(true)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      hasOnlineSources === true
                        ? 'border-blue-700 bg-blue-50/50 ring-2 ring-blue-700/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <h3 className="font-bold text-slate-900 text-sm">Yes, I have profiles</h3>
                    <p className="text-xs text-slate-500 mt-1">Google Maps, Facebook, Instagram, or trade portal.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasOnlineSources(false)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      hasOnlineSources === false
                        ? 'border-blue-700 bg-blue-50/50 ring-2 ring-blue-700/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <h3 className="font-bold text-slate-900 text-sm">No online profiles</h3>
                    <p className="text-xs text-slate-500 mt-1">Conflux will verify via direct phone contact and location checks.</p>
                  </button>
                </div>

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
                        <label className="text-xs font-bold text-slate-700 block mb-1">Instagram Profile</label>
                        <input
                          type="url"
                          value={onlineSources.instagramUrl}
                          onChange={e => setOnlineSources({ ...onlineSources, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 7: REVIEW & SUBMIT ───────────────────────────── */}
            {currentStep === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                    7. Review &amp; Submit
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Review your information
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Check your details before submitting for Conflux verification.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs sm:text-sm">
                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Business</span>
                    <span className="col-span-2 font-bold text-slate-900">{businessName}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Location</span>
                    <span className="col-span-2 text-slate-800">{fullAddress}, {city}, {district}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Website</span>
                    <span className="col-span-2 text-slate-800">
                      {hasWebsite && websiteUrl ? websiteUrl : 'No website'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Contact</span>
                    <span className="col-span-2 text-slate-800">{phone} {whatsapp ? `• WhatsApp: ${whatsapp}` : ''}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Category</span>
                    <span className="col-span-2 text-slate-800 capitalize">{category.replace(/-/g, ' ')}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-500">Description</span>
                    <span className="col-span-2 text-slate-800 line-clamp-2">{description}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-900 leading-relaxed font-medium flex items-start gap-2">
                  <ShieldCheck size={16} className="text-blue-700 shrink-0 mt-0.5" />
                  <span>Your submission will be reviewed against official records and confirmed before publishing your verified business badge.</span>
                </div>
              </motion.div>
            )}

            {/* ── STEP 8: SUCCESS SCREEN ────────────────────────────── */}
            {currentStep === 8 && submissionResult && (
              <motion.div
                key="step8"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-200">
                  <CheckCircle2 size={32} />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest">
                    Reference #{submissionResult.applicationId}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Verification request received
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    We have received the listing details for <strong>{submissionResult.businessName}</strong>. Our team will verify your information before publishing your profile.
                  </p>
                </div>

                {/* Verification Pipeline Tracker */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2.5 text-xs">
                  <div className="font-bold text-slate-700 uppercase font-mono tracking-wider border-b border-slate-200 pb-2">
                    Verification Status
                  </div>

                  <div className="flex items-center justify-between font-semibold text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                    <span>1. Submission received</span>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between font-medium text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>2. Details review</span>
                    <span className="text-amber-600 font-mono text-[11px]">In Queue ⏳</span>
                  </div>

                  <div className="flex items-center justify-between font-medium text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>3. Source verification</span>
                    <span className="text-slate-400 font-mono text-[11px]">Pending ⏳</span>
                  </div>

                  <div className="flex items-center justify-between font-medium text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>4. Profile publication</span>
                    <span className="text-slate-400 font-mono text-[11px]">Pending ⏳</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    to="/discover"
                    className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-all shadow-md"
                  >
                    Browse Directory
                  </Link>
                  <Link
                    to="/"
                    className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-200"
                  >
                    Return Home
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons (Only during steps 1 to 7) */}
          {currentStep <= 7 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <Link
                  to="/"
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Cancel
                </Link>
              )}

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-700/20 flex items-center gap-2 transition-all cursor-pointer min-h-[44px]"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer min-h-[44px]"
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

export default BusinessSubmissionPage;
