
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Calendar, ArrowRight, Sparkles, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Article {
    id: string;
    title: string;
    category: string;
    slug: string;
    created_at: string;
}

const BlogSection: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        const fetchLatest = async () => {
            const { data } = await supabase
                .from('articles')
                .select('id, title, category, slug, created_at')
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .limit(3);
            
            setArticles(data || []);
        };
        fetchLatest();
    }, []);

    if (articles.length === 0) return null;

    return (
        <section className="py-24 relative overflow-hidden bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-200 text-[10px] font-black tracking-widest uppercase mb-4"
                        >
                            <Sparkles size={12} />
                            Freshness Layer
                        </motion.div>
                        <h2 className="font-inter text-4xl md:text-5xl font-black text-slate-940 tracking-tight">
                            Daily <span className="text-blue-600 text-gradient">Authority.</span>
                        </h2>
                        <p className="text-slate-500 font-medium mt-4 max-w-lg text-sm">
                            Strategic insights on AI tools, automation, and business growth delivered to maintain digital dominance.
                        </p>
                    </div>
                    <Link to="/blog" className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all shadow-sm">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Full Blog Feed</span>
                        <ArrowRight size={16} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {articles.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-md">
                                    {article.category}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase">
                                    <Calendar size={12} />
                                    {new Date(article.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <h3 className="font-inter text-xl font-black text-slate-900 tracking-tight leading-tight mb-8 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {article.title}
                            </h3>
                            <Link 
                                to={`/blog/${article.slug}`}
                                className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                            >
                                Read Full Insight <ArrowRight size={14} />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
