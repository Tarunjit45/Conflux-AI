// Conflux Platform — Fast, Mobile-First Local Contribution Creation Modal
// Step 1: "What do you want to share?" → Step 2: Contextual, relevant fields only.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Compass,
  Sparkles,
  AlertTriangle,
  Building2,
  Calendar,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Link2,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Store,
  Send,
  Loader2
} from 'lucide-react';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { businessService } from '../../lib/businessService';
import { useAuth } from '../../lib/authContext';
import type { ContributionType, LocalContribution, ContributionProvenance } from '../../types/localKnowledge';
import type { ConfluxBusiness } from '../../types/business';

interface CreateContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contribution: LocalContribution) => void;
  onCreated?: (contribution: LocalContribution) => void;
  defaultLocality?: string;
  defaultLocalityName?: string;
  defaultBusinessId?: string;
  defaultBusinessType?: string;
}

interface ContributionTypeOption {
  type: ContributionType;
  title: string;
  subtitle: string;
  icon: any;
  tier: 'POPULAR' | 'GROUND_TRUTH' | 'COMMUNITY';
  repReward: string;
  pillText: string;
  iconBg: string;
  iconColor: string;
  borderHover: string;
  badgeBg: string;
  badgeText: string;
}

const CONTRIBUTION_OPTIONS: ContributionTypeOption[] = [
  // ── TIER 1: POPULAR & HIGH-IMPACT ACTIONS ──────────────────────────
  {
    type: 'DISCOVER',
    title: 'Discover a Place / Hidden Gem',
    subtitle: 'A newly opened shop, cafe, specialty clinic, or local landmark',
    icon: Compass,
    tier: 'POPULAR',
    repReward: '+15 Rep',
    pillText: 'PLACE DISCOVERY',
    iconBg: 'bg-emerald-50 border border-emerald-200/80',
    iconColor: 'text-emerald-700',
    borderHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
    badgeBg: 'bg-emerald-100/80',
    badgeText: 'text-emerald-800'
  },
  {
    type: 'RECOMMEND',
    title: 'Recommend a Real Business',
    subtitle: 'Factual praise for a reliable local artisan, trader, or doctor',
    icon: Sparkles,
    tier: 'POPULAR',
    repReward: '+10 Rep',
    pillText: 'MERCHANT SPOTLIGHT',
    iconBg: 'bg-amber-50 border border-amber-200/80',
    iconColor: 'text-amber-700',
    borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
    badgeBg: 'bg-amber-100/80',
    badgeText: 'text-amber-800'
  },
  {
    type: 'UPDATE',
    title: 'Local Field Update / Notice',
    subtitle: 'Road construction, market hours, public advisories, timings',
    icon: AlertTriangle,
    tier: 'POPULAR',
    repReward: '+10 Rep',
    pillText: 'TIMELY INTEL',
    iconBg: 'bg-sky-50 border border-sky-200/80',
    iconColor: 'text-sky-700',
    borderHover: 'hover:border-sky-400 hover:shadow-sky-500/10',
    badgeBg: 'bg-sky-100/80',
    badgeText: 'text-sky-800'
  },

  // ── TIER 2: GROUND TRUTH & FACT CHECKING ────────────────────────────
  {
    type: 'REPORT',
    title: 'Report a Hazard / Civic Issue',
    subtitle: 'Water logging, blocked passage, power cuts, or civic gaps',
    icon: AlertTriangle,
    tier: 'GROUND_TRUTH',
    repReward: '+10 Rep',
    pillText: 'CIVIC ALERT',
    iconBg: 'bg-rose-50 border border-rose-200/80',
    iconColor: 'text-rose-700',
    borderHover: 'hover:border-rose-400 hover:shadow-rose-500/10',
    badgeBg: 'bg-rose-100/80',
    badgeText: 'text-rose-800'
  },
  {
    type: 'CORRECTION',
    title: 'Suggest a Factual Correction',
    subtitle: 'A business has moved, phone changed, or shop permanently closed',
    icon: HelpCircle,
    tier: 'GROUND_TRUTH',
    repReward: '+20 Rep',
    pillText: 'FACT CHECKER',
    iconBg: 'bg-teal-50 border border-teal-200/80',
    iconColor: 'text-teal-700',
    borderHover: 'hover:border-teal-400 hover:shadow-teal-500/10',
    badgeBg: 'bg-teal-100/80',
    badgeText: 'text-teal-800'
  },
  {
    type: 'REVIEW',
    title: 'Direct Experience Review',
    subtitle: 'Factual customer visit details, pricing, quality, and service',
    icon: Store,
    tier: 'GROUND_TRUTH',
    repReward: '+5 Rep',
    pillText: 'GENUINE VISIT',
    iconBg: 'bg-indigo-50 border border-indigo-200/80',
    iconColor: 'text-indigo-700',
    borderHover: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
    badgeBg: 'bg-indigo-100/80',
    badgeText: 'text-indigo-800'
  },
  {
    type: 'INFORM',
    title: 'Local News & Field Report',
    subtitle: 'Factual neighborhood development or verified local report',
    icon: Building2,
    tier: 'GROUND_TRUTH',
    repReward: '+10 Rep',
    pillText: 'NEWS SIGNAL',
    iconBg: 'bg-blue-50 border border-blue-200/80',
    iconColor: 'text-blue-700',
    borderHover: 'hover:border-blue-400 hover:shadow-blue-500/10',
    badgeBg: 'bg-blue-100/80',
    badgeText: 'text-blue-800'
  },

  // ── TIER 3: COMMUNITY, CULTURE & QUESTIONS ──────────────────────────
  {
    type: 'EVENT',
    title: 'Local Event or Festival',
    subtitle: 'Durga Puja, cultural festival, exhibition, or tournament',
    icon: Calendar,
    tier: 'COMMUNITY',
    repReward: '+10 Rep',
    pillText: 'CALENDAR',
    iconBg: 'bg-purple-50 border border-purple-200/80',
    iconColor: 'text-purple-700',
    borderHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
    badgeBg: 'bg-purple-100/80',
    badgeText: 'text-purple-800'
  },
  {
    type: 'STORY',
    title: 'Local Heritage & Stories',
    subtitle: 'Heritage, folklore, craftsman profiles, community traditions',
    icon: BookOpen,
    tier: 'COMMUNITY',
    repReward: '+10 Rep',
    pillText: 'HERITAGE',
    iconBg: 'bg-cyan-50 border border-cyan-200/80',
    iconColor: 'text-cyan-700',
    borderHover: 'hover:border-cyan-400 hover:shadow-cyan-500/10',
    badgeBg: 'bg-cyan-100/80',
    badgeText: 'text-cyan-800'
  },
  {
    type: 'QUESTION',
    title: 'Ask the Locality',
    subtitle: 'Ask neighbors for directions, recommendations, or local advice',
    icon: MessageSquare,
    tier: 'COMMUNITY',
    repReward: '+5 Rep',
    pillText: 'QUESTION',
    iconBg: 'bg-amber-50 border border-amber-200/80',
    iconColor: 'text-amber-800',
    borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
    badgeBg: 'bg-amber-100/80',
    badgeText: 'text-amber-900'
  }
];

export const CreateContributionModal: React.FC<CreateContributionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onCreated,
  defaultLocality = 'Ranaghat',
  defaultLocalityName,
  defaultBusinessId
}) => {
  const { user } = useAuth();

  // Step 1: Select Type, Step 2: Fill Details
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<ContributionType>('DISCOVER');

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [locality, setLocality] = useState(defaultLocality);
  const [category, setCategory] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [externalPostUrl, setExternalPostUrl] = useState('');
  const [provenance, setProvenance] = useState<ContributionProvenance>('FIRST_HAND_CITIZEN');

  // Business linkage
  const [selectedBusinessId, setSelectedBusinessId] = useState(defaultBusinessId || '');
  const [availableBusinesses, setAvailableBusinesses] = useState<ConfluxBusiness[]>([]);
  const [authorName, setAuthorName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user?.fullName) {
      setAuthorName(user.fullName);
    } else if (user?.email) {
      setAuthorName(user.email.split('@')[0]);
    }
  }, [user]);

  useEffect(() => {
    if (defaultBusinessId) {
      setSelectedBusinessId(defaultBusinessId);
    }
  }, [defaultBusinessId]);

  useEffect(() => {
    let isMounted = true;
    const loadBusinesses = async () => {
      try {
        const results = await businessService.searchBusinesses({ city: locality.toLowerCase().trim() });
        if (isMounted) {
          setAvailableBusinesses(results.map(r => r.business));
        }
      } catch {
        // Safe fallback
      }
    };
    if (isOpen) {
      loadBusinesses();
    }
    return () => { isMounted = false; };
  }, [locality, isOpen]);

  if (!isOpen) return null;

  const handleSelectType = (t: ContributionType) => {
    setSelectedType(t);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please provide a descriptive headline.');
      return;
    }
    if (content.trim().length < 10) {
      setErrorMessage('Please share more details (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const authorId = user?.id || `usr_guest_${Date.now()}`;
      const finalAuthorName = authorName.trim() || user?.fullName || 'Local Resident';

      const contribution = await localKnowledgeService.createContribution({
        type: selectedType,
        title: title.trim(),
        content: content.trim(),
        locality: locality.trim(),
        category: category.trim() || undefined,
        businessId: selectedBusinessId || undefined,
        videoUrl: videoUrl.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        externalPostUrl: externalPostUrl.trim() || undefined,
        provenance,
        author: {
          id: authorId,
          displayName: finalAuthorName,
          locality: locality.trim()
        }
      });

      setIsSubmitting(false);
      if (onSuccess) onSuccess(contribution);
      if (onCreated) onCreated(contribution);
      onClose();

      // Reset form
      setStep(1);
      setTitle('');
      setContent('');
      setVideoUrl('');
      setImageUrl('');
      setExternalPostUrl('');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to submit contribution. Please try again.');
    }
  };

  const popularOptions = CONTRIBUTION_OPTIONS.filter(o => o.tier === 'POPULAR');
  const groundTruthOptions = CONTRIBUTION_OPTIONS.filter(o => o.tier === 'GROUND_TRUTH');
  const communityOptions = CONTRIBUTION_OPTIONS.filter(o => o.tier === 'COMMUNITY');
  const SelectedIcon = selectedOpt?.icon || Compass;

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200/90 flex flex-col max-h-[90vh]"
      >
        {/* ── MODAL HEADER WITH GENEROUS PADDING & WHITESPACE ────── */}
        <div className="px-7 sm:px-8 py-6 border-b border-slate-100 bg-slate-50/80 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-2 rounded-xl hover:bg-slate-200/80 text-slate-600 transition-colors cursor-pointer"
                  title="Back to categories"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-blue-700">
                    Conflux Local Intelligence • {locality}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
                  {step === 1 ? 'What do you want to share?' : selectedOpt?.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-all cursor-pointer shrink-0"
              title="Close modal"
            >
              <X size={22} />
            </button>
          </div>

          {/* Progress Bar & Subtitle */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-2 flex-1">
              <div className={`h-2 flex-1 rounded-full transition-all ${step === 1 ? 'bg-blue-600' : 'bg-emerald-500'}`} />
              <div className={`h-2 flex-1 rounded-full transition-all ${step === 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 shrink-0">
              {step === 1 ? 'Step 1 of 2: Select Intent' : 'Step 2 of 2: Details & Evidence'}
            </span>
          </div>
        </div>

        {/* ── MODAL BODY WITH AMPLE BREATHING ROOM ───────────────── */}
        <div className="p-7 sm:p-9 overflow-y-auto flex-1 font-inter">
          {step === 1 ? (
            /* ───────────────────────────────────────────────────────── */
            /* STEP 1: SPACIOUS TIERED INTENTS & CARDS                   */
            /* ───────────────────────────────────────────────────────── */
            <div className="space-y-9">
              {/* Locality Prompt Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-100 flex items-start gap-4 shadow-xs">
                <Compass size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Every contribution turns into <strong className="font-semibold text-slate-900">verifiable local intelligence</strong> for {locality}. Select an intent below to establish ground truth.
                </p>
              </div>

              {/* TIER 1: POPULAR & FEATURED ACTIONS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black font-mono tracking-wider text-slate-600 uppercase flex items-center gap-2">
                    <Sparkles size={15} className="text-amber-500" /> Featured &amp; High-Frequency Signals
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">High Visibility</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {popularOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => handleSelectType(opt.type)}
                        className={`p-5 sm:p-6 rounded-3xl border border-slate-200/90 bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${opt.borderHover}`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-2xl ${opt.iconBg} ${opt.iconColor}`}>
                              <Icon size={20} />
                            </div>
                            <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full ${opt.badgeBg} ${opt.badgeText}`}>
                              {opt.repReward}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                              {opt.title}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
                              {opt.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-600">
                          <span>{opt.pillText}</span>
                          <ChevronRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TIER 2: GROUND TRUTH & FACT CHECKING */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black font-mono tracking-wider text-slate-600 uppercase flex items-center gap-2">
                    <ShieldCheck size={15} className="text-blue-500" /> Facts &amp; Operational Ground Truth
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">High Utility</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groundTruthOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => handleSelectType(opt.type)}
                        className={`p-5 rounded-2xl border border-slate-200/90 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left flex items-start justify-between gap-4 group cursor-pointer ${opt.borderHover}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl ${opt.iconBg} ${opt.iconColor} shrink-0`}>
                            <Icon size={19} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {opt.title}
                              </span>
                              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${opt.badgeBg} ${opt.badgeText}`}>
                                {opt.repReward}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {opt.subtitle}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TIER 3: COMMUNITY, CULTURE & QUESTIONS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black font-mono tracking-wider text-slate-600 uppercase flex items-center gap-2">
                    <Calendar size={15} className="text-purple-500" /> Community, Culture &amp; Life
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Local Archive</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {communityOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => handleSelectType(opt.type)}
                        className={`p-5 rounded-2xl border border-slate-200/90 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left flex items-start justify-between gap-4 group cursor-pointer ${opt.borderHover}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl ${opt.iconBg} ${opt.iconColor} shrink-0`}>
                            <Icon size={19} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {opt.title}
                              </span>
                              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${opt.badgeBg} ${opt.badgeText}`}>
                                {opt.repReward}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {opt.subtitle}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ───────────────────────────────────────────────────────── */
            /* STEP 2: SPACIOUS FORM DETAILS WITH STRUCTURED BLOCKS      */
            /* ───────────────────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Selected Intent Summary Banner with Ample Padding */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-emerald-50/80 border border-blue-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-2xl ${selectedOpt?.iconBg} ${selectedOpt?.iconColor}`}>
                    <SelectedIcon size={22} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
                      Intent: {selectedOpt?.title}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">{selectedOpt?.subtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  Change
                </button>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-3">
                  <AlertTriangle size={18} className="shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ── BLOCK 1: THE CORE SIGNAL ──────────────────────── */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Compass size={15} className="text-blue-600" /> 1. Signal Headline &amp; Details
                  </span>
                  <span className="text-xs text-rose-500 font-bold">* Required</span>
                </div>

                {/* Title / Headline */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Headline / Summary
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedType === 'DISCOVER' ? 'e.g., New authentic Bengali fish thali restaurant opened' :
                      selectedType === 'UPDATE' ? 'e.g., Road widening work started near Station Platform 1' :
                      selectedType === 'EVENT' ? 'e.g., 2026 Nadia Handloom Weavers Expo' :
                      selectedType === 'CORRECTION' ? 'e.g., Shop moved to opposite Subhas Avenue market' :
                      selectedType === 'REPORT' ? 'e.g., Waterlogging near Ranaghat Bus Stand after rain' :
                      selectedType === 'RECOMMEND' ? 'e.g., Trusted watch repair technician with 20 years experience' :
                      'Describe clearly what happened or what you observed...'
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-slate-50/40 focus:bg-white transition-all shadow-xs"
                  />
                </div>

                {/* Locality & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Locality / Town
                    </label>
                    <input
                      type="text"
                      required
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/40 focus:bg-white shadow-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Category Tag (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dining, Transit, Health, Civic"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/40 focus:bg-white shadow-xs"
                    />
                  </div>
                </div>

                {/* Content Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Factual Observation &amp; Specifics
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Min. 10 chars</span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide useful specifics: location landmark, timings, what is verified, or what remains uncertain..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base sm:text-sm leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/40 focus:bg-white transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* ── BLOCK 2: CONNECT TO LOCAL ENTITY ─────────────── */}
              <div className="p-6 sm:p-7 rounded-3xl bg-blue-50/40 border border-blue-100 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                    <Store size={15} className="text-blue-600" /> 2. Connect to Local Business / Entity
                  </span>
                  <span className="text-xs font-mono text-blue-600">Optional 2-way Link</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Attaching this signal to a registered business embeds it directly into the business profile and community evidence ledger.
                </p>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs mt-1"
                >
                  <option value="">-- No specific business (General local contribution) --</option>
                  {availableBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.location.locality || b.location.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* ── BLOCK 3: EVIDENCE & MEDIA PROVENANCE ─────────── */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-50/80 border border-slate-200/90 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Video size={15} className="text-purple-600" /> 3. Supporting Evidence &amp; Media Links
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Optional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">
                      Video Link (YouTube / Vimeo)
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-base sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Embeds privacy-enhanced video</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">
                      Photo / Image Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-base sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Genuine photo of location</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-slate-600">
                    Public Post / Official Notice Citation URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/... or official circular link"
                    value={externalPostUrl}
                    onChange={(e) => setExternalPostUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-base sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>
              </div>

              {/* ── BLOCK 4: ATTRIBUTION & TRUTH PROVENANCE ──────── */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-50/80 border border-slate-200/90 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-emerald-600" /> 4. Contributor Attribution &amp; Source
                  </span>
                  <span className="text-xs text-emerald-700 font-bold font-mono">Verified Ledger</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Your Name / Display Credit *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tarunjit / Local Resident"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Your Relationship / Provenance
                    </label>
                    <select
                      value={provenance}
                      onChange={(e) => setProvenance(e.target.value as ContributionProvenance)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-base sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
                    >
                      <option value="FIRST_HAND_CITIZEN">First-Hand Citizen Eyewitness</option>
                      <option value="COMMUNITY_OBSERVATION">Local Resident Word of Mouth</option>
                      <option value="OFFICIAL_NOTICE">Official Authority Notice</option>
                      <option value="BUSINESS_PROPRIETOR">Business Proprietor</option>
                      <option value="FIELD_VERIFIED">Field Checked / On-Site</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200/70 text-xs text-slate-600 leading-relaxed mt-2">
                  🛡️ <strong>Truth Invariant:</strong> New citizen submissions begin as <span className="font-mono text-slate-800 font-semibold">UNVERIFIED</span> and reach <span className="font-mono text-emerald-700 font-semibold">COMMUNITY_CORROBORATED</span> through neighbor confirmations. Zero bot ratings or paid placement.
                </div>
              </div>

              {/* ── SUBMIT FOOTER WITH AMPLE BREATHING ROOM ───────── */}
              <div className="pt-6 mt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Recording Signal...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Publish Local Signal ({selectedOpt?.repReward})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
