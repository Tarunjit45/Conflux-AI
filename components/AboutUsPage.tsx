
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
                        <p className="text-slate-600 font-medium text-base sm:text-lg mt-6 leading-relaxed">
                            <strong>Conflux AI Digital Automation & Growth Agency</strong> is an AI automation and digital solutions agency headquartered in Kolkata, West Bengal, India. Founded by <a href="https://www.linkedin.com/in/tarunjit-biswas-a5248131b/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Tarunjit Biswas</a> and <a href="https://www.linkedin.com/in/shoubhik-majumdar-1a77032a1/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Shouvik Majumdar</a>, Conflux AI combines AI engineering, full-stack technology, automation, business strategy, marketing, and creative direction to build digital solutions for businesses.
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

                {/* Quick Navigation to Services & Portfolio */}
                <div className="mb-24 p-8 md:p-10 rounded-3xl bg-slate-50 border border-slate-200">
                    <h3 className="font-orbitron font-bold text-2xl text-slate-900 mb-4">
                        Explore Conflux AI Capabilities & Case Studies
                    </h3>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed max-w-3xl">
                        Headquartered in Kolkata, West Bengal, India, Conflux AI transforms operational workflows with enterprise AI agents, custom chatbots, high-performance web engineering, and Generative Engine Optimization (GEO).
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link 
                            to="/solutions" 
                            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/20"
                        >
                            Explore AI Automation Services
                        </Link>
                        <Link 
                            to="/portfolio" 
                            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            View Selected Client Work
                        </Link>
                        <Link 
                            to="/contact" 
                            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider transition-all border border-slate-300"
                        >
                            Contact Engineering Team
                        </Link>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center py-20 px-8 rounded-[3rem] bg-[#020c1b] text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                         style={{ background: 'radial-gradient(circle at 70% 30%, rgba(0,0,255,1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
                    
                    <h2 className="font-inter text-3xl md:text-5xl font-black mb-6 tracking-tight">Ready to build something <span className="text-blue-500">Extraordinary?</span></h2>
                    <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">Join us in the next chapter of the AI revolution. Let's automate your growth together.</p>
                    <Link to="/contact" className="inline-flex h-14 items-center px-10 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 hover:scale-105 transition-all active:scale-95">
                        Initiate Partnership
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
