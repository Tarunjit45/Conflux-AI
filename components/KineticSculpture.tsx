import React from 'react';
import { motion } from 'framer-motion';

const KineticSculpture: React.FC = () => {
  const nodes = Array.from({ length: 24 });
  const rings = [
    { rx: 180, ry: 60, dur: 25, rev: false },
    { rx: 120, ry: 160, dur: 35, rev: true },
    { rx: 200, ry: 100, dur: 45, rev: false }
  ];

  return (
    <div className="relative w-full h-full max-w-[900px] max-h-[900px]">
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        initial="initial"
        animate="animate"
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Central Core */}
        <motion.g filter="url(#glow)">
          <motion.circle
            cx="200"
            cy="200"
            r="30"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.5"
            animate={{
              r: [30, 45, 30],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.circle
            cx="200"
            cy="200"
            r="8"
            fill="#3b82f6"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.g>

        {/* Orbital Rings */}
        {rings.map((ring, i) => (
          <motion.ellipse
            key={i}
            cx="200"
            cy="200"
            rx={ring.rx}
            ry={ring.ry}
            fill="none"
            stroke="#334155"
            strokeWidth="0.5"
            strokeDasharray="4 8"
            animate={{ rotate: ring.rev ? -360 : 360 }}
            transition={{ duration: ring.dur, repeat: Infinity, ease: "linear" }}
          />
        ))}

        {/* Floating Intelligent Nodes */}
        {nodes.map((_, i) => {
          const angle = (i / nodes.length) * Math.PI * 2;
          const radius = 100 + (i % 3) * 40;
          const x = 200 + Math.cos(angle) * radius;
          const y = 200 + Math.sin(angle) * radius;

          return (
            <motion.g key={i}>
              <motion.line
                x1="200" y1="200" x2={x} y2={y}
                stroke="#3b82f6" strokeWidth="0.2"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0] }}
                transition={{ duration: 4, delay: i * 0.2, repeat: Infinity }}
              />
              <motion.circle
                cx={x} cy={y} r="2"
                fill="#60a5fa"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{ duration: 3, delay: i * 0.1, repeat: Infinity }}
              />
            </motion.g>
          );
        })}
      </motion.svg>
    </div>
  );
};

export default KineticSculpture;