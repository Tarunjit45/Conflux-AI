// Conflux Platform — About Us Page

import React from 'react';
import { motion } from 'framer-motion';
import Founders from './Founders.tsx';
import { ArrowLeft, Sparkles, Target, Zap, Shield, MapPin, Mail, Phone, ExternalLink, Linkedin, Youtube, Instagram, Twitter, Facebook, Search, Building2, CheckCircle2 } from 'lucide-react';
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
        <div className="min-h-screen bg-white font-inter text-slate-900">
            <div className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Back Link */}
                <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-8 hover:gap-3 transition-all">
                    <ArrowLeft size={14} /> Return to Home
                </Link>

                {/* Main Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-3xl space-y-4">
                        <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider inline-block">
                            About Conflux AI
                        </span>
                        <h1 className="font-orbitron text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                            Making Local Businesses <span className="text-blue-600">Discoverable</span> &amp; Trusted.
                        </h1>
                        <p className="text-slate-600 font-normal text-base sm:text-lg leading-relaxed">
                            Conflux AI is a Local Visibility + Trust Platform that helps local businesses become discoverable, trusted, and contactable across Google and AI search. Founded by Tarunjit Biswas and Shouvik Majumdar in Kolkata, West Bengal, India.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 italic text-slate-600 text-xs font-semibold shrink-0">
                        <Sparkles size={18} className="text-blue-600" />
                        "Evidence-First Visibility &amp; Local Business Trust"
                    </div>
                </div>

                {/* AI-Readable Company Summary Block */}
                <div className="mb-20 p-8 rounded-3xl bg-blue-50/60 border border-blue-100/80 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-700">
                        <Shield size={16} className="text-blue-600" /> Verified Canonical Summary
                    </div>
                    <p className="text-slate-800 text-base md:text-lg font-medium leading-relaxed">
                        "Conflux AI is a Local Visibility + Trust Platform that helps local businesses become discoverable, trusted, and contactable across Google and AI search."
                    </p>
                </div>

                {/* Detailed Overview: What We Do, Who We Serve, Where We Operate */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            <Search size={18} />
                        </div>
                        <h2 className="text-xl font-bold font-orbitron text-slate-900">What We Do</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            We build structured LocalBusiness entity graphs, Schema.org JSON-LD architectures, AI-search answer blocks (GEO/AEO), statutory registry verification dockets, and direct 1-tap WhatsApp lead conversion channels.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            <Building2 size={18} />
                        </div>
                        <h2 className="text-xl font-bold font-orbitron text-slate-900">Who We Serve</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            We serve local healthcare diagnostic centers, manufacturing workshops, retail showrooms, dining venues, and professional practitioners who need to be found by customers and trusted instantly.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                            <MapPin size={18} />
                        </div>
                        <h2 className="text-xl font-bold font-orbitron text-slate-900">Where We Operate</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Conflux AI operates across Kolkata and all 23 districts of West Bengal (including Nadia, North 24 Parganas, Howrah, Hooghly, Murshidabad, and Darjeeling), expanding local business visibility across India.
                        </p>
                    </div>
                </div>

                {/* Core Operating Principles */}
                <div className="mb-24">
                    <h2 className="font-orbitron text-3xl font-bold text-slate-900 mb-8 border-l-4 border-blue-600 pl-4">
                        Our Core Platform Principles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Shield className="text-blue-600" />, title: "Evidence-First Verification", desc: "We connect entity claims to authoritative primary registries (MCA, GSTIN, FSSAI, MSME Udyam) rather than inventing uncorroborated claims." },
                            { icon: <Zap className="text-emerald-600" />, title: "Technical Discoverability", desc: "Every business node is built on sub-second, crawlable React architecture with structured Schema.org JSON-LD and AI-readable answer models." },
                            { icon: <Target className="text-purple-600" />, title: "Measurable Lead Conversion", desc: "We track genuine customer interactions—calls, WhatsApp chats, and direction requests—with zero synthetic traffic or fabricated ranking claims." }
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
                <Founders />

                {/* Official Contact & Registry Information */}
                <div className="mt-20 p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                        <div>
                            <h3 className="font-orbitron text-xl font-bold">Conflux AI Operational Office</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Registered in Kolkata, West Bengal, India &bull; Serving Local Businesses
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {socialLinks.map((s, i) => (
                                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                            <MapPin size={15} className="text-blue-400" />
                            <span>Kolkata, West Bengal, 700001, India</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={15} className="text-blue-400" />
                            <a href="mailto:confluxai45@gmail.com" className="hover:text-white">confluxai45@gmail.com</a>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={15} className="text-blue-400" />
                            <a href="tel:+919734433100" className="hover:text-white">+91 97344 33100</a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutUsPage;
