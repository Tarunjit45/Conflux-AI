import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Youtube, ExternalLink, ShieldCheck } from 'lucide-react';

const socialSignals = [
  {
    platform: "LinkedIn Authority",
    metric: "5,000+ Connections",
    description: "Verified network of AI and automation leaders across India and Singapore.",
    icon: <Linkedin size={20} className="text-[#0077B5]" />,
    action: "View Profile"
  },
  {
    platform: "YouTube Insights",
    metric: "12,000+ Views",
    description: "Educational content on scaling businesses with smart AI workflows.",
    icon: <Youtube size={20} className="text-[#FF0000]" />,
    action: "Watch Tutorials"
  }
];

const AuthoritySignals: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-[#0a0f18]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left: Signals */}
          <div className="flex-1 w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-6"
            >
              <ShieldCheck className="text-blue-500" size={20} />
              <span className="font-inter text-xs font-black tracking-widest uppercase text-blue-500">
                Verified Entity Signals
              </span>
            </motion.div>
            
            <h2 className="font-inter text-4xl font-black text-white tracking-tight mb-8">
              Ranked through <span className="text-blue-500">Verification.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialSignals.map((signal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-tile p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        {signal.icon}
                      </div>
                      <ExternalLink size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{signal.platform}</p>
                    <h3 className="text-2xl font-black text-white mb-2">{signal.metric}</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{signal.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
                    <span>{signal.action}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Technical Capabilities (Micro-Bento) */}
          <div className="w-full lg:w-[450px] space-y-4">
            <div className="p-1 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/5">
              <div className="bg-[#020c1b]/60 backdrop-blur-3xl rounded-[1.4rem] p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck size={18} className="text-blue-500" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Engineering Standards</span>
                </div>

                <div className="space-y-6">
                  <div className="relative pl-6 border-l-2 border-blue-600/30">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Production Lead Security</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      End-to-end encryption for incoming client leads, API Webhooks, and CRM data sync.
                    </p>
                  </div>

                  <div className="relative pl-6 border-l-2 border-blue-600/30">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Sub-Second Web Architecture</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Vite + Serverless cloud edge infrastructure ensuring 100/100 Core Web Vitals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Entity Badge */}
            <div className="glass-tile p-6 flex items-center justify-between border-blue-500/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-blue-600/50 p-1">
                  <div className="w-full h-full rounded-full bg-blue-600 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">Conflux Global Entity</p>
                  <p className="text-[10px] text-slate-500 font-medium">Verified Knowledge Graph Signal</p>
                </div>
              </div>
              <ShieldCheck className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthoritySignals;
