
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Globe, BarChart3, ChevronRight } from 'lucide-react';

const SuiteCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  index: number 
}> = ({ title, description, icon, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.2 }}
    whileHover={{ y: -10 }}
    className="group relative p-8 glass border border-white/5 rounded-2xl flex flex-col h-full hover:border-blue-500/30 transition-all duration-500 overflow-hidden"
  >
    {/* Decorative background number */}
    <div className="absolute top-[-20px] right-[-20px] text-8xl font-black text-white/[0.02] font-orbitron">0{index + 1}</div>
    
    <div className="mb-8 p-4 bg-blue-500/10 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 text-blue-400">
      {icon}
    </div>

    <h3 className="font-orbitron text-xl font-bold text-white mb-4 tracking-wide">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
      {description}
    </p>

    <button 
      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
      className="flex items-center text-blue-400 text-[10px] font-orbitron tracking-[0.2em] uppercase group-hover:translate-x-2 transition-transform bg-transparent border-none cursor-pointer"
    >
      Explore Core <ChevronRight className="w-4 h-4 ml-2" />
    </button>

    {/* Hover Glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

const InfrastructureSuite: React.FC = () => {
  const services = [
    {
      title: "AUTONOMOUS BOTS",
      description: "Next-gen conversational agents built on private LLM clusters. Capable of handling 98% of complex customer inquiries with zero human intervention.",
      icon: <Bot className="w-8 h-8" />
    },
    {
      title: "HIGH-CONVERSION WEB",
      description: "Digital storefronts engineered for sub-second latency. We optimize every pixel for neuro-marketing principles to maximize ROI.",
      icon: <Globe className="w-8 h-8" />
    },
    {
      title: "PRECISION AD STACKS",
      description: "Real-time bidding algorithms and dynamic creative optimization. Deploy ad capital with clinical precision across global markets.",
      icon: <BarChart3 className="w-8 h-8" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="h-[1px] w-12 bg-blue-500" />
          <span className="font-orbitron text-[10px] tracking-[0.4em] text-blue-500 uppercase">The Infrastructure Suite</span>
        </motion.div>
        <h2 className="font-orbitron text-3xl md:text-5xl font-black text-white max-w-2xl leading-tight">
          BUILT FOR <span className="text-gradient">VELOCITY</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((s, i) => (
          <SuiteCard key={i} index={i} {...s} />
        ))}
      </div>
    </div>
  );
};

export default InfrastructureSuite;
