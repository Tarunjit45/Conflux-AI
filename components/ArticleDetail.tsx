import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, User, ArrowLeft, Loader2, Share2, MessageSquare, Zap, ExternalLink } from 'lucide-react';

interface Article {
    id: string;
    title: string;
    content: string;
    category: string;
    author: string;
    image_url: string;
    slug: string;
    created_at: string;
    reactions?: number;
}

// Markdown Parser Helper to render clean, beautifully formatted HTML without raw symbols
const parseMarkdownText = (text: string) => {
    // Process inline bold and links
    let parts: (string | JSX.Element)[] = [text];

    // Bold formatting **text**
    const formatBold = (nodes: (string | JSX.Element)[]) => {
        let result: (string | JSX.Element)[] = [];
        nodes.forEach((node) => {
            if (typeof node !== 'string') {
                result.push(node);
                return;
            }
            const regex = /\*\*(.*?)\*\*/g;
            let lastIndex = 0;
            let match;
            while ((match = regex.exec(node)) !== null) {
                if (match.index > lastIndex) {
                    result.push(node.substring(lastIndex, match.index));
                }
                result.push(<strong key={match.index} className="font-bold text-slate-900">{match[1]}</strong>);
                lastIndex = regex.lastIndex;
            }
            if (lastIndex < node.length) {
                result.push(node.substring(lastIndex));
            }
        });
        return result;
    };

    // Link formatting [text](url)
    const formatLinks = (nodes: (string | JSX.Element)[]) => {
        let result: (string | JSX.Element)[] = [];
        nodes.forEach((node) => {
            if (typeof node !== 'string') {
                result.push(node);
                return;
            }
            const regex = /\[(.*?)\]\((.*?)\)/g;
            let lastIndex = 0;
            let match;
            while ((match = regex.exec(node)) !== null) {
                if (match.index > lastIndex) {
                    result.push(node.substring(lastIndex, match.index));
                }
                result.push(
                    <a 
                        key={match.index} 
                        href={match[2]} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 font-bold underline hover:text-blue-800 transition-colors"
                    >
                        {match[1]}
                    </a>
                );
                lastIndex = regex.lastIndex;
            }
            if (lastIndex < node.length) {
                result.push(node.substring(lastIndex));
            }
        });
        return result;
    };

    return formatLinks(formatBold(parts));
};

const renderFormattedBlocks = (rawContent: string, articleTitle: string) => {
    const lines = rawContent.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Skip H1 title if it duplicates article title
        if (trimmed.startsWith('# ')) {
            const h1Text = trimmed.replace(/^#\s+/, '').replace(/\*\*/g, '');
            if (h1Text.toLowerCase() === articleTitle.toLowerCase()) return;
            elements.push(
                <h1 key={index} className="font-inter text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-10 mb-6">
                    {parseMarkdownText(h1Text)}
                </h1>
            );
        }
        else if (trimmed.startsWith('## ')) {
            const h2Text = trimmed.replace(/^##\s+/, '');
            elements.push(
                <h2 key={index} className="font-inter text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                    {parseMarkdownText(h2Text)}
                </h2>
            );
        }
        else if (trimmed.startsWith('### ')) {
            const h3Text = trimmed.replace(/^###\s+/, '');
            elements.push(
                <h3 key={index} className="font-inter text-xl font-bold text-slate-800 tracking-tight mt-8 mb-3">
                    {parseMarkdownText(h3Text)}
                </h3>
            );
        }
        else if (trimmed === '---' || trimmed === '***') {
            elements.push(<hr key={index} className="my-8 border-slate-100" />);
        }
        else if (trimmed.startsWith('> ')) {
            const quoteText = trimmed.replace(/^>\s+/, '');
            elements.push(
                <blockquote key={index} className="p-6 my-6 bg-blue-50/50 border-l-4 border-blue-600 rounded-r-2xl italic text-slate-700 font-medium text-lg shadow-sm">
                    {parseMarkdownText(quoteText)}
                </blockquote>
            );
        }
        else if (/^(\d+\.|\-|\*)\s+/.test(trimmed)) {
            const listText = trimmed.replace(/^(\d+\.|\-|\*)\s+/, '');
            elements.push(
                <div key={index} className="flex items-start gap-3 my-3 pl-4">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-2.5 flex-shrink-0" />
                    <p className="text-slate-700 font-medium leading-relaxed text-lg">
                        {parseMarkdownText(listText)}
                    </p>
                </div>
            );
        }
        else {
            elements.push(
                <p key={index} className="text-slate-600 font-medium leading-relaxed mb-6 text-lg">
                    {parseMarkdownText(trimmed)}
                </p>
            );
        }
    });

    return elements;
};

const ArticleDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [comments, setComments] = useState<Array<{ id: string; author: string; content: string; created_at: string }>>([]);
    const [newComment, setNewComment] = useState('');
    const [commentAuthor, setCommentAuthor] = useState('');

    useEffect(() => {
        if (slug) {
            fetchArticle();
            try {
                const saved = localStorage.getItem(`comments_${slug}`);
                if (saved) setComments(JSON.parse(saved));
                else setComments([]);
            } catch (e) {
                setComments([]);
            }
        }
    }, [slug]);

    const fetchArticle = async () => {
        setIsLoading(true);
        let loadedArticle: Article | null = null;
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('slug', slug)
                .single();

            if (!error && data) {
                loadedArticle = data;
            }
        } catch (err) {
            console.error('Error fetching article from Supabase:', err);
        }

        // Check custom local overrides first
        const customLocalData = localStorage.getItem('conflux_custom_articles');
        if (customLocalData) {
            try {
                const customList: Article[] = JSON.parse(customLocalData);
                const matching = customList.find(a => a.slug === slug || a.id === slug);
                if (matching) {
                    loadedArticle = matching;
                }
            } catch (e) {}
        }

        if (!loadedArticle) {
            try {
                const res = await fetch('/data/articles.json');
                if (res.ok) {
                    const localArticles: Article[] = await res.json();
                    loadedArticle = localArticles.find(a => a.slug === slug) || null;
                }
            } catch (err) {
                console.error('Error fetching fallback article:', err);
            }
        }

        if (loadedArticle) {
            const customCount = localStorage.getItem(`count_${slug}`);
            const baseReactions = customCount ? parseInt(customCount, 10) : (loadedArticle.reactions || 0);
            const userLiked = localStorage.getItem(`liked_${slug}`);
            const finalReactions = (customCount ? baseReactions : (baseReactions + (userLiked ? 1 : 0)));
            setArticle({ ...loadedArticle, reactions: finalReactions });
        } else {
            setArticle(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (article) {
            document.title = `${article.title} | Conflux AI Blog`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', `${article.title} - Technical insight and engineering analysis by Conflux AI.`);
            }
            const canonicalUrl = `https://confluxai.in/blog/${article.slug}`;
            let canonicalEl = document.querySelector('link[rel="canonical"]');
            if (!canonicalEl) {
                canonicalEl = document.createElement('link');
                canonicalEl.setAttribute('rel', 'canonical');
                document.head.appendChild(canonicalEl);
            }
            canonicalEl.setAttribute('href', canonicalUrl);
        }
    }, [article]);

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
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white text-center px-4">
                <h2 className="text-3xl font-black text-slate-900">Insight Not Found</h2>
                <p className="text-slate-500 font-medium max-w-md">The insight you're looking for might have been archived or moved in the network.</p>
                <Link to="/blog" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all">
                    Return to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* SEO & LLM GEO/AEO Schema.org JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "TechArticle",
                    "headline": article.title,
                    "inLanguage": "en-US",
                    "mainEntityOfPage": `https://confluxai.in/blog/${article.slug}`,
                    "articleSection": article.category,
                    "author": {
                        "@type": "Organization",
                        "name": article.author || "Conflux AI Research Network",
                        "url": "https://confluxai.in"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Conflux AI",
                        "url": "https://confluxai.in",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://confluxai.in/logo.png"
                        }
                    },
                    "datePublished": article.created_at,
                    "dateModified": article.created_at,
                    "description": article.content.substring(0, 200).replace(/#|\*/g, '').trim()
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

                        {/* Text-First Editorial Divider */}
                        <div className="w-full h-px bg-gradient-to-r from-blue-500/20 via-slate-200 to-transparent my-8" />

                        {/* Article Body: Clean Formatted HTML without raw markdown symbols */}
                        <div className="prose prose-slate prose-lg max-w-none">
                            {renderFormattedBlocks(article.content, article.title)}
                        </div>

                        {/* Real User Engagement: Like Reaction & Social Sharing */}
                        <div className="flex items-center justify-between py-6 px-8 my-10 bg-slate-50 border border-slate-100 rounded-2xl">
                            <button
                                onClick={() => {
                                    if (!article) return;
                                    const likedKey = `liked_${article.slug}`;
                                    const countKey = `count_${article.slug}`;
                                    const hasLiked = localStorage.getItem(likedKey);
                                    if (!hasLiked) {
                                        const newReactions = (article.reactions || 0) + 1;
                                        setArticle({ ...article, reactions: newReactions });
                                        localStorage.setItem(likedKey, 'true');
                                        localStorage.setItem(countKey, newReactions.toString());
                                        try {
                                            supabase.from('articles').update({ reactions: newReactions }).eq('slug', article.slug);
                                        } catch (e) {}
                                    }
                                }}
                                className={`flex items-center gap-3 px-6 py-3 bg-white border rounded-xl transition-all shadow-sm group ${
                                    article && localStorage.getItem(`liked_${article.slug}`) 
                                        ? 'border-pink-500 text-pink-600 bg-pink-50/20' 
                                        : 'border-slate-200 hover:border-pink-500 hover:text-pink-600'
                                }`}
                            >
                                <span className="text-pink-500 group-hover:scale-125 transition-transform">❤️</span>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                                    Like Article ({article.reactions || 0})
                                </span>
                            </button>

                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                <Share2 size={16} />
                                <span>Share Insight</span>
                            </div>
                        </div>

                        {/* Real User Comments Section */}
                        <section className="my-12 p-8 md:p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/50">
                            <div className="flex items-center gap-3 mb-8">
                                <MessageSquare size={20} className="text-blue-600" />
                                <h3 className="font-inter text-2xl font-black text-slate-900 tracking-tight">
                                    Discussion & Reader Comments ({comments.length})
                                </h3>
                            </div>

                            {/* Comment Submission Form */}
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!newComment.trim() || !commentAuthor.trim() || !article) return;
                                    const commentObj = {
                                        id: Date.now().toString(),
                                        author: commentAuthor,
                                        content: newComment,
                                        created_at: new Date().toISOString()
                                    };
                                    const updated = [commentObj, ...comments];
                                    setComments(updated);
                                    localStorage.setItem(`comments_${article.slug}`, JSON.stringify(updated));
                                    setNewComment('');
                                }}
                                className="mb-10 space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                        type="text"
                                        placeholder="Your Name *"
                                        required
                                        value={commentAuthor}
                                        onChange={(e) => setCommentAuthor(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-sm font-medium transition-all"
                                    />
                                </div>
                                <textarea 
                                    placeholder="Add to the technical discussion..."
                                    required
                                    rows={3}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-sm font-medium transition-all"
                                />
                                <button 
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Post Reader Comment
                                </button>
                            </form>

                            {/* Comments List */}
                            {comments.length === 0 ? (
                                <p className="text-xs font-bold text-slate-400 italic">No comments yet. Be the first genuine reader to join the technical discussion!</p>
                            ) : (
                                <div className="space-y-6">
                                    {comments.map((c) => (
                                        <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-black text-slate-900">{c.author}</span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {new Date(c.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed">{c.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

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
                        <div className="sticky top-32">
                            {/* Newsletter / CTA */}
                            <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm">
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
