import React from 'react';
import { motion } from 'framer-motion';

const KineticSculpture: React.FC = () => {
  const nodes = Array.from({ length: 32 });
  const rings = [
    { rx: 180, ry: 40, dur: 20, rev: false, stroke: "rgba(59, 130, 246, 0.4)" },
    { rx: 140, ry: 160, dur: 25, rev: true, stroke: "rgba(96, 165, 250, 0.2)" },
    { rx: 210, ry: 80, dur: 35, rev: false, stroke: "rgba(37, 99, 235, 0.3)" },
    { rx: 60, ry: 190, dur: 40, rev: true, stroke: "rgba(255, 255, 255, 0.1)" }
  ];

  return (
    <div className="relative w-full h-full max-w-[900px] max-h-[900px] flex items-center justify-center" style={{ perspective: '1200px' }}>
      <motion.div 
        className="w-full h-full relative"
        initial={{ rotateX: 0 }}
        animate={{ rotateX: [0, 10, -10, 0], rotateY: [0, 5, -5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Central Neural Hub */}
          <motion.g style={{ transform: 'translateZ(100px)' }}>
            <motion.circle
              cx="200" cy="200" r="40"
              fill="none" stroke="url(#ringGradient)" strokeWidth="0.5"
              animate={{ r: [40, 60, 40], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.circle
              cx="200" cy="200" r="12"
              fill="#3b82f6"
              filter="url(#neon-glow)"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.g>

          {/* Orbital Data Rings */}
          {rings.map((ring, i) => (
            <motion.ellipse
              key={i}
              cx="200" cy="200"
              rx={ring.rx} ry={ring.ry}
              fill="none"
              stroke={ring.stroke}
              strokeWidth="0.75"
              strokeDasharray="1, 15"
              strokeLinecap="round"
              animate={{ rotate: ring.rev ? -360 : 360, opacity: [0.2, 0.5, 0.2] }}
              transition={{ 
                rotate: { duration: ring.dur, repeat: Infinity, ease: "linear" },
                opacity: { duration: 3, delay: i, repeat: Infinity }
              }}
            />
          ))}

          {/* Infrastructure Nodes */}
          {nodes.map((_, i) => {
            const angle = (i / nodes.length) * Math.PI * 2;
            const radius = 120 + (i % 4) * 35;
            const x = 200 + Math.cos(angle) * radius;
            const y = 200 + Math.sin(angle) * radius;

            return (
              <motion.g key={i}>
                <motion.line
                  x1="200" y1="200" x2={x} y2={y}
                  stroke="#3b82f6" strokeWidth="0.1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.1, 0] }}
                  transition={{ duration: 5, delay: i * 0.15, repeat: Infinity }}
                />
                <motion.circle
                  cx={x} cy={y} r={i % 3 === 0 ? "1.5" : "0.8"}
                  fill={i % 2 === 0 ? "#60a5fa" : "#ffffff"}
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{ duration: 3 + (i % 3), delay: i * 0.2, repeat: Infinity }}
                />
              </motion.g>
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
};

export default KineticSculpture;