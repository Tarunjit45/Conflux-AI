// Conflux Platform — Public Business Submission & Listing System (Standard & Conflux Verified)

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, ShieldCheck, CheckCircle2, Upload, FileText, Lock,
  AlertCircle, ArrowRight, Check, Clock, Globe, Phone, MapPin,
  Camera, UserCheck, HelpCircle, Sparkles, ChevronRight, X, Image as ImageIcon,
  FileCheck, Shield, Trash2, Eye, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessService } from '../../lib/businessService';
import { connectService } from '../../lib/connectService';
import type {
  SubmissionType,
  PrivateDocumentType,
  PrivateEvidenceDocument,
  BusinessType
} from '../../types/business';
import { WEST_BENGAL_DISTRICTS } from '../../data/locationsData';
import { BUSINESS_CATEGORY_TAXONOMY } from '../../data/taxonomiesData';

export const BusinessSubmissionPage: React.FC = () => {
  const [submissionType, setSubmissionType] = useState<SubmissionType>('CONFLUX_VERIFIED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    applicationId: string;
    confluxBusinessId?: string;
    businessName: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields — 1. Business Identity
  const [businessName, setBusinessName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('LOCAL_BUSINESS');
  const [categoryId, setCategoryId] = useState('healthcare');
  const [yearEstablished, setYearEstablished] = useState<string>('2020');
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  
  // Location
  const [district, setDistrict] = useState('nadia');
  const [city, setCity] = useState('ranaghat');
  const [landmark, setLandmark] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [premisesType, setPremisesType] = useState<'OWNED' | 'LEASED' | 'COMMERCIAL_COMPLEX' | 'STANDALONE_BUILDING'>('COMMERCIAL_COMPLEX');

  // Contact
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [operatingHoursSummary, setOperatingHoursSummary] = useState('Mon - Sat: 09:00 AM - 08:00 PM');

  // 4. Media & Photographs (Storefront Photo, Business Logo, Owner Photo)
  const [storefrontPhotoUrl, setStorefrontPhotoUrl] = useState('');
  const [storefrontPhotoFileName, setStorefrontPhotoFileName] = useState('');
  
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFileName, setLogoFileName] = useState('');

  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState('');
  const [ownerPhotoFileName, setOwnerPhotoFileName] = useState('');

  // 5. Owner / Responsible Person
  const [ownerName, setOwnerName] = useState('');
  const [ownerRole, setOwnerRole] = useState('Proprietor / Managing Director');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  // 6. Private Evidence Documents (For Conflux Verified)
  const [selectedDocType, setSelectedDocType] = useState<PrivateDocumentType>('TRADE_LICENSE');
  const [docNumber, setDocNumber] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceFileData, setEvidenceFileData] = useState<string>('');
  const [evidenceFileName, setEvidenceFileName] = useState<string>('');
  const [uploadedEvidence, setUploadedEvidence] = useState<PrivateEvidenceDocument[]>([]);

  // 7. Declarations
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [noStockImagesConfirmed, setNoStockImagesConfirmed] = useState(false);

  // Hidden File Input Refs
  const storefrontFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const ownerPhotoFileRef = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<HTMLInputElement>(null);

  // Dynamic evidence recommendation based on selected category
  const getCategoryEvidenceGuide = (cat: string) => {
    switch (cat) {
      case 'food-hospitality':
        return {
          recommendedDoc: 'FSSAI License / Registration Certificate & Trade License',
          docType: 'FSSAI' as PrivateDocumentType,
          placeholder: 'e.g. FSSAI License #12823019000452'
        };
      case 'healthcare':
        return {
          recommendedDoc: 'Clinical Establishments Act Registration Certificate',
          docType: 'CLINICAL_ESTABLISHMENT' as PrivateDocumentType,
          placeholder: 'e.g. WB/CEA/NAD/2023-0941'
        };
      case 'manufacturing-industrial':
      case 'handloom-textiles':
        return {
          recommendedDoc: 'MSME Udyam Registration / GSTIN / Factory License',
          docType: 'MSME_UDYAM' as PrivateDocumentType,
          placeholder: 'e.g. UDYAM-WB-14-0029841 or GSTIN'
        };
      case 'tourism-hospitality':
        return {
          recommendedDoc: 'Tourism Directorate Accommodation Register & Municipal Trade License',
          docType: 'TOURISM_REG' as PrivateDocumentType,
          placeholder: 'e.g. WB/HTL/RNG/2023-5502'
        };
      case 'fitness-wellness':
      case 'salons-beauty':
      case 'services-repairs':
      case 'retail-trade':
      default:
        return {
          recommendedDoc: 'Municipal Commercial Trade License / Shop & Establishment Act Certificate',
          docType: 'TRADE_LICENSE' as PrivateDocumentType,
          placeholder: 'e.g. Municipal Trade Cert #RNG/TRD/2023/4491'
        };
    }
  };

  const currentEvidenceGuide = getCategoryEvidenceGuide(categoryId);

  // Handle Image File Upload (Storefront, Logo, Owner Photo)
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    nameSetter: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    nameSetter(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Document File Upload for Statutory Evidence
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Document size must be less than 10MB.');
      return;
    }

    setEvidenceFileName(file.name);
    if (!evidenceName) {
      setEvidenceName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEvidenceFileData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Evidence Document
  const handleAddEvidenceDoc = () => {
    if (!docNumber.trim() && !evidenceFileData) {
      alert('Please provide either the document registration/license number or upload the document file.');
      return;
    }

    const newDoc: PrivateEvidenceDocument = {
      id: `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      documentType: selectedDocType,
      documentName: evidenceName.trim() || currentEvidenceGuide.recommendedDoc,
      documentNumber: docNumber.trim() || undefined,
      mimeType: evidenceFileData.includes('data:application/pdf') ? 'application/pdf' : 'image/jpeg',
      fileSizeBytes: evidenceFileData ? Math.round((evidenceFileData.length * 3) / 4) : 1024 * 150,
      uploadedAt: new Date().toISOString(),
      isPrivate: true,
      fileData: evidenceFileData || undefined
    };

    setUploadedEvidence([...uploadedEvidence, newDoc]);
    setDocNumber('');
    setEvidenceName('');
    setEvidenceFileData('');
    setEvidenceFileName('');
    if (docFileRef.current) docFileRef.current.value = '';
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedEvidence(uploadedEvidence.filter(d => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Common Required Fields
    if (!businessName.trim()) {
      setErrorMessage('Please provide the business name.');
      return;
    }
    if (!description.trim() || description.length < 15) {
      setErrorMessage('Please provide a detailed business description (minimum 15 characters).');
      return;
    }
    if (!fullAddress.trim()) {
      setErrorMessage('Please provide the full physical operating address.');
      return;
    }
    if (!phone.trim() || !email.trim()) {
      setErrorMessage('Please provide official business contact phone and email.');
      return;
    }
    if (!ownerName.trim()) {
      setErrorMessage('Please provide the owner / responsible person name.');
      return;
    }
    if (!declarationConfirmed || !noStockImagesConfirmed) {
      setErrorMessage('Please confirm all mandatory accuracy and genuine-media declarations.');
      return;
    }

    // Specific Conflux Verified Mandatory Validations
    if (submissionType === 'CONFLUX_VERIFIED') {
      if (!ownerPhotoUrl.trim()) {
        setErrorMessage('Conflux Verified applications require the owner/responsible person original photograph.');
        return;
      }
      if (!storefrontPhotoUrl.trim()) {
        setErrorMessage('Conflux Verified applications require an authentic operating business/storefront photograph.');
        return;
      }
      if (uploadedEvidence.length === 0 && !docNumber.trim() && !evidenceFileData) {
        setErrorMessage('Conflux Verified applications require at least one statutory registration document (e.g. Trade License, FSSAI, GSTIN, MSME Udyam).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let finalEvidence = [...uploadedEvidence];
      if (docNumber.trim() || evidenceFileData) {
        finalEvidence.push({
          id: `doc_${Date.now()}`,
          documentType: selectedDocType,
          documentName: evidenceName.trim() || currentEvidenceGuide.recommendedDoc,
          documentNumber: docNumber.trim() || undefined,
          mimeType: evidenceFileData.includes('data:application/pdf') ? 'application/pdf' : 'image/jpeg',
          fileSizeBytes: evidenceFileData ? Math.round((evidenceFileData.length * 3) / 4) : 1024 * 150,
          uploadedAt: new Date().toISOString(),
          isPrivate: true,
          fileData: evidenceFileData || undefined
        });
      }

      const servicesArray = servicesInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const app = await businessService.submitApplication({
        submissionType,
        businessName: businessName.trim(),
        legalName: legalName.trim() || undefined,
        businessType,
        categoryId,
        categoryName: BUSINESS_CATEGORY_TAXONOMY.find(c => c.id === categoryId)?.name,
        yearEstablished: parseInt(yearEstablished) || 2020,
        description: description.trim(),
        history: history.trim() || undefined,
        services: servicesArray.length > 0 ? servicesArray : ['General Services'],
        district,
        city: city.trim().toLowerCase(),
        landmark: landmark.trim() || undefined,
        fullAddress: fullAddress.trim(),
        premisesType,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        bookingUrl: bookingUrl.trim() || undefined,
        operatingHoursSummary,
        storefrontPhotoUrl: storefrontPhotoUrl.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        ownerPhotoUrl: ownerPhotoUrl.trim() || undefined,
        ownerName: ownerName.trim(),
        ownerRole: ownerRole.trim(),
        ownerPhone: ownerPhone.trim() || phone.trim(),
        ownerEmail: ownerEmail.trim() || email.trim(),
        declarationConfirmed: true,
        noStockImagesConfirmed: true,
        privateEvidence: finalEvidence
      });

      // Telemetry event
      await connectService.logEvent({
        businessId: app.confluxBusinessId || app.id,
        eventType: 'SUBMISSION_COMPLETED',
        channel: 'HUMAN_WEB'
      });

      setSubmissionResult({
        applicationId: app.id,
        confluxBusinessId: app.confluxBusinessId,
        businessName: app.businessName
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 pt-8 font-inter">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 font-mono">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/discover" className="hover:text-blue-600 transition-colors">Discover</Link>
          <span>/</span>
          <span className="text-slate-800">List Your Business</span>
        </nav>

        {/* ── SUCCESS CONFIRMATION SCREEN ─────────────────────────── */}
        {submissionResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-8 text-center max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Application Received
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                {submissionResult.businessName}
              </h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your business application has been recorded in the Conflux intake queue for statutory review and approval.
              </p>
            </div>

            {/* Reference IDs */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Application Reference:</span>
                <span className="font-bold text-slate-900">{submissionResult.applicationId}</span>
              </div>
              {submissionResult.confluxBusinessId && (
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Assigned Conflux ID:</span>
                  <span className="font-bold text-blue-700">{submissionResult.confluxBusinessId}</span>
                </div>
              )}
            </div>

            {/* What Happens Next Explanation */}
            <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-100 text-left space-y-3 text-xs text-slate-700">
              <div className="font-bold text-blue-900 flex items-center gap-2 text-sm font-orbitron">
                <HelpCircle size={16} /> What Happens Next?
              </div>
              <ul className="space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  <strong>Administrative Audit:</strong> Conflux administrators corroborate your business identity and statutory registration credentials against official dockets.
                </li>
                <li>
                  <strong>Private Evidence Security:</strong> Uploaded government certificates and owner identity files remain in the secure vault and are <strong>never published publicly</strong>.
                </li>
                <li>
                  <strong>Public Profile Publishing:</strong> Upon approval, your verified profile is indexed on the Conflux Business Graph with direct phone, WhatsApp, and booking connect channels.
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/discover"
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
              >
                Browse Discover &rarr;
              </Link>
              <button
                onClick={() => setSubmissionResult(null)}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Submit Another Business
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── APPLICATION SUBMISSION FORM ─────────────────────────── */
          <div className="space-y-8">
            
            {/* Hero Header */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest font-mono">
                <Building2 size={16} /> Conflux Business Onboarding
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                List &amp; Verify Your Business on Conflux
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                Establish your official presence on the Conflux Business Graph. Upload authentic business media, control operational details, and receive direct customer inquiries.
              </p>

              {/* Pathway Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                
                {/* Standard Listing Card */}
                <div
                  onClick={() => setSubmissionType('STANDARD_LISTING')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                    submissionType === 'STANDARD_LISTING'
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-orbitron text-slate-900">1. Standard Listing</span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                      Standard Entry
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Essential business profile with business photo, logo, location, contact channels, and core services.
                  </p>
                </div>

                {/* Conflux Verified Card */}
                <div
                  onClick={() => setSubmissionType('CONFLUX_VERIFIED')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                    submissionType === 'CONFLUX_VERIFIED'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-orbitron text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-emerald-600" /> 2. Conflux Verified
                    </span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      High Trust Badge
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Statutory evidence application. Upload owner original photo, business photo, logo, and registration license to earn the <strong>Conflux Verified Trust Badge</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Application Form */}
            <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-8">
              
              {/* SECTION 1: BUSINESS IDENTITY */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-base font-orbitron">
                  <Building2 size={18} className="text-blue-600" /> 1. Business Identity
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Trading / Brand Name *</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. Ranaghat Apex Diagnostic Centre"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Legal Registered Name (if applicable)</label>
                    <input
                      type="text"
                      value={legalName}
                      onChange={e => setLegalName(e.target.value)}
                      placeholder="e.g. Apex Health Diagnostic LLP"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category *</label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none"
                    >
                      <option value="healthcare">Healthcare &amp; Diagnostics</option>
                      <option value="food-hospitality">Restaurants &amp; Dining</option>
                      <option value="fitness-wellness">Gyms &amp; Fitness</option>
                      <option value="services-repairs">Repairs &amp; HVAC Services</option>
                      <option value="tourism-hospitality">Hotels &amp; Lodging</option>
                      <option value="salons-beauty">Salons &amp; Personal Care</option>
                      <option value="handloom-textiles">Handloom &amp; Textiles</option>
                      <option value="agriculture-farming">Agro-Processing &amp; Cold Chain</option>
                      <option value="manufacturing-industrial">Manufacturing &amp; Machining</option>
                      <option value="retail-trade">Retail &amp; Local Store</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Business Type *</label>
                    <select
                      value={businessType}
                      onChange={e => setBusinessType(e.target.value as BusinessType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none"
                    >
                      <option value="LOCAL_BUSINESS">Local Commercial Business</option>
                      <option value="HEALTHCARE">Healthcare &amp; Clinical Centre</option>
                      <option value="HOSPITALITY">Hospitality / Restaurant / Hotel</option>
                      <option value="MANUFACTURER">Manufacturer / Processing Unit</option>
                      <option value="PROFESSIONAL_SERVICE">Professional Service Agency</option>
                      <option value="RETAIL">Retail Store / Merchant</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Year Established</label>
                    <input
                      type="number"
                      value={yearEstablished}
                      onChange={e => setYearEstablished(e.target.value)}
                      placeholder="e.g. 2018"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Key Services / Offerings (Comma Separated) *</label>
                  <input
                    type="text"
                    value={servicesInput}
                    onChange={e => setServicesInput(e.target.value)}
                    placeholder="e.g. Ultrasound (USG), Digital X-Ray, Pathology Blood Tests, Doctor OPD"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    Customers search for specific services. Add your core capabilities so local intent searches match your business.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Comprehensive Business Description *</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Explain what your business offers, operational standards, equipment, specialties, and customer service commitments..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    required
                  />
                </div>
              </div>

              {/* SECTION 2: BUSINESS LOCATION */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-base font-orbitron">
                  <MapPin size={18} className="text-blue-600" /> 2. Operating Location
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">District *</label>
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none"
                    >
                      {WEST_BENGAL_DISTRICTS.map(d => (
                        <option key={d.slug} value={d.slug}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">City / Town *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Ranaghat"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium capitalize"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Premises Type</label>
                    <select
                      value={premisesType}
                      onChange={e => setPremisesType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none"
                    >
                      <option value="COMMERCIAL_COMPLEX">Commercial Complex</option>
                      <option value="STANDALONE_BUILDING">Standalone Building</option>
                      <option value="OWNED">Owned Commercial Property</option>
                      <option value="LEASED">Leased Workshop / Premises</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Local Landmark (e.g. Near Station, Hospital More)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder="e.g. Near Ranaghat Sub-Divisional Hospital Gate"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Physical Operating Address *</label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={e => setFullAddress(e.target.value)}
                    placeholder="e.g. College Road, Near Hospital Gate, Ranaghat, Nadia, West Bengal 741201"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>

              {/* SECTION 3: DIRECT CONTACT & CONNECTIVITY */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-base font-orbitron">
                  <Phone size={18} className="text-blue-600" /> 3. Direct Contact &amp; Connect Channels
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Direct Customer Phone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98300 XXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">WhatsApp Inquiry Number</label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      placeholder="+91 98300 XXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Official Business Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="contact@business.in"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Official Website URL (Optional)</label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourbusiness.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Online Booking / Appointment Link (Optional)</label>
                    <input
                      type="url"
                      value={bookingUrl}
                      onChange={e => setBookingUrl(e.target.value)}
                      placeholder="https://yourbusiness.com/book"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Operating Hours Summary</label>
                    <input
                      type="text"
                      value={operatingHoursSummary}
                      onChange={e => setOperatingHoursSummary(e.target.value)}
                      placeholder="e.g. Mon - Sat: 09:00 AM - 08:00 PM"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 4: BUSINESS MEDIA & PHOTOGRAPHS (BUSINESS PIC + LOGO) ──────────────── */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-base font-orbitron">
                    <Camera size={18} className="text-blue-600" /> 4. Business Photographs &amp; Brand Logo
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {submissionType === 'CONFLUX_VERIFIED' ? 'Business Pic Required' : 'Standard Upload'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-700" /> Anti-Stock Image Guarantee:
                  </div>
                  <p className="leading-relaxed text-[11px] text-amber-800">
                    Upload a real photograph of your exterior storefront, workshop, or clinical premises. Do not upload stock photos or synthetic placeholder graphics.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* 1. BUSINESS PHOTO (STOREFRONT / PREMISES) */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <ImageIcon size={15} className="text-blue-600" /> Business Picture (Storefront / Premises) {submissionType === 'CONFLUX_VERIFIED' && <span className="text-rose-600">*</span>}
                      </label>
                      {storefrontPhotoUrl && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check size={11} /> Photo Loaded
                        </span>
                      )}
                    </div>

                    {storefrontPhotoUrl ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-100 flex items-center justify-center">
                          <img
                            src={storefrontPhotoUrl}
                            alt="Storefront Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setStorefrontPhotoUrl('');
                              setStorefrontPhotoFileName('');
                              if (storefrontFileRef.current) storefrontFileRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white transition-all cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {storefrontPhotoFileName && (
                          <div className="text-[11px] font-mono text-slate-500 truncate">{storefrontPhotoFileName}</div>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => storefrontFileRef.current?.click()}
                        className="h-36 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors p-4 text-center"
                      >
                        <Camera size={24} className="text-slate-400" />
                        <div>
                          <span className="text-xs font-bold text-blue-600 hover:underline">Choose Business Photo</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP (Max 5MB)</p>
                        </div>
                      </div>
                    )}

                    <input
                      ref={storefrontFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageFileUpload(e, setStorefrontPhotoUrl, setStorefrontPhotoFileName)}
                    />

                    {/* Or URL input */}
                    <div className="pt-1">
                      <input
                        type="url"
                        value={storefrontPhotoUrl.startsWith('data:') ? '' : storefrontPhotoUrl}
                        onChange={e => {
                          setStorefrontPhotoUrl(e.target.value);
                          setStorefrontPhotoFileName('');
                        }}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 2. BUSINESS LOGO */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles size={15} className="text-blue-600" /> Business Brand Logo
                      </label>
                      {logoUrl && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check size={11} /> Logo Loaded
                        </span>
                      )}
                    </div>

                    {logoUrl ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-100 flex items-center justify-center p-3">
                          <img
                            src={logoUrl}
                            alt="Logo Preview"
                            className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setLogoUrl('');
                              setLogoFileName('');
                              if (logoFileRef.current) logoFileRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white transition-all cursor-pointer"
                            title="Remove Logo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {logoFileName && (
                          <div className="text-[11px] font-mono text-slate-500 truncate">{logoFileName}</div>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => logoFileRef.current?.click()}
                        className="h-36 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors p-4 text-center"
                      >
                        <Upload size={24} className="text-slate-400" />
                        <div>
                          <span className="text-xs font-bold text-blue-600 hover:underline">Choose Logo File</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG (Square / Transparent)</p>
                        </div>
                      </div>
                    )}

                    <input
                      ref={logoFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageFileUpload(e, setLogoUrl, setLogoFileName)}
                    />

                    {/* Or URL input */}
                    <div className="pt-1">
                      <input
                        type="url"
                        value={logoUrl.startsWith('data:') ? '' : logoUrl}
                        onChange={e => {
                          setLogoUrl(e.target.value);
                          setLogoFileName('');
                        }}
                        placeholder="Or paste logo URL (https://...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 5: OWNER / RESPONSIBLE PERSON (+ OWNER ORIGINAL PHOTO) ──────────────── */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-base font-orbitron">
                    <UserCheck size={18} className="text-blue-600" /> 5. Owner / Responsible Person
                  </div>
                  {submissionType === 'CONFLUX_VERIFIED' && (
                    <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-600" /> Owner Photo Mandatory for Verification
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Legal Name *</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      placeholder="e.g. Tarunjit Biswas"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Role in Business *</label>
                    <input
                      type="text"
                      value={ownerRole}
                      onChange={e => setOwnerRole(e.target.value)}
                      placeholder="e.g. Proprietor / Managing Director / Partner"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Owner Direct Phone *</label>
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={e => setOwnerPhone(e.target.value)}
                      placeholder="+91 98300 XXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Owner Official Email *</label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={e => setOwnerEmail(e.target.value)}
                      placeholder="owner@business.in"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* OWNER'S ORIGINAL PHOTOGRAPH UPLOAD */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Camera size={15} className="text-emerald-600" /> Owner / Responsible Person Original Photo {submissionType === 'CONFLUX_VERIFIED' && <span className="text-rose-600">*</span>}
                    </label>
                    {ownerPhotoUrl && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check size={11} /> Owner Photo Loaded
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Upload a clear portrait photograph of the business owner or designated responsible officer.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {ownerPhotoUrl ? (
                      <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                        <img
                          src={ownerPhotoUrl}
                          alt="Owner Portrait"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setOwnerPhotoUrl('');
                            setOwnerPhotoFileName('');
                            if (ownerPhotoFileRef.current) ownerPhotoFileRef.current.value = '';
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 hover:bg-black text-white cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => ownerPhotoFileRef.current?.click()}
                        className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0 text-center p-2"
                      >
                        <UserCheck size={24} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-emerald-700 leading-tight">Upload Owner Photo</span>
                      </div>
                    )}

                    <div className="space-y-2 flex-1 w-full">
                      <button
                        type="button"
                        onClick={() => ownerPhotoFileRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Upload size={14} /> Choose Portrait Photo
                      </button>

                      {ownerPhotoFileName && (
                        <div className="text-[11px] font-mono text-slate-500">{ownerPhotoFileName}</div>
                      )}

                      <input
                        type="url"
                        value={ownerPhotoUrl.startsWith('data:') ? '' : ownerPhotoUrl}
                        onChange={e => {
                          setOwnerPhotoUrl(e.target.value);
                          setOwnerPhotoFileName('');
                        }}
                        placeholder="Or paste owner photo URL (https://...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <input
                    ref={ownerPhotoFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImageFileUpload(e, setOwnerPhotoUrl, setOwnerPhotoFileName)}
                  />
                </div>
              </div>

              {/* ── SECTION 6: STATUTORY EVIDENCE (CONFLUX VERIFIED PATHWAY) ──────────────── */}
              {submissionType === 'CONFLUX_VERIFIED' && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base font-orbitron">
                      <ShieldCheck size={18} className="text-emerald-600" /> 6. Statutory Evidence &amp; Official Documents
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Lock size={12} /> Private Document Vault
                    </span>
                  </div>

                  {/* Private Security Guarantee */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Lock size={14} className="text-blue-700" /> Strict Document Isolation Guarantee:
                    </div>
                    <p className="leading-relaxed text-[11px] text-blue-900">
                      Uploaded government documents, licenses, and certificates are isolated in the encrypted private evidence vault. They are restricted to authorized administrators and <strong>never exposed on public URLs, profiles, or search APIs</strong>.
                    </p>
                  </div>

                  {/* Dynamic Category Recommendation */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                        Statutory Recommendation ({categoryId}):
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Corroborated by Conflux
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 font-orbitron">
                      {currentEvidenceGuide.recommendedDoc}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Document Type *</label>
                        <select
                          value={selectedDocType}
                          onChange={e => setSelectedDocType(e.target.value as PrivateDocumentType)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none bg-white"
                        >
                          <option value="TRADE_LICENSE">Municipal Trade License</option>
                          <option value="FSSAI">FSSAI FoSCoS Certificate</option>
                          <option value="CLINICAL_ESTABLISHMENT">Clinical Establishment Certificate</option>
                          <option value="MSME_UDYAM">MSME Udyam Registration</option>
                          <option value="GSTIN">GSTIN Registration Docket</option>
                          <option value="TOURISM_REG">Tourism Directorate License</option>
                          <option value="OWNER_ID_PROOF">Owner Govt ID (Aadhaar/PAN/Voter)</option>
                          <option value="OTHER">Other Official Statutory License</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Document / License Number</label>
                        <input
                          type="text"
                          value={docNumber}
                          onChange={e => setDocNumber(e.target.value)}
                          placeholder={currentEvidenceGuide.placeholder}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none font-mono bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Document Label / Title</label>
                        <input
                          type="text"
                          value={evidenceName}
                          onChange={e => setEvidenceName(e.target.value)}
                          placeholder="e.g. 2024-2029 Active License Certificate"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    {/* File Attachment Box */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <FileText size={14} className="text-blue-600" /> Upload Document File (PDF, PNG, JPG)
                        </span>
                        {evidenceFileName && (
                          <span className="text-[11px] font-mono text-emerald-700 font-bold">
                            ✓ {evidenceFileName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => docFileRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Upload size={14} /> Select Document File
                        </button>
                        <span className="text-[11px] text-slate-500">Max size: 10MB per document</span>
                      </div>

                      <input
                        ref={docFileRef}
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={handleDocFileUpload}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddEvidenceDoc}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Attach This Document to Application
                    </button>
                  </div>

                  {/* Attached Documents List */}
                  {uploadedEvidence.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-slate-700 font-mono flex items-center justify-between">
                        <span>Attached Statutory Documents ({uploadedEvidence.length}):</span>
                        <span className="text-emerald-700 font-normal">Ready for private verification</span>
                      </div>
                      <div className="space-y-2">
                        {uploadedEvidence.map(doc => (
                          <div key={doc.id} className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <FileCheck size={18} />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{doc.documentName}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {doc.documentType} {doc.documentNumber ? `• #${doc.documentNumber}` : ''} • Private Vault
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(doc.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove document"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 7: MANDATORY DECLARATIONS */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 pb-2 text-slate-900 font-bold text-base font-orbitron">
                  <CheckCircle2 size={18} className="text-blue-600" /> 7. Declarations &amp; Accuracy Confirmation
                </div>

                <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationConfirmed}
                    onChange={e => setDeclarationConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    required
                  />
                  <span className="text-xs text-slate-800 leading-relaxed font-medium">
                    I confirm that the information submitted is accurate, truthful, and relates to the authorized enterprise identified in this application.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noStockImagesConfirmed}
                    onChange={e => setNoStockImagesConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    required
                  />
                  <span className="text-xs text-slate-800 leading-relaxed font-medium">
                    I confirm that all uploaded photographs represent our actual operating premises and are not stock images or images belonging to another business.
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 text-center sm:text-left">
                  Applications are audited and verified by the Conflux team within 24-48 hours.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting Application...' : 'Submit Application'} <ArrowRight size={16} />
                </button>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
