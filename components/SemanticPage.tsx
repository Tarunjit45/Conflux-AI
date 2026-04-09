
import React, { useEffect } from 'react';
import SemanticMap from './SemanticMap.tsx';
import { ArrowLeft, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

const SemanticPage: React.FC = () => {
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
                        Semantic <span className="text-blue-600 underline decoration-blue-500/20">Connectivity</span>.
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-6 max-w-2xl">
                        Deep ecosystem mapping and entity connection strategies that dominate next-generation search engine and AI model retrievals.
                    </p>
                </div>

                <div className="py-24" style={{ backgroundColor: '#ffffff' }}>
                    <SemanticMap />
                </div>

                {/* Technical Specs Section */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="section-tag mb-6">Core Methodology</div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">Building the <span className="text-blue-600">Knowledge Graph.</span></h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">Our semantic engine doesn't just look at keywords; it maps the relationships between entities, contexts, and user intents.</p>
                            <div className="space-y-4">
                                {[
                                    "Entity-Relationship Mapping",
                                    "Vector Database Integration",
                                    "Knowledge Graph Optimization",
                                    "Semantic Signal Clustering"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-600/20 text-blue-600">
                                            <Network size={12} />
                                        </div>
                                        <span className="font-bold text-slate-900">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-8 rounded-[3rem] bg-slate-900 text-white relative group overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 blur-[100px] bg-blue-600 opacity-20 pointer-events-none" />
                             <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">System Performance</h3>
                             <div className="space-y-6">
                                {[
                                    { label: "Retrieval Accuracy", value: "99.2%" },
                                    { label: "Entity Resolution", value: "Real-time" },
                                    { label: "Knowledge Depth", value: "Multi-layered" }
                                ].map((spec, i) => (
                                    <div key={i} className="flex justify-between items-end border-b border-white/10 pb-4">
                                        <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{spec.label}</span>
                                        <span className="text-blue-400 font-mono font-bold">{spec.value}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center py-20 px-8 rounded-[3rem] bg-[#020c1b] text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                             style={{ background: 'radial-gradient(circle at 70% 30%, rgba(0,0,255,1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
                        <h2 className="font-inter text-3xl md:text-5xl font-black mb-6 tracking-tight">Connect Your <span className="text-blue-500">Ecosystem.</span></h2>
                        <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">In the age of AI search, isolation is failure. Let's make you the center of your industry's knowledge graph.</p>
                        <Link to="/#contact" className="inline-flex h-14 items-center px-10 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-blue-500/20">
                            Start Semantic Mapping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SemanticPage;
