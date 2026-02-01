import React from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquareCode, ShieldCheck, Zap } from 'lucide-react';

const AICore: React.FC = () => {
  const messages = [
    { role: 'ai', text: 'Core operational. Ready to optimize infrastructure nodes.' },
    { role: 'user', text: 'Initiate leak detection on ad stack.' },
    { role: 'ai', text: 'Scanning... Detected 12% inefficiency in cross-channel attribution. Resolution protocol available.' }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
      <div className="flex-1 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center lg:justify-start gap-4 mb-6"
        >
          <div className="h-[1px] w-12 bg-blue-500" />
          <span className="font-orbitron text-[10px] tracking-[0.4em] text-blue-500 uppercase">Neural Infrastructure</span>
        </motion.div>
        
        <h2 className="font-orbitron text-3xl md:text-6xl font-black text-white mb-8 leading-tight">
          THE <span className="text-gradient">WHATSAPP</span><br />OMNICHANNEL
        </h2>
        
        <p className="text-slate-400 text-lg font-light leading-relaxed mb-12">
          Enterprise-grade intelligence deployed through the world's most accessible interface. We remove the friction between complex AI logic and your end customers.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          {[
            { icon: <ShieldCheck size={16} />, text: "End-to-end encrypted logic" },
            { icon: <Zap size={16} />, text: "Sub-200ms response time" },
            { icon: <MessageSquareCode size={16} />, text: "Natural Language Processing" },
            { icon: <Zap size={16} />, text: "Live CRM Synchronicity" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 text-slate-300 text-sm"
            >
              <div className="text-blue-500">{item.icon}</div>
              {item.text}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full perspective-2000 py-20">
        <motion.div
          initial={{ rotateY: 20, rotateX: 10, y: 50, opacity: 0 }}
          whileInView={{ rotateY: 15, rotateX: 5, y: 0, opacity: 1 }}
          animate={{ y: [0, -15, 0] }}
          transition={{ 
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            default: { duration: 1.2 }
          }}
          viewport={{ once: true }}
          className="w-full max-w-[380px] mx-auto h-[550px] glass rounded-[3rem] border border-blue-500/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_0_50px_-10px_rgba(59,130,246,0.2)] overflow-hidden flex flex-col relative preserve-3d"
        >
          {/* Header */}
          <div className="bg-slate-900/80 p-6 border-b border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-orbitron font-bold text-white text-sm">C</div>
            <div>
              <h4 className="font-bold text-white text-sm">CONFLUX AI CORE</h4>
              <p className="text-[9px] text-blue-500 font-orbitron tracking-widest uppercase">Protocol Active</p>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.4 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 flex items-center gap-4">
            <div className="flex-1 h-12 glass rounded-full px-5 flex items-center text-[10px] text-slate-500 italic">
              Awaiting neural input...
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <Send size={18} />
            </div>
          </div>

          {/* Holographic Decorations */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 blur-3xl rounded-full" />
        </motion.div>
      </div>
    </div>
  );
};

export default AICore;