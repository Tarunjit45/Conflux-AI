
import React, { useEffect } from 'react';
import SocialImpact from './SocialImpact.tsx';
import TrustEngine from './TrustEngine.tsx';
import { ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ImpactPage: React.FC = () => {
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
                        Global <span className="text-blue-600 underline decoration-blue-500/20">Impact</span>.
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-6 max-w-2xl">
                        Scaling reach, fostering trust, and driving measurable social transformation through intelligent automation and community engagement.
                    </p>
                </div>

                <div className="space-y-0">
                    <SocialImpact />
                    
                    <section id="impact" className="py-24 relative" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid rgba(15,23,42,0.04)', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
                        <TrustEngine />
                    </section>
                </div>

                {/* Values Section */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: "Empowerment", desc: "Providing tools that allow local businesses to compete on a global scale." },
                            { title: "Transparency", desc: "Build systems that are open, honest, and verifiable for every user." },
                            { title: "Innovation", desc: "Pushing the boundaries of what AI can do for human connection." }
                        ].map((v, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">{v.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
                    <div className="text-center py-20 px-8 rounded-[3rem] bg-blue-600 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                             style={{ background: 'radial-gradient(circle at 70% 30%, #ffffff 0%, transparent 70%)', filter: 'blur(100px)' }} />
                        <h2 className="font-inter text-3xl md:text-5xl font-black mb-6 tracking-tight">Make a <span className="text-white underline decoration-white/30">Real Difference.</span></h2>
                        <p className="text-blue-100 max-w-xl mx-auto mb-10 text-lg">Partner with us to build a future where technology serves everyone, not just the few.</p>
                        <Link to="/#contact" className="inline-flex h-14 items-center px-10 rounded-full bg-white text-blue-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-white/10">
                            Partner for Impact
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImpactPage;
