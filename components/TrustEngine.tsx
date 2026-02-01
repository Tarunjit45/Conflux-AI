
import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const RollingCounter: React.FC<{ value: number; prefix?: string; suffix?: string; label: string }> = ({ value, prefix = "", suffix = "", label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-orbitron text-4xl md:text-6xl font-black text-white mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="font-orbitron text-[10px] tracking-[0.3em] text-slate-500 uppercase">{label}</div>
    </div>
  );
};

const TrustEngine: React.FC = () => {
  const partners = [
    "TECHNOVA", "QUANTUM", "VELOCITY", "NEXUS", "APEX", "COBALT", "ZENITH", "AETHER"
  ];

  return (
    <div className="relative">
      {/* Ticker Section */}
      <div className="mb-24">
        <p className="text-center font-orbitron text-[10px] tracking-[0.4em] text-slate-500 uppercase mb-10">Trusted by Global Infrastructure Giants</p>
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <React.Fragment key={i}>
                {partners.map((partner) => (
                  <span key={partner} className="mx-12 font-orbitron text-3xl font-black text-white/10 hover:text-blue-500/40 transition-colors cursor-default select-none">
                    {partner}
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ROI Tracker Section */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 bg-blue-500/5 py-16 rounded-3xl border border-white/5 glass">
          <RollingCounter value={42} suffix="M+" label="Growth Capital Managed" />
          <RollingCounter value={340} suffix="%" prefix="+" label="Avg. Efficiency Gain" />
          <RollingCounter value={1200} suffix="k" label="Neural Requests / Sec" />
        </div>
      </div>

      {/* Live Indicator */}
      <div className="mt-12 flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="font-orbitron text-[8px] tracking-[0.2em] text-slate-400 uppercase">Live Impact Monitoring Active</span>
      </div>
    </div>
  );
};

export default TrustEngine;
