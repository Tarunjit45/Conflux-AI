// Conflux Platform — Simple Community Post Composer Modal
// Gated strictly to verified profiles (PROFILE_COMPLETE)
// Simple fields: What happened? Details? Where? Optional Photo? Optional Source/Link?
// Upon submission shows: "Thanks. Your update has been submitted for community review."

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Camera,
  Link2,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Radio,
  ShieldCheck
} from 'lucide-react';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import {
  communityProfileService,
  RANAGHAT_NEIGHBORHOODS,
  type CommunityProfile
} from '../../lib/communityProfileService';
import type { LocalContribution } from '../../types/localKnowledge';

interface CommunityPostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contribution: LocalContribution) => void;
  onCreated?: (contribution: LocalContribution) => void;
  locality?: string;
}

export const CommunityPostComposerModal: React.FC<CommunityPostComposerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onCreated,
  locality = 'ranaghat'
}) => {
  const profile: CommunityProfile | null = communityProfileService.getCommunityProfile();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState(profile?.locality || 'Station Road');
  const [imageUrl, setImageUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceName, setSourceName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Selected file must be an image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!profile) {
      setErrorMessage('Please complete your community profile before submitting updates.');
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage('Please provide a descriptive headline (at least 3 characters).');
      return;
    }

    if (!content.trim() || content.trim().length < 10) {
      setErrorMessage('Please provide more details for your neighbors (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const contribution = await localKnowledgeService.createContribution({
        type: 'UPDATE',
        title: title.trim(),
        content: content.trim(),
        locality: locality.toLowerCase().trim(),
        imageUrl: imageUrl.trim() || undefined,
        externalPostUrl: sourceUrl.trim() || undefined,
        category: 'Transit & Civic Updates',
        provenance: 'FIRST_HAND_CITIZEN',
        status: 'PUBLISHED', // or PENDING_MODERATION
        author: {
          id: profile.id,
          displayName: profile.name,
          avatarUrl: profile.photoUrl,
          locality: locationName.trim() || profile.locality || 'Ranaghat'
        }
      });

      setIsSubmitting(false);
      setShowSuccessMessage(true);

      if (onSuccess) onSuccess(contribution);
      if (onCreated) onCreated(contribution);

      // Dismiss after showing success message
      setTimeout(() => {
        setShowSuccessMessage(false);
        setTitle('');
        setContent('');
        setImageUrl('');
        setSourceUrl('');
        setSourceName('');
        onClose();
      }, 1800);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to submit your update. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 font-inter text-slate-900">
        {/* Close Button */}
        <button
          type="button"
          disabled={isSubmitting || showSuccessMessage}
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {showSuccessMessage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10 text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 font-orbitron">
                Thanks. Your update has been submitted for community review.
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your post will appear on the Live Local Ranaghat feed for your neighbors to see.
              </p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1.5 mb-2">
                <Radio size={12} className="text-purple-600 animate-pulse" /> Live Ground Truth
              </span>
              <h2 className="text-2xl font-black text-slate-900 font-orbitron tracking-tight">
                Share an Update
              </h2>
              <p className="text-xs text-slate-500">
                Post verified train notices, road advisories, power cuts, or civic alerts in Ranaghat.
              </p>
            </div>

            {/* Author Badge */}
            {profile && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-cover border border-purple-300"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    {profile.name} <ShieldCheck size={14} className="text-emerald-600" />
                  </p>
                  <p className="text-slate-500 font-medium">
                    Posting as verified resident • {profile.locality}
                  </p>
                </div>
              </div>
            )}

            {/* What Happened? (Title) */}
            <div className="space-y-1.5">
              <label htmlFor="post-title" className="text-xs font-bold text-slate-700 block">
                What happened? (Headline) <span className="text-rose-500">*</span>
              </label>
              <input
                id="post-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sealdah-Ranaghat Local delayed by 15 mins due to signal work"
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
              />
            </div>

            {/* Details (Content) */}
            <div className="space-y-1.5">
              <label htmlFor="post-content" className="text-xs font-bold text-slate-700 block">
                Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="post-content"
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide accurate, useful facts so neighbors know what to expect..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium resize-none"
              />
            </div>

            {/* Where? (Neighborhood) */}
            <div className="space-y-1.5">
              <label htmlFor="post-location" className="text-xs font-bold text-slate-700 block">
                Where in Ranaghat? <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  id="post-location"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
                >
                  {RANAGHAT_NEIGHBORHOODS.map(nh => (
                    <option key={nh} value={nh}>{nh}</option>
                  ))}
                  <option value="Other Area">Other Ranaghat Area</option>
                </select>
              </div>
            </div>

            {/* Optional Photo */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera size={14} className="text-purple-600" /> Optional Photo
                </span>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[11px] text-rose-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-40">
                  <img src={imageUrl} alt="Upload preview" className="w-full h-36 object-cover" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
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
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={14} /> Attach Photo
                  </button>
                  <input
                    type="url"
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste image URL"
                    className="flex-1 min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              )}
            </div>

            {/* Optional Source/Link */}
            <div className="space-y-1.5">
              <label htmlFor="post-source" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Link2 size={14} className="text-purple-600" /> Optional Source or Link
              </label>
              <input
                id="post-source"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="e.g. https://er.indianrailways.gov.in or official notice link"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Share with Community</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
