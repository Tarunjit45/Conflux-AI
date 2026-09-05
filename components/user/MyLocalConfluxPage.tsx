// Conflux Platform — Human Citizen Local Profile (/my-local)
// Follows Section 13: The profile should feel human, not like an analytics dashboard.
// Layout: [Profile Photo] • Rahul • Ranaghat, Nadia • "> Helping people find useful information around Ranaghat."
// Standing: Trusted Local • Local Trust Score: 78 / 100
// Impact: 42 people helped • 18 contributions • 12 confirmations (only show metrics that exist, zero fabrication)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ShieldCheck,
  Award,
  Sparkles,
  Plus,
  Compass,
  Store,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  MessageSquare,
  Edit3,
  Heart,
  CheckCircle2,
  Share2,
  Check
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { businessService } from '../../lib/businessService';
import { ContributionCard } from '../contributions/ContributionCard';
import { CreateContributionModal } from '../contributions/CreateContributionModal';
import { RequestBusinessModal } from '../contributions/RequestBusinessModal';
import { UserOnboardingFlow } from '../auth/UserOnboardingFlow';
import { getContributorStanding } from '../../types/localKnowledge';
import type {
  LocalUserProfile,
  LocalContribution,
  UserFollow,
  BusinessDemandRequest,
  LocalMoment
} from '../../types/localKnowledge';
import type { ConfluxBusiness } from '../../types/business';

export const MyLocalConfluxPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<LocalUserProfile | null>(null);
  const [contributions, setContributions] = useState<LocalContribution[]>([]);
  const [follows, setFollows] = useState<UserFollow[]>([]);
  const [requests, setRequests] = useState<BusinessDemandRequest[]>([]);
  const [moments, setMoments] = useState<LocalMoment[]>([]);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<ConfluxBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const primaryLocality = profile?.locality || 'Ranaghat';

  const loadUserData = async () => {
    setIsLoading(true);
    const userId = user?.id || (typeof localStorage !== 'undefined' && localStorage.getItem('conflux_local_user_id')) || 'usr_guest_active';
    try {
      const userProfile = await localKnowledgeService.getLocalProfile(userId);
      setProfile(userProfile);

      const myContribs = await localKnowledgeService.getContributions({ authorId: userId });
      setContributions(myContribs);

      const myFollows = await localKnowledgeService.getUserFollowing(userId);
      setFollows(myFollows);

      const myRequests = await localKnowledgeService.getBusinessRequests(primaryLocality);
      setRequests(myRequests);

      const localMoments = await localKnowledgeService.getLocalMoments(primaryLocality);
      setMoments(localMoments);

      const bizResults = await businessService.searchBusinesses({ city: primaryLocality.toLowerCase().trim(), limit: 4 });
      setNearbyBusinesses(bizResults.map(r => r.business));
    } catch (err) {
      console.warn('[MyLocalConfluxPage] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user, primaryLocality]);

  const handleShareProfile = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${profile?.displayName || 'Local Contributor'} on Conflux AI`,
        text: `View ${profile?.displayName || 'Local Contributor'}'s local profile and verified contributions in ${primaryLocality}.`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const standing = getContributorStanding({
    reputationScore: profile?.reputationScore,
    locality: primaryLocality,
    stats: profile?.stats
  });

  const stats = profile?.stats;
  const peopleHelped = stats?.peopleHelpedCount || 0;
  const totalContributions = contributions.length || stats?.contributionsCount || 0;
  const confirmations = stats?.confirmedUpdatesCount || 0;
  const discoveries = stats?.verifiedDiscoveriesCount || 0;
  const corrections = stats?.helpfulCorrectionsCount || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 md:pt-28 pb-20 font-inter text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* ── 1. HUMAN PROFILE CARD (SECTION 13) ────────────────────────── */}
        <header className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Profile Photo / Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md shadow-blue-600/20 shrink-0 overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  profile?.displayName?.charAt(0).toUpperCase() || 'L'
                )}
              </div>

              {/* Name, Locality, Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
                    {profile?.displayName || (isAuthenticated ? user?.email : 'Local Resident')}
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin size={14} className="text-blue-600 shrink-0" />
                  <span>{primaryLocality}, Nadia</span>
                </div>

                {/* Human bio quote */}
                <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed pt-1">
                  &ldquo;{profile?.bio || `Helping people find useful information around ${primaryLocality}.`}&rdquo;
                </p>
              </div>
            </div>

            {/* Actions: Edit & Share */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsOnboardingModalOpen(true)}
                className="min-h-[44px] px-4 py-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={handleShareProfile}
                className="min-h-[44px] px-3.5 py-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Share Profile"
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Local Trust Score & Standing Badge */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Local Trust Score
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-orbitron text-blue-700">
                    {profile?.reputationScore || 20}
                  </span>
                  <span className="text-xs font-mono text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block" />

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Community Standing
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${standing.badgeClass}`}>
                  <ShieldCheck size={14} />
                  <span>{standing.label}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer self-stretch sm:self-auto"
            >
              <Plus size={16} />
              <span>Share Local Update</span>
            </button>
          </div>

          {/* Simple Impact Indicators (Only non-zero genuine metrics) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2.5">
              Verified Impact
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {peopleHelped > 0 && (
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <Heart size={13} className="text-emerald-600" />
                  <span>{peopleHelped} people helped</span>
                </span>
              )}

              {totalContributions > 0 && (
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5">
                  <FileText size={13} className="text-slate-600" />
                  <span>{totalContributions} contributions</span>
                </span>
              )}

              {confirmations > 0 && (
                <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-blue-600" />
                  <span>{confirmations} confirmations</span>
                </span>
              )}

              {discoveries > 0 && (
                <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-600" />
                  <span>{discoveries} discoveries</span>
                </span>
              )}

              {corrections > 0 && (
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                  <Award size={13} className="text-amber-600" />
                  <span>{corrections} corrections</span>
                </span>
              )}

              {peopleHelped === 0 && totalContributions === 0 && (
                <span className="text-xs text-slate-400 italic">
                  New contributor to {primaryLocality}. Share your first update or discovery below.
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── 2. CONTRIBUTIONS STREAM ─────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-orbitron text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <span>Contributions ({contributions.length})</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Helpful answers, business updates, verified discoveries, and local notices.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              + Add Update
            </button>
          </div>

          {contributions.length > 0 ? (
            <div className="space-y-4">
              {contributions.map(c => (
                <ContributionCard
                  key={c.id}
                  contribution={c}
                  onUpdated={() => loadUserData()}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Compass size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 font-orbitron">
                No contributions shared yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Know about a newly opened shop, road maintenance, medical timing, or weekly market in {primaryLocality}? Share your first authentic update to build your Local Trust Score.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Plus size={15} />
                <span>Share First Local Discovery</span>
              </button>
            </div>
          )}
        </section>

        {/* ── 3. LOCALITY CONTEXT & DISCOVERIES ──────────────────────── */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <h3 className="text-sm font-bold font-orbitron text-slate-900">
                Connected to {primaryLocality} Local Hub
              </h3>
            </div>
            <Link
              to={`/locations/west-bengal/nadia/${primaryLocality.toLowerCase()}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Explore {primaryLocality}</span>
              <ChevronRight size={13} />
            </Link>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your contributions directly strengthen the open local knowledge graph for {primaryLocality}. Every confirmed fact helps residents make better daily decisions without commercial bias.
          </p>
        </div>

      </div>

      {/* Onboarding & Edit Profile Modal */}
      <AnimatePresence>
        {isOnboardingModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOnboardingModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-md my-auto">
              <UserOnboardingFlow
                isModal={true}
                initialLocality={primaryLocality}
                onClose={() => setIsOnboardingModalOpen(false)}
                onComplete={() => {
                  setIsOnboardingModalOpen(false);
                  loadUserData();
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Contribution Modal */}
      <CreateContributionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultLocality={primaryLocality}
        onSuccess={(newC) => {
          setContributions(prev => [newC, ...prev]);
          loadUserData();
        }}
      />

      {/* Request Business Modal */}
      <RequestBusinessModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultLocality={primaryLocality}
      />
    </div>
  );
};
