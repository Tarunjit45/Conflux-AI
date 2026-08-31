// Conflux Platform — Frequently Asked Questions & Structured Q&A

import React, { useEffect } from 'react';
import VoiceFAQ from './VoiceFAQ.tsx';
import { ArrowLeft, MessageSquare, ShieldCheck, Search, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FaqPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const faqs = [
        {
            q: "What is Conflux AI?",
            a: "Conflux AI is a Local Visibility & Trust Platform that makes local businesses discoverable, understandable, trusted, and contactable across Google Search, Google Maps, and AI search engines (ChatGPT, Google Gemini, Perplexity)."
        },
        {
            q: "How does Conflux help my business get customer leads?",
            a: "We structure your business node with Schema.org LocalBusiness JSON-LD markup, verify statutory registration evidence to award the Conflux Verified Badge, and integrate 1-tap WhatsApp and phone routing to connect high-intent local searchers directly with you."
        },
        {
            q: "How does the Conflux Visibility Audit work?",
            a: "The Conflux Visibility Audit evaluates measurable engineering criteria: technical SEO, NAP accuracy, Schema.org LocalBusiness markup, statutory evidence depth, and AI-search readiness—with zero synthetic data or fabricated rankings."
        },
        {
            q: "How do I list and verify my business?",
            a: "You can submit your business details publicly at /list-business without forced account creation. To receive the Conflux Verified Badge, upload statutory registration proof (MCA, GSTIN, Trade License, or authentic storefront photos) for admin review."
        },
        {
            q: "Does Conflux claim to control Google or AI rankings?",
            a: "No. Conflux operates under a strict Zero-Fabrication Policy. We connect your business to authoritative public registries and optimize your technical entity architecture so search engines and AI models accurately understand and recommend your business."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-inter text-slate-900">
            <div className="pt-32 pb-20">
                <div className="px-4 md:px-6 max-w-7xl mx-auto mb-16">
                    <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-6 hover:gap-3 transition-all">
                        <ArrowLeft size={14} /> Back to Home
                    </Link>
                    <h1 className="font-orbitron text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                        Frequently Asked <span className="text-blue-600">Questions</span>.
                    </h1>
                    <p className="text-slate-600 font-normal text-base sm:text-lg mt-4 max-w-2xl leading-relaxed">
                        Learn how Conflux AI drives local business discoverability, evidence verification, and customer lead generation across Google and AI search.
                    </p>

                    {/* FAQPage JSON-LD Structured Data */}
                    <script type="application/ld+json" dangerouslySetInnerHTML={{
                      __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": faqs.map(f => ({
                          "@type": "Question",
                          "name": f.q,
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": f.a
                          }
                        }))
                      })
                    }} />
                </div>

                {/* FAQ List Cards */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                    {faqs.map((faq, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 uppercase">
                                <HelpCircle size={14} /> Question {i + 1}
                            </div>
                            <h2 className="text-lg font-bold font-orbitron text-slate-900">
                                {faq.q}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="py-16 bg-slate-50 border-y border-slate-200">
                    <VoiceFAQ />
                </div>

                {/* Bottom CTA */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 mt-20">
                    <div className="text-center py-16 px-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden space-y-6">
                        <div className="flex justify-center">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold font-mono">
                                <ShieldCheck size={16} />
                                Zero Fabricated Rankings &bull; 100% Measurable
                            </div>
                        </div>
                        <h2 className="font-orbitron text-2xl sm:text-4xl font-black tracking-tight">
                            Check Your Business Visibility Score Today
                        </h2>
                        <p className="text-slate-300 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
                            Run a free evidence-based audit of your local SEO, Schema.org markup, and AI search readiness.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                            <Link 
                                to="/business/audit" 
                                className="inline-flex h-12 items-center px-8 rounded-xl bg-blue-600 text-white font-bold text-xs font-mono uppercase tracking-wider hover:bg-blue-500 transition-all shadow-lg"
                            >
                                Check Visibility Free
                            </Link>
                            <Link 
                                to="/list-business" 
                                className="inline-flex h-12 items-center px-8 rounded-xl bg-emerald-600 text-white font-bold text-xs font-mono uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-lg"
                            >
                                List Business
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
