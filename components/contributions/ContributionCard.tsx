// Conflux Platform — Local Contribution Intelligence Card
// Displays structured local contribution, connected entity actions, "How Conflux Knows" trust dossier,
// community confirmations, disputes, ratings (1-5 stars), and discussion comments.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ThumbsUp,
  AlertCircle,
  Star,
  MessageSquare,
  Share2,
  Flag,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Clock,
  Phone,
  Store,
  ChevronDown,
  ChevronUp,
  User,
  Send,
  HelpCircle,
  Sparkles,
  Check,
  Navigation
} from 'lucide-react';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { useAuth } from '../../lib/authContext';
import type { LocalContribution, ContributionComment } from '../../types/localKnowledge';

interface ContributionCardProps {
  contribution: LocalContribution;
  onUpdated?: (updated: LocalContribution) => void;
  onReportClick?: (contributionId: string) => void;
}

export const ContributionCard: React.FC<ContributionCardProps> = ({
  contribution: initialContribution,
  onUpdated,
  onReportClick
}) => {
  const { user } = useAuth();
  const [contribution, setContribution] = useState<LocalContribution>(initialContribution);

  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isDisputing, setIsDisputing] = useState(false);

  const [showTrustDossier, setShowTrustDossier] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<ContributionComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [userRating, setUserRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Handle Community Confirm
  const handleConfirm = async () => {
    if (hasConfirmed || isConfirming) return;
    setIsConfirming(true);
    try {
      const actorId = user?.id || `usr_guest_${Date.now()}`;
      const actorName = user?.fullName || 'Local Resident';
      const updated = await localKnowledgeService.confirmContribution(contribution.id, actorId, actorName);
      setContribution(updated);
      setHasConfirmed(true);
      if (onUpdated) onUpdated(updated);
    } catch {
      // Safe fallback
    } finally {
      setIsConfirming(false);
    }
  };

  // Handle Community Dispute
  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim() || isDisputing) return;
    setIsDisputing(true);
    try {
      const actorId = user?.id || `usr_guest_${Date.now()}`;
      const actorName = user?.fullName || 'Local Resident';
      const updated = await localKnowledgeService.disputeContribution(
        contribution.id,
        actorId,
        disputeReason.trim(),
        actorName
      );
      setContribution(updated);
      setShowDisputeInput(false);
      setDisputeReason('');
      if (onUpdated) onUpdated(updated);
    } catch {
      // Safe fallback
    } finally {
      setIsDisputing(false);
    }
  };

  // Handle 1-5 Star Rating
  const handleRate = async (stars: number) => {
    if (isRating) return;
    setIsRating(true);
    setUserRating(stars);
    try {
      const actorId = user?.id || `usr_guest_${Date.now()}`;
      const res = await localKnowledgeService.rateContribution(contribution.id, actorId, stars);
      setContribution(prev => ({
        ...prev,
        averageRating: res.averageRating,
        ratingsCount: res.ratingsCount
      }));
    } catch {
      // Safe fallback
    } finally {
      setIsRating(false);
    }
  };

  // Load and add comments
  const toggleComments = async () => {
    if (!showComments) {
      setIsLoadingComments(true);
      const loaded = await localKnowledgeService.getComments(contribution.id);
      setComments(loaded);
      setIsLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);

    try {
      const actorId = user?.id || `usr_guest_${Date.now()}`;
      const actorName = user?.fullName || 'Local Resident';
      const comment = await localKnowledgeService.addComment({
        contributionId: contribution.id,
        userId: actorId,
        userDisplayName: actorName,
        content: newCommentText.trim()
      });

      setComments(prev => [...prev, comment]);
      setContribution(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
      setNewCommentText('');
    } catch {
      // Safe fallback
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Share functionality
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/locations/west-bengal/nadia/${contribution.locality}?c=${contribution.id}`;
    if (navigator.share) {
      navigator.share({
        title: contribution.title,
        text: `${contribution.title} — Check this local knowledge update on Conflux AI`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Type badge colors
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DISCOVER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'UPDATE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'RECOMMEND':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'EVENT':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'REVIEW':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'REPORT':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'CORRECTION':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <article className="p-6 sm:p-7 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all font-inter space-y-6">
      {/* ── 1. AUTHOR & METADATA BAR ──────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200/60 flex items-center justify-center font-bold text-blue-700 text-sm shadow-xs">
            {contribution.author.avatarUrl ? (
              <img src={contribution.author.avatarUrl} alt={contribution.author.displayName} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              contribution.author.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                {contribution.author.displayName}
              </span>
              {contribution.author.badge && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {contribution.author.badge.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="capitalize">{contribution.locality}</span>
              <span>&bull;</span>
              <span>{new Date(contribution.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Type Badge & Report */}
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getTypeBadge(contribution.type)}`}>
            {contribution.type}
          </span>
          {onReportClick && (
            <button
              onClick={() => onReportClick(contribution.id)}
              className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
              title="Report inaccurate or inappropriate content"
            >
              <Flag size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. HEADLINE & BODY WITH GENEROUS BREATHING ROOM ────────── */}
      <div className="space-y-2.5">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug font-orbitron tracking-tight">
          {contribution.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {contribution.content}
        </p>
      </div>

      {/* ── 3. EMBEDDED MEDIA (VIDEO / PHOTO) ──────────────────────── */}
      {contribution.media && contribution.media.length > 0 && (
        <div className="space-y-2 pt-1">
          {contribution.media.map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden border border-slate-200 bg-black/5">
              {item.mediaType === 'VIDEO' ? (
                <div className="aspect-video w-full">
                  <iframe
                    src={item.url}
                    title={contribution.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={contribution.title}
                  className="w-full max-h-80 object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── 4. CONNECTED BUSINESS CARD (2-WAY ENTITY CONNECTION) ────── */}
      {contribution.businessRef && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Store size={18} />
            </div>
            <div>
              <div className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                Related Verified Business
              </div>
              <Link
                to={`/business/${contribution.businessRef.slug}`}
                className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
              >
                {contribution.businessRef.name} &rarr;
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/business/${contribution.businessRef.slug}`}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              View Profile
            </Link>
          </div>
        </div>
      )}

      {/* ── 5. "HOW CONFLUX KNOWS" TRUST DOSSIER (TRANSPARENCY UX) ──── */}
      <div className="rounded-2xl bg-slate-50/70 border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTrustDossier(!showTrustDossier)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:bg-slate-100/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-blue-600" />
            <span className="font-mono uppercase text-[11px] tracking-wider">How Conflux Knows</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600 font-semibold font-mono">
              {contribution.verificationState.replace(/_/g, ' ')}
            </span>
          </div>
          {showTrustDossier ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {showTrustDossier && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 pb-5 pt-4 text-xs space-y-3.5 border-t border-slate-200/60"
            >
              <div>
                <strong className="text-slate-700 font-bold block text-[10px] uppercase font-mono tracking-wider">
                  What we know:
                </strong>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">{contribution.trustDossier.whatWeKnow}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <strong className="text-slate-700 font-bold block text-[10px] uppercase font-mono tracking-wider">
                    Source:
                  </strong>
                  <p className="text-slate-600 text-xs mt-0.5">{contribution.trustDossier.source}</p>
                </div>
                <div>
                  <strong className="text-slate-700 font-bold block text-[10px] uppercase font-mono tracking-wider">
                    Last Checked:
                  </strong>
                  <p className="text-slate-600 text-xs mt-0.5">{contribution.trustDossier.lastCheckedDate}</p>
                </div>
              </div>
              <div>
                <strong className="text-slate-700 font-bold block text-[10px] uppercase font-mono tracking-wider">
                  Community Corroboration:
                </strong>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">{contribution.trustDossier.whatCommunitySays}</p>
              </div>
              <div>
                <strong className="text-amber-800 font-bold block text-[10px] uppercase font-mono tracking-wider">
                  What Remains Uncertain:
                </strong>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">{contribution.trustDossier.whatRemainsUncertain}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 6. INTERACTION & ACTION TOOLBAR ────────────────────────── */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Community Confirmation & Dispute */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={hasConfirmed || isConfirming}
            className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 font-bold transition-all cursor-pointer shadow-xs ${
              hasConfirmed
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <CheckCircle2 size={14} className={hasConfirmed ? 'text-emerald-600' : 'text-slate-400'} />
            <span>{hasConfirmed ? 'Confirmed' : 'Confirm True'}</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100">
              {contribution.confirmationsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowDisputeInput(!showDisputeInput)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Dispute or submit correction"
          >
            <AlertCircle size={14} />
          </button>
        </div>

        {/* 1-5 Star Community Rating */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Rate:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRate(star)}
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
                title={`${star} stars`}
              >
                <Star
                  size={15}
                  className={
                    (userRating !== null ? star <= userRating : (contribution.averageRating >= star))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }
                />
              </button>
            ))}
          </div>
          <span className="font-mono font-bold text-xs text-slate-700 ml-1">
            {contribution.ratingsCount > 0 ? `${contribution.averageRating}★ (${contribution.ratingsCount})` : 'Unrated'}
          </span>
        </div>

        {/* Comments & Share */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleComments}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare size={14} />
            <span>Discuss ({contribution.commentsCount})</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer relative"
            title="Share Contribution"
          >
            {copiedShare ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} />}
          </button>
        </div>
      </div>

      {/* ── 7. DISPUTE INPUT BOX (CONDITIONAL) ─────────────────────── */}
      <AnimatePresence>
        {showDisputeInput && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleDispute}
            className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 pt-3"
          >
            <div className="text-xs font-bold text-amber-900">
              Dispute or Inaccuracy Explanation
            </div>
            <p className="text-[11px] text-amber-700">
              Explain why this contribution appears inaccurate or what has changed locally.
            </p>
            <input
              type="text"
              required
              placeholder="e.g., The road is now open as of this morning, or the shop is located at Rathtala not Station Road..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDisputeInput(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-amber-100/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDisputing}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isDisputing ? 'Recording Dispute...' : 'Submit Dispute'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── 8. COMMENTS THREAD (CONDITIONAL) ────────────────────────── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-slate-100 space-y-3"
          >
            <h4 className="text-xs font-bold font-orbitron text-slate-900">
              Community Discussion
            </h4>

            {isLoadingComments ? (
              <p className="text-xs text-slate-400 italic">Loading comments...</p>
            ) : comments.length > 0 ? (
              <div className="space-y-2.5">
                {comments.map((comm) => (
                  <div key={comm.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{comm.userDisplayName}</span>
                      <span className="text-[10px] text-slate-400">{new Date(comm.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600">{comm.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No community comments yet. Start the discussion.</p>
            )}

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                required
                placeholder="Add a constructive local comment or detail..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <Send size={12} />
                <span>Reply</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};
