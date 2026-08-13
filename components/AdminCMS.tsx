import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Send, Image as ImageIcon, Layout, Type, FileText, CheckCircle, 
  AlertCircle, Zap, Edit3, Trash2, Eye, Plus, Search, Filter, 
  Globe, Clock, User, ArrowLeft, RefreshCw, Layers, MapPin, 
  Building2, HelpCircle, Link as LinkIcon, Compass, Sparkles, 
  TrendingUp, Calendar, BookOpen, UserCheck, ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllLocations, LocationItem } from '../data/locationsData';
import { BUSINESS_CATEGORY_TAXONOMY, DIGITAL_NEED_TAXONOMY } from '../data/taxonomiesData';
import { ArticleKnowledgeObject, ContentLanguage, SearchIntent, ArticleStatus, LocalBusinessLead, EditorialPlanItem } from '../types/article';

const LOCAL_STORAGE_ARTICLES_KEY = 'conflux_custom_articles';
const LOCAL_STORAGE_EDITORIAL_PLAN_KEY = 'conflux_editorial_plan';
const LOCAL_STORAGE_CRM_KEY = 'conflux_local_crm_leads';

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
  const [activeTab, setActiveTab] = useState<'editor' | 'matrix' | 'planner' | 'crm'>('matrix');
  
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
      answer: 'Conflux AI হলো কোলকাতা কেন্দ্রিক একটি Remote-First AI Automation Agency। আমরা বাগুলা সহ নদীয়া জেলার সমস্ত ব্যবসার সাথে অনলাইন ভিডিও সেশন ও রিমোট প্ল্যাটফর্মের মাধ্যমে কাজ করি।'
    }
  ]);
  const [sourceList, setSourceList] = useState<{ title: string; url: string }[]>([
    { title: 'Nadia District Official Portal', url: 'https://nadia.gov.in' }
  ]);

  // Editor Sub-tabs & Helper State
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  // Fetch articles and initial data on mount
  useEffect(() => {
    fetchArticles();
    loadEditorialPlans();
    loadCrmLeads();
  }, []);

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
      // 1. Fetch from Supabase if available
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

    // 2. Fetch local storage overrides
    const localData = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
    let customLocal: ArticleKnowledgeObject[] = [];
    if (localData) {
      try { customLocal = JSON.parse(localData); } catch (e) {}
    }

    // 3. Fallback to static articles.json
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

    // Combine local overrides with loaded articles
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
    // Default sample plan
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
      },
      {
        id: 'plan-02',
        title: 'How Siliguri Hotels Can Get Direct Room Bookings via WhatsApp Bot',
        locationSlug: 'siliguri',
        locationName: 'Siliguri (Darjeeling)',
        businessCategoryId: 'restaurants-eateries',
        problem: 'High OTA platform commissions',
        targetService: 'WhatsApp Business Automation',
        language: 'en',
        searchIntent: 'Lead Generation',
        priority: 'HIGH',
        status: 'IDEA'
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
        answer: 'Conflux AI হলো কোলকাতা কেন্দ্রিক একটি Remote-First AI Automation Agency। আমরা বাগুলা সহ নদীয়া জেলার সমস্ত ব্যবসার সাথে অনলাইন ভিডিও সেশন ও রিমোট প্ল্যাটফর্মের মাধ্যমে কাজ করি।'
      }
    ]);
    setSourceList([{ title: 'Nadia District Official Portal', url: 'https://nadia.gov.in' }]);
  };

  const handleCreateNewArticle = () => {
    resetForm();
    setActiveTab('editor');
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
      // 1. Supabase Sync attempt
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

    // 2. Save to local storage engine
    saveLocalOverride(articlePayload);

    setStatus({
      type: 'success',
      message: editingId ? `Article "${title}" updated successfully!` : `New manual article "${title}" published to network!`
    });

    // Update in-memory state
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
    setDeleteConfirmId(null);
    setIsLoading(false);
  };

  // Helper insertion for internal link suggestion
  const insertTextAtCursor = (textToInsert: string) => {
    setContent(prev => prev + '\n' + textToInsert);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  CONFLUX AI <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">Local Relationship & Knowledge CMS</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium">100% Manual Editorial Publishing • Location Knowledge Graph • Zero Automated AI</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'matrix' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass size={15} />
              <span>Location Coverage Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'editor' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 size={15} />
              <span>Manual Article Writer</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'planner' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar size={15} />
              <span>Editorial Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'crm' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck size={15} />
              <span>Internal CRM</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: LOCATION COVERAGE MATRIX */}
        {activeTab === 'matrix' && (
          <div className="space-y-8">
            {/* Intro Alert */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <MapPin className="text-blue-400" size={20} /> West Bengal Locality Knowledge Grid
                </h2>
                <p className="text-xs text-slate-400 max-w-3xl">
                  Conflux AI is a remote-first AI automation agency based in Kolkata. We build structured local content for business hubs like Bagula, Krishnanagar, Ranaghat, Haldia, Siliguri, and beyond without fake physical office claims.
                </p>
              </div>

              <button
                onClick={handleCreateNewArticle}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all shrink-0"
              >
                <Plus size={16} /> Write New Manual Article
              </button>
            </div>

            {/* Location Cards & Gap Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div key={loc.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                            {loc.type.replace('_', ' ')} • {loc.districtSlug || 'Nadia'}
                          </span>
                          <h3 className="text-xl font-black text-white mt-1">{loc.displayName || loc.name}</h3>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {locArticles.length} Articles
                        </span>
                      </div>

                      {/* Coverage Breakdown */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Language Distribution:</span>
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
                    <div className="pt-4 border-t border-slate-800">
                      {missingCategories.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <AlertCircle size={13} /> {missingCategories.length} Content Gaps
                            </span>
                            <span className="text-slate-500">Missing Topics</span>
                          </div>

                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {missingCategories.slice(0, 2).map(cat => (
                              <button
                                key={cat.id}
                                onClick={() => handleStartArticleFromGap(loc.id, cat.id)}
                                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-left truncate"
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

            {/* List of All Existing Articles */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-white">Published Articles Knowledge Repository ({articles.length})</h3>
                  <p className="text-xs text-slate-400">All manually created & published local articles with structured metadata tags.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                    <input 
                      type="text"
                      placeholder="Search title or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Editor Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-white">
                      {editingId ? 'Edit Manual Article Knowledge Object' : 'Write New Manual Article'}
                    </h2>
                    <p className="text-xs text-slate-400">Provide authoritative, human-written content. 100% manual authorship.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditorMode('write')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        editorMode === 'write' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Write Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('preview')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        editorMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {status.message && (
                  <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {status.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Article Title & Language */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-slate-300">Article Title *</label>
                      <input 
                        type="text"
                        required
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="e.g. বাগুলার ছোট ব্যবসার জন্য অনলাইনে Customer পাওয়ার ৭টি বাস্তব উপায়"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Language *</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as ContentLanguage)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:border-blue-500 outline-none"
                      >
                        <option value="bn">🇧🇩 Bengali (বাংলা)</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="bn-IN">Bengali + English</option>
                      </select>
                    </div>
                  </div>

                  {/* Slug & Excerpt */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">URL Slug *</label>
                      <input 
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Short Excerpt / Summary</label>
                      <input 
                        type="text"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief 1-2 sentence summary for search meta description..."
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Knowledge Graph Tagging Grid */}
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Layers size={14} /> Knowledge Graph Relationships & Metadata Tagging
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Location Selector */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Target Locality / Region *</label>
                        <select
                          value={selectedLocationIds[0] || 'loc-bagula'}
                          onChange={(e) => setSelectedLocationIds([e.target.value])}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 outline-none focus:border-blue-500"
                        >
                          {allLocations.map(l => (
                            <option key={l.id} value={l.id}>{l.displayName || l.name} ({l.type})</option>
                          ))}
                        </select>
                      </div>

                      {/* Business Category Selector */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Target Business Category *</label>
                        <select
                          value={selectedBusinessCategoryIds[0] || 'retail-clothing'}
                          onChange={(e) => {
                            setSelectedBusinessCategoryIds([e.target.value]);
                            const cat = BUSINESS_CATEGORY_TAXONOMY.find(c => c.id === e.target.value);
                            if (cat) setCategory(cat.name);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 outline-none focus:border-blue-500"
                        >
                          {BUSINESS_CATEGORY_TAXONOMY.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Search Intent */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">User Search Intent</label>
                        <select
                          value={searchIntent}
                          onChange={(e) => setSearchIntent(e.target.value as SearchIntent)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 outline-none focus:border-blue-500"
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
                          placeholder="e.g. Local shop owners in Bagula & Nadia"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  {editorMode === 'write' ? (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Manually Written Markdown Article Content *</span>
                        <span className="text-[10px] text-slate-500">Supports # H1, ## H2, **bold**, [link](url)</span>
                      </label>
                      <textarea
                        required
                        rows={16}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your article manually here in Bengali or English..."
                        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-200 outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-white text-slate-900 prose max-w-none max-h-[500px] overflow-y-auto">
                      <h1 className="text-3xl font-black">{title}</h1>
                      <div className="text-xs text-slate-500 font-bold mb-4">
                        Language: {language === 'bn' ? 'Bengali' : 'English'} • Author: {authorName}
                      </div>
                      <div className="whitespace-pre-wrap">{content}</div>
                    </div>
                  )}

                  {/* FAQs Section */}
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                        <HelpCircle size={14} /> Manually Defined FAQs for Schema.org
                      </h4>
                      <button
                        type="button"
                        onClick={() => setFaqList(prev => [...prev, { question: '', answer: '' }])}
                        className="text-[10px] font-bold text-blue-400 hover:underline"
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
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none"
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
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Submit Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Clear Form
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      <Send size={15} /> {editingId ? 'Update Article' : 'Publish Manual Article'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Side-Panel Assistant & Context Helpers */}
            <div className="lg:col-span-4 space-y-6">
              {/* Internal Link Suggestions */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                  <LinkIcon className="text-blue-400" size={14} /> Contextual Internal Link Suggestions
                </h3>
                <p className="text-[11px] text-slate-400">Click to automatically append relevant internal links to your content:</p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(`\nExplore our [Enterprise AI Automation Services](https://confluxai.in/services/ai-automation).`)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left text-xs transition-colors group"
                  >
                    <span className="font-bold text-slate-200 group-hover:text-blue-400 block">🔗 AI Automation Service</span>
                    <span className="text-[10px] text-slate-500 font-mono">https://confluxai.in/services/ai-automation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(`\nLearn more about our [WhatsApp Business Automation Services](https://confluxai.in/services/whatsapp-automation).`)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left text-xs transition-colors group"
                  >
                    <span className="font-bold text-slate-200 group-hover:text-blue-400 block">🔗 WhatsApp Automation Service</span>
                    <span className="text-[10px] text-slate-500 font-mono">https://confluxai.in/services/whatsapp-automation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(`\nCheck out our [High-Performance Website Development](https://confluxai.in/services/website-development).`)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left text-xs transition-colors group"
                  >
                    <span className="font-bold text-slate-200 group-hover:text-blue-400 block">🔗 Web Development Service</span>
                    <span className="text-[10px] text-slate-500 font-mono">https://confluxai.in/services/website-development</span>
                  </button>

                  {selectedLocationIds[0] && (
                    <button
                      type="button"
                      onClick={() => {
                        const loc = allLocations.find(l => l.id === selectedLocationIds[0]);
                        if (loc) {
                          insertTextAtCursor(`\nView detailed digital opportunities for [${loc.name} Businesses](https://confluxai.in/locations/${loc.slug}).`);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left text-xs transition-colors group"
                    >
                      <span className="font-bold text-slate-200 group-hover:text-blue-400 block">🔗 Selected Locality Hub Link</span>
                      <span className="text-[10px] text-slate-500 font-mono">https://confluxai.in/locations/{selectedLocationIds[0]}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Real Entity & Remote Service Statement Notice */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="text-emerald-400" size={14} /> Entity & Ethics Checklist
                </h3>
                <ul className="text-[11px] text-slate-300 space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span> Conflux AI is represented accurately as a remote-first agency based in Kolkata, West Bengal.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span> No fake physical office addresses created in Bagula/Krishnanagar.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span> Real author profiles preserved without synthetic identities.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EDITORIAL PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg font-black text-white">Manual Editorial Calendar & Topic Planner</h2>
                <p className="text-xs text-slate-400">Plan high-value, location-specific topics before writing manually.</p>
              </div>

              {/* Add New Plan Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <input 
                  type="text"
                  placeholder="Planned Article Title..."
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  className="md:col-span-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                />
                <select
                  value={newPlanLocSlug}
                  onChange={(e) => setNewPlanLocSlug(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  + Add Planned Topic
                </button>
              </div>

              {/* Planner List */}
              <div className="space-y-3">
                {editorialPlans.map(plan => (
                  <div key={plan.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {plan.locationName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {plan.priority} PRIORITY
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{plan.title}</h4>
                    </div>

                    <button
                      onClick={() => {
                        setTitle(plan.title);
                        setSlug(generateSlug(plan.title));
                        setSelectedLocationIds([plan.locationSlug]);
                        setLanguage(plan.language);
                        setActiveTab('editor');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700"
                    >
                      Write This Article Now →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTERNAL LOCAL CRM */}
        {activeTab === 'crm' && (
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <UserCheck className="text-emerald-400" size={20} /> Internal Local Business Relationship Database (CRM)
                </h2>
                <p className="text-xs text-slate-400">
                  Track local business leads per locality and link manually written educational articles to prospect inquiries. Internal use only.
                </p>
              </div>

              {/* Add Lead Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <input 
                  type="text"
                  placeholder="Business Name (e.g. Bagula Saree Store)"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                />
                <input 
                  type="text"
                  placeholder="Location (e.g. Bagula, Nadia)"
                  value={newLeadLocation}
                  onChange={(e) => setNewLeadLocation(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                />
                <input 
                  type="text"
                  placeholder="Internal Notes / Needs..."
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  + Add Local Prospect
                </button>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-4">
                {crmLeads.map(lead => (
                  <div key={lead.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {lead.relationshipStatus}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{lead.locationName}</span>
                      </div>
                      <h4 className="text-base font-bold text-white">{lead.businessName}</h4>
                      <p className="text-xs text-slate-400 mt-1">{lead.internalNotes}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 block">Linked Educational Article:</span>
                      <Link to={`/blog/${lead.linkedArticleSlugs[0]}`} className="text-xs text-blue-400 hover:underline font-bold" target="_blank">
                        View Bagula Article →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminCMS;
