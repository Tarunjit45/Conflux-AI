
import React, { useEffect } from 'react';
import Projects from './Projects.tsx';
import { ArrowLeft, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const PortfolioPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <div className="pt-32 pb-20">
                <div className="px-4 md:px-6 max-w-7xl mx-auto mb-16">
                    <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-6 hover:gap-3 transition-all">
                        <ArrowLeft size={14} /> Back to Network
                    </Link>
                    <h1 className="font-inter text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                        Case <span className="text-blue-600 underline decoration-blue-500/20">Studies</span>.
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-6 max-w-2xl">
                        A curated selection of high-impact AI implementations and growth strategies that have transformed businesses into industry leaders.
                    </p>
                </div>

                <div className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 relative" style={{ backgroundColor: '#ffffff' }}>
                    <Projects />
                </div>

                {/* Growth Stats Section */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: "450+", label: "Successful Deployments" },
                            { value: "10k+", label: "Automation Workflows Active" },
                            { value: "98%", label: "Client Retainment Rate" },
                            { value: "3.5x", label: "Average ROI Increase" }
                        ].map((stat, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                                <div className="text-4xl font-black text-blue-600 mb-2">{stat.value}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
                    <div className="text-center py-20 px-8 rounded-[3rem] bg-[#020c1b] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none"
                             style={{ background: 'radial-gradient(circle at 70% 30%, rgba(0,0,255,1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
                        <h2 className="font-inter text-3xl md:text-5xl font-black mb-6 tracking-tight">Your Success <span className="text-blue-500">Starts Here.</span></h2>
                        <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">Let's build a success story together. Our portfolio is missing your brand's next achievement.</p>
                        <Link to="/#contact" className="inline-flex h-14 items-center px-10 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-blue-500/20">
                            Launch Your Project
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioPage;
