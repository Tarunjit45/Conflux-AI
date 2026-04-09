
import React, { useEffect } from 'react';
import AuthoritySignals from './AuthoritySignals.tsx';
import VideoTrust from './VideoTrust.tsx';
import GEOPowerhouse from './GEOPowerhouse.tsx';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthorityPage: React.FC = () => {
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
                        Trust <span className="text-blue-600 underline decoration-blue-500/20">Authority</span>.
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-6 max-w-2xl">
                        Establishing unshakeable digital authority and entity signals across semantic search and AI search environments.
                    </p>
                </div>

                <div className="space-y-0">
                    <AuthoritySignals />
                    <VideoTrust />
                    <GEOPowerhouse />
                </div>

                {/* Bottom CTA */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 mt-24">
                    <div className="text-center py-20 px-8 rounded-[3rem] bg-slate-50 border border-slate-100 relative overflow-hidden">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 italic text-slate-400 text-xs font-bold">
                                <ShieldCheck size={16} className="text-blue-500" />
                                "Verification Engine Active"
                            </div>
                        </div>
                        <h2 className="font-inter text-3xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">Establish Your <span className="text-blue-600">Digital Entity.</span></h2>
                        <p className="text-slate-500 max-w-xl mx-auto mb-10 text-lg">In the world of AI, authority is everything. Let's make sure you're the recommended choice.</p>
                        <Link to="/#contact" className="inline-flex h-14 items-center px-10 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-blue-500/20">
                            Claim Your Authority
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorityPage;
