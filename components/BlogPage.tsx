
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Calendar, User, Tag, Heart, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
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
    created_at: string;
}

const BlogPage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setArticles(data || []);
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReaction = async (id: string, currentReactions: number) => {
        try {
            const { error } = await supabase
                .from('articles')
                .update({ reactions: currentReactions + 1 })
                .eq('id', id);

            if (error) throw error;
            setArticles(articles.map(a => a.id === id ? { ...a, reactions: a.reactions + 1 } : a));
        } catch (err) {
            console.error('Error updating reaction:', err);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-2xl">
                        <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-6 hover:gap-3 transition-all">
                            <ArrowLeft size={14} /> Back to Network
                        </Link>
                        <h1 className="font-inter text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                            The <span className="text-blue-600 underline decoration-blue-500/20">Conflux</span> <br />Blog.
                        </h1>
                        <p className="text-slate-500 font-medium text-lg mt-6">
                            Frontier AI tools, automation guides, and strategic business tips. Updated for digital dominance.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-400 text-xs font-bold">
                        <Sparkles size={16} className="text-blue-500" />
                        "Google's Freshness Layer Active"
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="text-blue-600 animate-spin" size={40} />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating Neural Content...</span>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-40 border-2 border-dashed border-slate-100 rounded-[3rem]">
                        <p className="text-slate-400 font-black uppercase tracking-widest">No articles found in the network database.</p>
                        <p className="text-xs text-slate-300 mt-2">Check the CMS to post your first manual update.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article, index) => (
                            <motion.article
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                            >
                                <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                                    {article.image_url ? (
                                        <img 
                                            src={article.image_url} 
                                            alt={article.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 opacity-20" />
                                    )}
                                    <div className="absolute top-6 left-6">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest border border-white">
                                            {article.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(article.created_at).toLocaleDateString()}</div>
                                        <div className="flex items-center gap-1.5"><User size={12} /> {article.author}</div>
                                    </div>
                                    
                                    <h2 className="font-inter text-2xl font-black text-slate-900 tracking-tight leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                                        {article.title}
                                    </h2>
                                    
                                    <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-8 leading-relaxed">
                                        {article.content}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <button 
                                            onClick={() => handleReaction(article.id, article.reactions)}
                                            className="flex items-center gap-2 group/heart"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover/heart:bg-red-50 group-hover/heart:text-red-500 transition-all">
                                                <Heart size={14} className={article.reactions > 0 ? "fill-red-500 text-red-500" : ""} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 group-hover/heart:text-slate-900 uppercase">
                                                {article.reactions} Reactions
                                            </span>
                                        </button>
                                        
                                        <Link 
                                            to={`/blog/${article.slug}`}
                                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                                        >
                                            Deep Dive →
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
