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
import { connectService } from '../../lib/connectService';
import { CreateContributionModal } from '../contributions/CreateContributionModal';
import { ContributionCard } from '../contributions/ContributionCard';
import { RequestBusinessModal } from '../contributions/RequestBusinessModal';
import { RanaghatVisitorPrompt } from './RanaghatVisitorPrompt';
import { CreateJobModal } from './CreateJobModal';
import { UserOnboardingFlow } from '../auth/UserOnboardingFlow';
import { CommunityOnboardingModal } from '../onboarding/CommunityOnboardingModal';
import { CommunityPostComposerModal } from '../community/CommunityPostComposerModal';
import { communityProfileService } from '../../lib/communityProfileService';
import { getContributorStanding } from '../../types/localKnowledge';
import type { LocalContribution, LocalUserProfile, LocalMoment, ContributionType, LocalJob, JobType } from '../../types/localKnowledge';
import type { ConfluxBusiness } from '../../types/business';
import type { ArticleKnowledgeObject } from '../../types/article';

const LocationDetailPage: React.FC = () => {
  const { districtSlug, citySlug, subPage } = useParams<{ districtSlug: string; citySlug: string; subPage?: string }>();
  
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
  const [isComposerModalOpen, setIsComposerModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isVisitorPromptOpen, setIsVisitorPromptOpen] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState<'ALL' | JobType>('ALL');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [activeContribTab, setActiveContribTab] = useState<'ALL' | ContributionType>('ALL');

  const handleShareUpdateClick = () => {
    const profile = communityProfileService.getCommunityProfile();
    if (!profile || profile.status !== 'PROFILE_COMPLETE') {
      setIsOnboardingModalOpen(true);
    } else {
      setIsComposerModalOpen(true);
    }
  };

  // Ask Ranaghat State
  const [askQuery, setAskQuery] = useState('');
  const [askResults, setAskResults] = useState<{
    businesses: any[];
    contributions: LocalContribution[];
    moments: LocalMoment[];
    jobs: LocalJob[];
    places: any[];
    totalResults: number;
    query: string;
  } | null>(null);
  const [isSearchingAsk, setIsSearchingAsk] = useState(false);

  const handleSearchAsk = async (queryText: string) => {
    setAskQuery(queryText);
    if (!queryText.trim()) {
      setAskResults(null);
      return;
    }
    setIsSearchingAsk(true);
    try {
      const res = await localKnowledgeService.searchLocalIntelligence(queryText, 'ranaghat');
      setAskResults(res);
    } catch (err) {
      console.warn('[AskRanaghat] Error searching:', err);
    } finally {
      setIsSearchingAsk(false);
    }
  };

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
          localKnowledgeService.getContributions({ locality: location.slug, authorId: communityProfileService.getCommunityProfile()?.id }),
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

  // Intent Telemetry Tracking (Section 14)
  useEffect(() => {
    if (isRanaghat) {
      if (!subPage) {
        connectService.logEvent({
          businessId: 'ranaghat_hub',
          eventType: 'RANAGHAT_HUB_VIEW',
          channel: 'HUMAN_WEB'
        });
      } else if (subPage === 'live') {
        connectService.logEvent({
          businessId: 'ranaghat_hub',
          eventType: 'LIVE_LOCAL_OPEN',
          channel: 'HUMAN_WEB'
        });
      } else if (subPage === 'jobs') {
        connectService.logEvent({
          businessId: 'ranaghat_hub',
          eventType: 'JOBS_OPEN',
          channel: 'HUMAN_WEB'
        });
      } else if (subPage === 'people') {
        connectService.logEvent({
          businessId: 'ranaghat_hub',
          eventType: 'TRUSTED_PEOPLE_OPEN',
          channel: 'HUMAN_WEB'
        });
      } else if (subPage === 'businesses') {
        connectService.logEvent({
          businessId: 'ranaghat_hub',
          eventType: 'BUSINESSES_OPEN',
          channel: 'HUMAN_WEB'
        });
      } else if (subPage === 'ask') {
        connectService.logEvent({
          businessId: 'ranaghat_hub',
          eventType: 'ASK_RANAGHAT_OPEN',
          channel: 'HUMAN_WEB'
        });
      }
    }
  }, [isRanaghat, subPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!location) return;

    let pageTitle = location.metaTitle || `Local Business Visibility & Verification in ${location.name} | Conflux AI`;
    let pageDesc = location.metaDescription || `Your trusted local guide to ${location.name}.`;
    let canonicalPath = `/locations/west-bengal/${districtSlug}/${location.slug}`;

    if (isRanaghat) {
      if (subPage === 'live') {
        pageTitle = 'Live Local Ranaghat | Real-Time Transit, Road Notices & Utility Updates | Conflux AI';
        pageDesc = 'Real-time community updates for Ranaghat: Sealdah train timings, road notices, power cuts, market haat schedules, and civic signals verified by local residents.';
        canonicalPath = `/locations/west-bengal/${districtSlug}/${location.slug}/live`;
      } else if (subPage === 'jobs') {
        pageTitle = 'Ranaghat Jobs | Verified Local Employment & Hiring in Ranaghat, Nadia | Conflux AI';
        pageDesc = 'Find authentic, verified job openings and local hiring in Ranaghat, Nadia. Retail, accounting, pharmacy, sales, and logistics jobs verified by Conflux AI.';
        canonicalPath = `/locations/west-bengal/${districtSlug}/${location.slug}/jobs`;
      } else if (subPage === 'people') {
        pageTitle = 'Trusted People in Ranaghat | Verified Local Residents & Helpers | Conflux AI';
        pageDesc = 'Directory of verified residents and active community helpers in Ranaghat, Nadia. Grounded in authentic local contributions and verified evidence.';
        canonicalPath = `/locations/west-bengal/${districtSlug}/${location.slug}/people`;
      } else if (subPage === 'businesses') {
        pageTitle = 'Ranaghat Business Directory | Verified Shops, Doctors & Services | Conflux AI';
        pageDesc = 'Authoritative directory of verified local businesses, healthcare clinics, wholesale distributors, and shops in Ranaghat, Nadia with statutory proof.';
        canonicalPath = `/locations/west-bengal/${districtSlug}/${location.slug}/businesses`;
      } else if (subPage === 'ask') {
        pageTitle = 'Ask Ranaghat | Local Knowledge & Verified Community Answers | Conflux AI';
        pageDesc = 'Ask anything about Ranaghat. Search across live transit notices, verified doctors, market schedules, municipal updates, and community contributions.';
        canonicalPath = `/locations/west-bengal/${districtSlug}/${location.slug}/ask`;
      } else {
        pageTitle = 'Ranaghat Local Community Hub | Live Updates, Jobs & Verified Businesses | Conflux AI';
        pageDesc = 'Your trusted local guide to Ranaghat, Nadia. Discover live community updates, verified local jobs, trusted residents, and statutory business listings.';
        canonicalPath = `/locations/west-bengal/${districtSlug}/${location.slug}`;
      }
    }

    document.title = pageTitle;
    
    let metaDescEl = document.querySelector('meta[name="description"]');
    if (!metaDescEl) {
      metaDescEl = document.createElement('meta');
      metaDescEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescEl);
    }
    metaDescEl.setAttribute('content', pageDesc);

    const fullCanonical = `https://confluxai.in${canonicalPath}`;
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', fullCanonical);

    trackLocationEvent('page_view', `locations/west-bengal/${districtSlug}/${location.slug}${subPage ? `/${subPage}` : ''}`);
  }, [districtSlug, citySlug, location, isRanaghat, subPage]);

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

  // Cross-Intent Navigation Component
  const renderCrossIntentNav = (currentSub?: string) => (
    <nav aria-label="Ranaghat Intent Navigation" className="flex flex-wrap items-center gap-2 mb-8 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
      <Link
        to={`/locations/west-bengal/${districtSlug}/${location.slug}`}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px] ${
          !currentSub
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
        }`}
      >
        <span>← Ranaghat Hub</span>
      </Link>
      <Link
        to={`/locations/west-bengal/${districtSlug}/${location.slug}/live`}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px] ${
          currentSub === 'live'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-slate-700 hover:bg-white/70'
        }`}
      >
        <Radio size={13} className={currentSub === 'live' ? 'animate-pulse' : 'text-purple-600'} />
        <span>Live Local</span>
      </Link>
      <Link
        to={`/locations/west-bengal/${districtSlug}/${location.slug}/jobs`}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px] ${
          currentSub === 'jobs'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-700 hover:bg-white/70'
        }`}
      >
        <Briefcase size={13} className={currentSub === 'jobs' ? '' : 'text-emerald-600'} />
        <span>Jobs ({jobs.length})</span>
      </Link>
      <Link
        to={`/locations/west-bengal/${districtSlug}/${location.slug}/people`}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px] ${
          currentSub === 'people'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-700 hover:bg-white/70'
        }`}
      >
        <Users size={13} className={currentSub === 'people' ? '' : 'text-indigo-600'} />
        <span>Trusted People ({localVoices.length})</span>
      </Link>
      <Link
        to={`/locations/west-bengal/${districtSlug}/${location.slug}/businesses`}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px] ${
          currentSub === 'businesses'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 hover:bg-white/70'
        }`}
      >
        <Store size={13} className={currentSub === 'businesses' ? '' : 'text-blue-600'} />
        <span>Businesses ({localBusinesses.length})</span>
      </Link>
      <Link
        to={`/locations/west-bengal/${districtSlug}/${location.slug}/ask`}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px] ${
          currentSub === 'ask'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'text-slate-700 hover:bg-white/70'
        }`}
      >
        <HelpCircle size={13} className={currentSub === 'ask' ? '' : 'text-amber-600'} />
        <span>Ask Ranaghat</span>
      </Link>
    </nav>
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
              "@id": `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}${isRanaghat && subPage ? `/${subPage}` : ''}#webpage`,
              "url": `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}${isRanaghat && subPage ? `/${subPage}` : ''}`,
              "name": isRanaghat && subPage
                ? (subPage === 'live' ? 'Live Local Ranaghat' : subPage === 'jobs' ? 'Ranaghat Jobs' : subPage === 'people' ? 'Trusted People in Ranaghat' : subPage === 'businesses' ? 'Ranaghat Business Directory' : 'Ask Ranaghat')
                : location.metaTitle,
              "description": location.metaDescription,
              "publisher": { "@type": "Organization", "name": "Conflux AI", "url": "https://confluxai.in/" }
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" },
                { "@type": "ListItem", "position": 2, "name": "West Bengal", "item": "https://confluxai.in/locations/west-bengal" },
                { "@type": "ListItem", "position": 3, "name": parentDistrict?.name || 'District', "item": `https://confluxai.in/locations/west-bengal/${districtSlug}` },
                { "@type": "ListItem", "position": 4, "name": location.name, "item": `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}` },
                ...(isRanaghat && subPage ? [{
                  "@type": "ListItem",
                  "position": 5,
                  "name": subPage === 'live' ? 'Live Local' : subPage === 'jobs' ? 'Jobs' : subPage === 'people' ? 'Trusted People' : subPage === 'businesses' ? 'Businesses' : 'Ask Ranaghat',
                  "item": `https://confluxai.in/locations/west-bengal/${districtSlug}/${location.slug}/${subPage}`
                }] : [])
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
          {isRanaghat && subPage ? (
            <>
              <Link to={`/locations/west-bengal/${districtSlug}/${location.slug}`} className="text-blue-600 hover:underline">{location.name}</Link>
              <span>/</span>
              <span className="text-slate-900">
                {subPage === 'live' ? 'Live Local' : subPage === 'jobs' ? 'Jobs' : subPage === 'people' ? 'Trusted People' : subPage === 'businesses' ? 'Businesses' : 'Ask Ranaghat'}
              </span>
            </>
          ) : (
            <span className="text-slate-900">{location.name}</span>
          )}
        </nav>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CASE A: DEDICATED CHILD PAGES FOR RANAGHAT                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {isRanaghat && subPage ? (
          <div>
            {/* ── 1. SUBPAGE: LIVE LOCAL ──────────────────────────────────── */}
            {subPage === 'live' && (
              <div>
                <div className="max-w-4xl mb-8">
                  <span className="px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black tracking-widest uppercase mb-4 inline-flex items-center gap-1.5">
                    <Radio size={14} className="text-purple-600 animate-pulse" /> Live Ground Truth • Ranaghat
                  </span>
                  <h1 className="font-orbitron text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-3">
                    Live Local Ranaghat
                  </h1>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium mb-2">
                    Real updates from people who live, work, and participate in Ranaghat.
                  </p>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">
                    Know something useful about Ranaghat? Share it with your local community.
                  </p>
                </div>

                {renderCrossIntentNav('live')}

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                  <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {filteredContributions.length > 0
                      ? `Showing ${filteredContributions.length} ground truth ${filteredContributions.length === 1 ? 'signal' : 'signals'}`
                      : 'Live Local Stream'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShareUpdateClick}
                      className="inline-flex items-center gap-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer min-h-[44px]"
                    >
                      <Plus size={14} /> Share an Update
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

                {/* Ground Truth Standard Notice */}
                <div className="mb-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                    <span>
                      <strong>Ground Truth Standard:</strong> Publishing live alerts is reserved for verified residents and trusted local guides to protect neighbors from spam and false claims.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleShareUpdateClick}
                    className="text-blue-600 hover:text-blue-800 font-bold shrink-0 hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
                  >
                    Get Verified as Resident &rarr;
                  </button>
                </div>

                {/* Contributions Stream or Honest Empty State */}
                {contributions.length === 0 ? (
                  <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4 my-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                      <Radio size={32} />
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="text-2xl font-black text-slate-900 font-orbitron tracking-tight">
                        Nothing new from Ranaghat yet.
                      </h2>
                      <p className="text-slate-600 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                        Be the first to share something useful with your local community.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleShareUpdateClick}
                        className="inline-flex items-center gap-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer min-h-[44px]"
                      >
                        <Plus size={16} /> Share an Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Signal Filter Tabs */}
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
                          No contributions found {activeContribTab !== 'ALL' ? `for "${activeContribTab}"` : ''} in Ranaghat
                        </p>
                        <p className="text-slate-500 text-xs max-w-md mx-auto">
                          Got an update on a local business, road work, community event, or hidden gem? Be the first to share evidence with your neighbors.
                        </p>
                        <button
                          type="button"
                          onClick={handleShareUpdateClick}
                          className="mt-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition-all cursor-pointer inline-flex items-center gap-1.5 min-h-[44px]"
                        >
                          <Plus size={14} /> Share an Update
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── 2. SUBPAGE: JOBS ────────────────────────────────────────── */}
            {subPage === 'jobs' && (
              <div>
                <div className="max-w-4xl mb-8">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black tracking-widest uppercase mb-4 inline-flex items-center gap-1.5">
                    <Briefcase size={14} className="text-emerald-600" /> Verified Local Employment • Ranaghat
                  </span>
                  <h1 className="font-orbitron text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-3">
                    Ranaghat Jobs
                  </h1>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    Verified vacancies, retail roles, cold storage operations, and healthcare openings across Ranaghat commercial zones.
                  </p>
                </div>

                {renderCrossIntentNav('jobs')}

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                  <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {filteredJobs.length} active opportunities
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsJobModalOpen(true)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer min-h-[44px]"
                  >
                    <Plus size={14} /> Post a Local Job
                  </button>
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
                              href={`https://wa.me/${job.contactValue.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(job.companyName)},%20I%20am%20inquiring%20about%20the%20${encodeURIComponent(job.title)}%20role%20on%20Conflux%20AI%20Ranaghat.`}
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
                      No job openings listed right now in Ranaghat.
                    </p>
                    <p className="text-slate-500 text-xs max-w-md mx-auto">
                      Hiring in Ranaghat? Post your vacancy directly to reach local job seekers across Nadia.
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
              </div>
            )}

            {/* ── 3. SUBPAGE: TRUSTED PEOPLE ──────────────────────────────── */}
            {subPage === 'people' && (
              <div>
                <div className="max-w-4xl mb-8">
                  <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black tracking-widest uppercase mb-4 inline-flex items-center gap-1.5">
                    <Users size={14} className="text-indigo-600" /> Verified Residents &amp; Guides • Ranaghat
                  </span>
                  <h1 className="font-orbitron text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-3">
                    Trusted People in Ranaghat
                  </h1>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    Directory of verified residents, local guides, and community contributors helping neighbors with authentic ground truth.
                  </p>
                </div>

                {renderCrossIntentNav('people')}

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                  <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {filteredVoices.length} verified resident contributors
                  </div>
                  <div className="flex items-center gap-2.5">
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
                  <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                    <Users size={32} className="mx-auto text-slate-400 mb-2" />
                    <h3 className="text-slate-800 text-base font-bold mb-1">Trusted People is growing.</h3>
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

                {/* Trust Score Transparency Box */}
                <div className="mt-12 p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 leading-relaxed font-medium space-y-1">
                    <strong className="block text-slate-900 font-bold text-sm">How Local Trust Scores Work in Ranaghat</strong>
                    <p>
                      Local Trust Scores (base 20 to 100) are purely calculated from real, confirmed contributions, verified updates, and community helpfulness. There are zero fabricated reviews, bought follower metrics, or synthetic reputations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 4. SUBPAGE: BUSINESSES ──────────────────────────────────── */}
            {subPage === 'businesses' && (
              <div>
                <div className="max-w-4xl mb-8">
                  <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black tracking-widest uppercase mb-4 inline-flex items-center gap-1.5">
                    <Store size={14} className="text-blue-600" /> Authoritative Directory • Ranaghat
                  </span>
                  <h1 className="font-orbitron text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-3">
                    Ranaghat Business Directory
                  </h1>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    Accredited commercial establishments, cold storage facilities, healthcare diagnostic centres, and shops in Ranaghat with statutory proof.
                  </p>
                </div>

                {renderCrossIntentNav('businesses')}

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                  <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {filteredBusinesses.length} verified listings
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/list-business"
                      className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer min-h-[44px]"
                    >
                      <Plus size={14} /> List a Business
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(true)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px]"
                    >
                      Can't find a business?
                    </button>
                  </div>
                </div>

                {/* Business Search Bar */}
                <div className="mb-8">
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Ranaghat businesses by name, category, or service..."
                      value={localSearchQuery}
                      onChange={(e) => setLocalSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 rounded-2xl border border-slate-200 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-slate-50/50 min-h-[44px]"
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

                {isLoadingBusinesses ? (
                  <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent mb-4"></div>
                    <p className="text-slate-600 text-sm font-medium">Loading verified businesses for Ranaghat...</p>
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

                            <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3 mb-4">
                              {biz.shortSummary || biz.description}
                            </p>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-4 flex items-start gap-2 text-xs text-slate-600 font-medium">
                              <MapPin size={14} className="text-blue-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{biz.location.fullAddress || `${biz.location.locality}, Ranaghat`}</span>
                            </div>

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
                    <p className="text-slate-600 text-sm mb-4">No verified businesses currently indexed in Ranaghat.</p>
                    <Link
                      to="/list-business"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all inline-flex items-center gap-2 min-h-[44px]"
                    >
                      List a Ranaghat Business
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── 5. SUBPAGE: ASK RANAGHAT ─────────────────────────────────── */}
            {subPage === 'ask' && (
              <div>
                <div className="max-w-4xl mb-8">
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black tracking-widest uppercase mb-4 inline-flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-amber-600" /> Community Knowledge &amp; Ground Truth • Ranaghat
                  </span>
                  <h1 className="font-orbitron text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-3">
                    Ask Ranaghat
                  </h1>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    Ask anything about Ranaghat. Search across live transit notices, verified doctors, market schedules, municipal updates, and community contributions.
                  </p>
                </div>

                {renderCrossIntentNav('ask')}

                {/* Interactive Ask Form */}
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-50/60 via-white to-slate-50 border border-amber-200 shadow-sm mb-8 space-y-4">
                  <h2 className="text-base font-bold font-orbitron text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Search size={18} className="text-amber-600" /> What do you want to know about Ranaghat?
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSearchAsk(askQuery);
                    }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="e.g. Sealdah local train timings, doctors near station, wholesale market haat..."
                        value={askQuery}
                        onChange={(e) => setAskQuery(e.target.value)}
                        className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-300 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium bg-white min-h-[48px]"
                      />
                      {askQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setAskQuery('');
                            setAskResults(null);
                          }}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingAsk}
                      className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                    >
                      {isSearchingAsk ? (
                        <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Search size={15} />
                      )}
                      <span>Search Ranaghat</span>
                    </button>
                  </form>

                  {/* Sample prompt chips */}
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-slate-500 font-bold block mb-2">TRY ASKING ABOUT:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Sealdah local train timings',
                        'Doctors near Ranaghat Station',
                        'College road shops',
                        'Power cut updates today',
                        'Wholesale cloth market haat',
                        'Cold storage facilities'
                      ].map((promptText, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleSearchAsk(promptText)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-900 text-xs font-medium transition-all text-left"
                        >
                          &ldquo;{promptText}&rdquo;
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                {isSearchingAsk ? (
                  <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-r-transparent mb-4"></div>
                    <p className="text-slate-600 text-sm font-medium">Searching Ranaghat local intelligence...</p>
                  </div>
                ) : askResults ? (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <h2 className="text-base font-bold font-orbitron text-slate-900">
                        Results for &ldquo;{askResults.query}&rdquo;
                      </h2>
                      <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {askResults.totalResults} records found
                      </span>
                    </div>

                    {askResults.totalResults === 0 ? (
                      <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                        <HelpCircle size={32} className="mx-auto text-amber-500" />
                        <h3 className="text-slate-800 font-bold text-base">
                          No verified community records found for &ldquo;{askResults.query}&rdquo;.
                        </h3>
                        <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                          Conflux adheres to strict ground truth standards and does not synthesize or fabricate answers. If you know the answer, help your neighbors by sharing a verified signal.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition-all cursor-pointer inline-flex items-center gap-1.5 min-h-[44px]"
                          >
                            <Plus size={14} /> Share Ground Truth Signal
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsRequestModalOpen(true)}
                            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 min-h-[44px]"
                          >
                            Request Business Listing
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* Matching Moments */}
                        {askResults.moments.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                              <Radio size={14} className="animate-pulse" /> Live Notices &amp; Moments ({askResults.moments.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {askResults.moments.map(m => (
                                <div key={m.id} className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-purple-300">
                                    <span>{m.momentType}</span>
                                    <span>{m.startDate}</span>
                                  </div>
                                  <h4 className="font-bold text-sm">{m.title}</h4>
                                  <p className="text-xs text-slate-300 leading-relaxed">{m.summary}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matching Contributions */}
                        {askResults.contributions.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                              <MessageSquare size={14} /> Community Signals ({askResults.contributions.length})
                            </h3>
                            <div className="space-y-4">
                              {askResults.contributions.map(c => (
                                <ContributionCard key={c.id} contribution={c} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matching Businesses */}
                        {askResults.businesses.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                              <Store size={14} /> Verified Businesses ({askResults.businesses.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {askResults.businesses.map(b => (
                                <div key={b.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                                  <span className="text-[10px] font-bold text-blue-600 uppercase">{b.categoryName}</span>
                                  <h4 className="font-bold text-sm text-slate-900">
                                    <Link to={`/business/${b.slug}`} className="hover:underline">{b.name}</Link>
                                  </h4>
                                  <p className="text-xs text-slate-600 line-clamp-2">{b.shortSummary || b.description}</p>
                                  <div className="pt-2 flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium">📍 {b.location?.fullAddress}</span>
                                    <Link to={`/business/${b.slug}`} className="text-blue-600 font-bold hover:underline">View &rarr;</Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matching Places */}
                        {askResults.places.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                              <MapPin size={14} /> Geographic Corridors &amp; Places ({askResults.places.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {askResults.places.map(p => (
                                <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{p.category}</span>
                                  <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                                  <p className="text-xs text-slate-600">{p.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold font-orbitron uppercase tracking-wider text-slate-800">
                      How Ask Ranaghat Works
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                        <strong className="block text-slate-900 font-bold">1. Community Knowledge</strong>
                        <p>Resident-confirmed ground updates, transit alerts, and road notices across Ranaghat.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                        <strong className="block text-slate-900 font-bold">2. Verified Evidence</strong>
                        <p>Official statutory registrations, clinical licenses, and cold storage registries.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                        <strong className="block text-slate-900 font-bold">3. Zero Fabrication</strong>
                        <p>When evidence doesn't exist, we honestly say so instead of hallucinating answers.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subpage bottom return link */}
            <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between">
              <Link
                to={`/locations/west-bengal/${districtSlug}/${location.slug}`}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
              >
                <span>← Return to Ranaghat Hub</span>
              </Link>
            </div>
          </div>
        ) : isRanaghat ? (
          /* ═══════════════════════════════════════════════════════════════════ */
          /* CASE B: RANAGHAT MAIN HUB (DECISION & NAVIGATION UTILITY)          */
          /* ═══════════════════════════════════════════════════════════════════ */
          <div>
            {/* Hero Header */}
            <div className="max-w-5xl mb-10">
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

              <div className="space-y-3 mb-6">
                <h1 className="font-orbitron text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Ranaghat
                </h1>
                <p className="text-xl md:text-2xl font-bold text-blue-600 font-orbitron">
                  Your trusted local guide to Ranaghat
                </p>
              </div>

              <p className="text-base md:text-lg font-medium text-slate-600 leading-relaxed mb-6">
                {location.summary}
              </p>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed font-medium">
                  <strong className="block text-slate-900 font-bold mb-1">Local Intelligence &amp; Truth Network in Ranaghat</strong>
                  Conflux connects neighbors, verified businesses, places, and local updates in Ranaghat. Every contribution turns into structured community signals and evidence to help neighbors discover and decide with confidence.
                </div>
              </div>
            </div>

            {/* Quick Locality Navigation Bar */}
            {renderCrossIntentNav()}

            {/* ── MOBILE-FIRST INTENT CHOOSER (SECTION 12 & 15) ───────────── */}
            <section aria-label="Choose Ranaghat Intent" className="mb-16">
              <div className="mb-4">
                <span className="text-[11px] font-mono uppercase tracking-widest text-blue-600 font-bold block mb-1">
                  What do you need in Ranaghat?
                </span>
                <h2 className="text-2xl font-bold font-orbitron text-slate-900">
                  Choose Your Local Intent
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Live Local */}
                <Link
                  to={`/locations/west-bengal/${districtSlug}/${location.slug}/live`}
                  className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 hover:border-purple-500 hover:shadow-lg transition-all group flex flex-col justify-between min-h-[160px]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                        <Radio size={20} className="animate-pulse" />
                      </span>
                      <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                        {contributions.length} Signals
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-orbitron text-slate-900 group-hover:text-purple-700 transition-colors">
                      Live Local
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Real-time train timings, road notices, power cut alerts &amp; ground updates.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-700">
                    <span>Explore Live Local</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 2. Jobs */}
                <Link
                  to={`/locations/west-bengal/${districtSlug}/${location.slug}/jobs`}
                  className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-lg transition-all group flex flex-col justify-between min-h-[160px]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <Briefcase size={20} />
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        {jobs.length} Open Roles
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-orbitron text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Ranaghat Jobs
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Verified vacancies, retail roles, cold storage operations &amp; clinic staff.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>View Local Jobs</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 3. Trusted People */}
                <Link
                  to={`/locations/west-bengal/${districtSlug}/${location.slug}/people`}
                  className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 hover:border-indigo-500 hover:shadow-lg transition-all group flex flex-col justify-between min-h-[160px]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                        <Users size={20} />
                      </span>
                      <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                        {localVoices.length} Verified
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-orbitron text-slate-900 group-hover:text-indigo-700 transition-colors">
                      Trusted People
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Verified residents, community helpers &amp; guides with calculated trust scores.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                    <span>Meet Contributors</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 4. Businesses */}
                <Link
                  to={`/locations/west-bengal/${districtSlug}/${location.slug}/businesses`}
                  className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 hover:border-blue-500 hover:shadow-lg transition-all group flex flex-col justify-between min-h-[160px]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Store size={20} />
                      </span>
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                        {localBusinesses.length} Verified
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-orbitron text-slate-900 group-hover:text-blue-700 transition-colors">
                      Verified Businesses
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Statutory verified shops, doctors, wholesale distributors &amp; clinics.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-blue-700">
                    <span>Browse Directory</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 5. Ask Ranaghat */}
                <Link
                  to={`/locations/west-bengal/${districtSlug}/${location.slug}/ask`}
                  className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 hover:border-amber-500 hover:shadow-lg transition-all group flex flex-col justify-between min-h-[160px] sm:col-span-2 lg:col-span-2"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                        <HelpCircle size={20} />
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                        Community Knowledge &amp; Evidence
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-orbitron text-slate-900 group-hover:text-amber-700 transition-colors">
                      Ask Ranaghat
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Ask anything about Ranaghat: Sealdah train timings, doctors near station, market haat days, or power updates.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-700">
                    <span>Ask a Question or Search Knowledge</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </section>

            {/* ── LOCAL SEARCH BAR ────────────────────────────────────────── */}
            <section id="locality-search" className="mb-16">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Search size={18} className="text-blue-600" />
                  <h3 className="text-sm font-bold font-orbitron text-slate-900 uppercase tracking-wider">
                    Search Ranaghat Community &amp; Verified Directory
                  </h3>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="What do you want to know about Ranaghat? Search shops, jobs, road notices, or people..."
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

            {/* ── SECTION 8: MAIN PAGE PREVIEWS ───────────────────────────── */}
            {/* Preview 1: Live Local */}
            <section className="mb-16">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div>
                  <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black tracking-widest uppercase mb-2 inline-flex items-center gap-1.5">
                    <Radio size={14} className="text-purple-600 animate-pulse" /> Live Ground Truth
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900">
                    Live Local in Ranaghat
                  </h2>
                </div>
                <Link
                  to={`/locations/west-bengal/${districtSlug}/${location.slug}/live`}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 uppercase tracking-wider"
                >
                  View all Live Local ({contributions.length}) &rarr;
                </Link>
              </div>

              {contributions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contributions.slice(0, 2).map((contrib) => (
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
                <p className="text-xs text-slate-500 italic">No community updates from Ranaghat yet.</p>
              )}
            </section>

            {/* Preview 2: Jobs */}
            <section className="mb-16">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black tracking-widest uppercase mb-2 inline-flex items-center gap-1.5">
                    <Briefcase size={14} className="text-emerald-600" /> Local Employment
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900">
                    Jobs in Ranaghat
                  </h2>
                </div>
                <Link
                  to={`/locations/west-bengal/${districtSlug}/${location.slug}/jobs`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 uppercase tracking-wider"
                >
                  View all Jobs ({jobs.length}) &rarr;
                </Link>
              </div>

              {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.slice(0, 2).map((job) => (
                    <div
                      key={job.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {job.jobType.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-bold text-slate-800 font-mono">
                            {job.salaryRange}
                          </span>
                        </div>
                        <h3 className="text-base font-bold font-orbitron text-slate-900 leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">
                          {job.companyName} • {job.area}
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono text-slate-400">Verified Listing</span>
                        <Link to={`/locations/west-bengal/${districtSlug}/${location.slug}/jobs`} className="text-emerald-600 font-bold hover:underline">
                          Apply / Details &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No open jobs listed right now.</p>
              )}
            </section>

            {/* Preview 3: Trusted People */}
            <section className="mb-16">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black tracking-widest uppercase mb-2 inline-flex items-center gap-1.5">
                    <Users size={14} className="text-indigo-600" /> Verified Community
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900">
                    Trusted People in Ranaghat
                  </h2>
                </div>
                <Link
                  to={`/locations/west-bengal/${districtSlug}/${location.slug}/people`}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 uppercase tracking-wider"
                >
                  View all Trusted People ({filteredVoices.length}) &rarr;
                </Link>
              </div>

              {filteredVoices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVoices.slice(0, 2).map((voice) => (
                    <div key={voice.id} className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                        {voice.avatarUrl ? (
                          <img src={voice.avatarUrl} alt={voice.displayName} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          voice.displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{voice.displayName}</span>
                          <CheckCircle2 size={13} className="text-blue-600" />
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 italic">&ldquo;{voice.bio}&rdquo;</p>
                        <span className="text-[10px] font-mono text-purple-700 font-bold">Trust Score: {voice.reputationScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-600 font-medium mb-2">Trusted People is growing. Verified local members will appear here as they complete Conflux verification.</p>
                  <button
                    type="button"
                    onClick={() => setIsOnboardingModalOpen(true)}
                    className="text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                  >
                    Join as Contributor &rarr;
                  </button>
                </div>
              )}
            </section>

            {/* Preview 4: Businesses */}
            <section className="mb-16">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black tracking-widest uppercase mb-2 inline-flex items-center gap-1.5">
                    <Store size={14} className="text-blue-600" /> Local Directory
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900">
                    Verified Businesses in Ranaghat
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/locations/west-bengal/${districtSlug}/${location.slug}/businesses`}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 uppercase tracking-wider"
                  >
                    View all Businesses ({localBusinesses.length}) &rarr;
                  </Link>
                  <Link
                    to="/list-business"
                    className="text-xs font-bold text-emerald-700 hover:underline uppercase tracking-wider"
                  >
                    List a Business &rarr;
                  </Link>
                </div>
              </div>

              {localBusinesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {localBusinesses.slice(0, 3).map((biz) => (
                    <div key={biz.id} className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{biz.categoryName}</span>
                        <h3 className="text-base font-bold font-orbitron text-slate-900 leading-snug">
                          <Link to={`/business/${biz.slug}`} className="hover:text-blue-600">{biz.name}</Link>
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{biz.shortSummary || biz.description}</p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]">📍 {biz.location.locality}</span>
                        <Link to={`/business/${biz.slug}`} className="text-blue-600 font-bold hover:underline">Profile &rarr;</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-600 mb-2">No verified businesses publicly listed yet for Ranaghat.</p>
                  <Link to="/list-business" className="text-xs font-bold text-blue-600 hover:underline">List a Business &rarr;</Link>
                </div>
              )}
            </section>

            {/* Preview 5: Ask Ranaghat Preview Card */}
            <section className="mb-20">
              <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-slate-50 to-blue-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                    Community Intelligence
                  </span>
                  <h3 className="text-2xl font-bold font-orbitron text-slate-900">
                    Have a question about Ranaghat?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Search train schedules, clinic doctors, wholesale haat market days, or municipal notices grounded purely in verified evidence.
                  </p>
                </div>
                <Link
                  to={`/locations/west-bengal/${districtSlug}/${location.slug}/ask`}
                  className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 inline-flex items-center gap-2 min-h-[44px]"
                >
                  <HelpCircle size={15} /> Ask Ranaghat &rarr;
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
                      How Conflux Knows What Is True in Ranaghat
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  Unlike generic directories where ratings can be bought or fabricated, Conflux maintains a deterministic separation between statutory legal proof and community-confirmed signals.
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

            {/* ── KEY COMMERCIAL HUBS & TRADING CORRIDORS ────────────────── */}
            {location.keyCommercialHubs && location.keyCommercialHubs.length > 0 && (
              <section className="mb-20">
                <div className="mb-8 pb-4 border-b border-slate-200">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-2 inline-flex items-center gap-1.5">
                    <Compass size={12} className="text-blue-600" /> Geographic Trading Nodes
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900">
                    Key Commercial Hubs &amp; Trading Corridors in Ranaghat
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Primary markets and wholesale zones driving daily trade across the Ranaghat municipality.
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

            {/* ── VERIFIED ENTITIES & STATUTORY REGISTRIES ────────────────── */}
            {location.verifiedEntities && location.verifiedEntities.length > 0 && (
              <section className="mb-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600" /> Evidence &amp; Verification Layer
                    </span>
                    <h2 className="text-3xl font-bold font-orbitron text-slate-900 tracking-tight">
                      Verified Local Entities &amp; Registries in Ranaghat
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
                      Ground-truth statutory registrations, food safety licenses, and clinical establishment records verified against primary government databases for Ranaghat.
                    </p>
                  </div>
                  <Link
                    to="/verify"
                    className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all shrink-0 self-start sm:self-auto"
                  >
                    Conflux Verify Portal <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {location.verifiedEntities.map((ent) => (
                    <div
                      key={ent.id}
                      className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                          <ShieldCheck size={14} className="text-emerald-600" /> {ent.verificationStatus}
                        </span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          {ent.entityType === 'REGISTERED_BUSINESS' ? 'Registered Corporate Business' : 'Geographical Indication (GI) Heritage Cluster'}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-orbitron text-slate-900">
                        {ent.name}
                      </h3>
                      {ent.statutoryIdentifier && (
                        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
                          <FileCheck size={14} className="text-blue-600" />
                          <span>{ent.statutoryIdentifier}</span>
                        </div>
                      )}
                      <p className="text-slate-700 text-sm leading-relaxed font-medium">
                        {ent.claimSummary}
                      </p>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-mono">Registrar: {ent.registrarName}</span>
                        <Link to={ent.verifyQueryUrl} className="text-xs font-bold text-blue-600 hover:underline">
                          Verify on Conflux &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── NEARBY LOCATIONS ────────────────────────────────────────── */}
            {nearbyLocations.length > 0 && (
              <div className="mb-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold font-orbitron text-slate-900">
                      Related Commercial Hubs in Nadia District
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Connected trading corridors and neighboring municipal markets along NH 12.
                    </p>
                  </div>
                  <Link
                    to={`/locations/west-bengal/${districtSlug}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-wider"
                  >
                    View Nadia District Directory &rarr;
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

            {/* ── FAQS ────────────────────────────────────────────────────── */}
            {location.faqs && location.faqs.length > 0 && (
              <div className="mb-20 max-w-4xl">
                <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-slate-900 mb-8 flex items-center gap-3">
                  <HelpCircle className="text-blue-600" /> Frequently Asked Questions about Ranaghat
                </h2>
                <div className="space-y-4">
                  {location.faqs.map((faq, idx) => (
                    <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-900 text-base mb-2">{faq.question}</h3>
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 9: BUSINESS OWNER UTILITY CALLOUT ───────────────── */}
            <div className="p-8 md:p-10 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 mb-20 shadow-xl">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <Store size={16} />
                  <span>Ranaghat Business Directory</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-orbitron">
                  Operate a Business in Ranaghat?
                </h3>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-normal">
                  Ensure your establishment is verified, discoverable, and easily reached by local customers on Google, Maps, and AI search engines.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                <Link
                  to="/list-business"
                  className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all text-center min-h-[44px] flex items-center justify-center shadow-lg shadow-blue-600/30"
                >
                  List Your Business Free &rarr;
                </Link>
                <Link
                  to="/business"
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all text-center min-h-[44px] flex items-center justify-center"
                >
                  For Business Owners
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════ */
          /* CASE C: GENERIC LOCATION PAGE FOR OTHER TOWNS/DISTRICTS            */
          /* ═══════════════════════════════════════════════════════════════════ */
          <div>
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

              <h1 className="font-orbitron text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                {location.h1Title || `Local Business Visibility, Verification & Automation in ${location.name}`}
              </h1>
              
              <p className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed mb-8">
                {location.summary}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <a
                  href="#live-local"
                  className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
                >
                  <Radio size={14} className="text-purple-600 animate-pulse" /> Live Local ({contributions.length})
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
              </div>
            </div>

            {/* Locality Search */}
            <section id="locality-search" className="mb-16">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Search size={18} className="text-blue-600" />
                  <h3 className="text-sm font-bold font-orbitron text-slate-900 uppercase tracking-wider">
                    Search {location.name} Local Intelligence
                  </h3>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Search verified shops, doctors, road updates, or moments in ${location.name}...`}
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

            {/* Live Local Section */}
            <section id="live-local" className="mb-20 scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div>
                  <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                    <Radio size={14} className="text-purple-600 animate-pulse" /> Live Ground Truth
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                    Live Local in {location.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer min-h-[44px]"
                >
                  <Plus size={14} /> Share Local Update
                </button>
              </div>

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
                <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-200">
                  <p className="text-slate-600 text-sm font-medium">No contributions recorded yet for {location.name}.</p>
                </div>
              )}
            </section>

            {/* Jobs Section */}
            <section id="jobs" className="mb-20 scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                    <Briefcase size={14} className="text-emerald-600" /> Local Employment
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                    Jobs in {location.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(true)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer min-h-[44px]"
                >
                  <Plus size={14} /> Post a Local Job
                </button>
              </div>

              {filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">{job.jobType}</span>
                        <h3 className="text-lg font-bold font-orbitron text-slate-900">{job.title}</h3>
                        <p className="text-xs text-slate-600">{job.companyName} • {job.area}</p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{job.salaryRange}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
                  <p className="text-slate-600 text-sm">No job openings listed right now in {location.name}.</p>
                </div>
              )}
            </section>

            {/* Trusted Businesses Section */}
            <section id="trusted-businesses" className="mb-20 scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
                <div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black tracking-widest uppercase mb-3 inline-flex items-center gap-1.5">
                    <Store size={14} className="text-blue-600" /> Local Business Graph
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-slate-900 tracking-tight">
                    Verified Local Businesses in {location.name}
                  </h2>
                </div>
                <Link
                  to="/list-business"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] flex items-center justify-center"
                >
                  List a Business Free &rarr;
                </Link>
              </div>

              {filteredBusinesses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {filteredBusinesses.map((biz) => (
                    <div key={biz.id} className="p-7 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">{biz.categoryName}</span>
                        <h3 className="text-xl font-bold font-orbitron text-slate-900 mb-2">
                          <Link to={`/business/${biz.slug}`}>{biz.name}</Link>
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-3 mb-4">{biz.shortSummary || biz.description}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <Link to={`/business/${biz.slug}`} className="text-xs font-bold text-blue-600 hover:underline">View Profile &rarr;</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
                  <p className="text-slate-600 text-sm mb-4">No verified businesses currently indexed in {location.name}.</p>
                  <Link to="/list-business" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all inline-flex items-center gap-2 min-h-[44px]">
                    List Your Business
                  </Link>
                </div>
              )}
            </section>

            {/* Commercial Ecosystem & Automation Focus */}
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

            {/* Verified Entities & Statutory Registries */}
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
                  </div>
                  <Link to="/verify" className="text-xs font-bold text-blue-600 hover:underline">
                    Conflux Verify Portal &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {location.verifiedEntities.map((ent) => (
                    <div key={ent.id} className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-3">
                      <h3 className="text-xl font-bold font-orbitron text-slate-900">{ent.name}</h3>
                      <p className="text-slate-700 text-sm leading-relaxed">{ent.claimSummary}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Industry Use Cases */}
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

            {/* Nearby Locations */}
            {nearbyLocations.length > 0 && (
              <div className="mb-20">
                <h2 className="text-2xl font-bold font-orbitron text-slate-900 mb-6">
                  Related Commercial Hubs in {parentDistrict?.name} District
                </h2>
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

            {/* FAQs */}
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

            {/* CTA Box */}
            <div className="p-10 md:p-14 rounded-3xl bg-slate-950 text-white shadow-2xl">
              <div className="max-w-2xl">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 block">Get Started Today</span>
                <h3 className="text-3xl md:text-4xl font-bold font-orbitron mb-6">
                  Grow Your Business Visibility in {location.name}
                </h3>
                <p className="text-slate-300 text-base mb-8 leading-relaxed font-normal">
                  Connect with our team to explore verified local visibility and direct WhatsApp routing for your business.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/list-business"
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                  >
                    List Your Business <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODALS (ACCESSIBLE ACROSS ALL INTENTS & MAIN HUB) ───────── */}
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
          <CommunityOnboardingModal
            isOpen={isOnboardingModalOpen}
            initialLocality={location.name}
            onClose={() => setIsOnboardingModalOpen(false)}
            onComplete={(completedProfile) => {
              setIsOnboardingModalOpen(false);
              setIsComposerModalOpen(true);
              localKnowledgeService.getLocalVoices(location.slug, 8).then(setLocalVoices);
            }}
          />
        )}

        <CommunityPostComposerModal
          isOpen={isComposerModalOpen}
          onClose={() => setIsComposerModalOpen(false)}
          locality={location.slug}
          onCreated={(newContrib) => {
            setContributions(prev => [newContrib, ...prev]);
          }}
        />

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
          onSuccess={() => {
            // Demand request submitted
          }}
        />
      </div>
    </div>
  );
};

export default LocationDetailPage;
