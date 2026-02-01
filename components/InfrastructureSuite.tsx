import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Bot, Globe, BarChart3, ChevronRight } from 'lucide-react';

const SuiteCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  index: number 
}> = ({ title, description, icon, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative p-8 glass border border-white/5 rounded-2xl flex flex-col h-full hover:border-blue-500/40 transition-colors duration-500 overflow-hidden cursor-default perspective-2000"
    >
      <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
        <div className="mb-8 p-4 bg-blue-500/10 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 text-blue-400 shadow-lg">
          {icon}
        </div>

        <h3 className="font-orbitron text-xl font-bold text-white mb-4 tracking-tight">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
          {description}
        </p>

        <button 
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center text-blue-400 text-[10px] font-orbitron tracking-[0.2em] uppercase group-hover:gap-4 transition-all bg-transparent border-none cursor-pointer"
        >
          Access Protocol <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-[-20px] right-[-20px] text-8xl font-black text-white/[0.03] font-orbitron select-none">0{index + 1}</div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

const InfrastructureSuite: React.FC = () => {
  const services = [
    {
      title: "AUTONOMOUS BOTS",
      description: "Neural-link conversational agents built on localized LLM clusters. Capable of handling 98% of complex customer queries without latency.",
      icon: <Bot className="w-8 h-8" />
    },
    {
      title: "HIGH-CONVERSION WEB",
      description: "Sub-second digital storefronts engineered with edge-compute precision. Every pixel optimized for zero-friction user journeys.",
      icon: <Globe className="w-8 h-8" />
    },
    {
      title: "PRECISION AD STACKS",
      description: "Real-time algorithmic bidding and creative optimization. Deploy ad capital with clinical precision across fragmented global markets.",
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
          <div className="h-[1px] w-12 bg-blue-600" />
          <span className="font-orbitron text-[10px] tracking-[0.4em] text-blue-400 uppercase">The Infrastructure Suite</span>
        </motion.div>
        <h2 className="font-orbitron text-4xl md:text-6xl font-black text-white max-w-2xl leading-[1.1]">
          DIGITAL <span className="text-gradient">HEGEMONY</span><br />BY DESIGN
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