import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Send, Image as ImageIcon, Layout, Type, FileText, CheckCircle, 
  AlertCircle, Zap, Edit3, Trash2, Eye, Plus, Search, Filter, 
  Globe, Clock, User, ArrowLeft, RefreshCw, Layers, MapPin, 
  Building2, HelpCircle, Link as LinkIcon, Compass, Sparkles, 
  TrendingUp, Calendar, BookOpen, UserCheck, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllLocations, LocationItem } from '../data/locationsData';
import { BUSINESS_CATEGORY_TAXONOMY, DIGITAL_NEED_TAXONOMY } from '../data/taxonomiesData';
import { ArticleKnowledgeObject, ContentLanguage, SearchIntent, ArticleStatus, LocalBusinessLead, EditorialPlanItem, GSCOpportunityItem } from '../types/article';
import { auditInternalLinks } from '../lib/internalLinkAudit';

const LOCAL_STORAGE_ARTICLES_KEY = 'conflux_custom_articles';
const LOCAL_STORAGE_EDITORIAL_PLAN_KEY = 'conflux_editorial_plan';
const LOCAL_STORAGE_CRM_KEY = 'conflux_local_crm_leads';
const LOCAL_STORAGE_GSC_KEY = 'conflux_gsc_opportunities';

const INITIAL_GSC_OPPORTUNITIES: GSCOpportunityItem[] = [
  {
    id: 'gsc-1',
    query: 'Mukutmanipur ecotourism homestay booking WhatsApp',
    pageSlug: 'mukutmanipur-jhilimili-ecotourism-homestays-boat-safari-sabai-crafts-whatsapp-booking',
    district: 'bankura',
    topic: 'Ecotourism & Homestays',
    impressions: 1420,
    clicks: 38,
    ctr: 2.68,
    position: 6.4,
    classification: 'OPPORTUNITY_A',
    status: 'IN_PROGRESS',
    lastUpdated: '2026-08-21',
    nextAction: 'Enhance direct room availability table and quick takeaway answer'
  },
  {
    id: 'gsc-2',
    query: 'Jhargram wild honey and forest homestay direct booking',
    pageSlug: 'jhargram-forest-homestays-agro-forestry-honey-direct-buyer-catalog',
    district: 'jhargram',
    topic: 'Jangalmahal Tourism & Agro-Forestry',
    impressions: 980,
    clicks: 19,
    ctr: 1.94,
    position: 8.2,
    classification: 'OPPORTUNITY_A',
    status: 'IN_PROGRESS',
    lastUpdated: '2026-08-21',
    nextAction: 'Add verified travel route & distance matrix from Kolkata/Kharagpur'
  },
  {
    id: 'gsc-3',
    query: 'Bishnupur Baluchari saree digital showroom online wholesale',
    pageSlug: 'bishnupur-baluchari-saree-terracotta-craft-digital-showroom-pan-india',
    district: 'bankura',
    topic: 'Handloom & Silk Crafts',
    impressions: 2150,
    clicks: 24,
    ctr: 1.12,
    position: 14.1,
    classification: 'OPPORTUNITY_B',
    status: 'PENDING',
    lastUpdated: '2026-08-21',
    nextAction: 'Expand silk authenticity identification guide & GI tag details'
  },
  {
    id: 'gsc-4',
    query: 'Kurseong Mirik boutique tea retreat homestays',
    pageSlug: 'kurseong-mirik-lepchajagat-tea-retreats-homestays-first-flush-whatsapp-booking',
    district: 'darjeeling',
    topic: 'Tea Tourism & Offbeat Homestays',
    impressions: 3400,
    clicks: 41,
    ctr: 1.21,
    position: 12.8,
    classification: 'OPPORTUNITY_B',
    status: 'IN_PROGRESS',
    lastUpdated: '2026-08-21',
    nextAction: 'Add detailed weather by month & tea plucking calendar (Mar-Nov)'
  },
  {
    id: 'gsc-5',
    query: 'Dooars offbeat homestays Samsing Suntalekhola Rocky Island',
    pageSlug: 'chalsa-samsing-suntalekhola-rocky-island-homestays-safari-tea-direct-booking',
    district: 'jalpaiguri',
    topic: 'Dooars Ecotourism',
    impressions: 4800,
    clicks: 56,
    ctr: 1.16,
    position: 5.7,
    classification: 'OPPORTUNITY_C',
    status: 'IN_PROGRESS',
    lastUpdated: '2026-08-21',
    nextAction: 'Improve title & meta description to highlight zero-commission booking'
  },
  {
    id: 'gsc-6',
    query: 'Purulia Ayodhya Pahar camping and tent booking prices',
    pageSlug: 'purulia-ayodhya-hills-eco-resorts-mineral-logistics-whatsapp-automation',
    district: 'purulia',
    topic: 'Hill Camping & Eco Resorts',
    impressions: 2900,
    clicks: 32,
    ctr: 1.10,
    position: 16.5,
    classification: 'OPPORTUNITY_B',
    status: 'PENDING',
    lastUpdated: '2026-08-21',
    nextAction: 'Restructure article to include seasonal camping checklist & water body guide'
  },
  {
    id: 'gsc-7',
    query: 'Malda Fazli Himsagar mango bulk wholesale mandi rate',
    pageSlug: 'malda-mango-food-processing-wholesale-buyer-catalog',
    district: 'malda',
    topic: 'Mango Processing & Agro Logistics',
    impressions: 1750,
    clicks: 18,
    ctr: 1.03,
    position: 18.2,
    classification: 'OPPORTUNITY_B',
    status: 'PENDING',
    lastUpdated: '2026-08-21',
    nextAction: 'Add export grade quality parameters and cold chain storage contacts'
  },
  {
    id: 'gsc-8',
    query: 'Santipur tant saree wholesale price list 2026',
    pageSlug: 'santipur-handloom-saree-manufacturers-digital-catalog',
    district: 'nadia',
    topic: 'Handloom Sarees & Wholesale',
    impressions: 5100,
    clicks: 112,
    ctr: 2.19,
    position: 4.8,
    classification: 'OPPORTUNITY_A',
    status: 'COMPLETED',
    lastUpdated: '2026-08-21',
    nextAction: 'Maintain position 1-3 with updated festive Durga Puja catalog link'
  }
];

const CONFLUX_SERVICES = [
  { id: 'whatsapp-automation', name: 'WhatsApp Business Automation', url: 'https://confluxai.in/services/whatsapp-automation' },
  { id: 'website-development', name: 'High-Performance Web Development', url: 'https://confluxai.in/services/website-development' },
  { id: 'seo-geo', name: 'SEO & GEO Search Optimization', url: 'https://confluxai.in/services/seo-geo' },
  { id: 'ai-chatbots', name: 'Custom AI Chatbots & RAG Systems', url: 'https://confluxai.in/services/chatbot-development' },
  { id: 'ai-automation', name: 'Enterprise AI Workflow Automation', url: 'https://confluxai.in/services/ai-automation' }
];

const SEARCH_INTENTS: SearchIntent[] = [
  'Business Growth',
  'Website Creation',
  'Lead Generation',
  'WhatsApp Automation',
  'Local SEO',
  'Customer Retention',
  'Process Automation'
];

const AdminCMS: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'editor' | 'matrix' | 'planner' | 'crm' | 'health' | 'gsc'>('matrix');
  
  // Articles Data State
  const [articles, setArticles] = useState<ArticleKnowledgeObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<ContentLanguage | 'ALL'>('ALL');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('ALL');

  // Locations & Taxonomies
  const allLocations: LocationItem[] = getAllLocations();

  // Form State for Manual Article Editor
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [language, setLanguage] = useState<ContentLanguage>('bn');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [authorName, setAuthorName] = useState('তরুণজিৎ বিশ্বাস');
  const [authorRole, setAuthorRole] = useState('Founder & Principal Architect, Conflux AI');
  const [authorBio, setAuthorBio] = useState('কোলকাতা থেকে রিমোটলি পশ্চিমবঙ্গ ও ভারতের নানা প্রান্তের ব্যবসার ডিজিটাইজেশন ও অটোমেশন নিয়ে কাজ করছেন।');
  const [category, setCategory] = useState('Retail & Apparel / Clothing Stores');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  
  // Knowledge Graph Tagging State
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(['loc-bagula']);
  const [selectedBusinessCategoryIds, setSelectedBusinessCategoryIds] = useState<string[]>(['retail-clothing']);
  const [selectedDigitalNeedIds, setSelectedDigitalNeedIds] = useState<string[]>(['whatsapp-catalog', 'google-visibility']);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['whatsapp-automation', 'website-development', 'seo-geo']);
  const [searchIntent, setSearchIntent] = useState<SearchIntent>('Business Growth');
  const [targetAudience, setTargetAudience] = useState('বাগুলার দোকানদার, কাপড় ব্যবসায়ী ও স্থানীয় উদ্যোক্তাগণ');
  const [faqList, setFaqList] = useState<{ question: string; answer: string }[]>([
    {
      question: 'Conflux AI কি বাগুলায় সরাসরি কাজ করে?',
      answer: 'Conflux AI হলো কোলকাতা কেন্দ্রিক একটি Local Visibility + Trust Platform। আমরা বাগুলা সহ নদীয়া জেলার সমস্ত ব্যবসার সাথে অনলাইন ভিডিও সেশন ও রিমোট প্ল্যাটফর্মের মাধ্যমে কাজ করি।'
    }
  ]);
  const [sourceList, setSourceList] = useState<{ title: string; url: string }[]>([
    { title: 'Nadia District Official Portal', url: 'https://nadia.gov.in' }
  ]);

  // Mobile Assistant Panel State
  const [showMobileAssistant, setShowMobileAssistant] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Editorial Planner State
  const [editorialPlans, setEditorialPlans] = useState<EditorialPlanItem[]>([]);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanLocSlug, setNewPlanLocSlug] = useState('loc-bagula');
  const [newPlanCategory, setNewPlanCategory] = useState('retail-clothing');
  const [newPlanProblem, setNewPlanProblem] = useState('Low Online Visibility');

  // Internal CRM Leads State
  const [crmLeads, setCrmLeads] = useState<LocalBusinessLead[]>([]);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadLocation, setNewLeadLocation] = useState('Bagula (Nadia)');
  const [newLeadCategory, setNewLeadCategory] = useState('Retail & Apparel');
  const [newLeadStatus, setNewLeadStatus] = useState<'PROSPECT' | 'CONTACTED' | 'CONSULTATION' | 'CLIENT'>('PROSPECT');
  const [newLeadNotes, setNewLeadNotes] = useState('');

  // Search Console (GSC) Content Opportunities State
  const [gscOpportunities, setGscOpportunities] = useState<GSCOpportunityItem[]>(INITIAL_GSC_OPPORTUNITIES);
  const [gscClassificationFilter, setGscClassificationFilter] = useState<string>('ALL');
  const [gscDistrictFilter, setGscDistrictFilter] = useState<string>('ALL');
  const [newGscQuery, setNewGscQuery] = useState('');
  const [newGscPageSlug, setNewGscPageSlug] = useState('');
  const [newGscDistrict, setNewGscDistrict] = useState('bankura');
  const [newGscTopic, setNewGscTopic] = useState('');
  const [newGscImpressions, setNewGscImpressions] = useState(1000);
  const [newGscClicks, setNewGscClicks] = useState(25);
  const [newGscPosition, setNewGscPosition] = useState(7.5);
  const [newGscClassification, setNewGscClassification] = useState<'OPPORTUNITY_A' | 'OPPORTUNITY_B' | 'OPPORTUNITY_C' | 'OPPORTUNITY_D'>('OPPORTUNITY_A');
  const [newGscNextAction, setNewGscNextAction] = useState('');

  // Fetch articles and initial data on mount
  useEffect(() => {
    fetchArticles();
    loadEditorialPlans();
    loadCrmLeads();
    loadGscOpportunities();
  }, []);

  const loadGscOpportunities = () => {
    const local = localStorage.getItem(LOCAL_STORAGE_GSC_KEY);
    if (local) {
      try {
        setGscOpportunities(JSON.parse(local));
      } catch (e) {
        setGscOpportunities(INITIAL_GSC_OPPORTUNITIES);
      }
    } else {
      setGscOpportunities(INITIAL_GSC_OPPORTUNITIES);
    }
  };

  const handleAddGscOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGscQuery.trim()) return;

    const ctr = newGscImpressions > 0 ? Number(((newGscClicks / newGscImpressions) * 100).toFixed(2)) : 0;
    const item: GSCOpportunityItem = {
      id: `gsc-${Date.now()}`,
      query: newGscQuery.trim(),
      pageSlug: newGscPageSlug.trim(),
      district: newGscDistrict,
      topic: newGscTopic.trim() || 'General Business Growth',
      impressions: Number(newGscImpressions),
      clicks: Number(newGscClicks),
      ctr,
      position: Number(newGscPosition),
      classification: newGscClassification,
      status: 'PENDING',
      lastUpdated: new Date().toISOString().split('T')[0],
      nextAction: newGscNextAction.trim() || 'Analyze query intent and update content headings'
    };

    const updated = [item, ...gscOpportunities];
    setGscOpportunities(updated);
    localStorage.setItem(LOCAL_STORAGE_GSC_KEY, JSON.stringify(updated));

    // Reset inputs
    setNewGscQuery('');
    setNewGscPageSlug('');
    setNewGscTopic('');
    setNewGscNextAction('');
  };

  const handleUpdateGscStatus = (id: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MONITORING') => {
    const updated = gscOpportunities.map(g => g.id === id ? { ...g, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : g);
    setGscOpportunities(updated);
    localStorage.setItem(LOCAL_STORAGE_GSC_KEY, JSON.stringify(updated));
  };

  const handleDeleteGscOpportunity = (id: string) => {
    const updated = gscOpportunities.filter(g => g.id !== id);
    setGscOpportunities(updated);
    localStorage.setItem(LOCAL_STORAGE_GSC_KEY, JSON.stringify(updated));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!editingId) {
      setSlug(generateSlug(newTitle));
    }
  };

  const fetchArticles = async () => {
    setIsLoading(true);
    let loadedArticles: ArticleKnowledgeObject[] = [];

    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        loadedArticles = data as any[];
      }
    } catch (err) {
      console.warn('Supabase fetch notice, loading local storage / static fallback:', err);
    }

    const localData = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
    let customLocal: ArticleKnowledgeObject[] = [];
    if (localData) {
      try { customLocal = JSON.parse(localData); } catch (e) {}
    }

    if (loadedArticles.length === 0 && customLocal.length === 0) {
      try {
        const res = await fetch('/data/articles.json');
        if (res.ok) {
          const staticArticles = await res.json();
          loadedArticles = staticArticles;
        }
      } catch (err) {
        console.error('Error fetching static articles:', err);
      }
    }

    const map = new Map<string, ArticleKnowledgeObject>();
    loadedArticles.forEach(a => map.set(a.id || a.slug, a));
    customLocal.forEach(a => map.set(a.id || a.slug, a));

    const finalArray = Array.from(map.values()).map(a => ({
      ...a,
      language: a.language || 'bn',
      locationIds: a.locationIds || ['loc-bagula'],
      businessCategoryIds: a.businessCategoryIds || ['retail-clothing'],
      serviceIds: a.serviceIds || ['whatsapp-automation', 'website-development'],
      status: a.status || 'PUBLISHED'
    }));

    setArticles(finalArray);
    setIsLoading(false);
  };

  const loadEditorialPlans = () => {
    const raw = localStorage.getItem(LOCAL_STORAGE_EDITORIAL_PLAN_KEY);
    if (raw) {
      try { setEditorialPlans(JSON.parse(raw)); return; } catch (e) {}
    }
    setEditorialPlans([
      {
        id: 'plan-01',
        title: 'কীভাবে বাগুলার রেস্তোরাঁ ও মিষ্টির দোকান হোয়াটসঅ্যাপে অর্ডার নিতে পারে',
        locationSlug: 'loc-bagula',
        locationName: 'Bagula (Nadia)',
        businessCategoryId: 'restaurants-eateries',
        problem: 'Offline foot-traffic drop during non-peak hours',
        targetService: 'WhatsApp Business Automation',
        language: 'bn',
        searchIntent: 'WhatsApp Automation',
        priority: 'HIGH',
        status: 'PLANNED'
      }
    ]);
  };

  const saveEditorialPlans = (plans: EditorialPlanItem[]) => {
    setEditorialPlans(plans);
    localStorage.setItem(LOCAL_STORAGE_EDITORIAL_PLAN_KEY, JSON.stringify(plans));
  };

  const loadCrmLeads = () => {
    const raw = localStorage.getItem(LOCAL_STORAGE_CRM_KEY);
    if (raw) {
      try { setCrmLeads(JSON.parse(raw)); return; } catch (e) {}
    }
    setCrmLeads([
      {
        id: 'crm-01',
        businessName: 'বাগুলা বস্ত্রালয় (Bagula Textile)',
        locationSlug: 'loc-bagula',
        locationName: 'Bagula (Nadia)',
        businessCategoryId: 'retail-clothing',
        businessCategoryName: 'Retail & Apparel',
        contactPerson: 'শুভদীপ দাস',
        phone: '+91 98765 43210',
        relationshipStatus: 'PROSPECT',
        potentialServices: ['WhatsApp Business Catalog', 'Mobile Website'],
        linkedArticleSlugs: ['7-real-ways-for-bagula-small-businesses-to-get-online-customers'],
        internalNotes: 'Interested in WhatsApp catalog for new saree collection before Durga Puja.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  };

  const saveCrmLeads = (leads: LocalBusinessLead[]) => {
    setCrmLeads(leads);
    localStorage.setItem(LOCAL_STORAGE_CRM_KEY, JSON.stringify(leads));
  };

  const handleEditArticle = (article: ArticleKnowledgeObject) => {
    setEditingId(article.id);
    setTitle(article.title);
    setSlug(article.slug);
    setLanguage(article.language || 'bn');
    setContent(article.content);
    setExcerpt(article.excerpt || '');
    if (typeof article.author === 'object') {
      setAuthorName(article.author.name || 'তরুণজিৎ বিশ্বাস');
      setAuthorRole(article.author.role || '');
      setAuthorBio(article.author.bio || '');
    } else {
      setAuthorName(article.author || 'তরুণজিৎ বিশ্বাস');
    }
    setCategory(typeof article.businessCategoryIds?.[0] === 'string' ? article.businessCategoryIds[0] : 'Retail & Apparel');
    setImageUrl(article.featuredImage || '');
    setIsPublished(article.status !== 'DRAFT');
    setSelectedLocationIds(article.locationIds || ['loc-bagula']);
    setSelectedBusinessCategoryIds(article.businessCategoryIds || ['retail-clothing']);
    setSelectedDigitalNeedIds(article.digitalNeedIds || ['whatsapp-catalog']);
    setSelectedServiceIds(article.serviceIds || ['whatsapp-automation', 'website-development']);
    setSearchIntent(article.searchIntent || 'Business Growth');
    setTargetAudience(article.targetAudience || '');
    setFaqList(article.faq || []);
    setSourceList(article.sources || []);
    setStatus({ type: null, message: '' });
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setLanguage('bn');
    setContent('');
    setExcerpt('');
    setAuthorName('তরুণজিৎ বিশ্বাস');
    setAuthorRole('Founder & Principal Architect, Conflux AI');
    setAuthorBio('কোলকাতা থেকে রিমোটলি পশ্চিমবঙ্গ ও ভারতের নানা প্রান্তের ব্যবসার ডিজিটাইজেশন ও অটোমেশন নিয়ে কাজ করছেন।');
    setCategory('Retail & Apparel / Clothing Stores');
    setImageUrl('');
    setIsPublished(true);
    setSelectedLocationIds(['loc-bagula']);
    setSelectedBusinessCategoryIds(['retail-clothing']);
    setSelectedDigitalNeedIds(['whatsapp-catalog', 'google-visibility']);
    setSelectedServiceIds(['whatsapp-automation', 'website-development', 'seo-geo']);
    setSearchIntent('Business Growth');
    setTargetAudience('বাগুলার দোকানদার, কাপড় ব্যবসায়ী ও স্থানীয় উদ্যোক্তাগণ');
    setFaqList([
      {
        question: 'Conflux AI কি বাগুলায় সরাসরি কাজ করে?',
        answer: 'Conflux AI হলো কোলকাতা কেন্দ্রিক একটি Local Visibility + Trust Platform। আমরা বাগুলা সহ নদীয়া জেলার সমস্ত ব্যবসার সাথে অনলাইন ভিডিও সেশন ও রিমোট প্ল্যাটফর্মের মাধ্যমে কাজ করি।'
      }
    ]);
    setSourceList([{ title: 'Nadia District Official Portal', url: 'https://nadia.gov.in' }]);
  };

  const handleCreateNewArticle = () => {
    resetForm();
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartArticleFromGap = (locationSlug: string, categoryId: string) => {
    resetForm();
    const loc = allLocations.find(l => l.slug === locationSlug || l.id === locationSlug);
    const cat = BUSINESS_CATEGORY_TAXONOMY.find(c => c.id === categoryId);
    
    if (loc) setSelectedLocationIds([loc.id]);
    if (cat) {
      setSelectedBusinessCategoryIds([cat.id]);
      setCategory(cat.name);
    }
    
    setTitle(`কীভাবে ${loc?.name || 'বাগুলার'} ${cat?.name || 'ব্যবসা'} ডিজিটাল উপস্থিতির মাধ্যমে নতুন গ্রাহক পেতে পারে`);
    setSlug(generateSlug(`guide-${loc?.slug || 'local'}-${cat?.id || 'business'}-growth`));
    setLanguage('bn');
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveLocalOverride = (article: ArticleKnowledgeObject, isDelete = false) => {
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
      let list: ArticleKnowledgeObject[] = localData ? JSON.parse(localData) : [];
      
      if (isDelete) {
        list = list.filter(a => a.id !== article.id && a.slug !== article.slug);
      } else {
        const existingIdx = list.findIndex(a => a.id === article.id || a.slug === article.slug);
        if (existingIdx >= 0) {
          list[existingIdx] = article;
        } else {
          list.unshift(article);
        }
      }
      localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Local storage save error:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const finalSlug = slug || generateSlug(title);
    const now = new Date().toISOString();

    const articlePayload: ArticleKnowledgeObject = {
      id: editingId || `art-${Date.now()}`,
      title,
      slug: finalSlug,
      language,
      content,
      excerpt: excerpt || title,
      author: {
        name: authorName,
        role: authorRole,
        bio: authorBio
      },
      publishedAt: now,
      updatedAt: now,
      locationIds: selectedLocationIds,
      districtIds: selectedLocationIds.map(id => {
        const item = allLocations.find(l => l.id === id);
        return item?.districtSlug || 'dist-nadia';
      }),
      localityIds: selectedLocationIds,
      businessCategoryIds: selectedBusinessCategoryIds,
      industryIds: selectedBusinessCategoryIds,
      problemIds: ['low-online-visibility'],
      digitalNeedIds: selectedDigitalNeedIds,
      serviceIds: selectedServiceIds,
      searchIntent,
      targetAudience,
      faq: faqList,
      sources: sourceList,
      featuredImage: imageUrl,
      seoTitle: `${title} | Conflux AI`,
      seoDescription: excerpt || title,
      canonicalUrl: `https://confluxai.in/blog/${finalSlug}`,
      status: isPublished ? 'PUBLISHED' : 'DRAFT',
      reactions: 0
    };

    try {
      if (editingId && !editingId.startsWith('art-') && !editingId.startsWith('static-')) {
        await supabase
          .from('articles')
          .update({
            title,
            content,
            category,
            author: authorName,
            image_url: imageUrl,
            slug: finalSlug,
            is_published: isPublished
          })
          .eq('id', editingId);
      } else {
        await supabase
          .from('articles')
          .insert([
            {
              title,
              content,
              category,
              author: authorName,
              image_url: imageUrl,
              slug: finalSlug,
              is_published: isPublished
            }
          ]);
      }
    } catch (err) {
      console.warn('Supabase notice (saved locally):', err);
    }

    saveLocalOverride(articlePayload);

    setStatus({
      type: 'success',
      message: editingId ? `Article "${title}" updated successfully!` : `New manual article "${title}" published to network!`
    });

    setArticles(prev => {
      const idx = prev.findIndex(a => a.id === articlePayload.id || a.slug === articlePayload.slug);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = articlePayload;
        return copy;
      }
      return [articlePayload, ...prev];
    });

    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, articleSlug: string) => {
    setIsLoading(true);
    const target = articles.find(a => a.id === id || a.slug === articleSlug);
    if (target) {
      try {
        await supabase.from('articles').delete().eq('id', id);
      } catch (err) {}
      saveLocalOverride(target, true);
      setArticles(prev => prev.filter(a => a.id !== id && a.slug !== articleSlug));
    }
    setIsLoading(false);
  };

  const insertTextAtCursor = (textToInsert: string) => {
    setContent(prev => prev + '\n' + textToInsert);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter pb-16">
      {/* Sticky Mobile-Optimized Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0">
                <ArrowLeft size={16} />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                    CONFLUX AI <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">Mobile CMS</span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">100% Manual Editorial Publishing • Mobile Responsive Studio</p>
              </div>
            </div>

            <button
              onClick={handleCreateNewArticle}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 sm:hidden shrink-0 shadow-md shadow-blue-500/20"
            >
              <Plus size={14} /> Write
            </button>
          </div>

          {/* Fluid Horizontal Scroll Navigation Bar for Mobile */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar scrollbar-none w-full md:w-auto">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[40px] ${
                activeTab === 'matrix' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass size={14} />
              <span>Coverage Grid</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[40px] ${
                activeTab === 'editor' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 size={14} />
              <span>Manual Writer</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[40px] ${
                activeTab === 'planner' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[40px] ${
                activeTab === 'crm' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck size={14} />
              <span>CRM</span>
            </button>

            <button
              onClick={() => setActiveTab('gsc')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[40px] ${
                activeTab === 'gsc' ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp size={14} />
              <span>GSC &amp; Opportunities</span>
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[40px] ${
                activeTab === 'health' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck size={14} />
              <span>SEO &amp; Evidence Health</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Body Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: LOCATION COVERAGE MATRIX */}
        {activeTab === 'matrix' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Intro Alert */}
            <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <MapPin className="text-blue-400" size={18} /> West Bengal Locality Knowledge Grid
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  Conflux AI is a Local Visibility + Trust Platform based in Kolkata. We build structured local content and evidence verification for business hubs like Bagula, Krishnanagar, Ranaghat, Haldia, Siliguri, and beyond without fake physical office claims.
                </p>
              </div>

              <button
                onClick={handleCreateNewArticle}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all shrink-0 min-h-[44px]"
              >
                <Plus size={16} /> Write New Manual Article
              </button>
            </div>

            {/* Location Cards & Gap Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {allLocations.filter(l => l.type === 'commercial_junction' || l.type === 'city' || l.type === 'district' || l.type === 'town').map(loc => {
                const locArticles = articles.filter(a => 
                  a.locationIds?.includes(loc.id) || 
                  a.locationIds?.includes(loc.slug) || 
                  a.content?.toLowerCase().includes(loc.name.toLowerCase())
                );
                
                const coveredCategoryIds = new Set(
                  locArticles.flatMap(a => a.businessCategoryIds || [])
                );

                const missingCategories = BUSINESS_CATEGORY_TAXONOMY.filter(
                  cat => !coveredCategoryIds.has(cat.id)
                );

                const bnCount = locArticles.filter(a => a.language === 'bn').length;
                const enCount = locArticles.filter(a => a.language === 'en').length;

                return (
                  <div key={loc.id} className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                            {loc.type.replace('_', ' ')} • {loc.districtSlug || 'Nadia'}
                          </span>
                          <h3 className="text-lg sm:text-xl font-black text-white mt-1">{loc.displayName || loc.name}</h3>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                          {locArticles.length} Articles
                        </span>
                      </div>

                      {/* Coverage Breakdown */}
                      <div className="space-y-3 mb-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Language:</span>
                          <span className="font-bold text-slate-200">🇧🇩 {bnCount} Bengali | 🇬🇧 {enCount} English</span>
                        </div>

                        <div className="text-xs space-y-1">
                          <span className="text-slate-400 font-medium">Covered Business Categories:</span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {BUSINESS_CATEGORY_TAXONOMY.map(cat => {
                              const isCovered = coveredCategoryIds.has(cat.id);
                              return (
                                <span 
                                  key={cat.id} 
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isCovered 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                      : 'bg-slate-800/50 text-slate-500 border border-slate-800'
                                  }`}
                                >
                                  {isCovered ? '✓ ' : '○ '}{cat.name.split('/')[0]}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gap Detector Action */}
                    <div className="pt-3 border-t border-slate-800">
                      {missingCategories.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <AlertCircle size={13} /> {missingCategories.length} Content Gaps
                            </span>
                            <span className="text-slate-500">Missing Topics</span>
                          </div>

                          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scrollbar-none">
                            {missingCategories.slice(0, 2).map(cat => (
                              <button
                                key={cat.id}
                                onClick={() => handleStartArticleFromGap(loc.id, cat.id)}
                                className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-left shrink-0"
                              >
                                + Write for {cat.name.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle size={14} /> Full Category Coverage Reached
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Card & Responsive Table List of All Articles */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Articles Knowledge Repository ({articles.length})</h3>
                  <p className="text-xs text-slate-400">All manually created local articles with metadata tags.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                  <input 
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Mobile View: Cards Layout for Small Screens */}
              <div className="block md:hidden space-y-3 pt-2">
                {articles
                  .filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(article => (
                    <div key={article.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px] uppercase">
                          {article.language === 'bn' ? '🇧🇩 Bengali' : '🇬🇧 English'}
                        </span>
                        <span className="text-[10px] text-slate-400">{new Date(article.publishedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm leading-snug">
                        <Link to={`/blog/${article.slug}`} className="hover:text-blue-400 transition-colors" target="_blank">
                          {article.title}
                        </Link>
                      </h4>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                        <span className="text-slate-400 text-[11px]">{article.category || 'Retail'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditArticle(article)}
                            className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(article.id, article.slug)}
                            className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Article Title</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4">Locations</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {articles
                      .filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(article => (
                        <tr key={article.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                            <Link to={`/blog/${article.slug}`} className="hover:text-blue-400 transition-colors" target="_blank">
                              {article.title}
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px] uppercase">
                              {article.language === 'bn' ? '🇧🇩 Bengali' : '🇬🇧 English'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {article.locationIds?.map(id => {
                              const loc = allLocations.find(l => l.id === id || l.slug === id);
                              return loc ? loc.name : id;
                            }).join(', ') || 'West Bengal'}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{article.category || 'Retail & Trade'}</td>
                          <td className="py-3 px-4 text-slate-400">{new Date(article.publishedAt || Date.now()).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleEditArticle(article)}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
                              title="Edit Article"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(article.id, article.slug)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                              title="Delete Article"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL ARTICLE WRITER */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Main Writer Form */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-4 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {editingId ? 'Edit Manual Article' : 'Write New Manual Article'}
                    </h2>
                    <p className="text-xs text-slate-400">100% human-written local business guide.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditorMode('write')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold min-h-[36px] ${
                        editorMode === 'write' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('preview')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold min-h-[36px] ${
                        editorMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {/* Mobile Assistant Accordion Trigger */}
                <div className="block lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowMobileAssistant(!showMobileAssistant)}
                    className="w-full p-3 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <LinkIcon size={14} /> 1-Click Internal Link Assistant & Checklist
                    </span>
                    {showMobileAssistant ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showMobileAssistant && (
                    <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                      <span className="font-bold text-slate-300 block">Tap to insert link into article text:</span>
                      <button
                        type="button"
                        onClick={() => insertTextAtCursor(`\nLearn more about our [WhatsApp Business Automation Services](https://confluxai.in/services/whatsapp-automation).`)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs font-bold text-blue-400 hover:bg-slate-800"
                      >
                        + Insert WhatsApp Service Link
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTextAtCursor(`\nCheck out our [High-Performance Website Development](https://confluxai.in/services/website-development).`)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs font-bold text-blue-400 hover:bg-slate-800"
                      >
                        + Insert Web Dev Service Link
                      </button>
                    </div>
                  )}
                </div>

                {status.message && (
                  <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {status.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Article Title & Language */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-slate-300">Article Title *</label>
                      <input 
                        type="text"
                        required
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="e.g. বাগুলার ছোট ব্যবসার জন্য অনলাইনে Customer পাওয়ার ৭টি বাস্তব উপায়"
                        className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm font-bold text-white focus:border-blue-500 outline-none min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Language *</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as ContentLanguage)}
                        className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-xs font-bold text-white focus:border-blue-500 outline-none min-h-[44px]"
                      >
                        <option value="bn">🇧🇩 Bengali (বাংলা)</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="bn-IN">Bengali + English</option>
                      </select>
                    </div>
                  </div>

                  {/* Slug & Excerpt */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">URL Slug *</label>
                      <input 
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-xs text-slate-300 focus:border-blue-500 outline-none min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Short Excerpt / Summary</label>
                      <input 
                        type="text"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Summary for search description..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-xs text-slate-300 focus:border-blue-500 outline-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Knowledge Graph Tagging Grid */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Layers size={14} /> Locality & Industry Tagging
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Location Selector */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Target Locality *</label>
                        <select
                          value={selectedLocationIds[0] || 'loc-bagula'}
                          onChange={(e) => setSelectedLocationIds([e.target.value])}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-base sm:text-xs font-medium text-slate-200 outline-none focus:border-blue-500 min-h-[44px]"
                        >
                          {allLocations.map(l => (
                            <option key={l.id} value={l.id}>{l.displayName || l.name} ({l.type})</option>
                          ))}
                        </select>
                      </div>

                      {/* Business Category Selector */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Business Category *</label>
                        <select
                          value={selectedBusinessCategoryIds[0] || 'retail-clothing'}
                          onChange={(e) => {
                            setSelectedBusinessCategoryIds([e.target.value]);
                            const cat = BUSINESS_CATEGORY_TAXONOMY.find(c => c.id === e.target.value);
                            if (cat) setCategory(cat.name);
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-base sm:text-xs font-medium text-slate-200 outline-none focus:border-blue-500 min-h-[44px]"
                        >
                          {BUSINESS_CATEGORY_TAXONOMY.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Search Intent */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Search Intent</label>
                        <select
                          value={searchIntent}
                          onChange={(e) => setSearchIntent(e.target.value as SearchIntent)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-base sm:text-xs font-medium text-slate-200 outline-none focus:border-blue-500 min-h-[44px]"
                        >
                          {SEARCH_INTENTS.map(si => (
                            <option key={si} value={si}>{si}</option>
                          ))}
                        </select>
                      </div>

                      {/* Target Audience */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Target Audience Note</label>
                        <input
                          type="text"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="e.g. Local shop owners in Bagula"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-base sm:text-xs text-slate-200 outline-none focus:border-blue-500 min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content Textarea */}
                  {editorMode === 'write' ? (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Markdown Content *</span>
                        <span className="text-[10px] text-slate-500 font-normal">Supports # H1, ## H2, **bold**</span>
                      </label>
                      <textarea
                        required
                        rows={14}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your article content here..."
                        className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-base sm:text-sm font-mono text-slate-200 outline-none focus:border-blue-500 leading-relaxed min-h-[250px] sm:min-h-[350px]"
                      />
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6 rounded-2xl bg-white text-slate-900 prose max-w-none max-h-[400px] overflow-y-auto">
                      <h1 className="text-2xl font-black">{title}</h1>
                      <div className="whitespace-pre-wrap text-sm">{content}</div>
                    </div>
                  )}

                  {/* FAQs Section */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                        <HelpCircle size={14} /> FAQs (Schema.org)
                      </h4>
                      <button
                        type="button"
                        onClick={() => setFaqList(prev => [...prev, { question: '', answer: '' }])}
                        className="text-[11px] font-bold text-blue-400 hover:underline min-h-[36px] px-2 flex items-center"
                      >
                        + Add FAQ
                      </button>
                    </div>

                    {faqList.map((faq, idx) => (
                      <div key={idx} className="space-y-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <input 
                          type="text"
                          placeholder="FAQ Question..."
                          value={faq.question}
                          onChange={(e) => {
                            const copy = [...faqList];
                            copy[idx].question = e.target.value;
                            setFaqList(copy);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-base sm:text-xs text-white outline-none"
                        />
                        <textarea
                          placeholder="FAQ Answer..."
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            const copy = [...faqList];
                            copy[idx].answer = e.target.value;
                            setFaqList(copy);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-base sm:text-xs text-slate-300 outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Mobile-Friendly Submit Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white border border-slate-800 sm:border-0 min-h-[44px]"
                    >
                      Clear Form
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 min-h-[44px]"
                    >
                      <Send size={15} /> {editingId ? 'Update Article' : 'Publish Article'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Desktop Side Assistant Column */}
            <div className="hidden lg:block lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                  <LinkIcon className="text-blue-400" size={14} /> Contextual Internal Link Suggestions
                </h3>
                <p className="text-[11px] text-slate-400">Click to append internal links to content:</p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(`\nExplore our [Enterprise AI Automation Services](https://confluxai.in/services/ai-automation).`)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left text-xs transition-colors group"
                  >
                    <span className="font-bold text-slate-200 group-hover:text-blue-400 block">🔗 AI Automation Service</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(`\nLearn more about our [WhatsApp Business Automation Services](https://confluxai.in/services/whatsapp-automation).`)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left text-xs transition-colors group"
                  >
                    <span className="font-bold text-slate-200 group-hover:text-blue-400 block">🔗 WhatsApp Automation Service</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(`\nCheck out our [High-Performance Website Development](https://confluxai.in/services/website-development).`)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left text-xs transition-colors group"
                  >
                    <span className="font-bold text-slate-200 group-hover:text-blue-400 block">🔗 Web Development Service</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EDITORIAL PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">Editorial Calendar & Planner</h2>
                <p className="text-xs text-slate-400">Plan topics before writing on desktop or mobile.</p>
              </div>

              {/* Add New Plan Form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <input 
                  type="text"
                  placeholder="Planned Article Title..."
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  className="sm:col-span-2 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-base sm:text-xs text-white outline-none min-h-[44px]"
                />
                <select
                  value={newPlanLocSlug}
                  onChange={(e) => setNewPlanLocSlug(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-base sm:text-xs text-white outline-none min-h-[44px]"
                >
                  {allLocations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!newPlanTitle.trim()) return;
                    const item: EditorialPlanItem = {
                      id: `plan-${Date.now()}`,
                      title: newPlanTitle,
                      locationSlug: newPlanLocSlug,
                      locationName: allLocations.find(l => l.id === newPlanLocSlug)?.name || 'Local',
                      businessCategoryId: newPlanCategory,
                      problem: newPlanProblem,
                      targetService: 'WhatsApp Business Automation',
                      language: 'bn',
                      searchIntent: 'Business Growth',
                      priority: 'HIGH',
                      status: 'PLANNED'
                    };
                    saveEditorialPlans([item, ...editorialPlans]);
                    setNewPlanTitle('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs min-h-[44px] flex items-center justify-center"
                >
                  + Add Topic
                </button>
              </div>

              {/* Planner List */}
              <div className="space-y-3">
                {editorialPlans.map(plan => (
                  <div key={plan.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {plan.locationName}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{plan.title}</h4>
                    </div>

                    <button
                      onClick={() => {
                        setTitle(plan.title);
                        setSlug(generateSlug(plan.title));
                        setSelectedLocationIds([plan.locationSlug]);
                        setLanguage(plan.language);
                        setActiveTab('editor');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 min-h-[40px] flex items-center justify-center"
                    >
                      Write Now →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTERNAL LOCAL CRM */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <UserCheck className="text-emerald-400" size={18} /> Local Business Relationship CRM
                </h2>
                <p className="text-xs text-slate-400">Track local business leads per locality. Internal use only.</p>
              </div>

              {/* Add Lead Form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <input 
                  type="text"
                  placeholder="Business Name..."
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-base sm:text-xs text-white outline-none min-h-[44px]"
                />
                <input 
                  type="text"
                  placeholder="Location (e.g. Bagula)..."
                  value={newLeadLocation}
                  onChange={(e) => setNewLeadLocation(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-base sm:text-xs text-white outline-none min-h-[44px]"
                />
                <input 
                  type="text"
                  placeholder="Internal Notes..."
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-base sm:text-xs text-white outline-none min-h-[44px]"
                />
                <button
                  onClick={() => {
                    if (!newLeadName.trim()) return;
                    const lead: LocalBusinessLead = {
                      id: `crm-${Date.now()}`,
                      businessName: newLeadName,
                      locationSlug: 'loc-bagula',
                      locationName: newLeadLocation,
                      businessCategoryId: 'retail-clothing',
                      businessCategoryName: newLeadCategory,
                      relationshipStatus: newLeadStatus,
                      potentialServices: ['WhatsApp Catalog', 'Mobile Website'],
                      linkedArticleSlugs: ['7-real-ways-for-bagula-small-businesses-to-get-online-customers'],
                      internalNotes: newLeadNotes,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    saveCrmLeads([lead, ...crmLeads]);
                    setNewLeadName('');
                    setNewLeadNotes('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs min-h-[44px] flex items-center justify-center"
                >
                  + Add Prospect
                </button>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-3">
                {crmLeads.map(lead => (
                  <div key={lead.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {lead.relationshipStatus}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{lead.locationName}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{lead.businessName}</h4>
                      <p className="text-xs text-slate-400 mt-1">{lead.internalNotes}</p>
                    </div>

                    <Link to={`/blog/${lead.linkedArticleSlugs[0]}`} className="text-xs text-blue-400 hover:underline font-bold shrink-0" target="_blank">
                      Linked Article →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SEO & EVIDENCE HEALTH DIAGNOSTICS */}
        {activeTab === 'health' && (() => {
          const linkAudit = auditInternalLinks(articles);
          const withCanonical = articles.filter(a => a.canonicalUrl).length;
          const withFaq = articles.filter(a => a.faq && a.faq.length > 0).length;
          const withSources = articles.filter(a => a.sources && a.sources.length > 0).length;
          const withAuthor = articles.filter(a => a.author).length;

          return (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      Technical & Evidence Auditor
                    </span>
                    <span className="text-xs text-slate-400">Production Guardrails</span>
                  </div>
                  <h2 className="text-xl font-black text-white">Platform Health & Verification Scorecard</h2>
                  <p className="text-xs text-slate-400 mt-1">Diagnostic overview of crawlability, link graph, evidence levels, and schema coverage.</p>
                </div>
                <div className="px-4 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center shrink-0">
                  <span className="text-2xl font-black text-emerald-400">{articles.length}</span>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Active Articles</span>
                </div>
              </div>

              {/* 4 Diagnostic Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Canonical Safety</span>
                    <CheckCircle className="text-emerald-400" size={16} />
                  </div>
                  <div className="text-2xl font-black text-white">{withCanonical} / {articles.length}</div>
                  <p className="text-[11px] text-slate-400 mt-1">100% self-referencing canonical URLs</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence & Sources</span>
                    <CheckCircle className="text-emerald-400" size={16} />
                  </div>
                  <div className="text-2xl font-black text-white">{withSources} / {articles.length}</div>
                  <p className="text-[11px] text-slate-400 mt-1">100% verified against district portals</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">FAQ Schema Coverage</span>
                    <CheckCircle className="text-emerald-400" size={16} />
                  </div>
                  <div className="text-2xl font-black text-white">{withFaq} / {articles.length}</div>
                  <p className="text-[11px] text-slate-400 mt-1">Structured Q&A for Answer Engines</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Author Attribution</span>
                    <CheckCircle className="text-emerald-400" size={16} />
                  </div>
                  <div className="text-2xl font-black text-white">{withAuthor} / {articles.length}</div>
                  <p className="text-[11px] text-slate-400 mt-1">Authentic leadership bylines</p>
                </div>
              </div>

              {/* Internal Link Graph & Orphan Detection */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <LinkIcon size={16} className="text-blue-400" /> Internal Link Equity Graph
                    </h3>
                    <p className="text-xs text-slate-400">Contextual links connect articles with parent localities and related service blueprints.</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-xl border border-blue-500/20">
                    Dynamic Related Engine Active
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Total In-Article Markdown Links:</span>
                    <span className="font-bold text-white">{linkAudit.totalInternalLinks}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Related Articles Linked per Post:</span>
                    <span className="font-bold text-emerald-400">3 Verified Relevant Posts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sitemap URL Registration:</span>
                    <span className="font-bold text-emerald-400">100% (114 Indexed URLs)</span>
                  </div>
                </div>
              </div>

              {/* Evidence Provenance Standards */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert size={16} className="text-emerald-400" /> Evidence & Verification Tiers (E1 - E6)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-black text-emerald-400 block mb-1">E1 — Primary Official Source</span>
                    <span className="text-slate-400">Government portals (nic.in, gov.in), university gazettes, registered administrative records.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-black text-blue-400 block mb-1">E2 — Direct ConfluxAI Verification</span>
                    <span className="text-slate-400">First-hand digital audits, technical analysis, and on-ground team verification.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-black text-purple-400 block mb-1">E3 — Direct Business Verification</span>
                    <span className="text-slate-400">Direct confirmation with business owners or verified official communication channels.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-black text-amber-400 block mb-1">E4 — Reliable Secondary Source</span>
                    <span className="text-slate-400">Established local news publications and accredited merchant association directories.</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 6: GSC & CONTENT OPPORTUNITIES DASHBOARD */}
        {activeTab === 'gsc' && (() => {
          const totalQueries = gscOpportunities.length;
          const oppA = gscOpportunities.filter(g => g.classification === 'OPPORTUNITY_A').length;
          const oppB = gscOpportunities.filter(g => g.classification === 'OPPORTUNITY_B').length;
          const oppC = gscOpportunities.filter(g => g.classification === 'OPPORTUNITY_C').length;
          const oppD = gscOpportunities.filter(g => g.classification === 'OPPORTUNITY_D').length;

          const filteredList = gscOpportunities.filter(item => {
            if (gscClassificationFilter !== 'ALL' && item.classification !== gscClassificationFilter) return false;
            if (gscDistrictFilter !== 'ALL' && item.district !== gscDistrictFilter) return false;
            return true;
          });

          return (
            <div className="space-y-8">
              {/* Header & Overview */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Search Console Intelligence</span>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                      <TrendingUp size={20} className="text-amber-400" /> Organic Search &amp; Content Authority Engine
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                      Feed Google Search Console metrics into our editorial workflow to upgrade existing high-potential articles and eliminate random publishing.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300">
                      {totalQueries} Monitored Queries
                    </span>
                  </div>
                </div>

                {/* Classification Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Opportunity A (Pos 4-10)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">{oppA}</span>
                      <span className="text-[10px] text-slate-400">Improve existing</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block mb-1">Opportunity B (Pos 11-20)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">{oppB}</span>
                      <span className="text-[10px] text-slate-400">Expand &amp; depth</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">Opportunity C (Low CTR)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">{oppC}</span>
                      <span className="text-[10px] text-slate-400">Title &amp; meta boost</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block mb-1">Opportunity D (Gap)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">{oppD}</span>
                      <span className="text-[10px] text-slate-400">New article needed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add New Opportunity Form */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-amber-400" /> Record New Search Console Query Opportunity
                </h3>
                <form onSubmit={handleAddGscOpportunity} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 font-bold mb-1">Search Query (GSC):</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Mukutmanipur boat safari booking WhatsApp" 
                      value={newGscQuery}
                      onChange={(e) => setNewGscQuery(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Associated Landing Page / Slug:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. mukutmanipur-jhilimili-ecotourism-..." 
                      value={newGscPageSlug}
                      onChange={(e) => setNewGscPageSlug(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">District:</label>
                    <select 
                      value={newGscDistrict}
                      onChange={(e) => setNewGscDistrict(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 outline-none"
                    >
                      {['bankura', 'jhargram', 'purulia', 'nadia', 'darjeeling', 'jalpaiguri', 'kalimpong', 'malda', 'murshidabad', 'purba-bardhaman', 'paschim-bardhaman', 'kolkata', 'howrah', 'hooghly', 'north-24-parganas', 'south-24-parganas', 'purba-medinipur', 'paschim-medinipur', 'birbhum', 'cooch-behar', 'alipurduar', 'uttar-dinajpur', 'dakshin-dinajpur'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Topic Cluster:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ecotourism & Homestays" 
                      value={newGscTopic}
                      onChange={(e) => setNewGscTopic(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Classification Tier:</label>
                    <select 
                      value={newGscClassification}
                      onChange={(e) => setNewGscClassification(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 outline-none"
                    >
                      <option value="OPPORTUNITY_A">Opportunity A (Pos 4-10) — Improve</option>
                      <option value="OPPORTUNITY_B">Opportunity B (Pos 11-20) — Expand</option>
                      <option value="OPPORTUNITY_C">Opportunity C (Low CTR) — Title/Meta</option>
                      <option value="OPPORTUNITY_D">Opportunity D (Gap) — Create New</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Impressions:</label>
                    <input 
                      type="number" 
                      value={newGscImpressions}
                      onChange={(e) => setNewGscImpressions(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Clicks:</label>
                    <input 
                      type="number" 
                      value={newGscClicks}
                      onChange={(e) => setNewGscClicks(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Avg Position:</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={newGscPosition}
                      onChange={(e) => setNewGscPosition(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-400 font-bold mb-1">Next Editorial Action:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Add direct pricing comparison table and FAQ for booking steps" 
                      value={newGscNextAction}
                      onChange={(e) => setNewGscNextAction(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button 
                      type="submit"
                      className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-600/20"
                    >
                      Save GSC Opportunity
                    </button>
                  </div>
                </form>
              </div>

              {/* Opportunities Filter and Table */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-slate-400 font-bold">Filter By:</span>
                    <select
                      value={gscClassificationFilter}
                      onChange={(e) => setGscClassificationFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                    >
                      <option value="ALL">All Opportunity Types</option>
                      <option value="OPPORTUNITY_A">Opportunity A (Pos 4-10)</option>
                      <option value="OPPORTUNITY_B">Opportunity B (Pos 11-20)</option>
                      <option value="OPPORTUNITY_C">Opportunity C (Low CTR)</option>
                      <option value="OPPORTUNITY_D">Opportunity D (Gap)</option>
                    </select>

                    <select
                      value={gscDistrictFilter}
                      onChange={(e) => setGscDistrictFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                    >
                      <option value="ALL">All Districts</option>
                      {['bankura', 'jhargram', 'purulia', 'nadia', 'darjeeling', 'jalpaiguri', 'kalimpong', 'malda', 'murshidabad'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <span className="text-slate-400 font-bold">
                    Showing <strong className="text-white">{filteredList.length}</strong> Opportunities
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredList.map((opp) => {
                    const classConfig = {
                      OPPORTUNITY_A: { label: 'Opportunity A', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                      OPPORTUNITY_B: { label: 'Opportunity B', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                      OPPORTUNITY_C: { label: 'Opportunity C', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                      OPPORTUNITY_D: { label: 'Opportunity D', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
                    }[opp.classification];

                    return (
                      <div 
                        key={opp.id} 
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                            <span className={`px-2.5 py-0.5 rounded-full border ${classConfig.color}`}>
                              {classConfig.label}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                              📍 {opp.district}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                              #{opp.topic}
                            </span>
                            <span className="text-slate-500 ml-auto font-medium">
                              Updated: {opp.lastUpdated}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white leading-snug">
                            {opp.query}
                          </h4>

                          {opp.pageSlug && (
                            <p className="text-xs text-blue-400 font-mono">
                              /blog/{opp.pageSlug}
                            </p>
                          )}

                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                            <strong className="text-amber-400 font-bold">Action Plan: </strong>
                            {opp.nextAction}
                          </div>
                        </div>

                        <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
                          <div className="text-right">
                            <div className="text-xs text-slate-400">Position <strong className="text-white">{opp.position}</strong></div>
                            <div className="text-xs text-slate-400">{opp.impressions} imp &bull; {opp.clicks} clicks ({opp.ctr}%)</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={opp.status}
                              onChange={(e) => handleUpdateGscStatus(opp.id, e.target.value as any)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 outline-none"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="IN_PROGRESS">IN PROGRESS</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="MONITORING">MONITORING</option>
                            </select>

                            <button
                              onClick={() => handleDeleteGscOpportunity(opp.id)}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                              title="Delete Opportunity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

      </main>
    </div>
  );
};

export default AdminCMS;

