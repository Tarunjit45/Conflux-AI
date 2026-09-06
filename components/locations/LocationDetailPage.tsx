import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NADIA_LOCATIONS, OTHER_MAJOR_WB_LOCATIONS, WEST_BENGAL_DISTRICTS } from '../../data/locationsData';
import { STATIC_ARTICLES, getArticlesByDistrict } from '../../data/articlesData';
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Building2,
  BookOpen,
  FileCheck,
  Phone,
  Search,
  Compass,
  ArrowUpRight,
  Store,
  Plus,
  Users,
  Award,
  AlertTriangle,
  Calendar,
  ThumbsUp,
  Flame,
  Radio,
  Share2,
  Briefcase
} from 'lucide-react';
import { trackLocationEvent } from '../../lib/locationAnalytics';
import { businessService } from '../../lib/businessService';
import { localKnowledgeService } from '../../lib/localKnowledgeService';
import { CreateContributionModal } from '../contributions/CreateContributionModal';
import { ContributionCard } from '../contributions/ContributionCard';
import { RequestBusinessModal } from '../contributions/RequestBusinessModal';
import { RanaghatVisitorPrompt } from './RanaghatVisitorPrompt';
import { CreateJobModal } from './CreateJobModal';
import { UserOnboardingFlow } from '../auth/UserOnboardingFlow';
import { getContributorStanding } from '../../types/localKnowledge';
import type { LocalContribution, LocalUserProfile, LocalMoment, ContributionType, LocalJob, JobType } from '../../types/localKnowledge';
import type { ConfluxBusiness } from '../../types/business';
import type { ArticleKnowledgeObject } from '../../types/article';

const LocationDetailPage: React.FC = () => {
  const { districtSlug, citySlug } = useParams<{ districtSlug: string; citySlug: string }>();
  
  const allLocations = [...NADIA_LOCATIONS, ...OTHER_MAJOR_WB_LOCATIONS];
  const location = allLocations.find(l => l.slug === citySlug && l.districtSlug === districtSlug);
  const parentDistrict = WEST_BENGAL_DISTRICTS.find(d => d.slug === districtSlug);
  const isRanaghat = location?.slug === 'ranaghat';

  const [localBusinesses, setLocalBusinesses] = useState<ConfluxBusiness[]>([]);
  const [contributions, setContributions] = useState<LocalContribution[]>([]);
  const [moments, setMoments] = useState<LocalMoment[]>([]);
  const [localVoices, setLocalVoices] = useState<LocalUserProfile[]>([]);
  const [jobs, setJobs] = useState<LocalJob[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);

  // Local Knowledge UI state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isVisitorPromptOpen, setIsVisitorPromptOpen] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState<'ALL' | JobType>('ALL');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [activeContribTab, setActiveContribTab] = useState<'ALL' | ContributionType>('ALL');

  // Trigger Ranaghat Visitor Entry Prompt if not dismissed during this session
  useEffect(() => {
    if (location && location.slug === 'ranaghat') {
      if (typeof sessionStorage !== 'undefined') {
        const dismissed = sessionStorage.getItem('conflux_ranaghat_prompt_dismissed');
        if (!dismissed) {
          const timer = setTimeout(() => {
            setIsVisitorPromptOpen(true);
          }, 1200);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [location]);

  // Load local verified businesses from Business Graph
  useEffect(() => {
    let isMounted = true;
    const loadBusinesses = async () => {
      if (!location) return;
      setIsLoadingBusinesses(true);
      try {
        const [bizResults, contribList, momentList, voiceList, jobsList] = await Promise.all([
          businessService.searchBusinesses({
            district: districtSlug,
            city: location.slug
          }),
          localKnowledgeService.getContributions({ locality: location.slug }),
          localKnowledgeService.getLocalMoments(location.slug),
          localKnowledgeService.getLocalVoices(location.slug, 8),
          localKnowledgeService.getJobs({ locality: location.slug })
        ]);

        const matched = bizResults.map(r => r.business);

        if (isMounted) {
          setLocalBusinesses(matched);
          setContributions(contribList);
          setMoments(momentList);
          setLocalVoices(voiceList);
          setJobs(jobsList);
        }
      } catch (err) {
        console.warn('[LocationDetailPage] Error loading local businesses or contributions:', err);
        if (isMounted) {
          setLocalBusinesses([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingBusinesses(false);
        }
      }
    };

    loadBusinesses();
    return () => {
      isMounted = false;
    };
  }, [districtSlug, location]);

  // Curate locality-specific and district articles
  const districtArticles = parentDistrict ? getArticlesByDistrict(parentDistrict.slug) : [];
  
  const relevantArticles: ArticleKnowledgeObject[] = STATIC_ARTICLES.filter(a => {
    if (a.status && a.status !== 'PUBLISHED') return false;
    if (!location) return false;

    const locId = location.id.toLowerCase();
    const locSlug = location.slug.toLowerCase();
    const locName = location.name.toLowerCase();

    const hasLocId = (a.localityIds || []).some(id => id.toLowerCase() === locId || id.toLowerCase() === `loc-${locSlug}`);
    const hasLocationId = (a.locationIds || []).some(id => id.toLowerCase() === locId || id.toLowerCase() === `loc-${locSlug}`);
    const hasLocalityName = (a.localities || []).some(l => l.toLowerCase().includes(locName));
    const hasSlugMatch = a.slug.toLowerCase().includes(locSlug);
    const hasTitleMatch = a.title.toLowerCase().includes(locName);

    return hasLocId || hasLocationId || hasLocalityName || hasSlugMatch || hasTitleMatch;
  });

  const displayedArticles = relevantArticles.length >= 2
    ? relevantArticles
    : [...relevantArticles, ...districtArticles.filter(da => !relevantArticles.some(ra => ra.id === da.id))].slice(0, 4);

  const filteredContributions = contributions.filter(c => {
    if (activeContribTab !== 'ALL' && c.type !== activeContribTab) {
      return false;
    }
    if (localSearchQuery.trim()) {
      const q = localSearchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchBody = c.content.toLowerCase().includes(q);
      const matchBiz = c.businessRef?.name?.toLowerCase().includes(q);
      const matchPlace = c.placeRef?.name?.toLowerCase().includes(q);
      const matchAuthor = c.author?.displayName?.toLowerCase().includes(q);
      const matchCategory = c.category?.toLowerCase().includes(q);
      return matchTitle || matchBody || matchBiz || matchPlace || matchAuthor || matchCategory;
    }
    return true;
  });

  const filteredJobs = jobs.filter(j => {
    if (jobTypeFilter !== 'ALL' && j.jobType !== jobTypeFilter) {
      return false;
    }
    if (localSearchQuery.trim()) {
      const q = localSearchQuery.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        (j.area && j.area.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredBusinesses = localBusinesses.filter(biz => {
    if (localSearchQuery.trim()) {
      const q = localSearchQuery.toLowerCase();
      return (
        biz.name.toLowerCase().includes(q) ||
        (biz.categoryName && biz.categoryName.toLowerCase().includes(q)) ||
        (biz.description && biz.description.toLowerCase().includes(q)) ||
        (biz.location?.fullAddress && biz.location.fullAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredVoices = localVoices.filter(voice => {
    // Invariant: Only verified residents with active verification status appear in Trusted People
    if (!voice.isVerifiedResident || voice.verificationStatus !== 'VERIFIED') {
      return false;
    }
    if (localSearchQuery.trim()) {
      const q = localSearchQuery.toLowerCase();
      return (
        voice.displayName.toLowerCase().includes(q) ||
        (voice.bio && voice.bio.toLowerCase().includes(q)) ||
        (voice.locality && voice.locality.toLowerCase().includes(q))
      );
    }
    return true;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location) {
      document.title = location.metaTitle || `Local Business Visibility & Verification in ${location.name} | Conflux AI`;
      
      const canonicalUrl = `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}`;
      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonicalUrl);

      trackLocationEvent('page_view', `locations/west-bengal/${districtSlug}/${location.slug}`);
    }
  }, [districtSlug, citySlug, location]);

  if (!location || location.status !== 'PUBLISHED') {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 text-center bg-white flex flex-col items-center justify-center gap-6 font-inter">
        <h1 className="text-4xl font-black text-slate-900 font-orbitron">Location Page Not Found</h1>
        <p className="text-slate-500 max-w-md">The requested location page is not published or is under technical data review.</p>
        <Link to="/locations/west-bengal" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">
          Return to West Bengal Directory
        </Link>
      </div>
    );
  }

  // Get nearby locations
  const nearbyLocations = allLocations.filter(
    l => location.nearbyLocationSlugs?.includes(l.slug) && l.status === 'PUBLISHED'
  );

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 font-inter">
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}#webpage`,
              "url": `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}`,
              "name": location.metaTitle,
              "description": location.metaDescription,
              "publisher": { "@type": "Organization", "name": "Conflux AI", "url": "https://confluxai.in/" }
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" },
                { "@type": "ListItem", "position": 2, "name": "West Bengal", "item": "https://confluxai.in/locations/west-bengal" },
                { "@type": "ListItem", "position": 3, "name": parentDistrict?.name || 'District', "item": `https://confluxai.in/locations/west-bengal/${districtSlug}` },
                { "@type": "ListItem", "position": 4, "name": location.name, "item": `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}` }
              ]
            },
            ...(localBusinesses.length > 0 ? [{
              "@type": "ItemList",
              "name": `Verified Local Businesses in ${location.name}`,
              "description": `Authoritative directory of verified local businesses, manufacturers, clinics, and distributors in ${location.name}, ${parentDistrict?.name || 'Nadia'}.`,
              "itemListElement": localBusinesses.map((biz, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": {
                  "@type": "LocalBusiness",
                  "name": biz.name,
                  "legalName": biz.legalName || biz.name,
                  "description": biz.shortSummary || biz.description,
                  "url": `https://confluxai.in/business/${biz.slug}`,
                  "telephone": biz.contact.phone,
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": biz.location.fullAddress,
                    "addressLocality": location.name,
                    "addressRegion": "West Bengal",
                    "postalCode": biz.location.postalCode,
                    "addressCountry": "IN"
                  }
                }
              }))
            }] : []),
            ...(location.verifiedEntities && location.verifiedEntities.length > 0 ? [{
              "@type": "ItemList",
              "name": `Verified Entities and Statutory Registries in ${location.name}`,
              "description": `Statutory registrations and accredited records verified by Conflux AI for ${location.name}, ${parentDistrict?.name || 'Nadia'}.`,
              "itemListElement": location.verifiedEntities.map((ent, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "name": ent.name,
                "description": ent.claimSummary,
                "url": `https://confluxai.in${ent.verifyQueryUrl}`
              }))
            }] : []),
            ...(location.faqs && location.faqs.length > 0 ? [{
              "@type": "FAQPage",
              "mainEntity": location.faqs.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.answer }
              }))
            }] : [])
          ]
        })}
      </script>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-8 uppercase tracking-wider flex-wrap">
          <Link to="/" className="text-slate-400 hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/locations/west-bengal" className="text-blue-600 hover:underline">West Bengal</Link>
          <span>/</span>
          <Link to={`/locations/west-bengal/${districtSlug}`} className="text-blue-600 hover:underline">{parentDistrict?.name || 'District'}</Link>
          <span>/</span>
          <span className="text-slate-900">{location.name}</span>
        </nav>

        {/* Hero Header */}
        <div className="max-w-5xl mb-16">
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold tracking-widest uppercase inline-flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-600" />
              {location.type} • {parentDistrict?.name} District
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
              {localBusinesses.length} Verified Local Businesses
            </span>
            <Link
              to={`/locations/west-bengal/${districtSlug}`}
              className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
            >
              Part of {parentDistrict?.name} Corridor &rarr;
            </Link>
          </div>

          {isRanaghat ? (
            <div className="space-y-3 mb-6">
              <h1 className="font-orbitron text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Ranaghat
              </h1>
              <p className="text-xl md:text-2xl font-bold text-blue-600 font-orbitron">
                Your trusted local guide to Ranaghat
              </p>
            </div>
          ) : (
            <h1 className="font-orbitron text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              {location.h1Title || `Local Business Visibility, Verification & Automation in ${location.name}`}
            </h1>
          )}
          
          <p className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed mb-8">
            {location.summary}
          </p>

          {/* Quick Locality Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <a
              href="#live-local"
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <Radio size={14} className="text-purple-600 animate-pulse" /> Live Local ({moments.filter(m => m.status === 'ACTIVE').length + contributions.length})
            </a>
            <a
              href="#jobs"
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <Briefcase size={14} className="text-emerald-600" /> Local Jobs ({jobs.length})
            </a>
            <a
              href="#trusted-people"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <Users size={14} className="text-slate-600" /> Trusted People ({localVoices.length})
            </a>
            <a
              href="#trusted-businesses"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/10 flex items-center gap-1.5 min-h-[44px]"
            >
              <Store size={14} /> Verified Businesses ({localBusinesses.length})
            </a>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto min-h-[44px]"
            >
              <Plus size={14} /> Share Contribution
            </button>
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              Request a Business
            </button>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              <strong className="block text-slate-900 font-bold mb-1">Local Intelligence &amp; Truth Network in {location.name}</strong>
              Conflux AI connects people, verified businesses, places, and local updates in {location.name}. Every contribution turns into structured community signals and evidence to help neighbors discover and decide with confidence.
            </div>
          </div>
        </div>

        {/* ── LOCAL INTELLIGENCE SEARCH ───────────────────────────────── */}
        <section id="locality-search" className="mb-16">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Search size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold font-orbitron text-slate-900 uppercase tracking-wider">
                {isRanaghat ? 'Search Ranaghat Community & Verified Directory' : `Search ${location.name} Local Intelligence`}
              </h3>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder={isRanaghat ? "What do you want to know about Ranaghat? Search shops, jobs, road notices, or people..." : `Search verified shops, doctors, road updates, or moments in ${location.name}...`}
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-slate-50/50 min-h-[44px]"
              />
              {localSearchQuery && (
                <button
                  onClick={() => setLocalSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── SECTION 1: LIVE LOCAL (REAL-TIME UPDATES, NOTICES, GROUND TRUTH) ─ */}
        <section id="live-local" className="mb-20 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                <Radio size={14} className="text-purple-600 animate-pulse" /> Section 1 • Live Ground Truth
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                Live Local in {location.name}
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
                Real-time transport alerts, infrastructure notices, market days, and community updates confirmed by {location.name} neighbors.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer min-h-[44px]"
              >
                <Plus size={14} /> Share Local Update
              </button>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px]"
              >
                Can't find a business?
              </button>
            </div>
          </div>

          {/* Publishing Policy Notice */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-blue-600 shrink-0" />
              <span>
                <strong>Ground Truth Standard:</strong> Publishing live alerts is reserved for verified residents and trusted local guides to protect neighbors from spam and false claims.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOnboardingModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-bold shrink-0 hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
            >
              Get Verified as Resident &rarr;
            </button>
          </div>

          {/* Active Local Moments Cards */}
          {moments.filter(m => m.status === 'ACTIVE').length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {moments.filter(m => m.status === 'ACTIVE').slice(0, 3).map((moment) => (
                <div
                  key={moment.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white shadow-md border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-400/20 text-purple-200 border border-purple-300/30 uppercase">
                        {moment.momentType}
                      </span>
                      <span className="text-[11px] font-mono text-purple-300">
                        {moment.startDate}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white font-orbitron leading-snug">
                      {moment.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {moment.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-200/80">
                    <span>📍 {moment.locationName}</span>
                    <span className="font-bold text-emerald-300">✓ {moment.confirmationsCount} confirmed</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contribution Type Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {(['ALL', 'DISCOVER', 'RECOMMEND', 'UPDATE', 'REPORT', 'REVIEW', 'EVENT', 'STORY', 'QUESTION'] as const).map((tab) => {
              const count = tab === 'ALL'
                ? contributions.length
                : contributions.filter(c => c.type === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveContribTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                    activeContribTab === tab
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab === 'ALL' ? 'All Signals' : tab}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    activeContribTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contributions Feed */}
          {filteredContributions.length > 0 ? (
            <div className="space-y-6">
              {filteredContributions.map((contrib) => (
                <ContributionCard
                  key={contrib.id}
                  contribution={contrib}
                  onUpdated={(updated) => {
                    setContributions(prev => prev.map(c => c.id === updated.id ? updated : c));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
              <Radio size={32} className="mx-auto text-slate-400" />
              <p className="text-slate-800 font-bold text-sm">
                No contributions found {activeContribTab !== 'ALL' ? `for "${activeContribTab}"` : ''} in {location.name}
              </p>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                Got an update on a local business, road work, community event, or hidden gem? Be the first to share evidence with your neighbors.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all cursor-pointer inline-flex items-center gap-1.5 min-h-[44px]"
              >
                <Plus size={14} /> Submit First Signal
              </button>
            </div>
          )}
        </section>

        {/* ── SECTION 2: LOCAL JOBS & OPPORTUNITIES ─────────────────── */}
        <section id="jobs" className="mb-20 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                <Briefcase size={14} className="text-emerald-600" /> Section 2 • Local Employment
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                Jobs in {location.name}
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
                Verified vacancies, retail roles, cold storage operations, and healthcare openings across {location.name} commercial zones.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsJobModalOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer min-h-[44px]"
              >
                <Plus size={14} /> Post a Local Job
              </button>
            </div>
          </div>

          {/* Job Type Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {(['ALL', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const).map((tab) => {
              const count = tab === 'ALL'
                ? jobs.length
                : jobs.filter(j => j.jobType === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setJobTypeFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                    jobTypeFilter === tab
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab === 'ALL' ? 'All Roles' : tab.replace('_', ' ')}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    jobTypeFilter === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Jobs Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        {job.status === 'VERIFIED' ? 'Verified Opportunity' : 'Active Listing'}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                        {job.jobType.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold font-orbitron text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
                        {job.title}
                      </h3>
                      <span className="text-xs font-bold text-slate-600 block mt-0.5">
                        {job.companyName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                      {job.area && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-blue-600" /> {job.area}
                        </span>
                      )}
                      {job.salaryRange && (
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                          💰 {job.salaryRange}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {job.description}
                    </p>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.requirements.slice(0, 3).map((req, rIdx) => (
                          <span
                            key={rIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            ✓ {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-mono text-slate-400">
                      Posted {new Date(job.postedAt).toLocaleDateString()}
                    </span>
                    {job.contactMethod === 'WHATSAPP' ? (
                      <a
                        href={`https://wa.me/${job.contactValue.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(job.companyName)},%20I%20am%20inquiring%20about%20the%20${encodeURIComponent(job.title)}%20role%20on%20Conflux%20AI%20${encodeURIComponent(location.name)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm min-h-[44px]"
                      >
                        <MessageSquare size={13} /> WhatsApp Apply
                      </a>
                    ) : job.contactMethod === 'PHONE' ? (
                      <a
                        href={`tel:${job.contactValue}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all min-h-[44px]"
                      >
                        <Phone size={13} /> Call Employer
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-blue-600">
                        {job.contactValue}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
              <Briefcase size={32} className="mx-auto text-slate-400" />
              <p className="text-slate-800 font-bold text-sm">
                No job openings listed right now in {location.name}.
              </p>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                Hiring in {location.name}? Post your vacancy directly to reach local job seekers across Nadia.
              </p>
              <button
                type="button"
                onClick={() => setIsJobModalOpen(true)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all cursor-pointer inline-flex items-center gap-1.5 min-h-[44px]"
              >
                <Plus size={14} /> Post First Job
              </button>
            </div>
          )}
        </section>

        {/* ── SECTION 3: TRUSTED PEOPLE (LOCAL CONTRIBUTORS & GUIDES) ─ */}
        <section id="trusted-people" className="mb-20 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div>
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                <Users size={14} className="text-purple-600" /> Section 3 • Trusted Local Contributors
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                Trusted People in {location.name}
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
                Longtime residents, local guides, and community contributors helping neighbors with verified ground updates.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <Link
                to="/my-local"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px]"
              >
                <span>Your Local Profile</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setIsOnboardingModalOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer min-h-[44px]"
              >
                <Plus size={14} /> Join as Contributor
              </button>
            </div>
          </div>

          {filteredVoices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVoices.map((voice) => {
                const standing = getContributorStanding({
                  reputationScore: voice.reputationScore,
                  locality: location.name,
                  stats: voice.stats
                });
                return (
                  <div
                    key={voice.id}
                    className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-black text-base shadow-sm">
                            {voice.avatarUrl ? (
                              <img src={voice.avatarUrl} alt={voice.displayName} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                              voice.displayName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">{voice.displayName}</span>
                              {voice.isVerifiedResident && (
                                <CheckCircle2 size={13} className="text-blue-600" title="Identity Verified Resident" />
                              )}
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${standing.badgeClass}`}>
                              <ShieldCheck size={11} />
                              <span>{standing.label}</span>
                            </span>
                          </div>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-center shrink-0">
                          <span className="text-[8px] font-mono uppercase tracking-wider block text-purple-600 font-bold">Local Trust Score</span>
                          <span className="text-sm font-black font-mono">{voice.reputationScore}</span>
                        </div>
                      </div>

                      {voice.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                          &ldquo;{voice.bio}&rdquo;
                        </p>
                      )}

                      {voice.reputationBadges && voice.reputationBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {voice.reputationBadges.map((b) => (
                            <span
                              key={b}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                            >
                              <span>★</span>
                              <span>{b.replace(/_/g, ' ')}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono">{voice.stats.contributionsCount} contributions</span>
                      <span className="font-mono text-emerald-600 font-bold">
                        {voice.stats.peopleHelpedCount ? `${voice.stats.peopleHelpedCount} helped` : `${voice.stats.confirmedUpdatesCount} confirmed`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
              <Users size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-slate-800 text-base font-bold mb-1">Trusted People is growing.</p>
              <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">
                Verified local members will appear here as they complete Conflux verification.
              </p>
              <button
                type="button"
                onClick={() => setIsOnboardingModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition-all cursor-pointer min-h-[44px]"
              >
                Join as First Contributor
              </button>
            </div>
          )}
        </section>

        {/* ── SECTION 4: VERIFIED LOCAL BUSINESSES IN RANAGHAT ───────── */}
        <section id="trusted-businesses" className="mb-20 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                <Store size={14} className="text-blue-600" /> Section 4 • Local Business Graph
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                Verified Local Businesses in {location.name}
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
                Accredited commercial establishments, cold storage facilities, healthcare diagnostic centres, and restaurants with verified statutory credentials and direct contact access.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={`/discover?where=${location.slug}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all min-h-[44px]"
              >
                <Search size={14} /> Search Discovery Hub <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {isLoadingBusinesses ? (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent mb-4"></div>
              <p className="text-slate-600 text-sm font-medium">Loading verified businesses for {location.name}...</p>
            </div>
          ) : filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((biz) => {
                const isOpenNow = businessService.isBusinessOpenNow(biz.operatingHours);
                return (
                  <div
                    key={biz.id}
                    className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200">
                          <ShieldCheck size={12} className="text-emerald-600" />
                          {biz.verificationLevel === 'STATUTORY_VERIFIED' ? 'Statutory Verified' : 'Verified Entity'}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
                            isOpenNow
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                          {isOpenNow ? 'Open Now' : 'Closed'}
                        </span>
                      </div>

                      {/* Business Identity */}
                      <div className="mb-3">
                        <span className="text-[10px] font-mono font-bold text-slate-400 block mb-1">
                          {biz.confluxBusinessId}
                        </span>
                        <h3 className="text-xl font-bold font-orbitron text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1">
                          <Link to={`/business/${biz.slug}`}>
                            {biz.name}
                          </Link>
                        </h3>
                        {biz.categoryName && (
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                            {biz.categoryName}
                          </span>
                        )}
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3 mb-4">
                        {biz.shortSummary || biz.description}
                      </p>

                      {/* Location Address */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-4 flex items-start gap-2 text-xs text-slate-600 font-medium">
                        <MapPin size={14} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{biz.location.fullAddress || `${biz.location.locality}, ${location.name}`}</span>
                      </div>

                      {/* Services Chips */}
                      {biz.services && biz.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {biz.services.slice(0, 3).map((svc, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {svc}
                            </span>
                          ))}
                          {biz.services.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                              +{biz.services.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {biz.contact.whatsapp && (
                          <a
                            href={`https://wa.me/${biz.contact.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(biz.name)},%20I%20found%20your%20business%20on%20Conflux%20AI%20Ranaghat.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm min-h-[44px]"
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </a>
                        )}
                        {biz.contact.phone && (
                          <a
                            href={`tel:${biz.contact.phone}`}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                          >
                            <Phone size={13} /> Call Direct
                          </a>
                        )}
                      </div>
                      
                      <Link
                        to={`/business/${biz.slug}`}
                        className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                      >
                        <span>View Verified Profile</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
              <p className="text-slate-600 text-sm mb-4">No verified businesses currently indexed in {location.name}.</p>
              <Link
                to="/list-business"
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all inline-flex items-center gap-2 min-h-[44px]"
              >
                List Your {location.name} Business
              </Link>
            </div>
          )}

          {/* Directory CTA Banner */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <Store size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Operate a Business in {location.name}?</h4>
                <p className="text-xs text-slate-500 font-normal">Establish a verified Schema.org entity profile with statutory proof dockets and direct WhatsApp lead capture.</p>
              </div>
            </div>
            <Link
              to="/list-business"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shrink-0 min-h-[44px] inline-flex items-center justify-center"
            >
              List Your Business Free &rarr;
            </Link>
          </div>
        </section>

        {/* ── HOW CONFLUX KNOWS (TRUST & EVIDENCE DOSSIER) ───────────── */}
        <section id="how-conflux-knows" className="mb-20 scroll-mt-28">
          <div className="p-8 md:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                  Transparency &amp; Ground Truth Architecture
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-orbitron">
                  How Conflux AI Knows What Is True in {location.name}
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              Unlike generic directories or social networks where ratings can be purchased or fabricated, Conflux AI maintains a deterministic separation between statutory legal proof and community-confirmed signals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 size={16} />
                  <span>Statutory Primary Registries</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct dockets from primary government registrars (MCA corporate master data, FSSAI food licenses, clinical registry numbers). 100% deterministic ground truth that cannot be purchased.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <Radio size={16} />
                  <span>Community Corroboration</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time updates reported by local residents and shopkeepers. Elevates to Corroborated status only after independent community confirmations and cross-verification.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle size={16} />
                  <span>"We Don't Know Yet" Principle</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When business hours, prices, or claims are disputed or lack evidence, Conflux transparently reports uncertainty rather than presenting AI hallucinations as fact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── DEMAND SIGNAL BANNER: CAN'T FIND A BUSINESS? ───────────── */}
        <section className="mb-20">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-slate-50 to-blue-50 border border-amber-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md">
                Locality Demand Request
              </span>
              <h3 className="text-xl md:text-2xl font-bold font-orbitron text-slate-900">
                Can't find a business or shop in {location.name}?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If a local manufacturer, doctor, sweet shop, gym, or artisan in {location.name} is missing from Conflux, let us know. Submitting a demand request alerts the community and initiates a verification docket.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
            >
              Request Business Listing &rarr;
            </button>
          </div>
        </section>

        {/* ── SECTION 2: KEY COMMERCIAL HUBS & TRADING CORRIDORS ──── */}
        {location.keyCommercialHubs && location.keyCommercialHubs.length > 0 && (
          <section className="mb-20">
            <div className="mb-8 pb-4 border-b border-slate-200">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-2 inline-flex items-center gap-1.5">
                <Compass size={12} className="text-blue-600" /> Geographic Trading Nodes
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900">
                Key Commercial Hubs &amp; Trading Corridors in {location.name}
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Primary markets and wholesale zones driving daily trade and logistics across the {location.name} municipality.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {location.keyCommercialHubs.map((hub, hIdx) => (
                <Link
                  key={hIdx}
                  to={`/discover?where=${encodeURIComponent(location.slug)}`}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white transition-all group flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors block">
                        {hub}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Explore businesses in this corridor &rarr;
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 3: COMMERCIAL ECOSYSTEM & AUTOMATION FOCUS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={16} /> Commercial Ecosystem
            </h2>
            <h3 className="text-2xl font-bold font-orbitron text-slate-900">Why Businesses in {location.name} Benefit from Automation</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              {location.localBusinessContext}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 space-y-4">
            <h2 className="text-xs font-bold text-blue-100 uppercase tracking-widest flex items-center gap-2">
              <Zap size={16} className="text-yellow-300" /> Automation Focus Areas
            </h2>
            <h3 className="text-2xl font-bold font-orbitron text-white">Targeted System Upgrades</h3>
            <ul className="space-y-3">
              {location.automationOpportunities?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-blue-50 font-medium">
                  <CheckCircle2 size={18} className="text-yellow-300 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── SECTION 4: VERIFIED LOCAL ENTITIES & STATUTORY REGISTRIES ── */}
        {location.verifiedEntities && location.verifiedEntities.length > 0 && (
          <section className="mb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" /> Evidence &amp; Verification Layer
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                  Verified Local Entities &amp; Registries in {location.name}
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
                  Ground-truth statutory registrations, food safety licenses, and clinical establishment records verified against primary government databases for {location.name}.
                </p>
              </div>
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all shrink-0 self-start sm:self-auto"
              >
                Conflux Verify Portal <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {location.verifiedEntities.map((ent) => (
                <div
                  key={ent.id}
                  className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-6"
                >
                  {/* Top Badges & Entity Classification */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                        <ShieldCheck size={14} className="text-emerald-600" /> {ent.verificationStatus}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
                        {ent.sourceTier === 'TIER_1_PRIMARY_AUTHORITATIVE' ? 'Tier 1: Primary Official Registrar' : ent.sourceTier.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                      {ent.entityType === 'REGISTERED_BUSINESS' ? 'Registered Corporate Business' : 'Geographical Indication (GI) Heritage Cluster'}
                    </span>
                  </div>

                  {/* Entity Name & Statutory Identifier */}
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900 mb-3">
                      {ent.name}
                    </h3>
                    {ent.statutoryIdentifier && (
                      <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl mb-4">
                        <FileCheck size={14} className="text-blue-600" />
                        <span>{ent.statutoryIdentifier}</span>
                      </div>
                    )}
                    <p className="text-slate-700 text-base leading-relaxed font-medium">
                      {ent.claimSummary}
                    </p>
                  </div>

                  {/* Location Context & Role */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Local Industry &amp; Geographic Relevance:
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {ent.locationRelevance}
                    </p>
                  </div>

                  {/* Provenance & Registrar Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-600">
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold block mb-1 uppercase tracking-wider">Primary Registrar</span>
                      <span className="font-bold text-slate-900 block">{ent.registrarName}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold block mb-1 uppercase tracking-wider">Registry Standing</span>
                      <span className="font-bold text-emerald-700 block flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        {ent.validThrough ? `Active (Valid Through ${ent.validThrough})` : 'Active Statutory Docket'}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold block mb-1 uppercase tracking-wider">Benchmark Evaluation</span>
                      <span className="font-bold text-slate-900 block font-mono">{ent.benchmarkCaseId || 'Verified Record'} (100% Deterministic)</span>
                    </div>
                  </div>

                  {/* Contextual Internal Links & Action CTAs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                      {ent.relatedArticleSlug && (
                        <Link
                          to={`/blog/${ent.relatedArticleSlug}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <BookOpen size={13} /> Related {location.name} Industry Strategy &rarr;
                        </Link>
                      )}
                      {ent.relatedGuideSlug && (
                        <Link
                          to={`/verify/guides/${ent.relatedGuideSlug}`}
                          className="text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
                        >
                          <ShieldCheck size={13} /> Verification Guide &rarr;
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <a
                        href={ent.registrarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        Official Registrar <ExternalLink size={13} />
                      </a>
                      <Link
                        to={ent.verifyQueryUrl}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/10 transition-all"
                      >
                        Verify on Conflux <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 5: INDUSTRY USE CASES ─────────────────────────── */}
        {location.useCases && location.useCases.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold font-orbitron text-slate-900 mb-8">
              Proven Automation Use Cases for {location.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {location.useCases.map((uc, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{uc.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{uc.description}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100 mt-4">
                    Business Impact: {uc.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 6: CURATED LOCAL ARTICLES & BLUEPRINTS ───────── */}
        {displayedArticles.length > 0 && (
          <section className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
              <div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                  <BookOpen size={12} className="text-blue-600" /> Local Field Blueprints
                </span>
                <h2 className="text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
                  Automation &amp; Growth Guides for {location.name}
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
                  Actionable market guides, wholesale ordering workflows, and healthcare technology blueprints relevant to {location.name} businesses.
                </p>
              </div>
              <Link
                to={`/blog?district=${districtSlug}`}
                className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1 shrink-0"
              >
                All {parentDistrict?.name} Guides ({districtArticles.length}) <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedArticles.map((art) => (
                <Link
                  key={art.id}
                  to={`/blog/${art.slug}`}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">
                        {art.category || 'Local Strategy'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {art.language === 'bn' ? 'বাংলা' : 'English'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors mb-3">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3 mb-4">
                      {art.excerpt || art.seoDescription}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>Read Guide</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 7: NEARBY LOCATIONS NAVIGATION ───────────────── */}
        {nearbyLocations.length > 0 && (
          <div className="mb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold font-orbitron text-slate-900">
                  Related Commercial Hubs in {parentDistrict?.name} District
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Connected trading corridors and neighboring municipal markets along NH 12.
                </p>
              </div>
              <Link
                to={`/locations/west-bengal/${districtSlug}`}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-wider"
              >
                View {parentDistrict?.name} District Directory &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbyLocations.map((nearby) => (
                <Link
                  key={nearby.id}
                  to={`/locations/west-bengal/${districtSlug}/${nearby.slug}`}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-white transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{nearby.name}</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 8: FAQS ──────────────────────────────────────── */}
        {location.faqs && location.faqs.length > 0 && (
          <div className="mb-20 max-w-4xl">
            <h2 className="text-3xl font-bold font-orbitron text-slate-900 mb-8 flex items-center gap-3">
              <HelpCircle className="text-blue-600" /> Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {location.faqs.map((faq, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-base md:text-lg mb-3">{faq.question}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 9: CTA BOX ───────────────────────────────────── */}
        <div className="p-10 md:p-14 rounded-3xl bg-slate-950 text-white shadow-2xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 block">Get Started Today</span>
            <h3 className="text-3xl md:text-4xl font-bold font-orbitron mb-6">
              Grow Your Business Visibility in {location.name}
            </h3>
            <p className="text-slate-300 text-base mb-8 leading-relaxed font-normal">
              Schedule a virtual technical consultation with our engineering team or request a customized local visibility and WhatsApp automation architecture for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/918972517557?text=Hi%20Conflux%20AI,%20I%20want%20to%20discuss%20automation%20and%20visibility%20for%20my%20business%20in%20${encodeURIComponent(location.name)}.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLocationEvent('whatsapp_click', `locations/west-bengal/${districtSlug}/${location.slug}`)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30"
              >
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>
              <Link
                to="/list-business"
                onClick={() => trackLocationEvent('list_business_click', `locations/west-bengal/${districtSlug}/${location.slug}`)}
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-3"
              >
                List Your Business <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── MODALS ─────────────────────────────────────────────────── */}
        <RanaghatVisitorPrompt
          isOpen={isVisitorPromptOpen}
          onClose={() => setIsVisitorPromptOpen(false)}
          onJoinCommunity={() => {
            setIsVisitorPromptOpen(false);
            setIsOnboardingModalOpen(true);
          }}
        />

        <CreateJobModal
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          locality={location.slug}
          onSuccess={(newJob) => {
            setJobs(prev => [newJob, ...prev]);
            setIsJobModalOpen(false);
          }}
        />

        {isOnboardingModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-md my-8">
              <UserOnboardingFlow
                isModal={true}
                initialLocality={location.name}
                onClose={() => setIsOnboardingModalOpen(false)}
                onComplete={() => {
                  setIsOnboardingModalOpen(false);
                  localKnowledgeService.getLocalVoices(location.slug, 8).then(setLocalVoices);
                }}
              />
            </div>
          </div>
        )}

        <CreateContributionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          defaultLocality={location.slug}
          defaultLocalityName={location.name}
          onCreated={(newContrib) => {
            setContributions(prev => [newContrib, ...prev]);
          }}
        />

        <RequestBusinessModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          defaultLocality={location.slug}
          defaultLocalityName={location.name}
          onRequestSubmitted={() => {
            // Demand request submitted
          }}
        />
      </div>
    </div>
  );
};

export default LocationDetailPage;
