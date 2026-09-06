// Conflux Platform — Conversational Citizen Onboarding Flow
// Principle: ONE USER → ONE QUESTION → ONE ACTION → NEXT STEP
// Mobile-first, >=44px touch targets, >=16px text on inputs to prevent mobile browser zoom.
// Zero fake engagement, zero complicated reputation jargon.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, MapPin, User, Compass, Sparkles, X } from 'lucide-react';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { connectService } from '../../lib/connectService';
import { useAuth } from '../../lib/authContext';
import { useNavigate } from 'react-router-dom';

const POPULAR_LOCALITIES = [
  'Ranaghat',
  'Birnagar',
  'Santipur',
  'Krishnanagar',
  'Kalyani',
  'Habibpur'
];

const TOPIC_OPTIONS = [
  'Food & Heritage Sweets',
  'Local Shops & Markets',
  'Transit & Train Routes',
  'Healthcare & Pharmacies',
  'Festivals & Community Events'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
];

interface UserOnboardingFlowProps {
  onClose?: () => void;
  onComplete?: (profileId: string) => void;
  initialLocality?: string;
  isModal?: boolean;
}

export const UserOnboardingFlow: React.FC<UserOnboardingFlowProps> = ({
  onClose,
  onComplete,
  initialLocality = 'Ranaghat',
  isModal = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  // Form State
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [locality, setLocality] = useState(initialLocality);
  const [customLocality, setCustomLocality] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [bio, setBio] = useState(`Helping people find useful information around ${initialLocality}.`);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [contactValue, setContactValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track ONBOARDING_STARTED on mount
  useEffect(() => {
    connectService.logEvent({
      businessId: 'conflux_identity',
      eventType: 'ONBOARDING_STARTED',
      channel: 'HUMAN_WEB'
    });
  }, []);

  // Update bio placeholder when locality changes
  useEffect(() => {
    const loc = customLocality.trim() || locality;
    if (loc && (!bio || bio.startsWith('Helping people find useful information'))) {
      setBio(`Helping people find useful information around ${loc}.`);
    }
  }, [locality, customLocality]);

  const handleNextStep = (stepNumber: number) => {
    connectService.logEvent({
      businessId: 'conflux_identity',
      eventType: 'ONBOARDING_STEP_COMPLETED',
      channel: 'HUMAN_WEB'
    });
    setStep(stepNumber + 1);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const finalLocality = customLocality.trim() || locality.trim() || 'Ranaghat';
    const finalDisplayName = displayName.trim() || 'Local Resident';
    const finalBio = bio.trim() || `Helping people find useful information around ${finalLocality}.`;
    const userId = user?.id || (typeof localStorage !== 'undefined' && localStorage.getItem('conflux_local_user_id')) || `usr_resident_${Date.now()}`;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('conflux_local_user_id', userId);
    }

    try {
      // Telemetry: Locality Selected
      connectService.logEvent({
        businessId: 'conflux_identity',
        eventType: 'LOCALITY_SELECTED',
        channel: 'HUMAN_WEB'
      });

      if (selectedAvatar) {
        connectService.logEvent({
          businessId: 'conflux_identity',
          eventType: 'PROFILE_PHOTO_ADDED',
          channel: 'HUMAN_WEB'
        });
      }

      // Upsert profile in local knowledge service
      const savedProfile = await localKnowledgeService.upsertLocalProfile({
        id: userId,
        displayName: finalDisplayName,
        locality: finalLocality,
        bio: finalBio,
        avatarUrl: selectedAvatar || undefined
      });

      // Submit verification proposal if contact is provided
      if (contactValue.trim().length >= 5) {
        await localKnowledgeService.createVerificationRequest({
          userId,
          displayName: finalDisplayName,
          locality: finalLocality,
          bio: finalBio,
          avatarUrl: selectedAvatar || undefined,
          contactMethod: 'WHATSAPP',
          contactValue: contactValue.trim(),
          notes: 'Submitted during conversational citizen onboarding.'
        });
      }

      // Telemetry: Profile Created & Onboarding Completed
      connectService.logEvent({
        businessId: 'conflux_identity',
        eventType: 'PROFILE_CREATED',
        channel: 'HUMAN_WEB'
      });

      connectService.logEvent({
        businessId: 'conflux_identity',
        eventType: 'ONBOARDING_COMPLETED',
        channel: 'HUMAN_WEB'
      });

      if (onComplete) {
        onComplete(savedProfile.id);
      } else {
        navigate('/my-local');
      }

      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('[UserOnboardingFlow] Completion error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full ${isModal ? '' : 'min-h-[80vh] flex items-center justify-center p-4 sm:p-6'}`}>
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 font-inter text-slate-900 relative">
        {/* Modal Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}

        {/* Progress Bar & Header */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono font-medium">
            <span>Step {step} of {totalSteps}</span>
            <span className="capitalize">{step === 1 ? 'Your Name' : step === 2 ? 'Your Locality' : step === 3 ? 'Local Focus' : 'Profile'}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Dynamic Step Content: ONE QUESTION AT A TIME */}
        <AnimatePresence mode="wait">
          {/* STEP 1: What is your name? */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-slate-900">
                  What is your name?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  How neighbors and local businesses will recognize your helpful updates.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="onboarding-name" className="text-xs font-bold text-slate-700 block">
                  Your Full or Display Name
                </label>
                <input
                  id="onboarding-name"
                  type="text"
                  autoFocus
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rahul Debnath"
                  className="w-full min-h-[48px] px-4 py-3 rounded-2xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <button
                type="button"
                disabled={!displayName.trim()}
                onClick={() => handleNextStep(1)}
                className="w-full min-h-[44px] py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Where do you live? */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-slate-900">
                  Where do you live?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Connect with updates, trusted people, and real businesses around your locality.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Select your town or neighborhood
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_LOCALITIES.map((loc) => {
                    const isSelected = locality === loc && !customLocality;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setLocality(loc);
                          setCustomLocality('');
                        }}
                        className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-600/20'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                          {loc}
                        </span>
                        {isSelected && <Check size={14} className="text-blue-600" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Or type another locality / town..."
                    value={customLocality}
                    onChange={(e) => setCustomLocality(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="min-h-[44px] px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNextStep(2)}
                  className="flex-1 min-h-[44px] py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: What kind of local information do you know best? (Optional) */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-slate-900">
                    What do you know best?
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Optional
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Select topics you frequently share tips or updates about in {customLocality || locality}.
                </p>
              </div>

              <div className="space-y-2">
                {TOPIC_OPTIONS.map((topic) => {
                  const isChecked = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`w-full min-h-[44px] px-4 py-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-600/10'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Compass size={14} className={isChecked ? 'text-blue-600' : 'text-slate-400'} />
                        {topic}
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="min-h-[44px] px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNextStep(3)}
                  className="flex-1 min-h-[44px] py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{selectedTopics.length > 0 ? 'Continue' : 'Skip & Continue'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Bio & Avatar (Optional) */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-slate-900">
                  Ready to join {customLocality || locality}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Add a short note explaining how you help your community.
                </p>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Choose a profile avatar (optional)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0 overflow-hidden">
                    {selectedAvatar ? (
                      <img src={selectedAvatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(selectedAvatar === av ? '' : av)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedAvatar === av ? 'border-blue-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt="Preset avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio / Motivation */}
              <div className="space-y-2">
                <label htmlFor="onboarding-bio" className="text-xs font-bold text-slate-700 block">
                  Your Local Focus
                </label>
                <textarea
                  id="onboarding-bio"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={`Helping people find useful information around ${customLocality || locality}.`}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium resize-none"
                />
              </div>

              {/* Verification Contact (Optional) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="onboarding-contact" className="text-xs font-bold text-slate-700 block">
                    WhatsApp or Phone (Optional)
                  </label>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    For Resident Verification
                  </span>
                </div>
                <input
                  id="onboarding-contact"
                  type="tel"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder="e.g. 9876543210 (Optional)"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
                <p className="text-[11px] text-slate-400 leading-tight">
                  Our local community moderation team will verify your resident status so you can post live updates.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="min-h-[44px] px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinish}
                  className="flex-1 min-h-[44px] py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>{isSubmitting ? 'Saving Profile...' : 'Complete My Profile'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
