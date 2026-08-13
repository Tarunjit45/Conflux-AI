
import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const RollingCounter: React.FC<{ value: number; prefix?: string; suffix?: string; label: string; color?: string }> = ({
  value, prefix = "", suffix = "", label, color = "#0000ff"
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number | null = null;
      const duration = 2200;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * value));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center px-4">
      <div className="font-inter text-3xl md:text-5xl lg:text-6xl font-black mb-2" style={{ color }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="font-inter text-[11px] md:text-[12px] font-bold tracking-wide uppercase" style={{ color: '#475569' }}>{label}</div>
    </div>
  );
};

const TrustEngine: React.FC = () => {
  const partners = [
    "TECHNOVA", "QUANTUM", "VELOCITY", "NEXUS", "APEX SYSTEMS",
    "COBALT IO", "ZENITH AI", "AETHER", "NOVA LABS", "PRISMATIC"
  ];

  return (
    <div className="relative">
      {/* Partner Ticker */}
      <div className="mb-20 md:mb-24">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center font-inter text-[11px] md:text-[12px] font-bold tracking-wide uppercase mb-10"
          style={{ color: '#475569' }}
        >
          Trusted by businesses across India &amp; beyond
        </motion.p>
        <div className="relative flex overflow-x-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, rgba(0,0,255,0.03) 0%, transparent 100%)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, rgba(0,0,255,0.03) 0%, transparent 100%)' }} />

          <div className="animate-marquee whitespace-nowrap flex items-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <React.Fragment key={i}>
                {partners.map((partner) => (
                  <div key={partner} className="mx-10 flex items-center gap-3 opacity-25 hover:opacity-70 transition-opacity cursor-default select-none">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#0000ff' }} />
                    <span className="font-inter text-xl md:text-2xl font-black tracking-tight" style={{ color: '#0f172a' }}>{partner}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div className="section-tag justify-center mb-3">Core Pillars</div>
          <h2 className="font-inter text-2xl md:text-4xl font-black" style={{ color: '#0f172a' }}>
            ENGINEERED FOR <span className="text-gradient">OPERATIONAL EXCELLENCE</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl py-10 px-6"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,255,0.06) 0%, rgba(255,255,255,0.95) 50%, rgba(15,23,42,0.04) 100%)',
            border: '1px solid rgba(0,0,255,0.15)',
            boxShadow: '0 4px 32px rgba(0,0,255,0.06)'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="px-4">
              <div className="font-inter text-xl md:text-2xl font-black mb-2 text-blue-600">
                Autonomous AI Systems
              </div>
              <div className="font-inter text-[11px] md:text-[12px] font-bold tracking-wide uppercase text-slate-500">
                End-to-End Process Automation
              </div>
            </div>
            <div className="hidden md:block w-px self-stretch bg-blue-100" />
            <div className="px-4">
              <div className="font-inter text-xl md:text-2xl font-black mb-2 text-slate-900">
                Sub-Second Speed
              </div>
              <div className="font-inter text-[11px] md:text-[12px] font-bold tracking-wide uppercase text-slate-500">
                High-Performance Web Infrastructure
              </div>
            </div>
            <div className="hidden md:block w-px self-stretch bg-blue-100" />
            <div className="px-4">
              <div className="font-inter text-xl md:text-2xl font-black mb-2 text-blue-700">
                Data Security
              </div>
              <div className="font-inter text-[11px] md:text-[12px] font-bold tracking-wide uppercase text-slate-500">
                Production Lead Protection
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Live Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex items-center justify-center gap-3"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
        </span>
        <span className="font-inter text-[11px] font-bold tracking-wide uppercase" style={{ color: '#475569' }}>
          Always Working — Real-time Operations
        </span>
      </motion.div>
    </div>
  );
};

export default TrustEngine;
