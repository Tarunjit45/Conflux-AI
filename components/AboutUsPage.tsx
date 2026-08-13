import React from 'react';
import { motion } from 'framer-motion';
import Founders from './Founders.tsx';
import { ArrowLeft, Sparkles, Target, Zap, Shield, MapPin, Mail, Phone, ExternalLink, Linkedin, Youtube, Instagram, Twitter, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUsPage: React.FC = () => {
    const socialLinks = [
        { name: "LinkedIn", icon: <Linkedin size={18} className="text-[#0077B5]" />, href: "https://www.linkedin.com/company/conflux-ai" },
        { name: "YouTube", icon: <Youtube size={18} className="text-[#FF0000]" />, href: "https://www.youtube.com/@Confluxai-z9o" },
        { name: "Instagram", icon: <Instagram size={18} className="text-[#E4405F]" />, href: "https://www.instagram.com/conflux.ai" },
        { name: "Twitter / X", icon: <Twitter size={18} className="text-[#1DA1F2]" />, href: "https://x.com/ConfluxA12947" },
        { name: "Facebook", icon: <Facebook size={18} className="text-[#1877F2]" />, href: "https://www.facebook.com/share/17dsWzvFYN/" }
    ];

    return (
        <div className="min-h-screen bg-white font-inter">
            <div className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Back Link */}
                <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-8 hover:gap-3 transition-all">
                    <ArrowLeft size={14} /> Return to Home
                </Link>

                {/* Main Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-3xl">
                        <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                            About Conflux AI
                        </span>
                        <h1 className="font-orbitron text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                            Engineering Intelligent <span className="text-blue-600">Business Systems</span>.
                        </h1>
                        <p className="text-slate-600 font-normal text-base sm:text-lg mt-6 leading-relaxed">
                            Conflux AI is a remote-first AI automation and digital solutions agency based in Kolkata, West Bengal, India. Founded by Tarunjit Biswas and Shouvik Majumdar, Conflux AI combines AI engineering, software development, workflow automation, and digital strategy to help businesses operate with precision and scale efficiently.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 italic text-slate-500 text-xs font-semibold">
                        <Sparkles size={18} className="text-blue-600" />
                        "Practical AI Engineering for Real Business Outcomes"
                    </div>
                </div>

                {/* AI-Readable Company Summary Block (Requirement 13) */}
                <div className="mb-20 p-8 rounded-3xl bg-blue-50/60 border border-blue-100/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-blue-700">
                        <Shield size={16} className="text-blue-600" /> Verified Company Summary
                    </div>
                    <p className="text-slate-800 text-base md:text-lg font-medium leading-relaxed">
                        "Conflux AI is a remote-first AI automation and digital solutions agency based in Kolkata, West Bengal, India, serving clients across India and globally."
                    </p>
                </div>

                {/* Detailed Overview: What We Do, Who We Serve, Where We Operate */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                        <h2 className="text-xl font-bold font-orbitron text-slate-900">What We Do</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            We architect end-to-end AI automation pipelines, autonomous AI agents, 24/7 conversational chatbots, WhatsApp Business API integrations, sub-second web platforms, and structured search engine optimizations.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                        <h2 className="text-xl font-bold font-orbitron text-slate-900">Who We Serve</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            We partner with growing companies, B2B agencies, e-commerce storefronts, professional consultants, local service providers, and enterprise teams seeking to reduce manual operational overhead.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                        <h2 className="text-xl font-bold font-orbitron text-slate-900">Where We Operate</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Conflux AI is structured as a remote-first agency based in Kolkata, West Bengal, India. We collaborate with business clients across Kolkata, West Bengal, India, and globally through digital communication channels.
                        </p>
                    </div>
                </div>

                {/* Core Operating Principles */}
                <div className="mb-24">
                    <h2 className="font-orbitron text-3xl font-bold text-slate-900 mb-8 border-l-4 border-blue-600 pl-4">
                        Our Operational Principles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Target className="text-blue-600" />, title: "Frictionless Utility", desc: "We design software around direct business goals—removing unnecessary fluff so users and internal teams accomplish tasks faster." },
                            { icon: <Zap className="text-orange-500" />, title: "Technical Rigor", desc: "Every system is built on modern, lightweight frameworks (React, Vite, Python, Serverless Cloud) with strict error handling." },
                            { icon: <Shield className="text-emerald-600" />, title: "Data Integrity & Security", desc: "We enforce zero-trust data protection, API encryption, and verified RAG guardrails across all customer automation pipelines." }
                        ].map((value, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6">
                                    {value.icon}
                                </div>
                                <h3 className="font-orbitron text-lg font-bold text-slate-900 mb-3">{value.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-normal">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Founders Section */}
                <div className="mb-24">
                    <Founders />
                </div>

                {/* Contact & Verification Information */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
                    <div className="lg:col-span-6 p-8 md:p-10 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
                        <h2 className="font-orbitron font-bold text-2xl text-slate-900">
                            Official Contact & Location
                        </h2>
                        <div className="space-y-4 text-sm text-slate-600">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-blue-600 shrink-0 mt-1" />
                                <div>
                                    <strong className="block text-slate-900 font-bold">Base Location (Remote-First)</strong>
                                    <span>Kolkata, West Bengal, India (Serving India & Global Clients)</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail size={18} className="text-blue-600 shrink-0 mt-1" />
                                <div>
                                    <strong className="block text-slate-900 font-bold">Official Email</strong>
                                    <a href="mailto:confluxdotai@gmail.com" className="text-blue-600 font-medium hover:underline">confluxdotai@gmail.com</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone size={18} className="text-blue-600 shrink-0 mt-1" />
                                <div>
                                    <strong className="block text-slate-900 font-bold">Direct Client Line</strong>
                                    <a href="tel:+918972517557" className="text-blue-600 font-medium hover:underline">+91-8972517557</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-6 p-8 md:p-10 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
                        <h2 className="font-orbitron font-bold text-2xl text-slate-900">
                            Verified Official Profiles
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        {social.icon}
                                        <span className="text-xs font-bold text-slate-800">{social.name}</span>
                                    </div>
                                    <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center py-16 px-8 rounded-3xl bg-slate-950 text-white relative overflow-hidden shadow-2xl">
                    <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Partner with <span className="text-blue-500">Conflux AI</span></h2>
                    <p className="text-slate-300 max-w-xl mx-auto mb-10 text-base font-light">Discuss your business automation, custom web application, or technical AI strategy with our technical team.</p>
                    <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-wider text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30">
                        <span>Initiate Project Consultation</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
