
import React from 'react';
import { motion } from 'framer-motion';

const KineticSculpture: React.FC = () => {
  // Generate random floating nodes
  const nodes = Array.from({ length: 15 });

  return (
    <div className="relative w-full h-full max-w-[800px] max-h-[800px] opacity-40 md:opacity-60">
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        initial="initial"
        animate="animate"
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Central Core */}
        <motion.circle
          cx="200"
          cy="200"
          r="40"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.5"
          animate={{
            r: [40, 50, 40],
            strokeWidth: [0.5, 2, 0.5],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.circle
          cx="200"
          cy="200"
          r="10"
          fill="#3b82f6"
          className="glow-blue"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Nodes and Connecting Lines */}
        {nodes.map((_, i) => {
          const angle = (i / nodes.length) * Math.PI * 2;
          const distance = 80 + Math.random() * 80;
          const x = 200 + Math.cos(angle) * distance;
          const y = 200 + Math.sin(angle) * distance;

          return (
            <React.Fragment key={i}>
              {/* Lines connecting to core */}
              <motion.line
                x1="200"
                y1="200"
                x2={x}
                y2={y}
                stroke="#3b82f6"
                strokeWidth="0.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                transition={{ duration: 2, delay: i * 0.1 }}
              />

              {/* Orbital Nodes */}
              <motion.g
                animate={{
                  x: [0, Math.random() * 20 - 10, 0],
                  y: [0, Math.random() * 20 - 10, 0],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="url(#nodeGlow)"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#60a5fa"
                />
              </motion.g>
            </React.Fragment>
          );
        })}

        {/* Outer Rings */}
        <motion.ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="60"
          fill="none"
          stroke="#1e293b"
          strokeWidth="0.5"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.ellipse
          cx="200"
          cy="200"
          rx="60"
          ry="180"
          fill="none"
          stroke="#1e293b"
          strokeWidth="0.5"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </motion.svg>
    </div>
  );
};

export default KineticSculpture;
