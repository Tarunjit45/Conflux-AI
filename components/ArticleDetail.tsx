import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
    Calendar, User, ArrowLeft, Loader2, Share2, MessageSquare, Zap, 
    ExternalLink, MapPin, Building2, HelpCircle, Layers, ShieldCheck, 
    Check, Copy, Send, Sparkles, BookOpen, ChevronRight 
} from 'lucide-react';
import { getAllLocations, LocationItem } from '../data/locationsData';
import { BUSINESS_CATEGORY_TAXONOMY } from '../data/taxonomiesData';
import { ArticleKnowledgeObject } from '../types/article';
import { trackLocationEvent } from '../lib/locationAnalytics';
import { getArticleBySlug, STATIC_ARTICLES, getRelatedArticles, getNormalizedDistricts } from '../data/articlesData';
import Breadcrumbs from './Breadcrumbs';
import { applySeoMetadata } from '../lib/seoMetadata';
import { getArticleCanonicalUrl } from '../lib/canonicalUrl';
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '../lib/structuredData';
import { trackPageView } from '../lib/analytics';

// Dynamic OpenGraph and Meta Tag Setter
const setOrCreateMeta = (attr: 'name' | 'property', key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
};

// Social Share Component with official branding & instant pre-filled text
const SocialShareBar: React.FC<{ title: string; slug: string; excerpt: string; className?: string }> = ({ 
    title, 
    slug, 
    excerpt, 
    className = "" 
}) => {
    const [copied, setCopied] = useState(false);
    const url = `https://confluxai.in/blog/${slug}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const shareMessage = encodeURIComponent(`Check out this authoritative insight from Conflux AI: "${title}"\n\nRead here: `) + encodedUrl;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleNativeShare = async () => {
        if (typeof navigator !== 'undefined' && 'share' in navigator) {
            try {
                await navigator.share({
                    title: title,
                    text: excerpt || title,
                    url: url
                });
            } catch (err) {}
        } else {
            handleCopy();
        }
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mr-1">
                <Share2 size={13} className="text-blue-600" /> Share:
            </span>

            {/* WhatsApp */}
            <a
                href={`https://api.whatsapp.com/send?text=${shareMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 hover:scale-105"
                title="Share on WhatsApp"
                aria-label="Share this insight on WhatsApp"
            >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                WhatsApp
            </a>

            {/* LinkedIn */}
            <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 hover:scale-105"
                title="Share on LinkedIn"
                aria-label="Share this insight on LinkedIn"
            >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                LinkedIn
            </a>

            {/* X / Twitter */}
            <a
                href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=ConfluxA12947`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm hover:scale-105"
                title="Post on X (Twitter)"
                aria-label="Post this insight on X"
            >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Post on X
            </a>

            {/* Facebook */}
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2] hover:bg-[#125ec4] text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 hover:scale-105"
                title="Share on Facebook"
                aria-label="Share this insight on Facebook"
            >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z"/></svg>
                Facebook
            </a>

            {/* Telegram */}
            <a
                href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#229ED9] hover:bg-[#1c85b8] text-white text-xs font-bold transition-all shadow-sm hover:scale-105"
                title="Share on Telegram"
                aria-label="Share this insight on Telegram"
            >
                <Send size={12} />
                Telegram
            </a>

            {/* Native Mobile Share */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                    onClick={handleNativeShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm hover:scale-105"
                    title="Device Share"
                    aria-label="Open device sharing menu"
                >
                    <Share2 size={12} />
                    Share
                </button>
            )}

            {/* Copy Link Button */}
            <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    copied 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Copy Article Link"
                aria-label="Copy insight link to clipboard"
            >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy Link'}
            </button>
        </div>
    );
};

// Markdown Parser Helper
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
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            i++;
            continue;
        }

        // Markdown Table Parser
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
                tableLines.push(lines[i].trim());
                i++;
            }

            if (tableLines.length >= 2) {
                const headerLine = tableLines[0];
                const headers = headerLine.split('|').map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
                
                const rows = tableLines.slice(1).filter(l => {
                    const clean = l.replace(/[\s|:-]/g, '');
                    return clean.length > 0;
                }).map(rowLine => {
                    return rowLine.split('|').map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
                });

                elements.push(
                    <div key={`table-${i}`} className="overflow-x-auto my-8 rounded-2xl border border-slate-200 shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                                <tr>
                                    {headers.map((h, hIdx) => (
                                        <th key={hIdx} className="px-4 py-3.5 border-r border-slate-200 last:border-r-0">
                                            {parseMarkdownText(h)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {rows.map((row, rIdx) => (
                                    <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white hover:bg-slate-50/80" : "bg-slate-50/40 hover:bg-slate-50/80"}>
                                        {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="px-4 py-3 text-slate-700 font-medium border-r border-slate-100 last:border-r-0">
                                                {parseMarkdownText(cell)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                continue;
            }
        }

        // Skip H1 title if it duplicates article title
        if (trimmed.startsWith('# ')) {
            const h1Text = trimmed.replace(/^#\s+/, '').replace(/\*\*/g, '');
            if (h1Text.toLowerCase() !== articleTitle.toLowerCase()) {
                elements.push(
                    <h1 key={i} className="font-inter text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-10 mb-6">
                        {parseMarkdownText(h1Text)}
                    </h1>
                );
            }
            i++;
            continue;
        }

        // Headers
        if (trimmed.startsWith('## ')) {
            const h2Text = trimmed.replace(/^##\s+/, '').replace(/\*\*/g, '');
            elements.push(
                <h2 key={i} className="font-inter text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-10 mb-4 pb-2 border-b border-slate-100">
                    {parseMarkdownText(h2Text)}
                </h2>
            );
            i++;
            continue;
        }

        if (trimmed.startsWith('### ')) {
            const h3Text = trimmed.replace(/^###\s+/, '').replace(/\*\*/g, '');
            elements.push(
                <h3 key={i} className="font-inter text-xl font-bold text-slate-900 tracking-tight mt-8 mb-3">
                    {parseMarkdownText(h3Text)}
                </h3>
            );
            i++;
            continue;
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
            const quoteText = trimmed.replace(/^>\s+/, '');
            elements.push(
                <blockquote key={i} className="my-6 pl-4 border-l-4 border-blue-500 bg-blue-50/50 p-4 rounded-r-2xl text-slate-700 italic font-medium">
                    {parseMarkdownText(quoteText)}
                </blockquote>
            );
            i++;
            continue;
        }

        // Code block indicator
        if (trimmed.startsWith('```')) {
            i++;
            continue;
        }

        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***') {
            elements.push(<hr key={i} className="my-8 border-slate-100" />);
            i++;
            continue;
        }

        // Bullet list item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-*]\s+/, '');
            elements.push(
                <li key={i} className="ml-6 list-disc text-slate-700 font-medium leading-relaxed mb-2">
                    {parseMarkdownText(bulletText)}
                </li>
            );
            i++;
            continue;
        }

        // Numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
            elements.push(
                <li key={i} className="ml-6 list-decimal text-slate-700 font-medium leading-relaxed mb-2">
                    {parseMarkdownText(numMatch[2])}
                </li>
            );
            i++;
            continue;
        }

        // Standard Paragraph
        elements.push(
            <p key={i} className="text-slate-700 font-medium leading-relaxed mb-6 text-base md:text-lg">
                {parseMarkdownText(trimmed)}
            </p>
        );
        i++;
    }

    return elements;
};

const ArticleDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<ArticleKnowledgeObject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState<{ id: string; author: string; content: string; created_at: string }[]>([]);

    const allLocations = getAllLocations();

    useEffect(() => {
        if (!slug) return;
        fetchArticle();
    }, [slug]);

    const fetchArticle = async () => {
        setIsLoading(true);
        const cleanSlug = decodeURIComponent(slug || '').trim().replace(/\s+/g, '-').replace(/\/+$/, '');
        let foundArticle: ArticleKnowledgeObject | null = null;

        // 1. Check local storage custom articles first
        try {
            const localData = localStorage.getItem('conflux_custom_articles');
            if (localData) {
                const list: ArticleKnowledgeObject[] = JSON.parse(localData);
                const localMatch = list.find(a => 
                    a.slug.toLowerCase().trim() === cleanSlug.toLowerCase() || 
                    a.id.toLowerCase().trim() === cleanSlug.toLowerCase()
                );
                if (localMatch) foundArticle = localMatch;
            }
        } catch (e) {}

        // 2. Check bundled static articles in-memory (0ms latency fallback)
        if (!foundArticle) {
            const staticMatch = getArticleBySlug(cleanSlug);
            if (staticMatch) {
                foundArticle = staticMatch;
            }
        }

        // 3. Query Supabase
        if (!foundArticle) {
            try {
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('slug', cleanSlug)
                    .single();

                if (!error && data) {
                    foundArticle = data as any;
                }
            } catch (err) {}
        }

        // 4. Fallback to public/data/articles.json network fetch
        if (!foundArticle) {
            try {
                const res = await fetch('/data/articles.json');
                if (res.ok) {
                    const articlesList: ArticleKnowledgeObject[] = await res.json();
                    const jsonMatch = articlesList.find(a => 
                        a.slug.toLowerCase().trim() === cleanSlug.toLowerCase() || 
                        a.id.toLowerCase().trim() === cleanSlug.toLowerCase()
                    );
                    if (jsonMatch) foundArticle = jsonMatch;
                }
            } catch (err) {}
        }

        if (foundArticle) {
            // Load saved reactions & comments
            const storedReactions = localStorage.getItem(`count_${foundArticle.slug}`);
            if (storedReactions) {
                foundArticle.reactions = parseInt(storedReactions, 10);
            }
            setArticle(foundArticle);

            // Dynamic OpenGraph and SEO Metadata updates for Social Scrapers
            const fullUrl = foundArticle.canonicalUrl || getArticleCanonicalUrl(foundArticle.slug);
            const shareImage = foundArticle.featuredImage || 'https://confluxai.in/logo.png';
            const desc = foundArticle.seoDescription || foundArticle.excerpt || foundArticle.title;
            const authorStr = typeof foundArticle.author === 'object' ? foundArticle.author.name : (foundArticle.author || 'Tarunjit Biswas');

            applySeoMetadata({
                title: foundArticle.seoTitle || `${foundArticle.title} | Conflux AI`,
                description: desc,
                canonicalUrl: fullUrl,
                imageUrl: shareImage,
                author: authorStr,
                publishedTime: foundArticle.publishedAt || foundArticle.updatedAt,
                type: 'article'
            });

            // ── GA4: Dynamic Article Page View ────────────────────────
            trackPageView(
                foundArticle.seoTitle || `${foundArticle.title} | Conflux AI`,
                fullUrl,
                `/blog/${foundArticle.slug}`
            );

            // Track page view event in location analytics
            trackLocationEvent(
                'page_view', 
                foundArticle.locationIds?.[0] || 'loc-bagula', 
                foundArticle.businessCategoryIds?.[0], 
                undefined, 
                foundArticle.slug
            );

            const savedComments = localStorage.getItem(`comments_${foundArticle.slug}`);
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

    // Resolve Location Items & Districts
    const locationItems: LocationItem[] = (article.locationIds || []).map(id => 
        allLocations.find(l => l.id === id || l.slug === id)
    ).filter(Boolean) as LocationItem[];

    const normalizedDistricts = getNormalizedDistricts(article);

    // Calculate Intelligent Related Articles (topical overlap, district, search intent)
    const finalRelated = getRelatedArticles(article, 3);

    // Schema.org Structured Data
    const articleSchema = generateArticleSchema({
        title: article.title,
        slug: article.slug,
        description: article.excerpt || article.seoDescription || article.title,
        authorName,
        authorRole,
        publishedAt: article.publishedAt || article.updatedAt || new Date().toISOString(),
        updatedAt: article.updatedAt || article.publishedAt || new Date().toISOString(),
        imageUrl: article.featuredImage || 'https://confluxai.in/logo.png',
        category: article.category || "AI Automation",
        language: article.language
    });

    const breadcrumbsItems = [
        { name: "Knowledge Base", url: "/blog" },
        ...(locationItems.length > 0 ? [{ name: locationItems[0].displayName || locationItems[0].name, url: `/locations/${locationItems[0].slug}` }] : []),
        { name: article.title, url: `/blog/${article.slug}` }
    ];

    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbsItems);
    const faqSchema = generateFAQSchema(article.faq || []);

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
            {/* Structured Data Schemas for Google & AI Overviews */}
            <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}

            <div className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Breadcrumbs Navigation */}
                <Breadcrumbs items={breadcrumbsItems} className="mb-6" />

                {/* Back Button */}
                <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-10 hover:gap-3 transition-all">
                    <ArrowLeft size={14} /> Back to Knowledge Base
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Article Content */}
                    <div className="lg:col-span-8">
                        <header className="mb-8">
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

                            {/* Top Social Share Bar */}
                            <SocialShareBar 
                                title={article.title} 
                                slug={article.slug} 
                                excerpt={article.excerpt} 
                                className="mt-4 pt-3 border-b border-slate-100" 
                            />
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
                                <h4 className="font-black text-blue-900 uppercase tracking-wider">Remote-First Platform Transparency</h4>
                                <p className="text-blue-800 font-medium leading-relaxed">
                                    Conflux AI is a Local Visibility + Trust Platform based in Kolkata, West Bengal. We partner with business clients across Bagula, Krishnanagar, Ranaghat, Haldia, Siliguri, and all districts of West Bengal remotely through digital communication channels without maintaining physical offices in those localities.
                                </p>
                            </div>
                        </div>

                        {/* Social Share & Helpful Insight Bar */}
                        <div className="p-6 md:p-8 my-8 bg-slate-50 border border-slate-200/80 rounded-3xl space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                                    className={`flex items-center gap-3 px-6 py-3 bg-white border rounded-2xl transition-all shadow-sm group ${
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

                                <span className="text-xs text-slate-500 font-medium">
                                    Found this valuable? Share it with fellow business owners:
                                </span>
                            </div>

                            {/* Full Bottom Social Share Bar */}
                            <SocialShareBar 
                                title={article.title} 
                                slug={article.slug} 
                                excerpt={article.excerpt} 
                            />
                        </div>

                        {/* Automatic Recommended / Related Posts Section */}
                        {finalRelated.length > 0 && (
                            <section className="my-16">
                                <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Knowledge Graph</span>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <BookOpen className="text-blue-600" size={22} /> Recommended Insights & Related Posts
                                        </h3>
                                    </div>

                                    <Link 
                                        to="/blog" 
                                        className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1"
                                    >
                                        All 39+ Articles <ChevronRight size={14} />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {finalRelated.map(item => (
                                        <Link 
                                            key={item.id || item.slug}
                                            to={`/blog/${item.slug}`}
                                            className="group flex flex-col p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest">
                                                    {item.language === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 EN'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-auto">
                                                    {new Date(item.publishedAt || Date.now()).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h4 className="font-inter font-black text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                                {item.title}
                                            </h4>

                                            <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed flex-1">
                                                {item.excerpt}
                                            </p>

                                            <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                Read Article →
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

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
                            {/* Connected District Hubs */}
                            {normalizedDistricts.length > 0 && normalizedDistricts[0] !== 'statewide' && (
                                <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100">
                                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-1.5">
                                        <MapPin size={14} className="text-blue-600" /> Regional District Hub
                                    </h4>
                                    <div className="space-y-2">
                                        {normalizedDistricts.map(d => (
                                            <Link 
                                                key={d} 
                                                to={`/locations/west-bengal/${d}`}
                                                className="p-3 rounded-xl bg-white border border-blue-200/80 flex items-center justify-between text-xs hover:border-blue-500 hover:shadow-md transition-all group"
                                            >
                                                <div>
                                                    <span className="font-bold text-slate-900 group-hover:text-blue-600 block capitalize">
                                                        {d.replace(/-/g, ' ')} District Directory
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium">Explore All Local Articles &amp; Services</span>
                                                </div>
                                                <ChevronRight size={15} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

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

                            {/* Topical Clusters */}
                            {((article.topics && article.topics.length > 0) || (article.tags && article.tags.length > 0)) && (
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-1.5">
                                        <BookOpen size={14} className="text-blue-600" /> Topical Knowledge Clusters
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[...(article.topics || []), ...(article.tags || [])].slice(0, 8).map((t, idx) => (
                                            <span 
                                                key={idx}
                                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs"
                                            >
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Verified Data Sources */}
                            {article.sources && article.sources.length > 0 && (
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-1.5">
                                        <ShieldCheck size={14} className="text-emerald-600" /> Verified Sources &amp; Citations
                                    </h4>
                                    <ul className="space-y-2 text-xs">
                                        {article.sources.map((s, idx) => (
                                            <li key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                                                <a 
                                                    href={s.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-blue-600 hover:underline flex items-start gap-1.5"
                                                >
                                                    <ExternalLink size={12} className="shrink-0 mt-0.5" />
                                                    <span>{s.title}</span>
                                                </a>
                                                {s.publisher && (
                                                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Publisher: {s.publisher}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
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
                                        • SEO &amp; GEO Search Optimization →
                                    </Link>
                                    <Link to="/services/ai-automation" className="block p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors">
                                        • Enterprise AI Automation →
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
