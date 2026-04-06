import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Zap, Target } from 'lucide-react';

const Hero: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const navyColor = "#000080";

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            containerRef.current.style.setProperty('--mouse-x', `${x}`);
            containerRef.current.style.setProperty('--mouse-y', `${y}`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

    return (
        <div ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            
            {/* Split Background Layer */}
            <div className="absolute inset-0 z-0 flex flex-col lg:flex-row">
                {/* Left Side: White (Extended) */}
                <div className="flex-[1.5] lg:flex-[1.8] bg-white relative">
                   {/* Subtle texture for white side */}
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                </div>
                
                {/* Right Side: Metallic Black (Compact) */}
                <div className="flex-1 lg:flex-1 bg-[#010409] relative overflow-hidden min-h-[350px] lg:min-h-0">
                    {/* Metallic Charcoal Gradients */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0" style={{ 
                            background: 'radial-gradient(circle at 70% 40%, rgba(20, 20, 20, 0.8) 0%, #000 100%)' 
                        }} />
                        <div className="absolute inset-0 opacity-30" style={{ 
                            background: 'linear-gradient(135deg, transparent 0%, #1a1a1a 50%, transparent 100%)',
                            backgroundSize: '200% 200%',
                            animation: 'shimmer 10s infinite linear' 
                        }} />
                    </div>
                    
                    {/* Charcoal Wave Textures */}
                    <div className="absolute inset-0 opacity-20">
                        <svg viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
                            <path d="M0 400C150 250 450 550 720 400C990 250 1200 550 1440 400" stroke="#2d2d2d" strokeWidth="80" strokeLinecap="round" style={{ filter: 'blur(80px)' }} />
                            <path d="M0 200C200 100 500 300 800 200" stroke="#1a1a1a" strokeWidth="60" strokeLinecap="round" style={{ filter: 'blur(100px)' }} />
                        </svg>
                    </div>

                    {/* Subtle Blue Pulses (Ambient) */}
                    <div className="absolute inset-0 z-0 opacity-20 mix-blend-screen overflow-visible">
                        {[0, 1, 2].map((wave) => (
                          <motion.div
                            key={wave}
                            className="absolute right-[-10%] top-[45%] translate-y-[-50%] w-[120%] aspect-square"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.8, opacity: [0, 0.4, 0] }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              delay: wave * 2.5,
                              ease: "linear"
                            }}
                          >
                             <svg viewBox="0 0 200 200" className="w-full h-full">
                                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(0,0,255,0.2)" strokeWidth="0.3" />
                             </svg>
                          </motion.div>
                        ))}
                    </div>
                </div>

                {/* Hazy Curved Divider - Repositioned Right */}
                <div className="absolute left-[60%] lg:left-[64%] top-0 bottom-0 w-48 md:w-80 -translate-x-1/2 z-[5] hidden lg:block overflow-hidden">
                   <div className="absolute inset-0 bg-white" style={{ 
                       clipPath: 'ellipse(100% 55% at 0% 50%)',
                       filter: 'blur(35px)',
                       opacity: 0.85
                   }}></div>
                   <div className="absolute inset-0 bg-white" style={{ 
                       clipPath: 'ellipse(100% 55% at 0% 50%)',
                       transform: 'scaleX(0.75)'
                   }}></div>
                </div>
            </div>

            <motion.div
                style={{ y, opacity }}
                className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-12 pt-24 lg:pt-32 pb-16 lg:pb-20 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center"
            >
                {/* Left Side: Content (Taking more space) */}
                <div className="lg:col-span-3 flex flex-col items-start text-left lg:pr-12">
                    {/* Tag */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 shadow-sm"
                        style={{ background: 'rgba(0, 0, 128, 0.05)', border: `1px solid ${navyColor}22` }}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: navyColor }}></span>
                        </span>
                        <span className="font-inter text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: navyColor }}>Smart Growth for Your Business</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="font-inter font-black leading-tight tracking-tight mb-8"
                        style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)' }}
                    >
                        <span className="text-black inline-block mb-1">WE BUILD POWERFUL AI & DIGITAL SOLUTIONS TO</span><br />
                        <span style={{ color: navyColor }}>SCALE YOUR BUSINESS FAST</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="font-inter text-base lg:text-lg font-medium max-w-xl mb-10 leading-relaxed"
                        style={{ color: '#334155' }}
                    >
                        We empower businesses with advanced AI automation, premium web development, and high-impact digital marketing. From intelligent chatbots to professional creative suites, we deliver everything you need to dominate the digital landscape.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2"
                    >
                        <button
                            className="group relative px-10 py-4 rounded-lg font-inter text-[13px] font-bold tracking-wide text-white shadow-2xl transition-all duration-500 overflow-hidden"
                            style={{ background: navyColor }}
                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                Grow My Business <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                        </button>

                        <button
                            className="group flex items-center justify-center gap-3 px-10 py-4 rounded-lg font-inter text-[13px] font-bold tracking-wide transition-all duration-300 border-2"
                            style={{ borderColor: navyColor, color: navyColor }}
                            onClick={() => document.getElementById('infrastructure')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            What We Do
                        </button>
                    </motion.div>
                </div>

                {/* Right Side: Visual Interest Layer (Balanced for Video) */}
                <div className="lg:col-span-2 relative flex justify-center items-center min-h-[450px]">
                   {/* Ambient Glows */}
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[150%] h-[150%] rounded-full blur-[120px] bg-blue-600/10 opacity-60" />
                      <div className="w-full h-full rounded-full blur-[80px] bg-slate-900/50 opacity-40" />
                   </div>
                   
                   {/* Animated Logo Video Integration */}
                   <motion.div 
                      className="relative z-20 w-[260px] h-[260px] md:w-[420px] md:h-[420px] flex items-center justify-center p-2"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: [0, -15, 0]
                      }}
                      transition={{ 
                        opacity: { duration: 1.2 },
                        scale: { duration: 1.2 },
                        y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                      }}
                   >
                      {/* Dynamic Aura Glow */}
                      <div className="absolute inset-[-10%] rounded-full blur-[80px] bg-blue-600/15 animate-pulse pointer-events-none" />
                      
                      {/* 1:1 Circular Video Container */}
                      <div className="relative w-full h-full rounded-full overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_100px_rgba(0,0,255,0.2)] group p-1">
                          <video 
                            src="/logo_animated.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover rounded-full"
                          />
                          
                          {/* Inner Gradient Overlay for Depth */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5 pointer-events-none" />
                      </div>

                      {/* Premium Metallic Rotating Ring */}
                      <motion.div 
                        className="absolute inset-[-5%] border border-white/5 rounded-full pointer-events-none"
                        style={{ borderTopColor: 'rgba(0,0,255,0.4)', borderWidth: '1.5px' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      />
                   </motion.div>
                </div>

            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-10 left-[25%] lg:left-[15%] flex flex-col items-center gap-3 z-20"
            >
                <div className="w-[1px] h-16 bg-slate-200 relative overflow-hidden">
                    <motion.div
                        className="absolute top-0 w-full h-1/2"
                        style={{ background: `linear-gradient(to bottom, transparent, ${navyColor})` }}
                        animate={{ y: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default Hero;
