
import React from 'react';
import { motion } from 'framer-motion';
import Founders from './Founders.tsx';
import { ArrowLeft, Sparkles, Target, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUsPage: React.FC = () => {
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
                            Our <span className="text-blue-600 underline decoration-blue-500/20">Mission</span> <br />& vision.
                        </h1>
                        <p className="text-slate-500 font-medium text-lg mt-6">
                            We are on a mission to democratize AI automation, making enterprise-grade intelligence accessible to every business, regardless of size or location.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-400 text-xs font-bold">
                        <Sparkles size={16} className="text-blue-500" />
                        "Building the Future of Work"
                    </div>
                </div>

                {/* Core Values Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {[
                        { icon: <Target className="text-blue-600" />, title: "Precision", desc: "Every solution we build is mathematically optimized for maximum ROI and efficiency." },
                        { icon: <Zap className="text-orange-500" />, title: "Speed", desc: "From concept to deployment, we prioritize rapid execution without compromising quality." },
                        { icon: <Shield className="text-emerald-500" />, title: "Trust", desc: "Transparent systems and verified results define our approach to AI integration." }
                    ].map((value, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-6">
                                {value.icon}
                            </div>
                            <h3 className="font-inter text-xl font-black text-slate-900 mb-3">{value.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">{value.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Founders Section (Imported Component) */}
                <div className="mb-24">
                    <Founders />
                </div>

                {/* Bottom CTA */}
                <div className="text-center py-20 px-8 rounded-[3rem] bg-[#020c1b] text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                         style={{ background: 'radial-gradient(circle at 70% 30%, rgba(0,0,255,1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
                    
                    <h2 className="font-inter text-3xl md:text-5xl font-black mb-6 tracking-tight">Ready to build something <span className="text-blue-500">Extraordinary?</span></h2>
                    <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">Join us in the next chapter of the AI revolution. Let's automate your growth together.</p>
                    <Link to="/#contact" className="inline-flex h-14 items-center px-10 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 hover:scale-105 transition-all active:scale-95">
                        Initiate Partnership
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
