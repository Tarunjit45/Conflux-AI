
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import KineticSculpture from './KineticSculpture';

const Hero: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-16 md:pt-20 overflow-hidden px-4">
      {/* 3D Kinetic Sculpture Container */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none scale-[0.5] sm:scale-75 md:scale-100 opacity-60">
        <KineticSculpture />
      </div>

      <motion.div 
        style={{ y: y1, opacity }}
        className="relative z-10 text-center max-w-5xl pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="inline-block px-3 py-1 mb-4 md:mb-6 glass border border-blue-400/20 rounded-full"
        >
          <span className="text-[7px] md:text-[10px] font-orbitron tracking-[0.2em] md:tracking-[0.3em] text-blue-400 uppercase">Automated Digital Hegemony</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-orbitron text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-6 md:mb-8"
        >
          YOUR BUSINESS,<br />
          <span className="text-gradient">UNIFIED</span> BY INTEL
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-slate-400 text-xs md:text-xl max-w-2xl mx-auto mb-10 md:mb-12 font-light leading-relaxed pointer-events-auto px-4 md:px-0"
        >
          We build the websites, AI-chatbots, and high-velocity ad systems that power India's fastest-growing brands.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pointer-events-auto px-4 md:px-0"
        >
          <button
            onClick={(e) => scrollToSection(e, 'contact')}
            className="w-full sm:w-auto group relative px-8 md:px-10 py-4 font-orbitron text-[9px] md:text-xs tracking-[0.2em] bg-blue-600 text-white rounded-sm overflow-hidden hover:scale-105 transition-transform"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            INITIATE GROWTH
          </button>
          <button 
            onClick={(e) => scrollToSection(e, 'infrastructure')}
            className="w-full sm:w-auto px-8 md:px-10 py-4 font-orbitron text-[9px] md:text-xs tracking-[0.2em] glass text-white hover:bg-white/5 transition-colors border border-white/10"
          >
            OUR PROTOCOLS
          </button>
        </motion.div>
      </motion.div>

      {/* Mouse scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40 hidden md:flex"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-blue-500 to-transparent" />
        <span className="font-orbitron text-[8px] tracking-[0.4em] uppercase text-slate-500">Scroll to Explore</span>
      </motion.div>
    </div>
  );
};

export default Hero;