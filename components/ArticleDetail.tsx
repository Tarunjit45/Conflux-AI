
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Calendar, User, Tag, ArrowLeft, Loader2, Share2, MessageSquare, Zap, ExternalLink } from 'lucide-react';

interface Article {
    id: string;
    title: string;
    content: string;
    category: string;
    author: string;
    image_url: string;
    slug: string;
    created_at: string;
}

const AdPlaceholder: React.FC<{ label: string; className?: string }> = ({ label, className = "" }) => (
    <div className={`my-8 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center min-h-[100px] md:min-h-[250px] ${className}`}>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Google AdSense Placement</span>
        <span className="text-xs font-bold text-slate-300 italic">{label}</span>
    </div>
);

const ArticleDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (slug) fetchArticle();
    }, [slug]);

    const fetchArticle = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setArticle(data);
        } catch (err) {
            console.error('Error fetching article:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
                <Loader2 className="text-blue-600 animate-spin" size={40} />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating Authority Layer...</span>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-4 text-center">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Article Not Found</h2>
                <p className="text-slate-500 font-medium max-w-md">The insight you're looking for might have been archived or moved in the network.</p>
                <Link to="/blog" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all">
                    Return to Blog
                </Link>
            </div>
        );
    }

    // Split content into paragraphs for ad placement
    const paragraphs = article.content.split('\n\n').filter(p => p.trim() !== '');
    const middleIndex = Math.floor(paragraphs.length / 2);

    return (
        <div className="min-h-screen bg-white">
            {/* SEO JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": article.title,
                    "image": article.image_url,
                    "author": {
                        "@type": "Person",
                        "name": article.author
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Conflux AI",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://confluxai.in/logo.png"
                        }
                    },
                    "datePublished": article.created_at,
                    "description": article.content.substring(0, 160)
                })}
            </script>

            <div className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Back Button */}
                <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-12 hover:gap-3 transition-all">
                    <ArrowLeft size={14} /> Back to Blog
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <header className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                    {article.category}
                                </span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={12} /> {new Date(article.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="font-inter text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8">
                                {article.title}
                            </h1>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{article.author}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Partner</p>
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        {article.image_url && (
                            <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden mb-12 border border-slate-100 shadow-2xl shadow-slate-200/50">
                                <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Article Body with Smart Ad Placement */}
                        <div className="prose prose-slate prose-lg max-w-none">
                            {paragraphs.map((para, idx) => (
                                <React.Fragment key={idx}>
                                    <p className="text-slate-600 font-medium leading-relaxed mb-6 text-lg">
                                        {para}
                                    </p>
                                    
                                    {/* Ad After 1st Paragraph */}
                                    {idx === 0 && <AdPlaceholder label="Inside Article: Top (After 1st Paragraph)" />}
                                    
                                    {/* Ad in the middle */}
                                    {idx === middleIndex && paragraphs.length > 3 && (
                                        <AdPlaceholder label="Inside Article: Middle" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Ad at the end */}
                        <AdPlaceholder label="Inside Article: Bottom" />

                        {/* Funnel CTA Section */}
                        <section className="mt-16 p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-900 text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
                            <div className="relative z-10">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-widest uppercase mb-6">
                                    <Zap size={14} className="text-yellow-400" /> Scalable Execution
                                </span>
                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
                                    Need AI Automation? <br />
                                    <span className="text-blue-200">Contact Conflux AI Today.</span>
                                </h3>
                                <p className="text-blue-100 font-medium text-lg mb-10 max-w-xl leading-relaxed">
                                    We transform complex workflows into streamlined competitive advantages using frontier AI models and custom automation engines.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a 
                                        href="/#contact" 
                                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-xl"
                                    >
                                        Start Your Build
                                        <ExternalLink size={16} />
                                    </a>
                                    <Link 
                                        to="/blog" 
                                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all"
                                    >
                                        Explore More Insights
                                    </Link>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-400/20 blur-[100px] rounded-full" />
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Zap size={200} />
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Desktop Sidebar Ad */}
                        <div className="sticky top-32">
                            <AdPlaceholder label="Desktop Sidebar" className="min-h-[600px] hidden lg:flex" />
                            
                            {/* Newsletter / CTA */}
                            <div className="mt-8 p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4">Network Freshness</h4>
                                <p className="text-sm text-slate-500 font-medium mb-6">
                                    Get manual updates and strategic AI insights delivered directly to your tactical layer.
                                </p>
                                <div className="space-y-3">
                                    <input 
                                        type="email" 
                                        placeholder="your@email.com" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    />
                                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-colors">
                                        Synchronize
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetail;
