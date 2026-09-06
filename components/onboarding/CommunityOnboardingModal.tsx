// Conflux Platform — Social Community Onboarding Modal (7 Questions, 1 per Screen)
// Enforces: Real Name (disallows test/demo/anonymous), Real Photo, Connected Neighborhood, Interests, Goals, Bio, Preview.
// Transitions state: ONBOARDING_NOT_STARTED -> ONBOARDING_IN_PROGRESS -> PROFILE_COMPLETE

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Camera,
  MapPin,
  Sparkles,
  ShieldCheck,
  Upload,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  communityProfileService,
  validateRealName,
  validateRealPhoto,
  RANAGHAT_NEIGHBORHOODS,
  COMMUNITY_TOPICS,
  COMMUNITY_GOALS,
  type CommunityProfile
} from '../../lib/communityProfileService';
import { localKnowledgeService } from '../../lib/localKnowledgeService';

interface CommunityOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: CommunityProfile) => void;
  initialLocality?: string;
}

export const CommunityOnboardingModal: React.FC<CommunityOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialLocality = 'Ranaghat'
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 7;

  // Form State
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [locality, setLocality] = useState(RANAGHAT_NEIGHBORHOODS[0]);
  const [customLocality, setCustomLocality] = useState('');
  const [isCustomLocality, setIsCustomLocality] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  // Validation errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [interestsError, setInterestsError] = useState<string | null>(null);
  const [goalsError, setGoalsError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate existing progress if user previously started
  useEffect(() => {
    if (!isOpen) return;
    const existing = communityProfileService.getCommunityProfile();
    if (existing) {
      if (existing.name) setName(existing.name);
      if (existing.photoUrl) setPhotoUrl(existing.photoUrl);
      if (existing.locality) {
        if (RANAGHAT_NEIGHBORHOODS.includes(existing.locality)) {
          setLocality(existing.locality);
          setIsCustomLocality(false);
        } else {
          setCustomLocality(existing.locality);
          setIsCustomLocality(true);
        }
      }
      if (Array.isArray(existing.interests) && existing.interests.length > 0) {
        setSelectedInterests(existing.interests);
      }
      if (Array.isArray(existing.goals) && existing.goals.length > 0) {
        setSelectedGoals(existing.goals);
      }
      if (existing.bio) setBio(existing.bio);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Save intermediate state on close or step transition
  const persistProgress = (customStatus?: 'ONBOARDING_IN_PROGRESS' | 'PROFILE_INCOMPLETE') => {
    const finalLoc = isCustomLocality ? (customLocality.trim() || 'Ranaghat') : locality;
    communityProfileService.saveCommunityProfile({
      name,
      photoUrl,
      locality: finalLoc,
      interests: selectedInterests,
      goals: selectedGoals,
      bio,
      status: customStatus || 'ONBOARDING_IN_PROGRESS'
    });
  };

  const handleClose = () => {
    persistProgress('PROFILE_INCOMPLETE');
    onClose();
  };

  // Step Navigators
  const goToNextStep = () => {
    if (step === 1) {
      const val = validateRealName(name);
      if (!val.valid) {
        setNameError(val.error || 'Please enter a valid real name.');
        return;
      }
      setNameError(null);
    } else if (step === 2) {
      const val = validateRealPhoto(photoUrl);
      if (!val.valid) {
        setPhotoError(val.error || 'Please provide a valid photo.');
        return;
      }
      setPhotoError(null);
    } else if (step === 4) {
      if (selectedInterests.length === 0) {
        setInterestsError('Please select at least one topic you know about.');
        return;
      }
      setInterestsError(null);
    } else if (step === 5) {
      if (selectedGoals.length === 0) {
        setGoalsError('Please select at least one reason for joining.');
        return;
      }
      setGoalsError(null);
    }

    persistProgress('ONBOARDING_IN_PROGRESS');
    setStep(prev => Math.min(totalSteps, prev + 1));
  };

  const goToPrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Selected file must be an image (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoUrl(result);
      setPhotoError(null);
    };
    reader.readAsDataURL(file);
  };

  // Toggle Interest
  const toggleInterest = (interestLabel: string) => {
    setInterestsError(null);
    setSelectedInterests(prev =>
      prev.includes(interestLabel)
        ? prev.filter(i => i !== interestLabel)
        : [...prev, interestLabel]
    );
  };

  // Toggle Goal
  const toggleGoal = (goalLabel: string) => {
    setGoalsError(null);
    setSelectedGoals(prev =>
      prev.includes(goalLabel)
        ? prev.filter(g => g !== goalLabel)
        : [...prev, goalLabel]
    );
  };

  // Final Submit
  const handleCreateProfile = async () => {
    const finalLoc = isCustomLocality ? (customLocality.trim() || 'Ranaghat') : locality;

    // Strict validation
    const nameCheck = validateRealName(name);
    if (!nameCheck.valid) {
      setStep(1);
      setNameError(nameCheck.error || 'Name is invalid.');
      return;
    }

    const photoCheck = validateRealPhoto(photoUrl);
    if (!photoCheck.valid) {
      setStep(2);
      setPhotoError(photoCheck.error || 'Photo is invalid.');
      return;
    }

    if (selectedInterests.length === 0) {
      setStep(4);
      setInterestsError('Please select at least one topic.');
      return;
    }

    // Save complete profile
    const saved = communityProfileService.saveCommunityProfile({
      name: name.trim(),
      photoUrl: photoUrl.trim(),
      locality: finalLoc,
      interests: selectedInterests,
      goals: selectedGoals,
      bio: bio.trim(),
      status: 'PROFILE_COMPLETE'
    });

    // Also register with localKnowledgeService
    try {
      await localKnowledgeService.upsertLocalProfile({
        id: saved.id,
        displayName: saved.name,
        locality: saved.locality,
        bio: saved.bio,
        avatarUrl: saved.photoUrl
      });
    } catch (err) {
      console.warn('[CommunityOnboardingModal] localKnowledgeService sync note:', err);
    }

    onComplete(saved);
  };

  const finalLocalityDisplay = isCustomLocality
    ? (customLocality.trim() ? `${customLocality.trim()}, Ranaghat` : 'Ranaghat')
    : `${locality}, Ranaghat`;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 font-inter text-slate-900">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Progress Tracker */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-medium">
            <span>Question {step} of {totalSteps}</span>
            <span className="text-purple-600 font-bold uppercase tracking-wider">
              {step === 1 && 'Real Name'}
              {step === 2 && 'Photo'}
              {step === 3 && 'Locality'}
              {step === 4 && 'Interests'}
              {step === 5 && 'Goals'}
              {step === 6 && 'Bio'}
              {step === 7 && 'Confirm'}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Dynamic Question Steps */}
        <AnimatePresence mode="wait">
          {/* ── QUESTION 1: REAL NAME ───────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-block">
                  Verified Identity
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-orbitron tracking-tight">
                  What is your real name?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Conflux is built on authentic community trust. We disallow test, placeholder, or anonymous accounts.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="onboarding-real-name" className="text-xs font-bold text-slate-700 block">
                  Full Name (First and Last Name)
                </label>
                <input
                  id="onboarding-real-name"
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="e.g. Rahul Debnath"
                  className={`w-full min-h-[48px] px-4 py-3 rounded-2xl border text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 font-medium ${
                    nameError
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-purple-600'
                  }`}
                />
                {nameError && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle size={14} className="shrink-0" /> {nameError}
                  </p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="min-h-[44px] px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── QUESTION 2: REAL PHOTO ──────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-block">
                  Community Face
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-orbitron tracking-tight">
                  Add a real photo of yourself
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Neighbors trust local reports from real people they recognize. Generated avatars and initials are not allowed.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 space-y-4">
                {photoUrl ? (
                  <div className="relative">
                    <img
                      src={photoUrl}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      onError={() => setPhotoError('Failed to load image. Please provide a valid photo.')}
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold hover:bg-rose-700 shadow"
                      title="Remove Photo"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <Camera size={36} />
                  </div>
                )}

                <div className="text-center space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Upload size={14} /> Upload from Device
                  </button>
                </div>

                <div className="w-full pt-2">
                  <label htmlFor="photo-url-input" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 text-center">
                    Or paste a direct photo link
                  </label>
                  <input
                    id="photo-url-input"
                    type="url"
                    value={photoUrl.startsWith('data:') ? '' : photoUrl}
                    onChange={(e) => {
                      setPhotoUrl(e.target.value);
                      if (photoError) setPhotoError(null);
                    }}
                    placeholder="https://example.com/my-photo.jpg"
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {photoError && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle size={14} className="shrink-0" /> {photoError}
                </p>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="min-h-[44px] px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="min-h-[44px] px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── QUESTION 3: LOCALITY / NEIGHBORHOOD ──────────────────── */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-block">
                  Ranaghat Area
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-orbitron tracking-tight">
                  Which part of Ranaghat do you connect with?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Choose your neighborhood or connected locality in Ranaghat.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {RANAGHAT_NEIGHBORHOODS.map(nh => {
                  const isSelected = !isCustomLocality && locality === nh;
                  return (
                    <button
                      key={nh}
                      type="button"
                      onClick={() => {
                        setLocality(nh);
                        setIsCustomLocality(false);
                      }}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all min-h-[44px] cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{nh}</span>
                      {isSelected && <Check size={14} className="text-purple-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Or enter another Ranaghat neighborhood:
                </label>
                <input
                  type="text"
                  value={customLocality}
                  onFocus={() => setIsCustomLocality(true)}
                  onChange={(e) => {
                    setCustomLocality(e.target.value);
                    setIsCustomLocality(true);
                  }}
                  placeholder="e.g. Joypore, Nokari, etc."
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    isCustomLocality ? 'border-purple-500 ring-2 ring-purple-100' : 'border-slate-300'
                  }`}
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="min-h-[44px] px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="min-h-[44px] px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── QUESTION 4: INTERESTS / WHAT DO YOU KNOW ABOUT? ──────── */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-block">
                  Local Expertise
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-orbitron tracking-tight">
                  What do you know best about Ranaghat?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Select what topics you can help your neighbors with (select one or more).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {COMMUNITY_TOPICS.map(topic => {
                  const isSelected = selectedInterests.includes(topic.label);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleInterest(topic.label)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all min-h-[46px] cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{topic.icon}</span>
                        <span>{topic.label}</span>
                      </span>
                      {isSelected && <Check size={14} className="text-purple-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {interestsError && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle size={14} className="shrink-0" /> {interestsError}
                </p>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="min-h-[44px] px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="min-h-[44px] px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── QUESTION 5: GOALS / WHAT BRINGS YOU HERE? ────────────── */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-block">
                  Community Intent
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-orbitron tracking-tight">
                  What brings you to Conflux?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Tell us what you hope to achieve in the Ranaghat community.
                </p>
              </div>

              <div className="space-y-2.5">
                {COMMUNITY_GOALS.map(goal => {
                  const isSelected = selectedGoals.includes(goal.label);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.label)}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs font-bold transition-all min-h-[50px] cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base">{goal.icon}</span>
                        <span>{goal.label}</span>
                      </span>
                      {isSelected && <Check size={16} className="text-purple-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {goalsError && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle size={14} className="shrink-0" /> {goalsError}
                </p>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="min-h-[44px] px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="min-h-[44px] px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── QUESTION 6: SHORT BIO ───────────────────────────────── */}
          {step === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-block">
                  About You
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-orbitron tracking-tight">
                  Write a short bio
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Optional: A brief sentence or two about your connection to Ranaghat.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={3}
                  maxLength={200}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={`e.g. Resident of ${isCustomLocality ? (customLocality || 'Ranaghat') : locality} for over 8 years, daily commuter on the Sealdah main line.`}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium resize-none"
                />
                <div className="flex justify-end text-[11px] text-slate-400 font-mono">
                  {bio.length} / 200
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="min-h-[44px] px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="min-h-[44px] px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Preview Profile</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── QUESTION 7: PREVIEW & CONFIRMATION ───────────────────── */}
          {step === 7 && (
            <motion.div
              key="step-7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1.5 text-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                  Final Step
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-orbitron tracking-tight">
                  Profile Preview
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Here is how neighbors in Ranaghat will recognize your updates.
                </p>
              </div>

              {/* Profile Card Preview */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 text-white shadow-xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={photoUrl}
                    alt={name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-purple-400/60 shadow"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold font-orbitron text-white">
                        {name}
                      </h3>
                      <ShieldCheck size={16} className="text-emerald-400" />
                    </div>
                    <p className="text-xs text-purple-300 flex items-center gap-1">
                      <MapPin size={12} /> {finalLocalityDisplay}
                    </p>
                  </div>
                </div>

                {bio && (
                  <p className="text-xs text-slate-300 italic leading-relaxed pt-2 border-t border-white/10">
                    "{bio}"
                  </p>
                )}

                {selectedInterests.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {selectedInterests.slice(0, 4).map(int => (
                      <span
                        key={int}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/10 text-purple-200 border border-white/10"
                      >
                        {int}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck size={16} className="text-purple-600 shrink-0" />
                <span>By confirming, you agree to publish honest, factual local ground truth for Ranaghat.</span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="min-h-[44px] px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleCreateProfile}
                  className="min-h-[44px] px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/25 inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Check size={16} />
                  <span>Create My Profile</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
