// Conflux Platform — Guided Step-by-Step Local Contribution Flow (/contribute)
// Principle: ONE SCREEN → ONE DECISION → ONE ACTION → NEXT SCREEN
// Calm, civic-utility experience. Zero gamification, zero clutter.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info, Building2, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
  ShieldCheck, AlertCircle, Link2, Sparkles, Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { useAuth } from '../../lib/authContext';
import type { ContributionType } from '../../types/localKnowledge';

type ContributionCategory = 'LOCAL_INFO' | 'BUSINESS' | 'PLACE_SERVICE' | 'CORRECTION';

export const ContributePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1: Choose Type -> 2: Where -> 3: Details -> 4: Source & Submitter -> 5: Success Status
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [category, setCategory] = useState<ContributionCategory | null>(null);

  // Form State
  const [locality, setLocality] = useState('Ranaghat');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [contributorName, setContributorName] = useState(user?.fullName || '');
  const [contributorEmail, setContributorEmail] = useState(user?.email || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const handleSelectCategory = (cat: ContributionCategory) => {
    setCategory(cat);
    if (cat === 'BUSINESS') {
      // If adding a full business, direct cleanly to the business onboarding wizard
      navigate('/list-business');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(2);
  };

  const handleNext = () => {
    setErrorMessage(null);

    if (currentStep === 2) {
      if (!locality.trim()) {
        setErrorMessage('Please enter the city, town, or locality.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!title.trim() || title.trim().length < 3) {
        setErrorMessage('Please provide a brief, clear title for this information.');
        return;
      }
      if (!content.trim() || content.trim().length < 10) {
        setErrorMessage('Please provide more details (at least 10 characters).');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let mappedType: ContributionType = 'UPDATE';
      if (category === 'PLACE_SERVICE') mappedType = 'DISCOVER';
      if (category === 'CORRECTION') mappedType = 'CORRECTION';

      const authorName = contributorName.trim() || user?.fullName || 'Local Resident';
      const authorId = user?.id || `usr_guest_${Date.now()}`;

      const res = await localKnowledgeService.createContribution({
        type: mappedType,
        title: title.trim(),
        content: content.trim(),
        locality: locality.trim(),
        externalPostUrl: sourceUrl.trim() || undefined,
        provenance: 'CITIZEN_OBSERVATION',
        author: {
          id: authorId,
          displayName: authorName,
          locality: locality.trim()
        }
      });

      setSubmissionId(res.id);
      setIsSubmitting(false);
      setCurrentStep(5);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Unable to submit contribution. Please try again.');
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-[85vh] bg-slate-50 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-inter text-slate-900">
      <div className="max-w-2xl mx-auto">
        
        {/* Progress indicator (Only during active steps 1 to 4) */}
        {currentStep < 5 && (
          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>
                {currentStep === 1 && 'What to add'}
                {currentStep === 2 && 'Location'}
                {currentStep === 3 && 'Information'}
                {currentStep === 4 && 'Source & Review'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-700 h-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">

          {/* ── STEP 1: CHOOSE CONTRIBUTION TYPE ────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  Contribute
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-950">
                  Help improve local information
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Know something about your area that should be here? Share it with Conflux.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-700 block">
                  What would you like to add?
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('LOCAL_INFO')}
                    className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left transition-all group cursor-pointer space-y-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Info size={18} />
                    </div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                      Local Information
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Schedules, public notices, transit updates, or community alerts.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCategory('BUSINESS')}
                    className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left transition-all group cursor-pointer space-y-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Building2 size={18} />
                    </div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                      Business
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      List a local clinic, shop, artisan, or professional service.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCategory('PLACE_SERVICE')}
                    className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left transition-all group cursor-pointer space-y-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <MapPin size={18} />
                    </div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                      Place / Service
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Public facilities, landmarks, repair centers, or local amenities.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCategory('CORRECTION')}
                    className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left transition-all group cursor-pointer space-y-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <AlertCircle size={18} />
                    </div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                      Correction
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Correct an outdated phone number, incorrect address, or closed status.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: WHERE IS IT? ───────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  Location
                </span>
                <h2 className="text-2xl font-bold text-slate-950">
                  Where is it?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Enter the town, municipality, or neighborhood this information applies to.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">
                  City, town, or locality *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={locality}
                    onChange={e => setLocality(e.target.value)}
                    placeholder="e.g. Ranaghat, Krishnanagar, Kalyani"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                    autoFocus
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: WHAT IS THE INFORMATION? ────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  Details
                </span>
                <h2 className="text-2xl font-bold text-slate-950">
                  What is the information?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Provide factual, clear details that will help local residents and visitors.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Title or Headline *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Subhas Avenue Market weekly closing hours"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Details &amp; Description *
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Provide specific details, timings, landmarks, or contact notes..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium leading-relaxed"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: ADD SOURCE IF AVAILABLE & SUBMIT ───────────── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  Verification &amp; Source
                </span>
                <h2 className="text-2xl font-bold text-slate-950">
                  Add a source if available
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Help us verify this information faster. This can be an official link, notice, or personal visit.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Source Link or Reference (Optional)
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={e => setSourceUrl(e.target.value)}
                      placeholder="https://... or Municipal notice link"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                    />
                  </div>
                </div>

                {!user && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block">
                      Your Contact (to notify you when approved)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={contributorName}
                        onChange={e => setContributorName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                      <input
                        type="email"
                        value={contributorEmail}
                        onChange={e => setContributorEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900">{title}</div>
                <div className="text-slate-600 line-clamp-2">{content}</div>
                <div className="text-blue-700 font-medium">{locality}</div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Contribution</span>
                      <Check size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: STATUS & NEXT STEPS ────────────────────────── */}
          {currentStep === 5 && (
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-slate-950">
                  Your contribution has been submitted
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Conflux will review the information and verification sources to ensure factual accuracy.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Status: Under review</span>
              </div>

              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Once reviewed against local records, this update will be published to the {locality} local directory and knowledge graph.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/discover"
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all"
                >
                  Explore Local Directory
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setContent('');
                    setSourceUrl('');
                    setCurrentStep(1);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                >
                  Add Another Update
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ContributePage;
