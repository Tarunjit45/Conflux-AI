import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, User, ArrowLeft, Loader2, Share2, MessageSquare, Zap, ExternalLink, MapPin, Building2, HelpCircle, Layers, ShieldCheck } from 'lucide-react';
import { getAllLocations, LocationItem } from '../data/locationsData';
import { BUSINESS_CATEGORY_TAXONOMY } from '../data/taxonomiesData';
import { ArticleKnowledgeObject } from '../types/article';
import { trackLocationEvent } from '../lib/locationAnalytics';

// Markdown Parser Helper to render clean, beautifully formatted HTML without raw symbols
const parseMarkdownText = (text: string) => {
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
                        target={match[2].startsWith('http') ? "_blank" : "_self"}
                        rel={match[2].startsWith('http') ? "noopener noreferrer" : undefined}
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
            return;
        }

        // Headers
        if (trimmed.startsWith('## ')) {
            const h2Text = trimmed.replace(/^##\s+/, '').replace(/\*\*/g, '');
            elements.push(
                <h2 key={index} className="font-inter text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-10 mb-4 pb-2 border-b border-slate-100">
                    {parseMarkdownText(h2Text)}
                </h2>
            );
            return;
        }

        if (trimmed.startsWith('### ')) {
            const h3Text = trimmed.replace(/^###\s+/, '').replace(/\*\*/g, '');
            elements.push(
                <h3 key={index} className="font-inter text-xl font-bold text-slate-900 tracking-tight mt-8 mb-3">
                    {parseMarkdownText(h3Text)}
                </h3>
            );
            return;
        }

        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***') {
            elements.push(<hr key={index} className="my-8 border-slate-100" />);
            return;
        }

        // Bullet list item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-*]\s+/, '');
            elements.push(
                <li key={index} className="ml-6 list-disc text-slate-700 font-medium leading-relaxed mb-2">
                    {parseMarkdownText(bulletText)}
                </li>
            );
            return;
        }

        // Numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
            elements.push(
                <li key={index} className="ml-6 list-decimal text-slate-700 font-medium leading-relaxed mb-2">
                    {parseMarkdownText(numMatch[2])}
                </li>
            );
            return;
        }

        // Standard Paragraph
        elements.push(
            <p key={index} className="text-slate-700 font-medium leading-relaxed mb-6 text-base md:text-lg">
                {parseMarkdownText(trimmed)}
            </p>
        );
    });

    return elements;
};

const ArticleDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<ArticleKnowledgeObject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState<{ id: string; author: string; content: string; created_at: string }[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentAuthor, setCommentAuthor] = useState('');

    const allLocations = getAllLocations();

    useEffect(() => {
        if (!slug) return;
        fetchArticle();
    }, [slug]);

    const fetchArticle = async () => {
        setIsLoading(true);
        let foundArticle: ArticleKnowledgeObject | null = null;

        // 1. Check local storage custom articles first
        try {
            const localData = localStorage.getItem('conflux_custom_articles');
            if (localData) {
                const list: ArticleKnowledgeObject[] = JSON.parse(localData);
                const localMatch = list.find(a => a.slug === slug || a.id === slug);
                if (localMatch) foundArticle = localMatch;
            }
        } catch (e) {}

        // 2. Query Supabase
        if (!foundArticle) {
            try {
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (!error && data) {
                    foundArticle = data as any;
                }
            } catch (err) {}
        }

        // 3. Fallback to public/data/articles.json
        if (!foundArticle) {
            try {
                const res = await fetch('/data/articles.json');
                if (res.ok) {
                    const articlesList: ArticleKnowledgeObject[] = await res.json();
                    const jsonMatch = articlesList.find(a => a.slug === slug || a.id === slug);
                    if (jsonMatch) foundArticle = jsonMatch;
                }
            } catch (err) {}
        }

        if (foundArticle) {
            // Load saved reactions & comments
            const storedReactions = localStorage.getItem(`count_${slug}`);
            if (storedReactions) {
                foundArticle.reactions = parseInt(storedReactions, 10);
            }
            setArticle(foundArticle);

            // Dynamic SEO Metadata updates
            document.title = foundArticle.seoTitle || `${foundArticle.title} | Conflux AI`;
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', foundArticle.seoDescription || foundArticle.excerpt || foundArticle.title);

            let canonicalEl = document.querySelector('link[rel="canonical"]');
            if (!canonicalEl) {
                canonicalEl = document.createElement('link');
                canonicalEl.setAttribute('rel', 'canonical');
                document.head.appendChild(canonicalEl);
            }
            canonicalEl.setAttribute('href', foundArticle.canonicalUrl || `https://confluxai.in/blog/${foundArticle.slug}`);

            // Track page view event in location analytics
            trackLocationEvent(
                'page_view', 
                foundArticle.locationIds?.[0] || 'loc-bagula', 
                foundArticle.businessCategoryIds?.[0], 
                undefined, 
                foundArticle.slug
            );

            const savedComments = localStorage.getItem(`comments_${slug}`);
            if (savedComments) {
                try { setComments(JSON.parse(savedComments)); } catch (e) {}
            }
        }

        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
                <Loader2 className="text-blue-600 animate-spin" size={40} />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating Knowledge Object...</span>
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

    // Resolve author string vs AuthorProfile
    const authorName = typeof article.author === 'object' ? article.author.name : (article.author || 'Conflux AI Editorial Network');
    const authorRole = typeof article.author === 'object' ? article.author.role : 'Authority Partner';

    // Resolve Location Items
    const locationItems: LocationItem[] = (article.locationIds || []).map(id => 
        allLocations.find(l => l.id === id || l.slug === id)
    ).filter(Boolean) as LocationItem[];

    // Schema.org Structured Data
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": article.title,
        "inLanguage": article.language === 'bn' ? 'bn-IN' : 'en-US',
        "mainEntityOfPage": `https://confluxai.in/blog/${article.slug}`,
        "articleSection": article.category || "AI Automation",
        "author": {
            "@type": "Person",
            "name": authorName,
            "jobTitle": authorRole
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
        "datePublished": article.publishedAt || article.updatedAt || new Date().toISOString(),
        "dateModified": article.updatedAt || article.publishedAt || new Date().toISOString(),
        "description": article.excerpt || article.seoDescription || article.title
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://confluxai.in/blog" },
            { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://confluxai.in/blog/${article.slug}` }
        ]
    };

    const faqSchema = article.faq && article.faq.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": article.faq.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": f.answer
            }
        }))
    } : null;

    const handleContactClick = () => {
        if (article) {
            trackLocationEvent(
                'contact_click', 
                article.locationIds?.[0] || 'loc-bagula', 
                article.businessCategoryIds?.[0], 
                undefined, 
                article.slug
            );
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Structured Data Schemas */}
            <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}

            <div className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Back Button */}
                <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-12 hover:gap-3 transition-all">
                    <ArrowLeft size={14} /> Back to Knowledge Base
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Article Content */}
                    <div className="lg:col-span-8">
                        <header className="mb-10">
                            {/* Badges Bar */}
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                    {article.category || 'Digital Strategy'}
                                </span>

                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                                    {article.language === 'bn' ? '🇧🇩 বাংলা (Bengali)' : '🇬🇧 English'}
                                </span>

                                {locationItems.map(loc => (
                                    <Link 
                                        key={loc.id} 
                                        to={`/locations/${loc.slug}`}
                                        className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                    >
                                        <MapPin size={10} /> {loc.displayName || loc.name}
                                    </Link>
                                ))}

                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 ml-auto">
                                    <Calendar size={12} /> {new Date(article.publishedAt || Date.now()).toLocaleDateString()}
                                </span>
                            </div>

                            <h1 className="font-inter text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
                                {article.title}
                            </h1>

                            <div className="flex items-center gap-3 py-3 border-y border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                                    {authorName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{authorName}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{authorRole}</p>
                                </div>
                            </div>
                        </header>

                        {/* Article Content Body */}
                        <div className="prose prose-slate prose-lg max-w-none">
                            {renderFormattedBlocks(article.content, article.title)}
                        </div>

                        {/* FAQs Section */}
                        {article.faq && article.faq.length > 0 && (
                            <section className="my-12 p-8 rounded-3xl bg-slate-50 border border-slate-200">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <HelpCircle className="text-blue-600" size={20} /> Frequently Asked Questions (FAQ)
                                </h3>
                                <div className="space-y-4">
                                    {article.faq.map((f, i) => (
                                        <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                                            <h4 className="font-bold text-slate-900 text-base mb-2">Q: {f.question}</h4>
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed">A: {f.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Remote-First Transparency Notice */}
                        <div className="my-10 p-6 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-4">
                            <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
                            <div className="text-xs space-y-1">
                                <h4 className="font-black text-blue-900 uppercase tracking-wider">Remote-First Agency Transparency</h4>
                                <p className="text-blue-800 font-medium leading-relaxed">
                                    Conflux AI is a remote-first AI automation and digital solutions agency based in Kolkata, West Bengal. We partner with business clients across Bagula, Krishnanagar, Ranaghat, Haldia, Siliguri, and all districts of West Bengal remotely through digital communication channels without maintaining physical offices in those localities.
                                </p>
                            </div>
                        </div>

                        {/* User Reaction Button */}
                        <div className="flex items-center justify-between py-6 px-8 my-8 bg-slate-50 border border-slate-100 rounded-2xl">
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
                                    }
                                }}
                                className={`flex items-center gap-3 px-6 py-3 bg-white border rounded-xl transition-all shadow-sm group ${
                                    localStorage.getItem(`liked_${article.slug}`) 
                                        ? 'border-pink-500 text-pink-600 bg-pink-50/20' 
                                        : 'border-slate-200 hover:border-pink-500 hover:text-pink-600'
                                }`}
                            >
                                <span className="text-pink-500 group-hover:scale-125 transition-transform">❤️</span>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                                    Helpful Insight ({article.reactions || 0})
                                </span>
                            </button>

                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                <Share2 size={16} />
                                <span>Share Knowledge</span>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <section className="mt-12 p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-900 text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
                            <div className="relative z-10">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-widest uppercase mb-6">
                                    <Zap size={14} className="text-yellow-400" /> Remote AI Solutions
                                </span>
                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
                                    Ready to Grow Your Business? <br />
                                    <span className="text-blue-200">Talk to Conflux AI Today.</span>
                                </h3>
                                <p className="text-blue-100 font-medium text-base md:text-lg mb-8 max-w-xl leading-relaxed">
                                    We transform complex workflows into streamlined competitive advantages using custom AI agents, WhatsApp Business bots, and sub-second web platforms.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a 
                                        href="/#contact" 
                                        onClick={handleContactClick}
                                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-xl"
                                    >
                                        Request Digital Consultation
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Knowledge Graph Relationships */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="sticky top-32 space-y-6">
                            {/* Connected Locations Box */}
                            {locationItems.length > 0 && (
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-1.5">
                                        <MapPin size={14} className="text-blue-600" /> Linked Locality Knowledge Hubs
                                    </h4>
                                    <div className="space-y-2">
                                        {locationItems.map(loc => (
                                            <Link 
                                                key={loc.id} 
                                                to={`/locations/${loc.slug}`}
                                                className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs hover:border-blue-500 transition-colors group"
                                            >
                                                <div>
                                                    <span className="font-bold text-slate-900 group-hover:text-blue-600 block">{loc.displayName || loc.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">{loc.districtSlug || 'Nadia'} District</span>
                                                </div>
                                                <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Connected Conflux Services */}
                            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                                <h4 className="font-black uppercase tracking-widest text-xs text-blue-400 flex items-center gap-1.5">
                                    <Zap size={14} /> Relevant Digital Solutions
                                </h4>
                                <p className="text-xs text-slate-300">
                                    Work remotely with Conflux AI to digitize your local business workflows.
                                </p>
                                <div className="space-y-2">
                                    <Link to="/services/whatsapp-automation" className="block p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors">
                                        • WhatsApp Business Automation →
                                    </Link>
                                    <Link to="/services/website-development" className="block p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors">
                                        • High-Performance Web Platforms →
                                    </Link>
                                    <Link to="/services/seo-geo" className="block p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors">
                                        • SEO & GEO Search Optimization →
                                    </Link>
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
