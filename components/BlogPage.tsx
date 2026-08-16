import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Calendar, User, Tag, Heart, ArrowLeft, Loader2, Sparkles, MapPin, Globe, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllLocations, LocationItem } from '../data/locationsData';
import { ArticleKnowledgeObject, ContentLanguage } from '../types/article';
import { STATIC_ARTICLES } from '../data/articlesData';

const BlogPage: React.FC = () => {
    const [articles, setArticles] = useState<ArticleKnowledgeObject[]>(STATIC_ARTICLES);
    const [isLoading, setIsLoading] = useState(false);
    
    // Filter State
    const [selectedLanguage, setSelectedLanguage] = useState<ContentLanguage | 'ALL'>('ALL');
    const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    const allLocations: LocationItem[] = getAllLocations();

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setIsLoading(true);
        let fetchedList: any[] = [];

        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                fetchedList = data;
            }
        } catch (err) {
            console.error('Error fetching articles from Supabase:', err);
        }

        // Fallback to static articles
        if (fetchedList.length === 0) {
            fetchedList = STATIC_ARTICLES;
        }

        // Merge custom admin overrides from localStorage
        const customLocalData = localStorage.getItem('conflux_custom_articles');
        if (customLocalData) {
            try {
                const customList: any[] = JSON.parse(customLocalData);
                const dbSlugs = new Set(fetchedList.map(a => a.slug));
                const newCustom = customList.filter(c => !dbSlugs.has(c.slug) && c.is_published !== false);

                fetchedList = fetchedList
                    .map(dbItem => {
                        const matchingCustom = customList.find(c => c.slug === dbItem.slug || c.id === dbItem.id);
                        return matchingCustom ? matchingCustom : dbItem;
                    })
                    .filter(item => item.is_published !== false);

                fetchedList = [...newCustom, ...fetchedList];
            } catch (e) {
                console.warn('Local articles parse error:', e);
            }
        }

        const normalizedList = fetchedList.map(a => ({
            ...a,
            language: a.language || 'bn',
            locationIds: a.locationIds || ['loc-bagula'],
            publishedAt: a.publishedAt || a.created_at || new Date().toISOString()
        }));

        setArticles(normalizedList);
        setIsLoading(false);
    };

    const handleReaction = async (id: string, slug: string, currentReactions: number) => {
        try {
            await supabase
                .from('articles')
                .update({ reactions: currentReactions + 1 })
                .eq('id', id);

            setArticles(articles.map(a => (a.id === id || a.slug === slug) ? { ...a, reactions: (a.reactions || 0) + 1 } : a));
        } catch (err) {}
    };

    // Filter Logic
    const filteredArticles = articles.filter(a => {
        if (selectedLanguage !== 'ALL' && a.language !== selectedLanguage) return false;
        if (selectedCategory !== 'ALL' && a.category !== selectedCategory) return false;
        if (selectedLocation !== 'ALL') {
            const locs = a.locationIds || [];
            if (!locs.includes(selectedLocation)) {
                // Check string match in content
                const locItem = allLocations.find(l => l.id === selectedLocation || l.slug === selectedLocation);
                if (!locItem || !a.content?.toLowerCase().includes(locItem.name.toLowerCase())) return false;
            }
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-white font-inter">
            <div className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="max-w-2xl">
                        <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-6 hover:gap-3 transition-all">
                            <ArrowLeft size={14} /> Back to Network
                        </Link>
                        <h1 className="font-inter text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                            West Bengal <span className="text-blue-600 underline decoration-blue-500/20">Business Knowledge</span> <br />& AI Insights.
                        </h1>
                        <p className="text-slate-500 font-medium text-base md:text-lg mt-6">
                            Authoritative local digital guides for businesses across Bagula, Krishnanagar, Ranaghat, Haldia, Siliguri, and all districts of West Bengal. Written 100% manually.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-blue-900 text-xs font-bold shrink-0">
                        <Globe size={18} className="text-blue-600 shrink-0" />
                        <span>Remote-First Agency Based in Kolkata</span>
                    </div>
                </div>

                {/* Filter Control Bar */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-12 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Filter size={14} /> Filter Knowledge:
                        </span>

                        {/* Language Selector */}
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value as any)}
                            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                        >
                            <option value="ALL">🌐 All Languages</option>
                            <option value="bn">🇧🇩 Bengali (বাংলা)</option>
                            <option value="en">🇬🇧 English</option>
                        </select>

                        {/* Location Selector */}
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                        >
                            <option value="ALL">📍 All West Bengal Locations</option>
                            {allLocations.filter(l => l.type === 'commercial_junction' || l.type === 'city' || l.type === 'district').map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.displayName || loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="text-xs font-bold text-slate-500">
                        Showing <span className="text-slate-900 font-black">{filteredArticles.length}</span> Knowledge Articles
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="text-blue-600 animate-spin" size={40} />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating Knowledge Graph...</span>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-40 border-2 border-dashed border-slate-100 rounded-[3rem]">
                        <p className="text-slate-400 font-black uppercase tracking-widest">No articles found for selected filters.</p>
                        <button 
                            onClick={() => { setSelectedLanguage('ALL'); setSelectedLocation('ALL'); setSelectedCategory('ALL'); }}
                            className="text-xs font-bold text-blue-600 hover:underline mt-2"
                        >
                            Reset Knowledge Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map((article, index) => {
                            const authorName = typeof article.author === 'object' ? article.author.name : (article.author || 'Conflux AI');
                            const locNames = (article.locationIds || []).map(id => {
                                const l = allLocations.find(loc => loc.id === id || loc.slug === id);
                                return l ? l.name : null;
                            }).filter(Boolean);

                            return (
                                <motion.article
                                    key={article.id || article.slug}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                                >
                                    <div className="p-8 flex flex-col flex-1">
                                        {/* Card Badges */}
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                {article.category || 'Digital Strategy'}
                                            </span>

                                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold border border-slate-200">
                                                {article.language === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
                                            </span>

                                            {locNames.length > 0 && (
                                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                                                    <MapPin size={10} /> {locNames[0]}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h2 className="font-inter text-xl font-black text-slate-900 tracking-tight leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                                            <Link to={`/blog/${article.slug}`}>
                                                {article.title}
                                            </Link>
                                        </h2>
                                        
                                        <p className="text-xs text-slate-500 font-medium line-clamp-3 mb-6 leading-relaxed">
                                            {article.excerpt || article.content.replace(/#|\*|\[|\]|\(.*?\)|\---/g, '').replace(/\s+/g, ' ').trim()}
                                        </p>

                                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-xs">
                                            <div className="text-[10px] font-bold text-slate-400">
                                                By {authorName}
                                            </div>
                                            
                                            <Link 
                                                to={`/blog/${article.slug}`}
                                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                                            >
                                                Read Article →
                                            </Link>
                                        </div>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
