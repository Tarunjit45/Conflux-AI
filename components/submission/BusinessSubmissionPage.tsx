// Conflux Platform — Guided 7-Step Business Onboarding Pipeline (/list-business)
// Strict Production Rules:
// - All core fields are MANDATORY (Business Name, Legal Name, Entity Type, Phone, WhatsApp, Email,
//   Owner Name & Role, Location Hierarchy, Street Address, Website URL, Google Maps Link, Category, Description)
// - ONLY Social Media (Facebook, Instagram, LinkedIn, IndiaMART) is OPTIONAL
// - ONLY Statutory GST / Trade License Number ("that Gist things") is OPTIONAL
// - Location is 100% selectable via dropdowns: Country -> State -> District -> City -> Locality

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Globe, Share2, Phone,
  CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck,
  AlertCircle, HelpCircle, Lock, Sparkles, UserCheck, MessageSquare, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessService } from '../../lib/businessService';
import type { SubmittedOnlineSources, ServiceInterestRequests, BusinessType } from '../../types/business';
import {
  getCountries,
  getStatesForCountry,
  getDistrictsForState,
  getCitiesForDistrict,
  getLocalitiesForCity
} from '../../data/hierarchicalLocations';

const BUSINESS_TYPE_OPTIONS: { id: BusinessType; label: string }[] = [
  { id: 'LOCAL_BUSINESS', label: 'Sole Proprietorship (Individual / Family Owned)' },
  { id: 'ENTERPRISE', label: 'Private Limited Company (Pvt Ltd)' },
  { id: 'REGIONAL_BRANCH', label: 'Partnership Firm' },
  { id: 'INSTITUTION', label: 'Limited Liability Partnership (LLP)' },
  { id: 'COOPERATIVE', label: 'Public Limited Company (Ltd)' }
];

const OWNER_ROLES = [
  'Proprietor / Sole Owner',
  'Managing Director / Founder',
  'Managing Partner',
  'General Manager / Authorized Officer',
  'Authorized Representative'
];

const CATEGORY_OPTIONS = [
  { id: 'healthcare', label: 'Healthcare, Clinics & Diagnostic Centres' },
  { id: 'food-hospitality', label: 'Restaurants, Cafes & Dining' },
  { id: 'services-repairs', label: 'AC, Electronics & Home Repairs' },
  { id: 'handloom-textiles', label: 'Handloom Sarees, Textiles & Weaving' },
  { id: 'retail-shops', label: 'Retail Stores & Supermarkets' },
  { id: 'fitness-wellness', label: 'Gyms, Fitness & Wellness Centres' },
  { id: 'tourism-hospitality', label: 'Hotels, Lodging & Homestays' },
  { id: 'salons-beauty', label: 'Salons, Spa & Personal Grooming' },
  { id: 'agriculture-farming', label: 'Agro-Processing, Cold Storage & Dairy' },
  { id: 'manufacturing-industrial', label: 'Manufacturing & Industrial Engineering' },
  { id: 'it-software', label: 'IT, Software & Digital Services' }
];

export const BusinessSubmissionPage: React.FC = () => {
  // 1 to 6 = Questions, 7 = Review & Submit, 8 = Success Screen
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [submissionResult, setSubmissionResult] = useState<{
    applicationId: string;
    confluxBusinessId?: string;
    businessName: string;
  } | null>(null);

  // ── STEP 1: BUSINESS IDENTITY (ALL MANDATORY) ──
  const [businessName, setBusinessName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('LOCAL_BUSINESS');

  // ── STEP 2: LOCATION HIERARCHY (100% SELECTABLE OPTIONS, NO MANUAL WRITING FOR REGIONS) ──
  const [country, setCountry] = useState('india');
  const [state, setState] = useState('west-bengal');
  const [district, setDistrict] = useState('nadia');
  const [city, setCity] = useState('ranaghat');
  const [locality, setLocality] = useState('ranaghat-subhas-avenue');
  const [fullAddress, setFullAddress] = useState('');

  // ── STEP 3: ONLINE PRESENCE & WEB CHANNELS ──
  // Mandatory: Website URL & Google Business Profile
  // Optional: Facebook, Instagram, LinkedIn, IndiaMART
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState('');
  const [onlineSources, setOnlineSources] = useState<SubmittedOnlineSources>({
    googleBusinessUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    justdialUrl: '',
    indiamartUrl: '',
    otherUrl: ''
  });

  // ── STEP 4: CONTACT & PROPRIETOR VERIFICATION (ALL MANDATORY) ──
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerRole, setOwnerRole] = useState(OWNER_ROLES[0]);

  // ── STEP 5: CATEGORY & SERVICES (ALL MANDATORY) ──
  const [category, setCategoryId] = useState('healthcare');
  const [description, setDescription] = useState('');

  // ── STEP 6: STATUTORY EVIDENCE (OPTIONAL: "THAT GIST THINGS") ──
  const [statutoryDocNumber, setStatutoryDocNumber] = useState('');

  // ── STEP 7: DECLARATION ──
  const [declarationConfirmed, setDeclarationConfirmed] = useState(true);

  // Dynamic Hierarchical Dropdown Lists
  const countries = useMemo(() => getCountries(), []);
  const states = useMemo(() => getStatesForCountry(country), [country]);
  const districts = useMemo(() => getDistrictsForState(country, state), [country, state]);
  const cities = useMemo(() => getCitiesForDistrict(country, state, district), [country, state, district]);
  const localities = useMemo(() => getLocalitiesForCity(country, state, district, city), [country, state, district, city]);

  // Hierarchical Handlers
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const availableStates = getStatesForCountry(newCountry);
    const defaultState = availableStates[0]?.id || '';
    setState(defaultState);

    const availableDistricts = getDistrictsForState(newCountry, defaultState);
    const defaultDistrict = availableDistricts[0]?.id || '';
    setDistrict(defaultDistrict);

    const availableCities = getCitiesForDistrict(newCountry, defaultState, defaultDistrict);
    const defaultCity = availableCities[0]?.id || '';
    setCity(defaultCity);

    const availableLocs = getLocalitiesForCity(newCountry, defaultState, defaultDistrict, defaultCity);
    setLocality(availableLocs[0]?.id || '');
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    const availableDistricts = getDistrictsForState(country, newState);
    const defaultDistrict = availableDistricts[0]?.id || '';
    setDistrict(defaultDistrict);

    const availableCities = getCitiesForDistrict(country, newState, defaultDistrict);
    const defaultCity = availableCities[0]?.id || '';
    setCity(defaultCity);

    const availableLocs = getLocalitiesForCity(country, newState, defaultDistrict, defaultCity);
    setLocality(availableLocs[0]?.id || '');
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const availableCities = getCitiesForDistrict(country, state, newDistrict);
    const defaultCity = availableCities[0]?.id || '';
    setCity(defaultCity);

    const availableLocs = getLocalitiesForCity(country, state, newDistrict, defaultCity);
    setLocality(availableLocs[0]?.id || '');
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const availableLocs = getLocalitiesForCity(country, state, district, newCity);
    setLocality(availableLocs[0]?.id || '');
  };

  // Human Readable Names for Summary
  const countryName = countries.find(c => c.id === country)?.name || country;
  const stateName = states.find(s => s.id === state)?.name || state;
  const districtName = districts.find(d => d.id === district)?.name || district;
  const cityName = cities.find(c => c.id === city)?.name || city;
  const localityName = localities.find(l => l.id === locality)?.name || locality;

  // Validation per step
  const handleNextStep = () => {
    setErrorMessage(null);

    // ── STEP 1 VALIDATION ──
    if (currentStep === 1) {
      if (!businessName || businessName.trim().length < 2) {
        setErrorMessage('Business Trade Name is mandatory (minimum 2 characters).');
        return;
      }
      if (!legalName || legalName.trim().length < 2) {
        setErrorMessage('Legal Registered Entity Name is mandatory (minimum 2 characters).');
        return;
      }
    }

    // ── STEP 2 VALIDATION ──
    else if (currentStep === 2) {
      if (!country) {
        setErrorMessage('Country selection is mandatory.');
        return;
      }
      if (!state) {
        setErrorMessage('State / Province selection is mandatory.');
        return;
      }
      if (!district) {
        setErrorMessage('District / County selection is mandatory.');
        return;
      }
      if (!city) {
        setErrorMessage('City / Town selection is mandatory.');
        return;
      }
      if (!locality) {
        setErrorMessage('Locality / Ward selection is mandatory.');
        return;
      }
      if (!fullAddress || fullAddress.trim().length < 5) {
        setErrorMessage('Street Address, Shop Number, or Premises Landmark is mandatory (minimum 5 characters).');
        return;
      }
    }

    // ── STEP 3 VALIDATION ──
    else if (currentStep === 3) {
      if (!websiteUrl || websiteUrl.trim().length < 4 || !websiteUrl.includes('.')) {
        setErrorMessage('Official Website URL or Primary Online Storefront link is mandatory.');
        return;
      }
      if (!googleBusinessUrl || googleBusinessUrl.trim().length < 5) {
        setErrorMessage('Google Business Profile or Google Maps location link is mandatory for local verification.');
        return;
      }
    }

    // ── STEP 4 VALIDATION ──
    else if (currentStep === 4) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (!phone || cleanPhone.length < 10) {
        setErrorMessage('Official Business Contact Telephone is mandatory (valid 10-digit number).');
        return;
      }
      const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
      if (!whatsapp || cleanWhatsapp.length < 10) {
        setErrorMessage('Direct WhatsApp Line is mandatory (valid 10-digit number for customer inquiries).');
        return;
      }
      if (!email || !email.includes('@') || !email.includes('.')) {
        setErrorMessage('Official Business Email Address is mandatory.');
        return;
      }
      if (!ownerName || ownerName.trim().length < 2) {
        setErrorMessage('Proprietor or Responsible Manager Name is mandatory.');
        return;
      }
    }

    // ── STEP 5 VALIDATION ──
    else if (currentStep === 5) {
      if (!category) {
        setErrorMessage('Category selection is mandatory.');
        return;
      }
      if (!description || description.trim().length < 20) {
        setErrorMessage('Business Description is mandatory (minimum 20 characters detailing products and services).');
        return;
      }
    }

    // ── STEP 6: "THAT GIST THINGS" IS OPTIONAL ──
    // Step 6 has no mandatory requirements, as GST / Trade license is optional per user instructions

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

      const normalizedSources: SubmittedOnlineSources = {
        ...onlineSources,
        googleBusinessUrl: googleBusinessUrl.trim()
      };

      const cleanFullAddress = `${fullAddress.trim()}, ${localityName}, ${cityName}, ${districtName}, ${stateName}, ${countryName}`;

      const result = await businessService.submitApplication({
        submissionType: 'CONFLUX_VERIFIED',
        businessName: businessName.trim(),
        legalName: legalName.trim(),
        businessType,
        categoryId: category,
        categoryName: CATEGORY_OPTIONS.find(c => c.id === category)?.label || category.toUpperCase(),
        description: description.trim(),
        country,
        state,
        district,
        city: cityName,
        locality: localityName,
        fullAddress: cleanFullAddress,
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        websiteUrl: websiteUrl.trim(),
        hasWebsite: true,
        bookingUrl: undefined,
        ownerName: ownerName.trim(),
        ownerRole,
        ownerPhone: phone.trim(),
        ownerEmail: email.trim(),
        onlineSources: normalizedSources,
        serviceInterestRequests,
        services: [category.replace(/-/g, ' ')],
        privateEvidence: statutoryDocNumber.trim() ? [{
          id: `DOC-${Date.now()}`,
          documentType: 'TRADE_LICENSE',
          documentNumber: statutoryDocNumber.trim(),
          fileUrl: '',
          uploadedAt: new Date().toISOString(),
          verificationStatus: 'PENDING'
        }] : [],
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
              <span className="font-mono text-slate-700 font-bold">Step {currentStep} of 7</span>
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
            
            {/* ── STEP 1: BUSINESS IDENTITY (MANDATORY) ──────────────── */}
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
                    1 of 7 &bull; Business Identity (Mandatory)
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Add your business
                  </h1>
                  <p className="text-sm text-slate-600">
                    Enter your official business name and legal registration classification.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Business Trade Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. TEETH IN TRUST Dental Clinic"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      autoFocus
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      The public commercial name customers recognize on signs and bills.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Legal Registered Entity Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={legalName}
                      onChange={e => setLegalName(e.target.value)}
                      placeholder="e.g. TEETH IN TRUST Healthcare Pvt Ltd / Dr. Subir Biswas Clinic"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Official legal name registered on municipal, tax, or corporate records.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Business Structure / Legal Type <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={businessType}
                      onChange={e => setBusinessType(e.target.value as BusinessType)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                    >
                      {BUSINESS_TYPE_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: LOCATION HIERARCHY (100% SELECTABLE OPTIONS) ── */}
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
                    2 of 7 &bull; Location Hierarchy (Mandatory Selection)
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Where is your business located?
                  </h1>
                  <p className="text-sm text-slate-600">
                    Select your exact location from the options below (Country, State, District, City, and Locality are all selectable).
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  
                  {/* Country Selection */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Country <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={country}
                      onChange={e => handleCountryChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                    >
                      {countries.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phoneCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State and District Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        State / Province <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={state}
                        onChange={e => handleStateChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                      >
                        {states.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        District / County <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={e => handleDistrictChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                      >
                        {districts.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* City and Locality Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        City / Town / Municipality <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={city}
                        onChange={e => handleCityChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                      >
                        {cities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        Locality / Commercial Zone / Ward <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={locality}
                        onChange={e => setLocality(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                      >
                        {localities.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specific Street Address / Premise Building */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Street Address / Premises / Shop No / Landmark <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullAddress}
                      onChange={e => setFullAddress(e.target.value)}
                      placeholder="e.g. Shop No. 12, Subhas Avenue, Near Ranaghat Sub-Divisional Hospital"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Specific door/shop number and landmark for customers visiting your physical premises.
                    </span>
                  </div>

                  {/* Selected Location Preview Badge */}
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                    <MapPin size={16} className="text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Selected Geographic Route:</strong> {countryName} &rarr; {stateName} &rarr; {districtName} &rarr; {cityName} &rarr; {localityName}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: ONLINE PRESENCE & CHANNELS ──────────────────── */}
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
                    3 of 7 &bull; Online Presence &amp; Social Links
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Online Presence &amp; Profiles
                  </h1>
                  <p className="text-sm text-slate-600">
                    Website and Google Maps are mandatory for trust verification. Social media links are optional.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Official Website or Primary Online Catalog <span className="text-rose-600">* (Mandatory)</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourbusiness.in or official catalog URL"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Your business website, web catalog, or primary digital domain.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Google Business Profile / Maps Link <span className="text-rose-600">* (Mandatory)</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={googleBusinessUrl}
                      onChange={e => {
                        setGoogleBusinessUrl(e.target.value);
                        setOnlineSources({ ...onlineSources, googleBusinessUrl: e.target.value });
                      }}
                      placeholder="https://maps.google.com/?cid=... or Google Maps link"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Required to verify your physical business location against Google Maps.
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 font-mono">
                      Optional Social Media Profiles
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Facebook Page <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          value={onlineSources.facebookUrl}
                          onChange={e => setOnlineSources({ ...onlineSources, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/yourpage"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Instagram Profile <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          value={onlineSources.instagramUrl}
                          onChange={e => setOnlineSources({ ...onlineSources, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/yourhandle"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          LinkedIn Page <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          value={onlineSources.linkedinUrl}
                          onChange={e => setOnlineSources({ ...onlineSources, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/company/yourbiz"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          IndiaMART / Trade Directory <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          value={onlineSources.indiamartUrl}
                          onChange={e => setOnlineSources({ ...onlineSources, indiamartUrl: e.target.value })}
                          placeholder="https://indiamart.com/company"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: CONTACT & PROPRIETOR (MANDATORY) ───────────── */}
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
                    4 of 7 &bull; Contact &amp; Proprietor Verification (Mandatory)
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Contact &amp; Owner Details
                  </h1>
                  <p className="text-sm text-slate-600">
                    All contact details are mandatory to ensure customers and administrators can reach authentic decision-makers.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        Calling Telephone / Mobile <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="e.g. +91 98300 XXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        Direct WhatsApp Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        placeholder="e.g. +91 98300 XXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Official Business Email Address <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. contact@business.in or owner@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Verification audit notices and customer inquiries will be dispatched here.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        Proprietor / Manager Full Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={e => setOwnerName(e.target.value)}
                        placeholder="e.g. Dr. Subir Biswas"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        Designation / Role <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={ownerRole}
                        onChange={e => setOwnerRole(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                      >
                        {OWNER_ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: CATEGORY & DESCRIPTION (MANDATORY) ─────────── */}
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
                    5 of 7 &bull; Category &amp; Offerings (Mandatory)
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Business Offerings
                  </h1>
                  <p className="text-sm text-slate-600">
                    Select your primary sector and describe your specific services for local consumers.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Primary Industry Category <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white"
                    >
                      {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Detailed Business Description <span className="text-rose-600">* (Minimum 20 characters)</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="e.g. Advanced dental care and oral surgery clinic in Ranaghat providing orthodontic alignments, dental implants, root canal treatments, and digital X-ray diagnostics. Operating 7 days a week."
                      className="w-full p-4 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Explain what makes your business reliable and what local customers can expect.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 6: STATUTORY EVIDENCE (OPTIONAL: "THAT GIST THINGS") ── */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                    6 of 7 &bull; Statutory Registration (Optional)
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Government Registration Number
                  </h1>
                  <p className="text-sm text-slate-600">
                    This step is optional. Unregistered micro-enterprises and small shops can leave this blank.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 leading-relaxed space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <HelpCircle size={15} className="text-amber-700 shrink-0" />
                      Optional Field Notice:
                    </div>
                    <p>
                      If your business possesses an active <strong>GSTIN (15-digit)</strong>, <strong>Municipal Trade License No.</strong>, <strong>FSSAI Food License</strong>, or <strong>MCA Corporate CIN</strong>, please enter it below. It accelerates manual statutory verification.
                    </p>
                    <p className="text-[11px] text-amber-800">
                      If you are an unregistered local establishment, you may skip this step without penalty.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Trade License / GSTIN / MCA CIN / Registration No. <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={statutoryDocNumber}
                      onChange={e => setStatutoryDocNumber(e.target.value)}
                      placeholder="e.g. GSTIN: 19AAAAA0000A1Z5 or Municipal Trade License No."
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
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
                    7 of 7 &bull; Review &amp; Submit
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Review your application
                  </h1>
                  <p className="text-sm text-slate-600">
                    Verify that all mandatory information is accurate before submitting for Conflux verification.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs sm:text-sm">
                  
                  {/* Entity */}
                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Business Name</span>
                    <span className="col-span-2 font-bold text-slate-900">{businessName}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Legal Name</span>
                    <span className="col-span-2 text-slate-800">{legalName}</span>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Selected Location</span>
                    <span className="col-span-2 text-slate-800">
                      {localityName}, {cityName}, {districtName}, {stateName}, {countryName}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Street Address</span>
                    <span className="col-span-2 text-slate-800">{fullAddress}</span>
                  </div>

                  {/* Contacts */}
                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Phone &amp; WhatsApp</span>
                    <span className="col-span-2 text-slate-800">
                      Call: {phone} &bull; WhatsApp: {whatsapp}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Official Email</span>
                    <span className="col-span-2 text-slate-800">{email}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Owner / Role</span>
                    <span className="col-span-2 text-slate-800">{ownerName} ({ownerRole})</span>
                  </div>

                  {/* Online Presence */}
                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Website &amp; Maps</span>
                    <div className="col-span-2 space-y-1 text-slate-800 truncate">
                      <div>Web: <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{websiteUrl}</a></div>
                      <div>Maps: <a href={googleBusinessUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{googleBusinessUrl}</a></div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Category</span>
                    <span className="col-span-2 text-slate-800 font-medium">
                      {CATEGORY_OPTIONS.find(c => c.id === category)?.label}
                    </span>
                  </div>

                  {/* Statutory Document */}
                  <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Statutory GST / License</span>
                    <span className="col-span-2 text-slate-800 font-mono">
                      {statutoryDocNumber ? statutoryDocNumber : 'Unregistered / Exempt Local Establishment'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-500">Description</span>
                    <span className="col-span-2 text-slate-800 line-clamp-2">{description}</span>
                  </div>
                </div>

                {/* Mandatory Declaration Checkbox */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-900 leading-relaxed font-medium flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="declaration"
                    checked={declarationConfirmed}
                    onChange={e => setDeclarationConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <label htmlFor="declaration" className="cursor-pointer">
                    I declare that all stated business, location, and contact information is authentic and accurate. I understand that Conflux conducts manual verification against official records.
                  </label>
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

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                    Reference #{submissionResult.applicationId}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    Your business has been submitted
                  </h1>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Conflux audit team will evaluate your business location ({localityName}, {cityName}) and contact details.
                  </p>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Status: Under manual review</span>
                </div>

                {/* Next Steps Explanation */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2.5 text-xs">
                  <div className="font-bold text-slate-800 uppercase font-mono tracking-wider border-b border-slate-200 pb-2">
                    What happens next?
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    1. <strong>Location corroboration:</strong> Our local verification team confirms your location in {cityName}, {districtName}.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    2. <strong>Direct channel confirmation:</strong> We will verify your WhatsApp and telephone reachability.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    3. <strong>Public directory listing:</strong> Once verified, your business profile will be published with authoritative contact lines.
                  </p>
                </div>

                {/* Optional Fast-Track Verification Step */}
                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 max-w-md mx-auto text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5 font-inter">
                      <ShieldCheck size={16} className="text-blue-700 shrink-0" />
                      <span>Optional Next Step: Apply for Conflux Verified</span>
                    </span>
                    <span className="text-xs font-bold text-blue-800 font-mono">₹499 / 1st yr</span>
                  </div>
                  <p className="text-[11px] text-blue-900 leading-relaxed">
                    Submit your statutory documents (GSTIN, Trade License, or registration certificate) for priority manual evidence evaluation and the official 1-year <strong>✓ Conflux Verified</strong> badge.
                  </p>
                  <Link
                    to="/verify"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <span>Apply for Conflux Verified (₹499)</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    to="/discover"
                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all shadow-md"
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
                  disabled={isSubmitting || !declarationConfirmed}
                  className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer min-h-[44px]"
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
