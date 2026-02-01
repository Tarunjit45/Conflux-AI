
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquareCode } from 'lucide-react';

const AICore: React.FC = () => {
  const [messages] = useState([
    { role: 'ai', text: 'Hello. I am the Conflux Growth Core. How can I assist your scale today?' },
    { role: 'user', text: 'Analyze my ad spend for efficiency.' },
    { role: 'ai', text: 'Processing node data... Found 14% leakage in retargeting loops. Would you like me to patch the infrastructure?' }
  ]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-16">
      <div className="flex-1 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center lg:justify-start gap-4 mb-4"
        >
          <div className="h-[1px] w-12 bg-blue-500" />
          <span className="font-orbitron text-[10px] tracking-[0.4em] text-blue-500 uppercase">The AI Core</span>
        </motion.div>
        <h2 className="font-orbitron text-2xl md:text-5xl font-black text-white mb-6 md:mb-8 leading-tight">
          THE <span className="text-gradient">WHATSAPP</span><br />OMNICHANNEL
        </h2>
        <p className="text-slate-400 text-sm md:text-lg font-light leading-relaxed mb-10 px-4 lg:px-0">
          Our specialized infrastructure brings enterprise-grade intelligence directly into your customers' pockets. No apps, no logins—just seamless automated scale for Indian businesses.
        </p>
        
        <ul className="space-y-3 md:space-y-6 text-left max-w-md mx-auto lg:mx-0 px-4 lg:px-0">
          {[
            "Real-time sentiment analysis",
            "Multi-lingual neural translation (Hindi, Marathi, etc.)",
            "Direct Stripe/Shopify/Razorpay integration",
            "Human-handoff fallback protocols"
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-4 text-slate-300 text-xs md:text-sm font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 w-full flex justify-center perspective-1000 mt-12 lg:mt-0 px-4 overflow-visible">
        <motion.div
          initial={{ rotateY: 15, rotateX: 5, opacity: 0 }}
          whileInView={{ rotateY: 10, rotateX: 2, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="w-full max-w-[320px] md:max-w-[400px] h-[450px] md:h-[500px] glass rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative"
        >
          {/* Mock App Header */}
          <div className="bg-slate-800/50 p-4 md:p-6 border-b border-white/5 flex items-center gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center font-orbitron font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">C</div>
            <div className="min-w-0">
              <h4 className="font-bold text-white text-[12px] md:text-sm truncate">Conflux Core</h4>
              <p className="text-[8px] md:text-[10px] text-blue-400 font-orbitron tracking-widest uppercase truncate">Autonomous Agent</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 md:p-4 rounded-2xl text-[10px] md:text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-300 rounded-tl-none border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-white/5 flex items-center gap-3 md:gap-4">
            <div className="flex-1 h-10 glass rounded-full px-4 flex items-center text-[9px] md:text-[10px] text-slate-500 italic truncate">
              Type protocol command...
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
              <Send size={14} />
            </div>
          </div>

          {/* Floating UI Elements */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-2 md:-top-10 md:-right-10 glass p-3 md:p-4 rounded-xl border border-blue-500/30 flex items-center gap-3 shadow-xl"
          >
            <MessageSquareCode className="text-blue-400" size={16} />
            <div className="text-[8px] md:text-[9px] font-orbitron tracking-wider text-white whitespace-nowrap">98% RESOLUTION</div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AICore;
