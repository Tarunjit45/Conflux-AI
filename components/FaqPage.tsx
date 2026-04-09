
import React, { useEffect } from 'react';
import VoiceFAQ from './VoiceFAQ.tsx';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const FaqPage: React.FC = () => {
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
                        Have <span className="text-blue-600 underline decoration-blue-500/20">Questions?</span>.
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-6 max-w-2xl">
                        Everything you need to know about our AI automation, creative services, and how we help businesses scale with precision.
                    </p>
                </div>

                <div className="py-24" style={{ backgroundColor: '#f8fafc' }}>
                    <VoiceFAQ />
                </div>

                {/* Bottom CTA */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 mt-24">
                    <div className="text-center py-20 px-8 rounded-[3rem] bg-blue-600 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                             style={{ background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, transparent 70%)', filter: 'blur(100px)' }} />
                        <h2 className="font-inter text-3xl md:text-5xl font-black mb-6 tracking-tight">Still Need <span className="text-white underline decoration-white/30">Clarification?</span></h2>
                        <p className="text-blue-100 max-w-xl mx-auto mb-10 text-lg">Our experts are available for a one-on-one session to answer your specific technical questions.</p>
                        <Link to="/#contact" className="inline-flex h-14 items-center px-10 rounded-full bg-white text-blue-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-white/20">
                            Speak with an Expert
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
