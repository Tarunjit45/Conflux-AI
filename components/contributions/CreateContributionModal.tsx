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
  color: string;
  badgeColor: string;
}

const CONTRIBUTION_OPTIONS: ContributionTypeOption[] = [
  {
    type: 'DISCOVER',
    title: 'Something I Discovered',
    subtitle: 'A newly opened shop, cafe, clinic, or local landmark',
    icon: Compass,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    type: 'UPDATE',
    title: 'Local Update / Notice',
    subtitle: 'Road construction, market hours, public advisories, timings',
    icon: AlertTriangle,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    type: 'RECOMMEND',
    title: 'Recommend a Business',
    subtitle: 'Factual praise for a reliable local artisan, trader, or doctor',
    icon: Sparkles,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    type: 'EVENT',
    title: 'Local Event or Festival',
    subtitle: 'Durga Puja, cultural festival, exhibition, or tournament',
    icon: Calendar,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    type: 'REVIEW',
    title: 'Customer Experience / Review',
    subtitle: 'Factual customer visit details, pricing, and service quality',
    icon: Store,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
  {
    type: 'REPORT',
    title: 'Report a Problem',
    subtitle: 'Water logging, blocked passage, power cuts, or municipal gaps',
    icon: AlertTriangle,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    badgeColor: 'bg-rose-100 text-rose-800'
  },
  {
    type: 'CORRECTION',
    title: 'Correction / Outdated Info',
    subtitle: 'A business has moved, phone changed, or shop closed',
    icon: HelpCircle,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-800'
  },
  {
    type: 'STORY',
    title: 'Local History or Story',
    subtitle: 'Heritage, folklore, craftsman profiles, community traditions',
    icon: BookOpen,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    badgeColor: 'bg-cyan-100 text-cyan-800'
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

  const selectedOpt = CONTRIBUTION_OPTIONS.find(o => o.type === selectedType);

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Back to options"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-blue-700">
                  Conflux Local Knowledge • {locality}
                </span>
              </div>
              <h2 className="text-lg font-bold font-orbitron text-slate-900">
                {step === 1 ? 'What do you want to share?' : selectedOpt?.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 font-inter">
          {step === 1 ? (
            /* STEP 1: Option Cards */
            <div className="space-y-3">
              <p className="text-xs text-slate-600 mb-2">
                Every useful local contribution turns into structured community signals and evidence for {locality}.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONTRIBUTION_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => handleSelectType(opt.type)}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${opt.color} shrink-0`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {opt.title}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-1">
                            {opt.subtitle}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* STEP 2: Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Title / Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Headline / Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    selectedType === 'DISCOVER' ? 'e.g., New authentic Bengali fish thali restaurant opened' :
                    selectedType === 'UPDATE' ? 'e.g., Road widening work started near Station Platform 1' :
                    selectedType === 'EVENT' ? 'e.g., 2026 Nadia Handloom Weavers Expo' :
                    selectedType === 'CORRECTION' ? 'e.g., Shop moved to opposite Subhas Avenue market' :
                    'Describe clearly what happened or what you observed...'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Locality & Category Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Locality / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Food, Traffic, Health"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Content Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Factual Details &amp; Observation *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide useful specifics: location landmark, timings, what is verified, or what remains uncertain..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Link to Existing Business (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Connect to Business (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Creates a 2-way entity signal</span>
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- No specific business (General local contribution) --</option>
                  {availableBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.location.locality || b.location.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* External Media & Links */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Video size={14} className="text-blue-600" />
                  <span>External Content / Media Link</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="url"
                      placeholder="YouTube Video / Shorts link"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Embeds privacy-enhanced video</span>
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="Photo / Image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Genuine photo of location</span>
                  </div>
                </div>
                <div>
                  <input
                    type="url"
                    placeholder="Public Post / Notice URL (Facebook, Instagram, News)"
                    value={externalPostUrl}
                    onChange={(e) => setExternalPostUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Original public source link for citation</span>
                </div>
              </div>

              {/* Author & Provenance */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name / Credit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your Display Name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Source Provenance
                  </label>
                  <select
                    value={provenance}
                    onChange={(e) => setProvenance(e.target.value as ContributionProvenance)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="FIRST_HAND_CITIZEN">First-Hand Citizen Observation</option>
                    <option value="COMMUNITY_OBSERVATION">Community Word of Mouth</option>
                    <option value="OFFICIAL_NOTICE">Official Authority Notice</option>
                    <option value="BUSINESS_PROPRIETOR">Business Proprietor</option>
                    <option value="FIELD_VERIFIED">Field Checked</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Change Category
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Recording Signal...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Contribution</span>
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
