
import React, { useEffect } from 'react';
import InfrastructureSuite from './InfrastructureSuite.tsx';
import AICore from './AICore.tsx';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const SolutionsPage: React.FC = () => {
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
                        Enterprise <span className="text-blue-600 underline decoration-blue-500/20">Solutions</span>.
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-6 max-w-2xl">
                        Advanced infrastructure and AI-driven systems designed for high-performance business scaling and technical dominance.
                    </p>
                </div>

                <div className="space-y-24">
                    <InfrastructureSuite />
                    
                    <section className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 relative overflow-hidden" style={{ backgroundColor: '#020c1b' }}>
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-10 pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(0,0,255,1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
                        <AICore />
                    </section>
                </div>

                {/* Bottom CTA */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 mt-24">
                    <div className="text-center py-20 px-8 rounded-[3rem] bg-slate-50 border border-slate-100 relative overflow-hidden">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 italic text-slate-400 text-xs font-bold">
                                <Sparkles size={16} className="text-blue-500" />
                                "Engineered for 2026 Connectivity"
                            </div>
                        </div>
                        <h2 className="font-inter text-3xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">Custom Engineering <span className="text-blue-600">Request?</span></h2>
                        <p className="text-slate-500 max-w-xl mx-auto mb-10 text-lg">Need a specific AI integration or specialized infrastructure? Our engineers are ready.</p>
                        <Link to="/#contact" className="inline-flex h-14 items-center px-10 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-blue-500/20">
                            Consult with Experts
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SolutionsPage;
