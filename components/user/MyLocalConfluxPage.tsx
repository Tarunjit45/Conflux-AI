// Conflux Platform — Personalized "My Local Conflux" Dashboard (/my-local)
// Answers: "What matters to me locally?"
// Displays: Primary Locality, Followed Entities, Contributions History, Local Reputation & Badges, Demand Requests.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { businessService } from '../../lib/businessService';
import { ContributionCard } from '../contributions/ContributionCard';
import { CreateContributionModal } from '../contributions/CreateContributionModal';
import { RequestBusinessModal } from '../contributions/RequestBusinessModal';
import type {
  LocalUserProfile,
  LocalContribution,
  UserFollow,
  BusinessDemandRequest,
  LocalMoment
} from '../../types/localKnowledge';
import type { ConfluxBusiness } from '../../types/business';

export const MyLocalConfluxPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [profile, setProfile] = useState<LocalUserProfile | null>(null);
  const [contributions, setContributions] = useState<LocalContribution[]>([]);
  const [follows, setFollows] = useState<UserFollow[]>([]);
  const [requests, setRequests] = useState<BusinessDemandRequest[]>([]);
  const [moments, setMoments] = useState<LocalMoment[]>([]);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<ConfluxBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const primaryLocality = profile?.locality || 'Ranaghat';

  useEffect(() => {
    let isMounted = true;
    const loadUserData = async () => {
      setIsLoading(true);
      const userId = user?.id || 'usr_guest_active';
      try {
        const userProfile = await localKnowledgeService.getLocalProfile(userId);
        if (isMounted) setProfile(userProfile);

        const myContribs = await localKnowledgeService.getContributions({ authorId: userId });
        if (isMounted) setContributions(myContribs);

        const myFollows = await localKnowledgeService.getUserFollowing(userId);
        if (isMounted) setFollows(myFollows);

        const myRequests = await localKnowledgeService.getBusinessRequests(primaryLocality);
        if (isMounted) setRequests(myRequests);

        const localMoments = await localKnowledgeService.getLocalMoments(primaryLocality);
        if (isMounted) setMoments(localMoments);

        const bizResults = await businessService.searchBusinesses({ city: primaryLocality.toLowerCase().trim(), limit: 4 });
        if (isMounted) setNearbyBusinesses(bizResults.map(r => r.business));
      } catch (err) {
        console.warn('[MyLocalConfluxPage] Load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadUserData();
    return () => { isMounted = false; };
  }, [user, primaryLocality]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 font-inter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ── 1. LOCAL IDENTITY HERO ────────────────────────────────── */}
        <header className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-600/20 shrink-0">
              {profile?.displayName?.charAt(0).toUpperCase() || 'L'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold font-orbitron text-slate-900">
                  {profile?.displayName || (isAuthenticated ? user?.email : 'Local Citizen')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-mono">
                  {primaryLocality} Resident
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profile?.explanation || 'Active contributor to verified local knowledge.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                {profile?.reputationBadges.map(badge => (
                  <span
                    key={badge}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    ★ {badge.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={15} />
              <span>Create Contribution</span>
            </button>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Request a Business
            </button>
          </div>
        </header>

        {/* ── 2. LOCAL METRICS SCOREBOARD (UTILITY, NOT POPULARITY) ──── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Local Reputation Score
            </div>
            <div className="text-2xl font-black font-orbitron text-blue-600">
              {profile?.reputationScore || 20} / 100
            </div>
            <div className="text-[11px] text-slate-500">Based on verified contributions</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Contributions Made
            </div>
            <div className="text-2xl font-black font-orbitron text-slate-900">
              {contributions.length}
            </div>
            <div className="text-[11px] text-slate-500">Discoveries &amp; local updates</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Community Confirmations
            </div>
            <div className="text-2xl font-black font-orbitron text-emerald-600">
              {profile?.stats.confirmedUpdatesCount || 0}
            </div>
            <div className="text-[11px] text-slate-500">Corroborated by neighbors</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Followed Entities
            </div>
            <div className="text-2xl font-black font-orbitron text-purple-600">
              {follows.length}
            </div>
            <div className="text-[11px] text-slate-500">Businesses, people &amp; places</div>
          </div>
        </div>

        {/* ── 3. MAIN DASHBOARD CONTENT (2 COLUMNS) ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3): My Contributions & Recent Local Moments */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Contributions */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-orbitron text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  <span>My Contributions ({contributions.length})</span>
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  + New Contribution
                </button>
              </div>

              {contributions.length > 0 ? (
                <div className="space-y-4">
                  {contributions.map(c => (
                    <ContributionCard key={c.id} contribution={c} />
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Compass size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 font-orbitron">No contributions recorded yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Share a newly discovered shop, a road notice, or recommend a local business in {primaryLocality} to start building your local reputation.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    Share Your First Local Discovery
                  </button>
                </div>
              )}
            </section>

            {/* Local Moments in My Locality */}
            {moments.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold font-orbitron text-slate-900 flex items-center gap-2">
                  <Calendar size={18} className="text-purple-600" />
                  <span>Happening in {primaryLocality}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {moments.map(m => (
                    <div key={m.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 uppercase">
                          {m.momentType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {m.startDate}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 font-orbitron line-clamp-2">
                        {m.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {m.summary}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>📍 {m.locationName}</span>
                        <span className="text-emerald-700 font-bold">{m.confirmationsCount} confirmed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (1/3): Followed & Nearby Verified Businesses */}
          <div className="space-y-6">
            {/* Quick Locality Switcher Link */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-200">
                <MapPin size={14} />
                <span>Primary Locality</span>
              </div>
              <h3 className="text-xl font-bold font-orbitron">
                {primaryLocality}
              </h3>
              <p className="text-xs text-blue-100/80 leading-relaxed">
                Explore the complete digital intelligence layer for {primaryLocality} including verified businesses, local voices, and live updates.
              </p>
              <Link
                to={`/locations/west-bengal/nadia/${primaryLocality.toLowerCase()}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-blue-50 transition-all cursor-pointer"
              >
                <span>Visit {primaryLocality} Hub</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Followed Entities */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold font-orbitron text-slate-900 flex items-center justify-between">
                <span>Following</span>
                <span className="text-xs font-mono text-slate-400 font-normal">{follows.length} items</span>
              </h3>
              {follows.length > 0 ? (
                <div className="space-y-2">
                  {follows.map(f => (
                    <div key={f.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{f.targetName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{f.targetType}</div>
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold">Following</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  You are not following any creators or businesses yet. Follow local contributors in Ranaghat to see their updates here.
                </p>
              )}
            </div>

            {/* Nearby Verified Businesses */}
            {nearbyBusinesses.length > 0 && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold font-orbitron text-slate-900 flex items-center justify-between">
                  <span>Verified in {primaryLocality}</span>
                  <Link to="/discover" className="text-xs text-blue-600 font-bold hover:underline">
                    View All
                  </Link>
                </h3>
                <div className="space-y-3">
                  {nearbyBusinesses.map(biz => (
                    <Link
                      key={biz.id}
                      to={`/business/${biz.slug}`}
                      className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all flex items-center justify-between group block"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {biz.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {biz.categoryName || biz.businessType}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Creation and Request Modals */}
      <CreateContributionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultLocality={primaryLocality}
        onSuccess={(newC) => setContributions(prev => [newC, ...prev])}
      />

      <RequestBusinessModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultLocality={primaryLocality}
      />
    </div>
  );
};
