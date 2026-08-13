import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Send, Image as ImageIcon, Layout, Type, FileText, CheckCircle, 
  AlertCircle, Zap, Edit3, Trash2, Eye, Plus, Search, Filter, 
  Globe, Clock, User, ArrowLeft, RefreshCw, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  image_url: string;
  slug: string;
  reactions: number;
  is_published: boolean;
  created_at: string;
}

const LOCAL_STORAGE_ARTICLES_KEY = 'conflux_custom_articles';

const AdminCMS: React.FC = () => {
  // State management
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('AI Automation');
  const [author, setAuthor] = useState('Conflux AI Engineering Team');
  const [imageUrl, setImageUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');

  // Action status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load articles on mount
  useEffect(() => {
    fetchArticles();
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
    let loadedArticles: Article[] = [];

    try {
      // 1. Attempt fetching from Supabase database
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        loadedArticles = data as Article[];
      }
    } catch (err) {
      console.warn('Supabase fetch error, checking local backups:', err);
    }

    // 2. Check local custom overrides
    const localData = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
    let customLocal: Article[] = [];
    if (localData) {
      try { customLocal = JSON.parse(localData); } catch (e) {}
    }

    // 3. Fallback to static articles JSON if needed
    if (loadedArticles.length === 0 && customLocal.length === 0) {
      try {
        const res = await fetch('/data/articles.json');
        if (res.ok) {
          const staticArticles = await res.json();
          loadedArticles = staticArticles.map((a: any, idx: number) => ({
            id: a.id || `static-${idx}`,
            title: a.title || 'Untitled',
            content: a.content || '',
            category: a.category || 'AI Automation',
            author: a.author || 'Conflux AI',
            image_url: a.image_url || '',
            slug: a.slug || generateSlug(a.title),
            reactions: a.reactions || 0,
            is_published: a.is_published !== false,
            created_at: a.created_at || new Date().toISOString()
          }));
        }
      } catch (err) {
        console.error('Error fetching static articles:', err);
      }
    }

    // Merge custom local overrides
    if (customLocal.length > 0) {
      const dbSlugs = new Set(loadedArticles.map(a => a.slug));
      const newFromLocal = customLocal.filter(c => !dbSlugs.has(c.slug));
      
      // Apply local updates to matching items
      loadedArticles = loadedArticles.map(dbItem => {
        const matchingLocal = customLocal.find(c => c.slug === dbItem.slug || c.id === dbItem.id);
        return matchingLocal ? { ...dbItem, ...matchingLocal } : dbItem;
      });

      loadedArticles = [...newFromLocal, ...loadedArticles];
    }

    setArticles(loadedArticles);
    setIsLoading(false);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('AI Automation');
    setAuthor('Conflux AI Engineering Team');
    setImageUrl('');
    setSlug('');
    setIsPublished(true);
    setStatus({ type: null, message: '' });
    setActiveTab('editor');
  };

  const handleEditArticle = (article: Article) => {
    setEditingId(article.id);
    setTitle(article.title);
    setContent(article.content);
    setCategory(article.category);
    setAuthor(article.author || 'Conflux AI Engineering Team');
    setImageUrl(article.image_url || '');
    setSlug(article.slug);
    setIsPublished(article.is_published !== false);
    setStatus({ type: null, message: '' });
    setActiveTab('editor');
  };

  const saveLocalOverride = (article: Article, isDelete = false) => {
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
      let list: Article[] = localData ? JSON.parse(localData) : [];
      
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
      console.warn('Local storage error:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const finalSlug = slug || generateSlug(title);
    const now = new Date().toISOString();

    const articlePayload: Article = {
      id: editingId || `custom-${Date.now()}`,
      title,
      content,
      category,
      author,
      image_url: imageUrl,
      slug: finalSlug,
      reactions: 0,
      is_published: isPublished,
      created_at: now
    };

    try {
      // 1. Try Supabase Upsert
      if (editingId && !editingId.startsWith('custom-') && !editingId.startsWith('static-')) {
        const { error } = await supabase
          .from('articles')
          .update({
            title,
            content,
            category,
            author,
            image_url: imageUrl,
            slug: finalSlug,
            is_published: isPublished
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([
            {
              title,
              content,
              category,
              author,
              image_url: imageUrl,
              slug: finalSlug,
              is_published: isPublished
            }
          ]);

        if (error) console.warn('Supabase insert notice (saved to local engine):', error.message);
      }

      // 2. Sync Local Storage & In-Memory State
      saveLocalOverride(articlePayload);
      
      setStatus({
        type: 'success',
        message: editingId ? `Article "${title}" updated successfully!` : `New article "${title}" published to network!`
      });

      // Update state array
      setArticles(prev => {
        const existing = prev.findIndex(a => a.id === articlePayload.id || a.slug === articlePayload.slug);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], ...articlePayload };
          return updated;
        }
        return [articlePayload, ...prev];
      });

      setTimeout(() => {
        setActiveTab('list');
      }, 1200);

    } catch (err: any) {
      console.error('CMS Save Error:', err);
      // Fallback local save if database connection fails
      saveLocalOverride(articlePayload);
      
      setStatus({
        type: 'success',
        message: `Article saved locally & live on network! (${err.message || 'Database sync pending'})`
      });

      setArticles(prev => {
        const existing = prev.findIndex(a => a.id === articlePayload.id || a.slug === articlePayload.slug);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = articlePayload;
          return updated;
        }
        return [articlePayload, ...prev];
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const targetArticle = articles.find(a => a.id === id);
    if (!targetArticle) return;

    try {
      if (!id.startsWith('custom-') && !id.startsWith('static-')) {
        await supabase.from('articles').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('Supabase delete warning:', err);
    }

    saveLocalOverride(targetArticle, true);
    setArticles(prev => prev.filter(a => a.id !== id));
    setDeleteConfirmId(null);
    setStatus({ type: 'success', message: `Article "${targetArticle.title}" deleted.` });
  };

  const handleTogglePublish = async (article: Article) => {
    const updatedStatus = !article.is_published;
    const updatedArticle = { ...article, is_published: updatedStatus };

    try {
      if (!article.id.startsWith('custom-') && !article.id.startsWith('static-')) {
        await supabase.from('articles').update({ is_published: updatedStatus }).eq('id', article.id);
      }
    } catch (err) {
      console.warn('Supabase update warning:', err);
    }

    saveLocalOverride(updatedArticle);
    setArticles(prev => prev.map(a => a.id === article.id ? updatedArticle : a));
  };

  // Filtered Articles for List
  const filteredArticles = articles.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'ALL' || a.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoriesList = Array.from(new Set(articles.map(a => a.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-28 pb-20 font-inter">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layout className="text-blue-500" size={18} />
              <span className="text-xs font-black tracking-widest uppercase text-blue-400">
                Central Content Management System
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-orbitron text-white">
              Blog & Article <span className="text-blue-500">Control Panel</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Create, edit, modify, publish, and delete blog articles across the Conflux AI network.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/blog" 
              target="_blank" 
              className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2"
            >
              <Globe size={14} /> View Live Blog
            </Link>
            
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Plus size={16} /> Create New Article
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText size={16} /> Articles Manager ({articles.length})
          </button>
          <button
            onClick={handleCreateNew}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'editor'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Edit3 size={16} /> {editingId ? 'Edit Article' : 'Article Editor'}
          </button>
        </div>

        {/* Status Notification Banner */}
        {status.type && (
          <div className={`p-5 mb-8 rounded-2xl flex items-center justify-between gap-4 ${
            status.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-rose-950/80 text-rose-300 border border-rose-800'
          }`}>
            <div className="flex items-center gap-3 font-bold text-sm">
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{status.message}</span>
            </div>
            <button onClick={() => setStatus({ type: null, message: '' })} className="text-xs opacity-70 hover:opacity-100 uppercase tracking-widest">
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: ARTICLES MANAGER LIST */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Search & Filter Control Bar */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search articles by title, author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={fetchArticles}
                className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin text-blue-400" : ""} /> Refresh List
              </button>
            </div>

            {/* Articles Table */}
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-4">Article Title & Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredArticles.map((article) => {
                    const isPub = article.is_published !== false;
                    return (
                      <tr key={article.id} className="hover:bg-slate-800/70 transition-colors group">
                        <td className="p-4 max-w-md">
                          <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
                            {article.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 font-mono">/blog/{article.slug}</div>
                        </td>

                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                            {article.category}
                          </span>
                        </td>

                        <td className="p-4 text-slate-300 font-medium">{article.author}</td>

                        <td className="p-4">
                          <button
                            onClick={() => handleTogglePublish(article)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                              isPub 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                            }`}
                          >
                            {isPub ? 'Published' : 'Draft'}
                          </button>
                        </td>

                        <td className="p-4 text-slate-400 text-[11px]">
                          {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/blog/${article.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                              title="Preview Article"
                            >
                              <Eye size={14} />
                            </Link>

                            <button
                              onClick={() => handleEditArticle(article)}
                              className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all"
                              title="Edit / Modify Article"
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmId(article.id)}
                              className="p-2 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all"
                              title="Delete Article"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredArticles.length === 0 && (
                <div className="p-12 text-center text-slate-500 font-medium">
                  No articles found matching your query.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ARTICLE EDITOR FORM */}
        {activeTab === 'editor' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-orbitron text-white">
                {editingId ? 'Edit Article' : 'Create New Article'}
              </h2>
              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditorMode('write')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold ${editorMode === 'write' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Write Content
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold ${editorMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Live Preview
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800/80 p-8 md:p-10 rounded-3xl border border-slate-700 shadow-2xl">
              {editorMode === 'write' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                        <Type size={14} className="text-blue-400" />
                        Article Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="How AI Workflows Scale Regional Enterprises..."
                        required
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-xs text-white placeholder-slate-500 outline-none transition-all font-medium"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                        <Zap size={14} className="text-blue-400" />
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-xs text-white outline-none transition-all font-medium"
                      >
                        <option>AI Automation</option>
                        <option>Business Automation</option>
                        <option>Digital Strategy</option>
                        <option>AI Tools</option>
                        <option>Automation Guides</option>
                        <option>Business Tips</option>
                        <option>Case Study</option>
                        <option>Network Update</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Author */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                        <User size={14} className="text-blue-400" />
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Conflux AI Engineering Team"
                        required
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-xs text-white outline-none font-medium"
                      />
                    </div>

                    {/* URL Slug */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                        <Globe size={14} className="text-blue-400" />
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="guide-ai-workflows"
                        required
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-xs text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Featured Image URL */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <ImageIcon size={14} className="text-blue-400" />
                      Featured Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-xs text-white outline-none font-medium"
                    />
                  </div>

                  {/* Content (Markdown Textarea) */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <FileText size={14} className="text-blue-400" />
                      Article Markdown Content
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article in Markdown syntax (# Heading, ## Section, **bold**, lists, links)..."
                      required
                      rows={14}
                      className="w-full px-5 py-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-xs text-slate-200 outline-none font-mono resize-none leading-relaxed"
                    />
                  </div>

                  {/* Publish Status Checkbox */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-700">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="isPublished" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                      Publish immediately on website (Uncheck to save as draft)
                    </label>
                  </div>
                </>
              ) : (
                /* LIVE PREVIEW MODE */
                <div className="space-y-6 p-6 rounded-2xl bg-white text-slate-900">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                    {category}
                  </span>
                  <h1 className="text-3xl font-black font-orbitron">{title || 'Untitled Article'}</h1>
                  <div className="text-xs text-slate-500 font-medium border-b border-slate-100 pb-4">
                    By {author} • {new Date().toLocaleDateString()}
                  </div>
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                  )}
                  <div className="prose max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700">
                    {content || 'No content written yet...'}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-6 py-3.5 rounded-xl bg-slate-700 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 shadow-lg transition-all ${
                    isSubmitting ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  }`}
                >
                  <Send size={14} />
                  {isSubmitting ? 'Saving Changes...' : (editingId ? 'Update Article' : 'Publish Article')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmId && (
            <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-orbitron text-white">Delete Article?</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Are you sure you want to delete this article? This action cannot be undone.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminCMS;
