
import React, { useEffect } from 'react';
import CreativeSuite from './CreativeSuite.tsx';
import { ArrowLeft, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreativePage: React.FC = () => {
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
                        Digital <span className="text-blue-600 underline decoration-blue-500/20">Creative</span> <br />Suite.
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-6 max-w-2xl">
                        Premium visual assets, high-retention video editing, and strategic branding that gives your business an unfair advantage in the attention economy.
                    </p>
                </div>

                <div className="bg-[#f8fafc] py-24">
                    <CreativeSuite />
                </div>

                {/* Creative Process Section */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="section-tag mb-6">Our Workflow</div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">Where <span className="text-blue-600">Art</span> Meets <br />Mathematical Precision.</h2>
                            <div className="space-y-6">
                                {[
                                    { title: "Conceptualization", desc: "We study your brand's DNA to create visual strategies that resonate with your target audience." },
                                    { title: "High-Velocity Drafting", desc: "Rapid prototyping of assets across video, static design, and interactive UI components." },
                                    { title: "Retention Optimization", desc: "Fine-tuning every pixel and frame to maximize user engagement and trust signals." }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center font-black text-blue-600 flex-shrink-0">
                                            0{i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1">{step.title}</h4>
                                            <p className="text-sm text-slate-500">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-slate-100 flex items-center justify-center p-12 relative overflow-hidden group">
                                <Palette size={200} className="text-blue-600/20 group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,255,0.05)_0%,transparent_70%)] animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center py-20 px-8 rounded-[3rem] bg-[#020c1b] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none"
                             style={{ background: 'radial-gradient(circle at 30% 70%, rgba(0,0,255,1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
                        <h2 className="font-inter text-3xl md:text-5xl font-black mb-6 tracking-tight">Need a <span className="text-blue-500">Brand Level-up?</span></h2>
                        <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">Stop using generic designs. Let's create something that actually represents your vision.</p>
                        <Link to="/#contact" className="inline-flex h-14 items-center px-10 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-blue-500/20">
                            Book Creative Session
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativePage;
